const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop tracking stocks'),
    async execute(interaction) {}
}