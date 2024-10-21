const { SlashCommandBuilder } = require('discord.js');
const { removeJob } = require('../../utility/jobs.js');
const { clearColors } = require('../../utility/colors.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop tracking stocks'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
    },
    stop: stop
}

/**
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {boolean} standalone Whether this is being run as a slash command or part of a separate one
 */
async function stop(interaction, standalone) {
    // Clear colors
    clearColors();
    // Grab user id
    const userId = interaction.user.id;

    // Delete the job from the map
    removeJob(userId);

    // If this is from the explicit slash command, make sure to reply
    if (standalone) {
        interaction.editReply('Stopped tracking all jobs!');
    }
}