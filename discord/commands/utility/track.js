const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { domain } = require('../../config.json');
const { jobs } = require('../../utility/jobs.js');

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
        ].filter(ticker => ticker !== null);
        await interaction.reply(`Tracking ${tickers.join(', ')}`);
    },
    track: track
}

/**
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {string} ticker The stock ticker to analyze
 * @returns The analysis data
 */
async function analyze(interaction, ticker) {
    if (!ticker) {
        return null;
    }
    
    try {
        // Ask the server for the intial analysis
        const response = await axios.get(`${domain}/analyze/${ticker}`);
        // Get the channel which requested the analysis
        // const channel = interaction.client.channels.cache.get(interaction.channelId);
        // Send a message to the channel
        // await channel.send(`${ticker}: ${response.data.current_price}`);
        interaction.followUp(`${ticker}: ${response.data.current_price}`);
        // Return the analysis for potential plays
        return response.data;
    } catch(e) {
        console.error(e);
        return null;
    }
}

/**
 * Creates a new interval for a ticker which will run until stopped
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {string} ticker The stock ticker to track
 * @param {Object} data The analysis data for determining potential plays
 * @param {number} minutes The interval frequency in minutes, defaults to 5.
 * @returns The interval job
 */
function createInterval(interaction, ticker, data, minutes = 5) {
    const interval = minutes * 60 * 1000
    detect(interaction, ticker, data);
    return setInterval(() => { detect(interaction, ticker, data) }, interval);
}

/**
 * Run detection on potential plays for a ticker
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {string} ticker The stock to check potential plays on
 * @param {Object} data 
 */
async function detect(interaction, ticker, data) {
    try {
        // Ping the server for potential plays
        const response = await axios.post(`${domain}/detect/${ticker}`, data);
        // Get the channel which requested the analysis
        const channel = interaction.client.channels.cache.get(interaction.channelId);
        // Send a message to the channel if there is a play to make
        // TODO: Format message and conditionals
        await channel.send(`${ticker}: ${response.data.rbr.direction}`);
    } catch(e) {
        console.error(e);
    }
}

/**
 * Track specific stocks for potential plays
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {CallableFunction} areJobsStopped Callback to see if jobs have been stopped
 * @param {number} intervalMinutes The interval (on the hour) to run jobs
 */
async function track(interaction, areJobsStopped, intervalMinutes = 5) {
    // Grab user id
    const userId = interaction.user.id;
    // Grab all the input tickers, only one is required
    const tickers = [
        interaction.options.getString('ticker1'),
        interaction.options.getString('ticker2'),
        interaction.options.getString('ticker3'),
        interaction.options.getString('ticker4'),
        interaction.options.getString('ticker5')
    ].filter(ticker => ticker !== null);

    for (const ticker of tickers) {
        // Make the initial analysis
        const analysis = await analyze(interaction, ticker);
        const data = {
            resistance_past_hour: analysis.resistance_past_hour,
            resistance_past_night: analysis.resistance_past_night,
            resistance_past_week: analysis.resistance_past_week,
            support_past_hour: analysis.support_past_hour,
            support_past_night: analysis.support_past_night,
            support_past_week: analysis.support_past_week
        }

        // Calculate the time until the next interval for starting the jobs
        const offset = 1000;
        const now = new Date();
        const nextInterval = new Date(
            now.getTime() + (intervalMinutes - now.getMinutes() % intervalMinutes - now.getSeconds() / 60) * 60 * 1000 + offset
        );
        const delay = nextInterval - now;
        console.log(`delay: ${delay}`);

        // Start the job after the calculated delay
        setTimeout(() => {
            // If jobs haven't already been stopped then proceed
            if (!areJobsStopped()) {
                const job = createInterval(interaction, ticker, data, intervalMinutes);
                // Add the job to the map for cancelation
                if (!jobs.has(userId)) {
                    jobs.set(userId, []);
                }
                jobs.get(userId).push(job);
            }
        }, delay);
    }
}