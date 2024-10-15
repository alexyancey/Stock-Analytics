const { SlashCommandBuilder } = require('discord.js');
const { jobs } = require('../../utility/jobs.js');
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

    if (jobs.has(userId)) {
        console.log(`Job length before Stop: ${jobs.get(userId).length}`);
    } else {
        console.log(`No more jobs: ${jobs.keys.length}`);
    }

    // Delete the job from the map
    if (jobs.has(userId)) {
        jobs.get(userId).forEach(job => clearInterval(job));
        jobs.delete(userId);
    }

    if (jobs.has(userId)) {
        console.log(`Job length after Stop: ${jobs.get(userId).length}`);
    } else {
        console.log(`No more jobs: ${jobs.keys.length}`);
    }

    // If this is from the explicit slash command, make sure to reply
    if (standalone) {
        interaction.editReply('Stopped tracking all jobs!');
    }
}