const { EmbedBuilder } = require("@discordjs/builders");

/**
 * Map to store detect jobs
 */ 
const detectJobs = new Map();

/**
 * Map to store detect alt jobs
 */
const detectAltJobs = new Map();

/**
 * Map to store tickers actively being tracked
 */
const userTrackedTickers = new Map();

/**
 * Queue of tickers that haven't started their jobs yet
 */
var queuedDetectTickers = [];

/**
 * Queue of tickers that haven't started their jobs yet
 */
var queuedDetectAltTickers = [];

/**
 * Add the selected ticker as a user tracked job
 * 
 * @param {string} ticker 
 * @param {string} userId 
 */
function addUserTicker(ticker, userId, channel) {
    // Prevent the same user from tracking in multiple channels
    if (userTrackedTickers.has(userId)) {
        const cachedChannelId = userTrackedTickers.get(userId).channel.id;
        const currentChannelId = channel.id;
        if (currentChannelId !== cachedChannelId) {
            removeJob(userId);
        }
    }

    // Set up a session for a new user tracking or after a removed session
    if (!userTrackedTickers.has(userId)) {
        userTrackedTickers.set(userId, { channel: channel, tickers: [] });
    }

    const currentTickers = userTrackedTickers.get(userId).tickers;
    if (!currentTickers.includes(ticker)) {
        currentTickers.push(ticker);    
        queuedDetectTickers.push(ticker);
        queuedDetectAltTickers.push(ticker);
    }
    console.log(`New user tickers: ${userTrackedTickers.get(userId).tickers.join(", ")}`);
    console.log(`Queued tickers: ${queuedDetectTickers.join(", ")}`);
}

/**
 * Whether a job for this ticker already exists or not
 * 
 * @param {string} ticker 
 * @returns If ticker job exists
 */
function isJobQueued(ticker) {
    const exists =  queuedDetectTickers.includes(ticker);
    console.log(`Job already exists for ${ticker}?\t${exists}`);
    return exists;
}

/**
 * Whether a job for this ticker already exists or not
 * 
 * @param {string} ticker 
 * @returns If ticker job exists
 */
function isJobAltQueued(ticker) {
    const exists =  queuedDetectAltTickers.includes(ticker);
    console.log(`Alt job already exists for ${ticker}?\t${exists}`);
    return exists;
}

/**
 * Add a job for detecting a ticker every 5 minutes
 * 
 * @param {string} ticker 
 * @param {NodeJS.Timeout} job 
 */
function addDetectJob(ticker, job) {
    console.log(`Adding job for ${ticker}`);
    if (!detectJobs.has(ticker)) {
        detectJobs.set(ticker, job);
        if (queuedDetectTickers.includes(ticker)) {
            queuedDetectTickers = queuedDetectTickers.filter(element => element !== ticker);
        }
    } else {
        clearInterval(job);
    }
}

/**
 * Add a job for detecting a ticker every 5 minutes with a -30 second offset
 * 
 * @param {string} ticker 
 * @param {NodeJS.Timeout} job 
 */
function addDetectAltJob(ticker, job) {
    console.log(`Adding alt job for ${ticker}`);
    if (!detectAltJobs.has(ticker)) {
        detectAltJobs.set(ticker, job);
        if (queuedDetectAltTickers.includes(ticker)) {
            queuedDetectAltTickers = queuedDetectAltTickers.filter(element => element !== ticker);
        }
    } else {
        clearInterval(job);
    }
}

/**
 * Remove tracked tickers for a specific user, stop the job if no longer tracked
 * 
 * @param {string} userId 
 */
function removeJob(userId) {
    var tickers = [];
    if (userTrackedTickers.has(userId)) {
        tickers = userTrackedTickers.get(userId).tickers;
    }
    userTrackedTickers.delete(userId);

    const activeTickers = Array.from(userTrackedTickers.values())
        .flatMap(value => value.tickers);
    const tickerSet = new Set(activeTickers);

    for (const ticker of tickers) {
        var tickerExists = tickerSet.has(ticker);

        // If the job is no longer needed, delete it and clear the interval
        if (!tickerExists) {
            console.log(`Removing ${ticker} job from queue and intervals`);
            queuedDetectTickers = queuedDetectTickers.filter(value => value !== ticker);
            queuedDetectAltTickers = queuedDetectAltTickers.filter(value => value !== ticker);

            const detectJob = detectJobs.get(ticker);
            clearInterval(detectJob);
            detectJobs.delete(ticker);

            const detectAltJob = detectAltJobs.get(ticker);
            clearInterval(detectAltJob);
            detectAltJobs.delete(ticker);
        }
    }
}

/**
 * Send out a message to all the users tracking the ticker
 * 
 * @param {string} ticker 
 * @param {EmbedBuilder} embedBuilder 
 */
function sendMessage(ticker, embedBuilder) {
    const userTuples = Array.from(userTrackedTickers.values());
    const channels = userTuples
        .filter(user => user.tickers.includes(ticker))
        .map(user => user.channel);
    channels.forEach(channel => {
        channel.send({ embeds: [embedBuilder] });
    });
}

module.exports = {
    addUserTicker: addUserTicker,
    isJobQueued: isJobQueued,
    isJobAltQueued,
    addDetectJob: addDetectJob,
    addDetectAltJob: addDetectAltJob,
    removeJob: removeJob,
    sendMessage: sendMessage
};