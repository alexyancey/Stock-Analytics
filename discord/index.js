const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json')
const { track } = require('./commands/utility/track');
const { stop } = require('./commands/utility/stop');

const client = new Client({
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ]
});

client.commands = new Collection();

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

    const now = new Date()
    console.log(`got command ${interaction.commandName} ${new Date().getTime() - now.getTime()}`);
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
        console.log(`command starting ${new Date().getTime() - now.getTime()}`);
		await command.execute(interaction);
        console.log(`command executed ${new Date().getTime() - now.getTime()}`);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

    var jobsStopped = false;
    const areJobsStopped = () => {
        return jobsStopped;
    };
    switch (interaction.commandName) {
        case 'track':
            // Jobs are about to start
            jobsStopped = false;
            // Make sure to stop all running jobs first
            stop(interaction, false);
            track(interaction, areJobsStopped, 5);
            break;
        case 'stop':
            // Clear all jobs for the user
            jobsStopped = true;
            stop(interaction, true);
            break;
        default:
            break;
    };
});

try {
    client.login(token);
} catch (e) {
    console.error(`Couldn't login: ${e}`);
}
