/**
 * DRF File Parser
 * Parses BRISNET DRF format files into structured race and horse data
 */

class DRFParser {
    constructor() {
        this.races = new Map();
    }

    /**
     * Parse DRF file content
     * @param {string} content - Raw DRF file content
     * @returns {Object} Parsed race data organized by race
     */
    parseContent(content) {
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

        lines.forEach(line => {
            const fields = this.parseCSVLine(line);
            if (fields.length > 50) { // Valid DRF record
                this.processRecord(fields);
            }
        });

        return this.getOrganizedData();
    }

    /**
     * Parse CSV line handling quoted fields
     */
    parseCSVLine(line) {
        const fields = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        fields.push(current.trim());
        return fields;
    }

    /**
     * Process a single DRF record (one horse)
     */
    processRecord(fields) {
        // Extract race information
        const raceKey = `${fields[0]}_${fields[1]}_${fields[2]}`;

        if (!this.races.has(raceKey)) {
            // Field 9 (index 8): Race Type
            // Field 10 (index 9): Age/Sex Restrictions (3 character field)
            const ageSexCode = (fields[9] || '').trim();
            const ageCode = ageSexCode.charAt(0) || '';
            const ageModifier = ageSexCode.charAt(1) || '';
            const sexCode = ageSexCode.charAt(2) || '';

            this.races.set(raceKey, {
                trackCode: (fields[0] || '').trim(),
                date: fields[1],
                raceNumber: fields[2],
                postTime: fields[1417] || '',  // Field 1418 - Post Time
                distance: fields[5],
                distanceInFurlongs: this.convertToFurlongs(fields[5]),
                surface: (fields[6] || '').trim(),
                raceType: (fields[8] || '').trim(),
                classification: fields[10],
                purse: fields[11],
                claimingPriceHigh: fields[12],
                claimingPriceLow: fields[13],
                trackCondition: fields[14],
                raceConditions: fields[15],
                ageSexRestrictions: ageSexCode,
                ageCode: ageCode,
                ageModifier: ageModifier,
                sexCode: sexCode,
                speedPar: parseInt(fields[216]) || 0,  // Field 217 - BRIS Speed Par
                wagerTypes: (fields[239] || '').trim(),
                horses: []
            });
        }

        // Extract horse information
        // NOTE: BRISNET field numbers are 1-based, array indices are 0-based (subtract 1)
        const horse = {
            // Section 1: Horse specific attributes
            programNumber: fields[42],       // Field 43
            postPosition: fields[42],        // Field 43
            horseName: fields[44],           // Field 45
            yearOfBirth: fields[45],         // Field 46
            foalingMonth: fields[46],        // Field 47
            age: this.calculateAge(fields[45], fields[46]), // Calculated from year and month
            sex: fields[48],                 // Field 49
            color: fields[49],               // Field 50
            weight: fields[50],              // Field 51
            sire: fields[51],                // Field 52
            dam: fields[53],                 // Field 54
            damSire: fields[54],             // Field 55
            breeder: fields[55],             // Field 56
            medicationCode: fields[61],      // Field 62 - Today's Medication
            medication: this.getMedicationLabel(fields[61]), // Converted to label
            equipment: '',

            // Trainer info - Current Meet (CM)
            trainer: fields[27],             // Field 28
            trainerStarts: parseInt(fields[28]) || 0,       // Field 29
            trainerWins: parseInt(fields[29]) || 0,         // Field 30
            trainerPlaces: parseInt(fields[30]) || 0,       // Field 31
            trainerShows: parseInt(fields[31]) || 0,        // Field 32

            // Trainer info - Most Recent (MR) - Current Year (Fields 1147-1150) + Previous Year (Fields 1152-1155)
            trainerCurrentYearStarts: parseInt(fields[1146]) || 0,   // Field 1147
            trainerCurrentYearWins: parseInt(fields[1147]) || 0,     // Field 1148
            trainerCurrentYearPlaces: parseInt(fields[1148]) || 0,   // Field 1149
            trainerCurrentYearShows: parseInt(fields[1149]) || 0,    // Field 1150
            trainerPreviousYearStarts: parseInt(fields[1151]) || 0,  // Field 1152
            trainerPreviousYearWins: parseInt(fields[1152]) || 0,    // Field 1153
            trainerPreviousYearPlaces: parseInt(fields[1153]) || 0,  // Field 1154
            trainerPreviousYearShows: parseInt(fields[1154]) || 0,   // Field 1155

            // Jockey info - Current Meet (CM)
            jockey: fields[32],              // Field 33
            jockeyStarts: parseInt(fields[34]) || 0,        // Field 35
            jockeyWins: parseInt(fields[35]) || 0,          // Field 36
            jockeyPlaces: parseInt(fields[36]) || 0,        // Field 37
            jockeyShows: parseInt(fields[37]) || 0,         // Field 38

            // Jockey info - Most Recent (MR) - Current Year (Fields 1157-1160) + Previous Year (Fields 1162-1165)
            jockeyCurrentYearStarts: parseInt(fields[1156]) || 0,    // Field 1157
            jockeyCurrentYearWins: parseInt(fields[1157]) || 0,      // Field 1158
            jockeyCurrentYearPlaces: parseInt(fields[1158]) || 0,    // Field 1159
            jockeyCurrentYearShows: parseInt(fields[1159]) || 0,     // Field 1160
            jockeyPreviousYearStarts: parseInt(fields[1161]) || 0,   // Field 1162
            jockeyPreviousYearWins: parseInt(fields[1162]) || 0,     // Field 1163
            jockeyPreviousYearPlaces: parseInt(fields[1163]) || 0,   // Field 1164
            jockeyPreviousYearShows: parseInt(fields[1164]) || 0,    // Field 1165

            owner: fields[38],               // Field 39
            silks: fields[39],               // Field 40
            morningLineOdds: fields[43],     // Field 44

            // Pace Par Values (Fields 214-218)
            pacePar2F: parseInt(fields[213]) || 0,       // Field 214 - 2f BRIS Pace Par
            pacePar4F: parseInt(fields[214]) || 0,       // Field 215 - 4f BRIS Pace Par
            pacePar6F: parseInt(fields[215]) || 0,       // Field 216 - 6f BRIS Pace Par
            paceParSpeed: parseInt(fields[216]) || 0,    // Field 217 - BRIS Speed Par
            paceParLate: parseInt(fields[217]) || 0,     // Field 218 - BRIS Late Pace Par

            // BRIS Run Style and Speed Points (Fields 210-211)
            brisRunStyle: fields[209] || '',             // Field 210 - BRIS Run Style
            earlySpeedPoints: fields[210] || '',         // Field 211 - Quirin Speed Points

            // Jockey/Trainer Combo Statistics
            jtComboStarts: parseInt(fields[218]) || 0,   // Field 219
            jtComboWins: parseInt(fields[219]) || 0,     // Field 220
            jtComboPlaces: parseInt(fields[220]) || 0,   // Field 221
            jtComboShows: parseInt(fields[221]) || 0,    // Field 222

            // Money Rating Statistics
            // Distance (Fields 65-69)
            distanceStarts: parseInt(fields[64]) || 0,
            distanceWins: parseInt(fields[65]) || 0,
            distancePlaces: parseInt(fields[66]) || 0,
            distanceShows: parseInt(fields[67]) || 0,
            distanceEarnings: parseFloat(fields[68]) || 0,

            // Track (Fields 70-74)
            trackStarts: parseInt(fields[69]) || 0,
            trackWins: parseInt(fields[70]) || 0,
            trackPlaces: parseInt(fields[71]) || 0,
            trackShows: parseInt(fields[72]) || 0,
            trackEarnings: parseFloat(fields[73]) || 0,

            // Turf (Fields 75-79)
            turfStarts: parseInt(fields[74]) || 0,
            turfWins: parseInt(fields[75]) || 0,
            turfPlaces: parseInt(fields[76]) || 0,
            turfShows: parseInt(fields[77]) || 0,
            turfEarnings: parseFloat(fields[78]) || 0,

            // Wet (Fields 80-84)
            wetStarts: parseInt(fields[79]) || 0,
            wetWins: parseInt(fields[80]) || 0,
            wetPlaces: parseInt(fields[81]) || 0,
            wetShows: parseInt(fields[82]) || 0,
            wetEarnings: parseFloat(fields[83]) || 0,

            // Current Year (Fields 86-90)
            currentYearStarts: parseInt(fields[85]) || 0,
            currentYearWins: parseInt(fields[86]) || 0,
            currentYearPlaces: parseInt(fields[87]) || 0,
            currentYearShows: parseInt(fields[88]) || 0,
            currentYearEarnings: parseFloat(fields[89]) || 0,

            // Previous Year (Fields 92-96)
            previousYearStarts: parseInt(fields[91]) || 0,
            previousYearWins: parseInt(fields[92]) || 0,
            previousYearPlaces: parseInt(fields[93]) || 0,
            previousYearShows: parseInt(fields[94]) || 0,
            previousYearEarnings: parseFloat(fields[95]) || 0,

            // Lifetime (Fields 97-101)
            lifetimeStarts: parseInt(fields[96]) || 0,
            lifetimeWins: parseInt(fields[97]) || 0,
            lifetimePlaces: parseInt(fields[98]) || 0,
            lifetimeShows: parseInt(fields[99]) || 0,
            lifetimeEarnings: parseFloat(fields[100]) || 0,

            // All Weather (Fields 231-235)
            allWeatherStarts: parseInt(fields[230]) || 0,
            allWeatherWins: parseInt(fields[231]) || 0,
            allWeatherPlaces: parseInt(fields[232]) || 0,
            allWeatherShows: parseInt(fields[233]) || 0,
            allWeatherEarnings: parseFloat(fields[234]) || 0,

            // Fast Track (Fields 1332-1336)
            fastStarts: parseInt(fields[1331]) || 0,
            fastWins: parseInt(fields[1332]) || 0,
            fastPlaces: parseInt(fields[1333]) || 0,
            fastShows: parseInt(fields[1334]) || 0,
            fastEarnings: parseFloat(fields[1335]) || 0,

            // Best Speed Values
            bestSpeedLife: parseInt(fields[1327]) || 0,           // Field 1328 - Best BRIS Speed: Life
            bestSpeedMostRecentYear: parseInt(fields[1328]) || 0, // Field 1329 - Best BRIS Speed: Most Recent Yr
            bestSpeed2ndRecentYear: parseInt(fields[1329]) || 0,  // Field 1330 - Best BRIS Speed: 2nd Most Recent Yr
            bestSpeedTrack: parseInt(fields[1330]) || 0,          // Field 1331 - Best BRIS Speed: Today's Track
            bestSpeedFast: parseInt(fields[1177]) || 0,           // Field 1178 - Best BRIS Speed: Fast track
            bestSpeedTurf: parseInt(fields[1178]) || 0,           // Field 1179 - Best BRIS Speed: Turf
            bestSpeedWet: parseInt(fields[1179]) || 0,            // Field 1180 - Best BRIS Speed: Off track
            bestSpeedDistance: parseInt(fields[1180]) || 0,       // Field 1181 - Best BRIS Speed: Distance
            bestSpeedAllWeather: parseInt(fields[235]) || 0,      // Field 236 - Best BRIS Speed: All Weather Surface

            // Additional fields (BRISNET field numbers are 1-based, array indices are 0-based)
            powerRating: fields[250] || '',  // Field 251
            studFee: fields[1176] || '',     // Field 1177 - Sire Stud Fee
            salesPrice: fields[1221] || '',  // Field 1222 - Auction Price

            // Section 2 & 4: Statistics (for money ratings calculation)
            // Lifetime Record (Fields 97-101)
            lifetimeStarts: parseInt(fields[96]) || 0,   // Field 97
            lifetimeWins: parseInt(fields[97]) || 0,     // Field 98
            lifetimePlaces: parseInt(fields[98]) || 0,   // Field 99
            lifetimeShows: parseInt(fields[99]) || 0,    // Field 100
            lifetimeEarnings: parseFloat(fields[100]) || 0, // Field 101

            // Current Year Record (Fields 86-90)
            currentYearStarts: parseInt(fields[85]) || 0,   // Field 86
            currentYearWins: parseInt(fields[86]) || 0,     // Field 87
            currentYearPlaces: parseInt(fields[87]) || 0,   // Field 88
            currentYearShows: parseInt(fields[88]) || 0,    // Field 89
            currentYearEarnings: parseFloat(fields[89]) || 0, // Field 90

            // Previous Year Record (Fields 92-96)
            previousYearStarts: parseInt(fields[91]) || 0,   // Field 92
            previousYearWins: parseInt(fields[92]) || 0,     // Field 93
            previousYearPlaces: parseInt(fields[93]) || 0,   // Field 94
            previousYearShows: parseInt(fields[94]) || 0,    // Field 95
            previousYearEarnings: parseFloat(fields[95]) || 0, // Field 96

            // Section 3: Speed ratings
            speedRatings: this.extractSpeedRatings(fields),

            // Workout data (Fields 102-209 for 12 workouts)
            // Most recent workout is #1 (Fields 102, 114, 126, 138, 150, 162, 174, 186, 198)
            // All 12 workout dates for calculating workouts in last 30 days
            workoutDates: [
                fields[101] || '',  // Workout #1 - Field 102
                fields[102] || '',  // Workout #2 - Field 103
                fields[103] || '',  // Workout #3 - Field 104
                fields[104] || '',  // Workout #4 - Field 105
                fields[105] || '',  // Workout #5 - Field 106
                fields[106] || '',  // Workout #6 - Field 107
                fields[107] || '',  // Workout #7 - Field 108
                fields[108] || '',  // Workout #8 - Field 109
                fields[109] || '',  // Workout #9 - Field 110
                fields[110] || '',  // Workout #10 - Field 111
                fields[111] || '',  // Workout #11 - Field 112
                fields[112] || ''   // Workout #12 - Field 113
            ],
            lastWorkoutDate: fields[101] || '',          // Field 102 - Date of Workout #1
            lastWorkoutTime: fields[113] || '',          // Field 114 - Time of Workout #1
            lastWorkoutTrack: fields[125] || '',         // Field 126 - Track of Workout #1
            lastWorkoutDistance: fields[137] || '',      // Field 138 - Distance of Workout #1
            lastWorkoutCondition: fields[149] || '',     // Field 150 - Track Condition of Workout #1
            lastWorkoutDescription: fields[161] || '',   // Field 162 - Description of Workout #1
            lastWorkoutTrackType: fields[173] || '',     // Field 174 - Main/Inner track indicator #1
            lastWorkoutNumWorks: fields[185] || '',      // Field 186 - # of Works that day/distance #1
            lastWorkoutRank: fields[197] || '',          // Field 198 - Rank of the work #1

            // Section 5-8: Past performances (last 4 races)
            pastPerformances: this.extractPastPerformances(fields)
        };

        this.races.get(raceKey).horses.push(horse);
    }

    /**
     * Extract speed ratings from various race segments
     */
    extractSpeedRatings(fields) {
        // Speed ratings are typically in fields around 85-95
        // These need to be mapped to specific race segments
        return {
            early: fields[85] || '',
            middle: fields[86] || '',
            late: fields[87] || '',
            final: fields[88] || ''
        };
    }

    /**
     * Extract past performance data from fields (up to 10 races)
     *
     * IMPORTANT: Past performance data is organized BY FIELD TYPE across all 10 races,
     * NOT by race sequentially!
     *
     * Structure:
     * Fields 256-265: Race Dates for races 1-10 (10 fields)
     * Fields 266-274: Days since previous race for races 1-9 (9 fields)
     * Fields 276-285: Track Codes for races 1-10 (10 fields)
     * Fields 286-295: BRIS Track Codes for races 1-10 (10 fields)
     * Fields 296-305: Race Numbers for races 1-10 (10 fields)
     * Fields 306-315: Track Conditions for races 1-10 (10 fields)
     * Fields 316-325: Distances for races 1-10 (10 fields)
     * Fields 326-335: Surfaces for races 1-10 (10 fields)
     * ... and so on
     */
    extractPastPerformances(fields) {
        const pps = [];

        // Speed Par fields: 1167-1176 (one per race, index 1166-1175)
        const speedParBaseIndex = 1166;

        // Nasal Strip codes: 1254-1263 (one per race, index 1253-1262)
        const nasalStripBaseIndex = 1253;

        // Process up to 10 past performances
        for (let i = 0; i < 10; i++) {
            // Each field group contains 10 values (one per race)
            // To get race i's value, use: baseFieldIndex + i

            // Field 256-265: Race Date (index 255-264)
            const date = fields[255 + i];

            if (date) {
                pps.push({
                    // Basic race info
                    date: date,                                // Field 256-265 (index 255+i)
                    track: fields[285 + i] || '',             // Field 286-295 (BRIS Track Code, index 285+i)

                    // Section 3: D-Sf-Cd-Cg data
                    distance: fields[315 + i] || '',          // Field 316-325 (Distance in yards, index 315+i)
                    surface: fields[325 + i] || '',           // Field 326-335 (Surface, index 325+i)
                    condition: fields[305 + i] || '',         // Field 306-315 (Track Condition, index 305+i)

                    // Section 1: P-T-C data
                    purse: fields[555 + i] || '',             // Field 556-565 (Purse, index 555+i)
                    raceType: fields[1085 + i] || '',         // Field 1086-1095 (Race Type, index 1085+i)
                    claimingPrice: fields[1201 + i] || '',    // Field 1202-1211 ("Low" Claiming Price, index 1201+i)

                    // Section 2: Speed Par (stored separately)
                    speedPar: fields[speedParBaseIndex + i] || '', // Field 1167-1176 (index 1166+i)

                    // Sections 6-10: Pace Ratings
                    paceFig2F: fields[765 + i] || '',         // Field 766-775 (BRIS 2f Pace Fig, index 765+i)
                    paceFig4F: fields[775 + i] || '',         // Field 776-785 (BRIS 4f Pace Fig, index 775+i)
                    paceFig6F: fields[785 + i] || '',         // Field 786-795 (BRIS 6f Pace Fig, index 785+i)
                    paceFigLate: fields[815 + i] || '',       // Field 816-825 (BRIS Late Pace Fig, index 815+i)
                    paceFigSpeed: fields[845 + i] || '',      // Field 846-855 (BRIS Speed Rating, index 845+i)

                    // Change detection fields - VERIFY OFFSETS
                    jockey: fields[1065 + i] || '',           // Jockey name - VERIFY
                    trainer: fields[1055 + i] || '',          // Trainer name - VERIFY
                    claimedCode: fields[1045 + i] || '',      // Claimed code - VERIFY
                    nasalStripCode: fields[nasalStripBaseIndex + i] || '', // Field 1254-1263 (index 1253+i)

                    // Position data for Column 6
                    postPosition: fields[355 + i] || '',      // Field 356-365 (Post Position, index 355+i)
                    numHorses: fields[345 + i] || '',         // Field 346-355 (# of entrants, index 345+i)
                    position2F: fields[575 + i] || '',        // Field 576-585 (1st Call Position, index 575+i)
                    position4F: fields[585 + i] || '',        // Field 586-595 (2nd Call Position, index 585+i)
                    positionLate: fields[605 + i] || '',      // Field 606-615 (Stretch Position, index 605+i)
                    finishPosition: fields[615 + i] || '',    // Field 616-625 (Finish Position, index 615+i)

                    // Other data - VERIFY OFFSETS
                    lengthsBehind: fields[635 + i] || '',     // Lengths behind - VERIFY
                    odds: fields[515 + i] || '',              // Field 516-525 (Odds, index 515+i) - VERIFY
                    comment: fields[395 + i] || '',           // Trip Comment - VERIFY
                    weight: fields[505 + i] || ''             // Field 506-515 (Weight, index 505+i) - VERIFY
                });
            }
        }

        return pps;
    }

    /**
     * Get medication label from code
     * @param {string} code - Medication code from Field 62
     * @returns {string} Medication label
     */
    getMedicationLabel(code) {
        const medicationMap = {
            '0': '',      // None - display blank
            '1': 'L',     // Lasix
            '2': 'B',     // Bute
            '3': 'BL',    // Bute & Lasix
            '4': 'L1',    // 1st time Lasix
            '5': 'BL1',   // Bute & 1st Lasix
            '9': 'N/A'    // Medication info unavailable
        };

        return medicationMap[code] || '';
    }

    /**
     * Format post time from HHMM format to HH:MM AM/PM
     * @param {string} postTime - Post time in HHMM format (e.g., "1430")
     * @returns {string} Formatted time (e.g., "2:30 PM")
     */
    formatPostTime(postTime) {
        if (!postTime || postTime.length < 3) return '';
        
        // Handle HHMM format (e.g., "1430" or "930")
        let timeStr = postTime.trim();
        
        // Pad with leading zero if needed (e.g., "930" -> "0930")
        if (timeStr.length === 3) {
            timeStr = '0' + timeStr;
        }
        
        if (timeStr.length !== 4) return postTime; // Return as-is if unexpected format
        
        let hours = parseInt(timeStr.substring(0, 2));
        let minutes = parseInt(timeStr.substring(2, 4));
        
        if (isNaN(hours) || hours < 0 || hours > 23) return postTime;
        
        // Convert from Pacific Time to Central Time (add 2 hours)
        hours = hours + 2;
        if (hours >= 24) {
            hours = hours - 24;
        }
        
        // Convert to 12-hour format
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period} CT`;
    }

    /**
     * Calculate horse age from year of birth and foaling month
     * @param {string} yearOfBirth - 2-digit year (e.g., "19" for 2019)
     * @param {string} foalingMonth - Month number (1-12)
     * @returns {number} Age rounded to 1 decimal precision
     */
    calculateAge(yearOfBirth, foalingMonth) {
        if (!yearOfBirth) return 0;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
        const currentDay = currentDate.getDate();

        // Convert 2-digit year to 4-digit year
        // Assume years 00-50 are 2000s, 51-99 are 1900s
        let birthYear = parseInt(yearOfBirth);
        if (isNaN(birthYear)) return 0;

        if (birthYear <= 50) {
            birthYear += 2000;
        } else if (birthYear < 100) {
            birthYear += 1900;
        }

        const birthMonth = parseInt(foalingMonth) || 1;

        // Calculate age in years with decimal precision
        let age = currentYear - birthYear;

        // Calculate the fractional part based on months
        const monthDiff = currentMonth - birthMonth;
        const fractionalAge = monthDiff / 12;

        age += fractionalAge;

        // Round to 1 decimal place
        return Math.round(age * 10) / 10;
    }

    /**
     * Convert distance to furlongs
     * Distance in DRF is typically in yards or feet
     */
    convertToFurlongs(distance) {
        if (!distance) return '';

        // Remove any non-numeric characters except decimal point
        const numericDistance = parseFloat(distance.replace(/[^\d.]/g, ''));

        if (isNaN(numericDistance)) return distance;

        // Common conversions:
        // 1 furlong = 220 yards = 660 feet
        // If distance is in yards (most common in DRF)
        if (numericDistance < 100) {
            // Likely already in furlongs or a fraction
            return numericDistance.toFixed(1) + ' F';
        } else if (numericDistance >= 220) {
            // Likely in yards
            const furlongs = numericDistance / 220;
            return furlongs.toFixed(1) + ' F';
        }

        return distance;
    }

    /**
     * Get organized data by race
     */
    getOrganizedData() {
        const races = Array.from(this.races.values());

        // Sort races by race number
        races.sort((a, b) => parseInt(a.raceNumber) - parseInt(b.raceNumber));

        // Sort horses within each race by post position
        races.forEach(race => {
            race.horses.sort((a, b) => parseInt(a.postPosition) - parseInt(b.postPosition));
        });

        return {
            trackCode: races[0]?.trackCode || '',
            date: races[0]?.date || '',
            races: races,
            totalRaces: races.length,
            totalHorses: races.reduce((sum, race) => sum + race.horses.length, 0)
        };
    }
}

