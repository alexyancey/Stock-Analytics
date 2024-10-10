const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { token } = require('./config.json')

const client = new Client({
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ]
});

client.commands = new Collection();

// Map to store user-specific jobs
const jobs = new Map();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

    const userId = interaction.user.id;
    var jobsStopped = false;
    switch (interaction.commandName) {
        case 'track':
            jobsStopped = false;
            const tickers = [
                interaction.options.getString('ticker1'),
                interaction.options.getString('ticker2'),
                interaction.options.getString('ticker3'),
                interaction.options.getString('ticker4'),
                interaction.options.getString('ticker5')
            ].filter(t => t !== null);

            // Calculate the time until the next 5-minute interval
            const now = new Date();
            const nextInterval = new Date(now.getTime() + (5 - now.getMinutes() % 5 - now.getSeconds() / 60) * 60 * 1000 + 1000);
            const delay = nextInterval - now;

            for (const ticker of tickers) {
                const analysis = await analyze(interaction, ticker);
                const detectData = {
                    resistance_past_hour: analysis.resistance_past_hour,
                    resistance_past_night: analysis.resistance_past_night,
                    resistance_past_week: analysis.resistance_past_week,
                    support_past_hour: analysis.support_past_hour,
                    support_past_night: analysis.support_past_night,
                    support_past_week: analysis.support_past_week
                }
                console.log(delay)

                // Start the job after the calculated delay
                setTimeout(() => {
                    console.log(`Starting job for ${ticker}`);
                    if (!jobsStopped) {
                        const job = createInterval(interaction, ticker, detectData);
                        if (!jobs.has(userId)) {
                            jobs.set(userId, []);
                        }
                        jobs.get(userId).push(job);
                    }
                }, delay);
            }
            break;
        case 'stop':
            // Clear all jobs for the user
            jobsStopped = true;
            if (jobs.has(userId)) {
                jobs.get(userId).forEach(job => clearInterval(job));
                jobs.delete(userId);
            }

            await interaction.reply('Jobs stopped!');
            break;
        default:
            break;
    };
});

/*
"current_price": 209.0,
    "macd": 0.12,
    "overall_trend": "Downward",
    "overnight_trend": "Upward",
    "resistance_past_hour": 209.93,
    "resistance_past_night": 218.35,
    "resistance_past_week": 235.48,
    "rsi": 52.26,
    "rsi_summary": "Neutral",
    "support_past_hour": 206.28,
    "support_past_night": 195.1,
    "support_past_week": 190.86
*/

async function analyze(interaction, ticker) {
    if (ticker) {
        try {
            const response = await axios.get(`http://localhost:4050/analyze/${ticker}`);
            const data = response.data;
            console.log(data);
            const channel = interaction.client.channels.cache.get(interaction.channelId);
            await channel.send(`${ticker}: ${data.current_price}`);
            return data;
        } catch(e) {
            console.error(e);
            return null;
        }
    }
}

function createInterval(interaction, ticker, detectData) {
    return setInterval(async () => {
        try {
            const response = await axios.post(`http://localhost:4050/detect/${ticker}`, detectData);
            const data = response.data;
            console.log(data);
            const channel = interaction.client.channels.cache.get(interaction.channelId);
            await channel.send(`${ticker}: ${data.rbr.direction}`);
            return true;
        } catch(e) {
            console.error(e);
        }
    }, 5000/*5 * 60 * 1000*/);
}

client.login(token);