const { SlashCommandBuilder } = require('discord.js');
const { jobs } = require('../../utility/jobs.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop tracking stocks'),
    async execute(interaction) {},
    stop: stop
}

/**
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {boolean} standalone Whether this is being run as a slash command or part of a separate one
 */
async function stop(interaction, standalone) {
    // Grab user id
    const userId = interaction.user.id;
    // Delete the job from the map
    if (jobs.has(userId)) {
        jobs.get(userId).forEach(job => clearInterval(job));
        jobs.delete(userId);
    }

    // If this is from the explicit slash command, make sure to reply
    if (standalone) {
        await interaction.reply('Stopped tracking all jobs!');
    }
}