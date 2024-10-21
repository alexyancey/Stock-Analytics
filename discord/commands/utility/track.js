const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { domain } = require('../../config.json');
const { 
    addUserTicker,
    isJobQueued, 
    isJobAltQueued,
    addDetectJob, 
    addDetectAltJob,
    sendMessage 
} = require('../../utility/jobs.js');
const { 
    formatAnalysis,
    formatBrc, 
    formatBounceReject, 
    formatRbr, 
    formatMorningStar, 
    formatHammer, 
    formatEngulfing 
} = require('../../utility/messageFormatter.js');
const { setColor, getColor } = require('../../utility/colors.js');

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
        await interaction.deferReply();
        interaction.editReply(`Tracking ${tickers.join(', ')}`);
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
        const channel = interaction.client.channels.cache.get(interaction.channelId);
        // Send a message to the channel
        const message = formatAnalysis(response.data)
        const embed = new EmbedBuilder()
            .setColor(getColor(ticker))
            .setTitle(`📊 Analysis for **${ticker}** 📊`)
            .setDescription(message)
            .setTimestamp();
        await channel.send({ embeds: [embed] });
        // Return the analysis for potential plays
        return response.data;
    } catch(e) {
        console.error(`Couldn't get analyze data for ${ticker}`);
        return null;
    }
}

/**
 * Creates a new interval for a ticker which will run until stopped
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {string} ticker The stock ticker to track
 * @param {object} data The analysis data for determining potential plays
 * @param {number} minutes The interval frequency in minutes, defaults to 5
 * @returns The interval job
 */
function createDetectInterval(interaction, ticker, data, minutes = 5) {
    const intervalTime = minutes * 60 * 1000
    detect(interaction, ticker, data);
    const interval = setInterval(() => { 
        detect(interaction, ticker, data);
    }, intervalTime);
    return interval;
}

/**
 * Creates a new alt interval for a ticker which will run until stopped
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {string} ticker The stock ticker to track
 * @param {number} minutes The interval frequency in minutes, defaults to 5
 * @returns The interval job
 */
function createDetectAltInterval(interaction, ticker, minutes = 5) {
    const intervalTime = minutes * 60 * 1000
    detectAlt(interaction, ticker);
    const interval = setInterval(() => { 
        detectAlt(interaction, ticker);
    }, intervalTime);
    return interval
}

/**
 * Run detection on potential plays for a ticker
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {string} ticker The stock to check potential plays on
 * @param {object} data 
 */
async function detect(interaction, ticker, data) {
    try {
        // Ping the server for potential plays
        const response = await axios.post(`${domain}/detect/${ticker}`, data);
        // Get the channel which requested the analysis
        const channel = interaction.client.channels.cache.get(interaction.channelId);

        // Check potential plays
        const brcMessage = formatBrc(ticker, response.data.brc);
        const bounceRejectMessage = formatBounceReject(ticker, response.data.bounce_reject);

        // Send a message to the channel if there is a play to make
        if (brcMessage) {
            const brcEmbed = new EmbedBuilder()
                .setColor(getColor(ticker))
                .setTitle(`❗Potential play for **${ticker}**❗`)
                .setDescription(brcMessage)
                .setTimestamp();
            sendMessage(ticker, brcEmbed);
        }
        if (bounceRejectMessage) {
            const bounceRejectEmbed = new EmbedBuilder()
                .setColor(getColor(ticker))
                .setTitle(`❗Potential play for **${ticker}**❗`)
                .setDescription(bounceRejectMessage)
                .setTimestamp();
            sendMessage(ticker, bounceRejectEmbed);
        }
    } catch(e) {
        console.error(`Couldn't get detect data for ${ticker}`);
    }
}

/**
 * Run detection on potential RBR plays for a ticker
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {string} ticker The stock to check potential plays on
 */
async function detectAlt(interaction, ticker) {
    try {
        // Ping the server for potential plays
        const response = await axios.get(`${domain}/detect/alt/${ticker}`);
        // Get the channel which requested the analysis
        const channel = interaction.client.channels.cache.get(interaction.channelId);
        // Send a message to the channel if there is a play to make
        const rbrMessage = formatRbr(ticker, response.data.rbr);
        const morningStarMessage = formatMorningStar(ticker, response.data.morning_star);
        const hammerMessage = formatHammer(ticker, response.data.hammer);
        const engulfingMessage = formatEngulfing(ticker, response.data.engulfing);
        if (rbrMessage) {
            const rbrEmbed = new EmbedBuilder()
                .setColor(getColor(ticker))
                .setTitle(`❗Potential play for **${ticker}**❗`)
                .setDescription(rbrMessage)
                .setTimestamp();
            sendMessage(ticker, rbrEmbed);
        }
        if (morningStarMessage) {
            const morningStarEmbed = new EmbedBuilder()
                .setColor(getColor(ticker))
                .setTitle(`❗Potential play for **${ticker}**❗`)
                .setDescription(morningStarMessage)
                .setTimestamp();
            sendMessage(ticker, morningStarEmbed);
        }
        if (hammerMessage) {
            const hammerEmbed = new EmbedBuilder()
                .setColor(getColor(ticker))
                .setTitle(`❗Potential play for **${ticker}**❗`)
                .setDescription(hammerMessage)
                .setTimestamp();
            sendMessage(ticker, hammerEmbed);
        }
        if (engulfingMessage) {
            const engulfingEmbed = new EmbedBuilder()
                .setColor(getColor(ticker))
                .setTitle(`❗Potential play for **${ticker}**❗`)
                .setDescription(engulfingMessage)
                .setTimestamp();
            sendMessage(engulfingEmbed);
        }
    } catch(e) {
        console.error(`Couldn't get detect alt data for ${ticker}`);
    }
}

/**
 * Track specific stocks for potential plays
 * 
 * @param {Interaction} interaction The slash command interaction
 * @param {number} intervalMinutes The interval (on the hour) to run jobs
 */
async function track(interaction, intervalMinutes = 5) {
    // Grab user id and channel
    const userId = interaction.user.id;
    const channel = interaction.client.channels.cache.get(interaction.channelId);
    // Grab all the input tickers, only one is required
    const tickers = [
        interaction.options.getString('ticker1'),
        interaction.options.getString('ticker2'),
        interaction.options.getString('ticker3'),
        interaction.options.getString('ticker4'),
        interaction.options.getString('ticker5')
    ].filter(ticker => ticker !== null);

    for (index = 0; index < tickers.length; index++) {
        const ticker = tickers[index];
        // Set the color
        setColor(index, ticker);
        // Make the initial analysis
        await new Promise(resolve => setTimeout(resolve, 1000));
        const analysis = await analyze(interaction, ticker);
        if (!analysis) {
            console.error('Analysis was empty due to an internal error')
            return;
        }

        const data = {
            resistance_past_night: analysis.resistance_past_night,
            resistance_past_day: analysis.resistance_past_day,
            resistance_past_week: analysis.resistance_past_week,
            support_past_night: analysis.support_past_night,
            support_past_day: analysis.support_past_day,
            support_past_week: analysis.support_past_week
        }

        // Calculate the time until the next interval for starting the jobs
        // TODO: Remove offset logic after switching to AlphaVantage
        const offset = 1000;
        const now = new Date();
        const nextInterval = new Date(
            now.getTime() + (intervalMinutes - now.getMinutes() % intervalMinutes - now.getSeconds() / 60) * 60 * 1000 + offset
        );
        const delay = (nextInterval - now) + (index * 1500);

        // Start the job after the calculated delay
        setTimeout(() => {
            // If jobs haven't already been stopped then proceed
            if (isJobQueued(ticker)) {
                const job = createDetectInterval(interaction, ticker, data, intervalMinutes);
                addDetectJob(ticker, job);
            } else {
                console.log(`Detect job for ${ticker} removed from queue, not proceeding`);
            }
        }, delay);

        const offsetDelay = delay + ((intervalMinutes - 1) * 60 * 1000) + (30 * 1000);
        // Start the alt strategy job after the calculated delay, 30 seconds earlier than the next interval
        setTimeout(() => {
            // If jobs haven't already been stopped then proceed
            if (isJobAltQueued(ticker)) {
                const job = createDetectAltInterval(interaction, ticker, intervalMinutes);
                addDetectAltJob(ticker, job);
            } else {
                console.log(`Detect alt job for ${ticker} removed from queue, not proceeding`);
            }
        }, offsetDelay);

        // Add user tracked ticker
        addUserTicker(ticker, userId, channel);
    };
}