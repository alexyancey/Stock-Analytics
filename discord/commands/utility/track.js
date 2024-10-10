const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('track')
        .setDescription('Tracks suggested stocks')
        .addStringOption(option =>
            option
                .setName('ticker1')
                .setDescription('Ticker symbol to track')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('ticker2')
                .setDescription('Ticker symbol to track')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('ticker3')
                .setDescription('Ticker symbol to track')
                .setRequired(false)
            )
        .addStringOption(option =>
            option
                .setName('ticker4')
                .setDescription('Ticker symbol to track')
                .setRequired(false)
            )
        .addStringOption(option =>
            option
                .setName('ticker5')
                .setDescription('Ticker symbol to track')
                .setRequired(false)
            ),
    async execute(interaction) {
        const tickers = [
            interaction.options.getString('ticker1'),
            interaction.options.getString('ticker2'),
            interaction.options.getString('ticker3'),
            interaction.options.getString('ticker4'),
            interaction.options.getString('ticker5')
        ];
        //await analyze(interaction, tickers);
        await interaction.reply(`Tracking ${tickers.join(', ')}`);
    }
}

async function analyze(interaction, tickers) {
    const tasks = [];
    for (const ticker of tickers) {
        if (ticker) {
            tasks.push(
                async () => {
                    try {
                        const response = await axios.get(`http://localhost:4050/analyze/${ticker}`);
                        const data = response.data;
                        console.log(data);
                        const channel = interaction.client.channels.cache.get(interaction.channelId);
                        await channel.send(`${ticker}: ${data.current_price}`);
                        return data;
                    } catch(e) {
                        console.error(e);
                    }
                }
            );
        }
    }
    console.log(tasks);

    try {
        console.log("running all")
        await Promise.all(tasks.map(t => t()));
        return true;
    } catch(e) {
        console.error(e);
        return false;
    }
}