module.exports = {
    formatAnalysis: formatAnalysis,
    formatBrc: formatBrc,
    formatRbr: formatRbr,
    formatBounceReject: formatBounceReject
};

/**
 * Format the analysis string to be sent to the client
 * 
 * @param {string} ticker 
 * @param {object} analysis 
 * @returns Formatted analysis string
 */
function formatAnalysis(ticker, analysis) {
    const upwardEmoji = '📈';
    const downwardEmoji = '📉';

    const rsiSummary = analysis.rsi_summary != 'Neutral' ? `\n\n❗${analysis.rsi_summary}❗` : '';

    const formatted = `📊 Analysis for **${ticker}** 📊

**Current Price:** ${analysis.current_price}

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
    console.log(brc)
    if (!brc || !brc.direction || !brc.key_level) {
        return null;
    }
    console.log(brc.direction);

    var message = null;
    switch (brc.direction) {
        case 1:
            message = `❗❗Potential upward **BRC** on **${ticker}** at the ${brc.key_level} price level, look for **CALLS**❗❗`;
            break;
        case -1:
            message = `❗❗Potential downward **BRC** on **${ticker}** at the ${brc.key_level} price level, look for **PUTS**❗❗`;
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
    if (!rbr || !rbr.direction) {
        return null;
    }

    var message = null;
    switch (rbr.direction) {
        case 1:
            message = `❗❗Potential upward **RBR** on **${ticker}**, look for **CALLS**❗❗`;
            break;
        case -1:
            message = `❗❗Potential downward **RBR** on **${ticker}**, look for **PUTS**❗❗`;
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
    if (!bounceReject || !bounceReject.direction || !bounceReject.key_level) {
        return null;
    }

    var message = null;
    switch (bounceReject.direction) {
        case 1:
            message = `❗❗Potential upward **Bounce Reject** on **${ticker}** at the ${bounceReject.key_level} price level, look for **CALLS**❗❗`;
            break;
        case -1:
            message = `❗❗Potential downward **Bounce Reject** on **${ticker}** at the ${bounceReject.key_level} price level, look for **PUTS**❗❗`;
            break;
        default:
            break;
    }

    return message;
}