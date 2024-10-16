module.exports = {
    formatAnalysis: formatAnalysis,
    formatBrc: formatBrc,
    formatBounceReject: formatBounceReject,
    formatRbr: formatRbr,
    formatMorningStar: formatMorningStar,
    formatHammer: formatHammer,
    formatEngulfing: formatEngulfing
};

/**
 * Format the analysis string to be sent to the client
 * 
 * @param {object} analysis 
 * @returns Formatted analysis string
 */
function formatAnalysis(analysis) {
    const upwardEmoji = '📈';
    const downwardEmoji = '📉';

    const rsiSummary = analysis.rsi_summary != 'Neutral' ? `\n\n❗${analysis.rsi_summary}❗` : '';

    const formatted = `**Current Price:** ${analysis.current_price}

**MACD:** ${analysis.macd}
**RSI:** ${analysis.rsi}${rsiSummary}

**Overnight Trend:** ${analysis.overnight_trend} ${analysis.overnight_trend == "Upward" ? upwardEmoji : analysis.overnight_trend == "Downward" ? downwardEmoji : ''}
**Overall Trend:** ${analysis.overall_trend} ${analysis.overall_trend == "Upward" ? upwardEmoji : analysis.overall_trend == "Downward" ? downwardEmoji : ''}

⬆️ **Resistances:** ⬆️
* Past **Hour: ${analysis.resistance_past_hour}**
* Past **Night: ${analysis.resistance_past_night}**
* Past **Week: ${analysis.resistance_past_week}**

⬇️ **Supports:** ⬇️
* Past **Hour: ${analysis.support_past_hour}**
* Past **Night: ${analysis.support_past_night}**
* Past **Week: ${analysis.support_past_week}**`;

    return formatted;
}

/**
 * If a potential BRC is present format a message to the client
 * 
 * @param {string} ticker 
 * @param {object} brc 
 * @returns Formatted BRC message if applicable
 */
function formatBrc(ticker, brc) {
    if (!brc && !brc.direction && !brc.key_level) {
        return null;
    }

    var message = null;
    switch (brc.direction) {
        case 1:
            message = `Potential upward **BRC** on **${ticker}** at the ${brc.key_level} price level, look for **CALLS**`;
            break;
        case -1:
            message = `Potential downward **BRC** on **${ticker}** at the ${brc.key_level} price level, look for **PUTS**`;
            break;
        default:
            break;
    }

    return message;
}

/**
 * If a potential Bounce Reject is present format a message to the client
 * 
 * @param {string} ticker 
 * @param {object} bounceReject 
 * @returns Formatted Bounce Reject message if applicable
 */
function formatBounceReject(ticker, bounceReject) {
    if (!bounceReject && !bounceReject.direction && !bounceReject.key_level) {
        return null;
    }

    var message = null;
    switch (bounceReject.direction) {
        case 1:
            message = `Potential upward **Bounce Reject** on **${ticker}** at the ${bounceReject.key_level} price level, look for **CALLS**`;
            break;
        case -1:
            message = `Potential downward **Bounce Reject** on **${ticker}** at the ${bounceReject.key_level} price level, look for **PUTS**`;
            break;
        default:
            break;
    }

    return message;
}

/**
 * If a potential RBR is present format a message to the client
 * 
 * @param {string} ticker 
 * @param {object} rbr 
 * @returns Formatted RBR message if applicable
 */
function formatRbr(ticker, rbr) {
    if (!rbr) {
        return null;
    }

    var message = null;
    switch (rbr) {
        case 1:
            message = `Potential upward **RBR** on **${ticker}**, look for **CALLS**`;
            break;
        case -1:
            message = `Potential downward **RBR** on **${ticker}**, look for **PUTS**`;
            break;
        default:
            break;
    }

    return message;
}

/**
 * If a potential morning star is present format a message to the client
 * 
 * @param {string} ticker 
 * @param {object} morningStar 
 * @returns Formatted morning star message if applicable
 */
function formatMorningStar(ticker, morningStar) {
    if (!morningStar) {
        return null;
    }

    var message = null;
    switch (morningStar) {
        case 1:
            message = `Potential upward **Morning Star** on **${ticker}**, look for **CALLS**`;
            break;
        case -1:
            message = `Potential downward **Morning Star** on **${ticker}**, look for **PUTS**`;
            break;
        default:
            break;
    }

    return message;
}

/**
 * If a potential hammer is present format a message to the client
 * 
 * @param {string} ticker 
 * @param {object} hammer 
 * @returns Formatted hammer message if applicable
 */
function formatHammer(ticker, hammer) {
    if (!hammer) {
        return null;
    }

    var message = null;
    switch (hammer) {
        case 1:
            message = `Potential **Bullish Hammer** on **${ticker}**, look for **CALLS**`;
            break;
        case -1:
            message = `Potential **Bearish Hammer** on **${ticker}**, look for **PUTS**`;
            break;
        default:
            break;
    }

    return message;
}

/**
 * If a potential engulfing is present format a message to the client
 * 
 * @param {string} ticker 
 * @param {object} engulfing 
 * @returns Formatted engulfing message if applicable
 */
function formatEngulfing(ticker, engulfing) {
    if (!engulfing) {
        return null;
    }

    var message = null;
    switch (engulfing) {
        case 1:
            message = `Potential **Bullish Engulfing Candle** on **${ticker}**, look for **CALLS**`;
            break;
        case -1:
            message = `Potential **Bearish Engulfing Candle** on **${ticker}**, look for **PUTS**`;
            break;
        default:
            break;
    }

    return message;
}