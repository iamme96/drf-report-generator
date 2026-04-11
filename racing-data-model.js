/**
 * Horse Racing Data Model - Relational Object Structure
 * Converts flat BRISNET .EG data into normalized relational objects
 */

// Core Entity Classes

class Race {
    constructor(data = {}) {
        this.id = data.id || '';
        this.track = data.track || '';
        this.date = data.date || '';
        this.raceNumber = data.raceNumber || '';
        this.distance = data.distance || '';
        this.surface = data.surface || '';
        this.raceType = data.raceType || '';
        this.ageSexRestrictions = data.ageSexRestrictions || '';
        this.classification = data.classification || '';
        this.purse = data.purse || '';
        this.claimingPrice = data.claimingPrice || '';
        this.trackRecord = data.trackRecord || '';
        this.conditions = data.conditions || '';
        this.lasixList = data.lasixList || '';
        this.buteList = data.buteList || '';
        this.coupledList = data.coupledList || '';
        this.mutuelList = data.mutuelList || '';
        this.simulcastHostTrack = data.simulcastHostTrack || '';
        this.simulcastHostRace = data.simulcastHostRace || '';
        this.allWeatherFlag = data.allWeatherFlag || '';

        // Relationships
        this.horses = [];
    }

    addHorse(horse) {
        this.horses.push(horse);
        horse.raceId = this.id;
    }

    getHorseCount() {
        return this.horses.length;
    }

    getFieldSize() {
        return this.horses.length;
    }
}

class Horse {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.age = data.age || '';
        this.sex = data.sex || '';
        this.color = data.color || '';
        this.sire = data.sire || '';
        this.dam = data.dam || '';
        this.owner = data.owner || '';
        this.breeder = data.breeder || '';
        this.foalingDate = data.foalingDate || '';
        this.stateCountryBred = data.stateCountryBred || '';

        // Race-specific data
        this.raceId = data.raceId || '';
        this.postPosition = data.postPosition || '';
        this.programNumber = data.programNumber || '';
        this.morningLineOdds = data.morningLineOdds || '';
        this.weight = data.weight || '';
        this.medication = data.medication || '';
        this.equipment = data.equipment || '';
        this.claimingPrice = data.claimingPrice || '';

        // Relationships
        this.trainer = null;
        this.jockey = null;
        this.raceHistory = [];
        this.workouts = [];
    }

    setTrainer(trainer) {
        this.trainer = trainer;
    }

    setJockey(jockey) {
        this.jockey = jockey;
    }

    addPastPerformance(performance) {
        this.raceHistory.push(performance);
    }

    addWorkout(workout) {
        this.workouts.push(workout);
    }

    getRecentForm(races = 5) {
        return this.raceHistory
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, races);
    }
}

class Trainer {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';

        this.currentMeet = {
            starts: data.currentMeetStarts || 0,
            wins: data.currentMeetWins || 0,
            places: data.currentMeetPlaces || 0,
            shows: data.currentMeetShows || 0,
            earnings: data.currentMeetEarnings || 0
        };

        this.yearToDate = {
            starts: data.ytdStarts || 0,
            wins: data.ytdWins || 0,
            places: data.ytdPlaces || 0,
            shows: data.ytdShows || 0,
            earnings: data.ytdEarnings || 0
        };

        this.career = {
            starts: data.careerStarts || 0,
            wins: data.careerWins || 0,
            places: data.careerPlaces || 0,
            shows: data.careerShows || 0,
            earnings: data.careerEarnings || 0
        };

        // Specialty stats
        this.distanceStats = {};
        this.surfaceStats = {};
        this.classStats = {};
    }

    getWinPercentage(period = 'career') {
        const stats = this[period];
        return stats.starts > 0 ? (stats.wins / stats.starts * 100).toFixed(1) : 0;
    }

    getInTheMoneyPercentage(period = 'career') {
        const stats = this[period];
        const itm = stats.wins + stats.places + stats.shows;
        return stats.starts > 0 ? (itm / stats.starts * 100).toFixed(1) : 0;
    }
}

class Jockey {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';

        this.currentMeet = {
            starts: data.currentMeetStarts || 0,
            wins: data.currentMeetWins || 0,
            places: data.currentMeetPlaces || 0,
            shows: data.currentMeetShows || 0,
            earnings: data.currentMeetEarnings || 0
        };

        this.yearToDate = {
            starts: data.ytdStarts || 0,
            wins: data.ytdWins || 0,
            places: data.ytdPlaces || 0,
            shows: data.ytdShows || 0,
            earnings: data.ytdEarnings || 0
        };

        this.career = {
            starts: data.careerStarts || 0,
            wins: data.careerWins || 0,
            places: data.careerPlaces || 0,
            shows: data.careerShows || 0,
            earnings: data.careerEarnings || 0
        };

        // Specialty stats
        this.distanceStats = {};
        this.surfaceStats = {};
        this.classStats = {};
    }

    getWinPercentage(period = 'career') {
        const stats = this[period];
        return stats.starts > 0 ? (stats.wins / stats.starts * 100).toFixed(1) : 0;
    }

    getInTheMoneyPercentage(period = 'career') {
        const stats = this[period];
        const itm = stats.wins + stats.places + stats.shows;
        return stats.starts > 0 ? (itm / stats.starts * 100).toFixed(1) : 0;
    }
}

class PastPerformance {
    constructor(data = {}) {
        this.horseId = data.horseId || '';
        this.date = data.date || '';
        this.track = data.track || '';
        this.raceNumber = data.raceNumber || '';
        this.distance = data.distance || '';
        this.surface = data.surface || '';
        this.condition = data.condition || '';
        this.raceType = data.raceType || '';
        this.raceClass = data.raceClass || '';
        this.purse = data.purse || '';
        this.claimingPrice = data.claimingPrice || '';
        this.field = data.field || '';
        this.postPosition = data.postPosition || '';
        this.odds = data.odds || '';
        this.weight = data.weight || '';
        this.jockey = data.jockey || '';
        this.trainer = data.trainer || '';
        this.finishPosition = data.finishPosition || '';
        this.margin = data.margin || '';
        this.time = data.time || '';
        this.speed = data.speed || '';
        this.earnings = data.earnings || '';
        this.comment = data.comment || '';
    }

    isWin() {
        return this.finishPosition === '1';
    }

    isPlace() {
        return ['1', '2'].includes(this.finishPosition);
    }

    isShow() {
        return ['1', '2', '3'].includes(this.finishPosition);
    }

    isInTheMoney() {
        return this.isShow();
    }
}

class Workout {
    constructor(data = {}) {
        this.horseId = data.horseId || '';
        this.date = data.date || '';
        this.track = data.track || '';
        this.distance = data.distance || '';
        this.surface = data.surface || '';
        this.time = data.time || '';
        this.handily = data.handily || '';
        this.rank = data.rank || '';
        this.totalWorkouts = data.totalWorkouts || '';
        this.comment = data.comment || '';
    }

    isRecent(days = 7) {
        const workoutDate = new Date(this.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return workoutDate >= cutoffDate;
    }
}

/**
 * Data Processor - Converts flat BRISNET data to relational objects
 */
class RacingDataProcessor {
    constructor() {
        this.races = new Map();          // raceId -> Race object
        this.horses = new Map();         // horseId -> Horse object
        this.trainers = new Map();       // trainerId -> Trainer object
        this.jockeys = new Map();        // jockeyId -> Jockey object
    }

    /**
     * Process raw BRISNET data array into relational objects
     * @param {Array} raceDataArray - Raw parsed data from .EG file
     * @returns {Object} - Processed data with all entities
     */
    processRawData(raceDataArray) {
        console.log('Processing', raceDataArray.length, 'records...');

        for (let i = 0; i < raceDataArray.length; i++) {
            const record = raceDataArray[i];

            try {
                // Skip records with insufficient data
                if (record.length < 25) continue;

                // 1. Create or update Race
                const race = this.createOrUpdateRace(record);

                // 2. Create or update Horse
                const horse = this.createOrUpdateHorse(record);

                // 3. Create or update Trainer
                const trainer = this.createOrUpdateTrainer(record);

                // 4. Create or update Jockey
                const jockey = this.createOrUpdateJockey(record);

                // 5. Parse and add Past Performances (if present)
                this.addPastPerformances(horse, record);

                // 6. Parse and add Workouts (if present)
                this.addWorkouts(horse, record);

                // 7. Establish relationships
                this.establishRelationships(race, horse, trainer, jockey);

            } catch (error) {
                console.error(`Error processing record ${i}:`, error);
            }
        }

        console.log('Processing complete:', {
            races: this.races.size,
            horses: this.horses.size,
            trainers: this.trainers.size,
            jockeys: this.jockeys.size
        });

        return this.getProcessedData();
    }

    createOrUpdateRace(record) {
        const raceId = `${record[0]}_${record[1]}_${record[2]}`;

        if (!this.races.has(raceId)) {
            const race = new Race({
                id: raceId,
                track: record[0],
                date: record[1],
                raceNumber: record[2],
                distance: record[5],
                surface: record[6],
                raceType: record[8],
                ageSexRestrictions: record[9],
                classification: record[10],
                purse: record[11],
                claimingPrice: record[12],
                trackRecord: record[14],
                conditions: record[15],
                lasixList: record[16],
                buteList: record[17],
                coupledList: record[18],
                mutuelList: record[19],
                simulcastHostTrack: record[20],
                simulcastHostRace: record[21],
                allWeatherFlag: record[24]
            });

            this.races.set(raceId, race);
        }

        return this.races.get(raceId);
    }

    createOrUpdateHorse(record) {
        // Create unique horse ID (you may need to adjust based on actual field positions)
        const horseName = record[3] || '';  // Assuming field 4 is horse name
        const horseId = this.generateHorseId(record);

        if (!this.horses.has(horseId)) {
            const horse = new Horse({
                id: horseId,
                name: horseName,
                // Add other horse fields based on BRISNET format
                // You'll need to map these to the correct field positions
                postPosition: record[4] || '',
                // ... other fields
            });

            this.horses.set(horseId, horse);
        }

        return this.horses.get(horseId);
    }

    createOrUpdateTrainer(record) {
        // Assuming trainer name is in a specific field (adjust as needed)
        const trainerName = record[30] || '';  // Placeholder - adjust field position
        const trainerId = this.generateTrainerId(trainerName);

        if (!this.trainers.has(trainerId)) {
            const trainer = new Trainer({
                id: trainerId,
                name: trainerName,
                // Add trainer stats from record (adjust field positions)
                // currentMeetStarts: record[31] || 0,
                // ... other stats
            });

            this.trainers.set(trainerId, trainer);
        }

        return this.trainers.get(trainerId);
    }

    createOrUpdateJockey(record) {
        // Assuming jockey name is in a specific field (adjust as needed)
        const jockeyName = record[35] || '';  // Placeholder - adjust field position
        const jockeyId = this.generateJockeyId(jockeyName);

        if (!this.jockeys.has(jockeyId)) {
            const jockey = new Jockey({
                id: jockeyId,
                name: jockeyName,
                // Add jockey stats from record (adjust field positions)
                // currentMeetStarts: record[36] || 0,
                // ... other stats
            });

            this.jockeys.set(jockeyId, jockey);
        }

        return this.jockeys.get(jockeyId);
    }

    addPastPerformances(horse, record) {
        // Parse past performance data from record
        // This will depend on how BRISNET stores historical data in the record
        // You may need to parse multiple past races from specific field ranges

        // Example implementation (adjust based on actual format):
        // const ppStartIndex = 50;  // Adjust based on actual format
        // const ppFieldCount = 10;  // Fields per past performance
        // const maxPPs = 10;        // Maximum past performances

        // for (let i = 0; i < maxPPs; i++) {
        //     const startIdx = ppStartIndex + (i * ppFieldCount);
        //     if (startIdx + ppFieldCount <= record.length) {
        //         const pp = new PastPerformance({
        //             horseId: horse.id,
        //             date: record[startIdx],
        //             track: record[startIdx + 1],
        //             // ... other fields
        //         });
        //         horse.addPastPerformance(pp);
        //     }
        // }
    }

    addWorkouts(horse, record) {
        // Parse workout data from record
        // Similar to past performances, adjust based on actual BRISNET format

        // Example implementation:
        // const workoutStartIndex = 150;  // Adjust based on actual format
        // Parse workout data and create Workout objects
    }

    establishRelationships(race, horse, trainer, jockey) {
        // Establish all relationships
        race.addHorse(horse);
        horse.setTrainer(trainer);
        horse.setJockey(jockey);

        // Store in maps for easy lookup (only if not already present)
        if (!this.races.has(race.id)) {
            this.races.set(race.id, race);
        }
        if (!this.horses.has(horse.id)) {
            this.horses.set(horse.id, horse);
        }
        // Trainers and jockeys are already added in their respective methods
        // No need to add them again here
    }

    // Helper methods for generating unique IDs
    generateHorseId(record) {
        const name = record[3] || '';
        const track = record[0] || '';
        const date = record[1] || '';
        const raceNum = record[2] || '';
        const postPos = record[4] || '';
        // Create a unique ID based on horse name, track, date, race, and post position
        // This ensures each horse in each race gets a unique ID
        return `horse_${track}_${date}_${raceNum}_${postPos}_${name}`.replace(/[^a-zA-Z0-9_]/g, '_');
    }

    generateTrainerId(name) {
        return `trainer_${name}`.replace(/[^a-zA-Z0-9_]/g, '_');
    }

    generateJockeyId(name) {
        return `jockey_${name}`.replace(/[^a-zA-Z0-9_]/g, '_');
    }

    getProcessedData() {
        return {
            races: Array.from(this.races.values()),
            horses: Array.from(this.horses.values()),
            trainers: Array.from(this.trainers.values()),
            jockeys: Array.from(this.jockeys.values()),
            summary: {
                totalRaces: this.races.size,
                totalHorses: this.horses.size,
                totalTrainers: this.trainers.size,
                totalJockeys: this.jockeys.size
            }
        };
    }

    // Query methods
    getRaceById(raceId) {
        return this.races.get(raceId);
    }

    getHorsesByRace(raceId) {
        const race = this.races.get(raceId);
        return race ? race.horses : [];
    }

    getTrainerStats(trainerId) {
        return this.trainers.get(trainerId);
    }

    getJockeyStats(jockeyId) {
        return this.jockeys.get(jockeyId);
    }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Race,
        Horse,
        Trainer,
        Jockey,
        PastPerformance,
        Workout,
        RacingDataProcessor
    };
}
