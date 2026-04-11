/**
 * Post Position Color Configuration
 * Standard racing saddlecloth colors by post position
 */

const POST_POSITION_COLORS = {
    1: {
        name: 'Red',
        background: '#DC143C',  // Crimson red
        text: '#FFFFFF',        // White text
        border: '#B22222',      // Darker red border
        notes: 'Always red'
    },
    2: {
        name: 'White',
        background: '#FFFFFF',  // White
        text: '#000000',        // Black text/number
        border: '#CCCCCC',      // Light gray border
        notes: 'White with black number'
    },
    3: {
        name: 'Blue',
        background: '#4169E1',  // Royal blue
        text: '#FFFFFF',        // White text
        border: '#1E3A8A',      // Darker blue border
        notes: 'Royal blue'
    },
    4: {
        name: 'Yellow',
        background: '#FFD700',  // Bright yellow / gold
        text: '#000000',        // Black text
        border: '#DAA520',      // Darker yellow border
        notes: 'Bright yellow'
    },
    5: {
        name: 'Green',
        background: '#228B22',  // Kelly green / forest green
        text: '#FFFFFF',        // White text
        border: '#006400',      // Dark green border
        notes: 'Kelly green'
    },
    6: {
        name: 'Black',
        background: '#000000',  // Black
        text: '#FFFFFF',        // White number
        border: '#333333',      // Dark gray border
        notes: 'White number'
    },
    7: {
        name: 'Orange',
        background: '#FF8C00',  // Dark orange / solid orange
        text: '#FFFFFF',        // White text
        border: '#CC7000',      // Darker orange border
        notes: 'Solid orange'
    },
    8: {
        name: 'Pink',
        background: '#FF1493',  // Hot pink / deep pink
        text: '#FFFFFF',        // White text
        border: '#C71585',      // Darker pink border
        notes: 'Hot pink'
    },
    9: {
        name: 'Turquoise',
        background: '#40E0D0',  // Turquoise / light blue-teal
        text: '#000000',        // Black text
        border: '#20B2AA',      // Darker turquoise border
        notes: 'Light blue / teal'
    },
    10: {
        name: 'Purple',
        background: '#8B00FF',  // Violet / purple
        text: '#FFFFFF',        // White text
        border: '#6A0DAD',      // Darker purple border
        notes: 'Violet'
    },
    11: {
        name: 'Gray',
        background: '#D3D3D3',  // Light gray
        text: '#000000',        // Black text
        border: '#A9A9A9',      // Darker gray border
        notes: 'Light gray'
    },
    12: {
        name: 'Lime Green',
        background: '#32CD32',  // Lime green / neon green
        text: '#000000',        // Black text
        border: '#228B22',      // Darker green border
        notes: 'Neon / apple green'
    },
    13: {
        name: 'Brown',
        background: '#8B4513',  // Saddle brown / dark brown
        text: '#FFFFFF',        // White text
        border: '#654321',      // Darker brown border
        notes: 'Dark brown'
    },
    14: {
        name: 'Forest Green',
        background: '#228B22',  // Forest green / dark green
        text: '#FFFFFF',        // White text
        border: '#006400',      // Very dark green border
        notes: 'Dark green'
    },
    15: {
        name: 'Khaki',
        background: '#F0E68C',  // Khaki / tan
        text: '#000000',        // Black text
        border: '#BDB76B',      // Darker khaki border
        notes: 'Tan'
    },
    16: {
        name: 'Light Blue',
        background: '#ADD8E6',  // Light blue / pale blue
        text: '#000000',        // Black text
        border: '#87CEEB',      // Darker light blue border
        notes: 'Pale blue'
    },
    17: {
        name: 'Navy Blue',
        background: '#000080',  // Navy blue / dark navy
        text: '#FFFFFF',        // White text
        border: '#00004D',      // Very dark navy border
        notes: 'Dark navy'
    },
    18: {
        name: 'Yellow w/ Black',
        background: '#FFD700',  // Yellow base
        text: '#000000',        // Black number
        border: '#DAA520',      // Darker yellow border
        notes: 'Yellow base, black number'
    },
    19: {
        name: 'Green w/ Black',
        background: '#228B22',  // Green base
        text: '#000000',        // Black number
        border: '#006400',      // Dark green border
        notes: 'Used rarely'
    },
    20: {
        name: 'Orange w/ Black',
        background: '#FF8C00',  // Orange base
        text: '#000000',        // Black number
        border: '#CC7000',      // Darker orange border
        notes: 'Used rarely'
    }
};

/**
 * Get color configuration for a post position
 * @param {number} postPosition - The post position (1-20)
 * @returns {object} Color configuration object
 */
function getPostPositionColor(postPosition) {
    return POST_POSITION_COLORS[postPosition] || POST_POSITION_COLORS[1]; // Default to red if not found
}

/**
 * Get background color for a post position
 * @param {number} postPosition - The post position (1-20)
 * @returns {string} Hex color code
 */
function getPostPositionBackground(postPosition) {
    const config = getPostPositionColor(postPosition);
    return config.background;
}

/**
 * Get text color for a post position
 * @param {number} postPosition - The post position (1-20)
 * @returns {string} Hex color code
 */
function getPostPositionText(postPosition) {
    const config = getPostPositionColor(postPosition);
    return config.text;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        POST_POSITION_COLORS,
        getPostPositionColor,
        getPostPositionBackground,
        getPostPositionText
    };
}


/**
 * Last Call Configuration
 * Determines the last call point based on race distance in furlongs
 */

/**
 * Get the last call designation based on race distance
 * @param {number} furlongs - Race distance in furlongs
 * @returns {string} Last call designation (e.g., '2F', '4F', '6F', '8F', '10F')
 */
function getLastCall(furlongs) {
    const distance = parseFloat(furlongs);
    
    if (isNaN(distance) || distance <= 0) {
        return '2F'; // Default to 2F if invalid
    }
    
    if (distance <= 5) {
        return '2F';
    } else if (distance <= 7) {
        return '4F';
    } else if (distance <= 9) {
        return '6F';
    } else if (distance <= 11) {
        return '8F';
    } else {
        return '10F';
    }
}

/**
 * Get the last call field name for DRF data
 * @param {number} furlongs - Race distance in furlongs
 * @returns {string} Field name for last call (e.g., 'paceFig2F', 'paceFig4F', etc.)
 */
function getLastCallFieldName(furlongs) {
    const lastCall = getLastCall(furlongs);
    return `paceFig${lastCall}`;
}

/**
 * Get last call configuration details
 * @param {number} furlongs - Race distance in furlongs
 * @returns {object} Configuration object with lastCall, fieldName, and description
 */
function getLastCallConfig(furlongs) {
    const lastCall = getLastCall(furlongs);
    const fieldName = getLastCallFieldName(furlongs);
    
    return {
        lastCall: lastCall,
        fieldName: fieldName,
        description: `Last Call at ${lastCall}`,
        furlongs: parseFloat(furlongs)
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        POST_POSITION_COLORS,
        getPostPositionColor,
        getPostPositionBackground,
        getPostPositionText,
        getLastCall,
        getLastCallFieldName,
        getLastCallConfig
    };
}
