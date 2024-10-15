module.exports = {
    setColor: setColor,
    getColor: getColor,
    clearColors: clearColors
}

const colors = new Map();

/**
 * Cache color per ticker for embeds
 * 
 * @param {number} index 
 * @param {string} ticker 
 */
function setColor(index, ticker) {
    // Determine color based on index
    var color = '#B22222';
    switch (index) {
        case 0:
            color = '#B22222';
            break;
        case 1:
            color = '#00FF00';
            break;
        case 2:
            color = '#87CEEB';
            break;
        case 3:
            color = '#DAA520';
            break;
        case 4:
            color = '#DA70D6';
            break;
        default:
            color = '#B22222';
            break;
    }

    // Cache the color
    colors.set(ticker, color);
}

/**
 * Get the hex color for a given ticker
 * 
 * @param {string} ticker 
 * @returns Hex color
 */
function getColor(ticker) {
    return colors.get(ticker);
}

/**
 * Clear cached colors
 */
function clearColors() {
    colors.clear();
}