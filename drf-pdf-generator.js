/**
 * DRF PDF Report Generator
 * Generates PDF reports matching the LSX0426.pdf format
 */

/**
 * Configuration: Weighted values for purse calculations
 * These weights are used across multiple calculations including:
 * - J/T Combo statistics
 * - Future performance calculations
 */
const PURSE_WEIGHTS = {
    WIN: 0.6,      // Weighted Win value
    PLACE: 0.2,    // Weighted Place value
    SHOW: 0.11,    // Weighted Show value
    FOURTH: 0.06   // Weighted 4th Place value
};

/**
 * Configuration: Correlation coefficients for performance rating calculations
 * These coefficients are used to calculate the PR score in Table 2, Column 7
 */
const CORRELATION_COEFFICIENTS = {
    PR: 0.295,        // Power Rating correlation
    MONEY_MR: 0.130,  // Money Rating correlation
    JOCKEY_MR: 0.128, // Jockey Money Rating correlation
    TRAINER_MR: 0.154,// Trainer Money Rating correlation
    SPEED_MR: 0.183,  // Speed Money Rating correlation
    AVG_PAR: 0.110    // Average Par correlation
};

class DRFPDFGenerator {
    constructor() {
        this.doc = null;
        this.currentY = 0;
        this.pageWidth = 792; // Letter size landscape in points
        this.pageHeight = 612;
        this.margin = 20; // Reduced from 40 to maximize space
        this.contentWidth = this.pageWidth - (this.margin * 2);

        // Embedded track mapping (from reference-data/track.json)
        this.trackMapping = {
            "DMR": "Del Mar", "DED": "Delta Downs", "AQU": "Aqueduct", "AP": "Arlington Park",
            "BC": "Breeders Cup", "BEL": "Belmont Park", "BEU": "Beulah Park", "BM": "Bay Meadows",
            "CBY": "Canterbury Park", "CD": "Churchill Downs", "CLS": "Columbus", "CNL": "Colonial Downs",
            "CRC": "Calder Race Course", "CT": "Charles Town", "DEL": "Delaware Park", "ELP": "Ellis Park",
            "EMD": "Emerald Downs", "EVD": "Evangeline Downs", "FE": "Fort Erie", "FG": "Fair Grounds",
            "FPK": "Fairmount Park", "FPZ": "OLDFairplex", "GG": "Golden Gate Fields", "GLD": "Great Lakes Down",
            "GP": "Gulfstream Park", "GS": "Garden State", "HAW": "Hawthorne", "HIA": "Hialeah Park",
            "FMT": "Fair Meadows Tulsa", "HOZ": "OLDHoosier", "HOL": "Hollywood Park OLD", "HOO": "Hoosier",
            "HOU": "Sam Houston Park", "HST": "Hastings Park", "IND": "Indiana Grand Race Course", "KEE": "Keeneland",
            "LA": "Los Alamitos Qh", "LAZ": "OLDLos Alamitos", "LAD": "Louisiana Downs", "LRL": "Laurel Park",
            "LS": "Lone Star Park", "MAG": "Magna Pick 5", "MED": "Meadowlands", "MNR": "Mountaineer",
            "MTH": "Monmouth Park", "OP": "Oaklawn Park", "OSA": "Oak Tree (santa Anita)", "PEN": "Penn National",
            "PHA": "Philadelphia Park", "PIM": "Pimlico", "PLN": "Pleasanton", "PM": "Portland Meadows",
            "PRM": "Prairie Meadows", "RD": "River Downs", "RET": "Retama Park", "RKM": "Rockingham Park",
            "RP": "Remington Park", "SA": "Santa Anita Park", "SAR": "Saratoga", "SOL": "Solana, CA",
            "SPT": "Sportsman Park", "SUF": "Suffolk Downs", "SUN": "Sunland Park", "TAM": "Tampa Bay Downs",
            "TDN": "Thistledown", "TIM": "Timonium", "TP": "Turfway Park", "TUP": "Turf Paradise",
            "WO": "Woodbine", "WOZ": "OLDWoodbine Canada", "YAV": "Yavapai", "ZIA": "Zia Park",
            "DG": "Cochise Co. Fair @ Douglas", "EMT": "Emmett", "FL": "Finger Lakes", "FON": "Fonner Park",
            "FTP": "Fort Pierre", "MAN": "Manor Downs", "NPF": "Premier Pick 4", "STP": "Stampede Park",
            "SUD": "Sun Downs", "SRP": "Sun Ray", "WRD": "Will Rogers Downs", "ASD": "Assiniboia Downs",
            "BCF": "Brown County Fair", "BOI": "Les Bois Park", "LBG": "Lethbridge", "LNN": "Lincoln State Fair",
            "MC": "Miles City", "MOF": "Mohave County Fair", "MPM": "Mount Pleasant Meadows", "POD": "Pocatello Downs",
            "PID": "Presque Isle Downs", "WW": "Walla Walla", "WTS": "Waitsburg Race Track", "TAB": "Twinspires.com Contest",
            "RUI": "Ruidoso Downs", "BRD": "Blue Ribbon Downs", "DUB": "Dubai", "OTH": "Oak Tree (HOLLYWOOD)",
            "PRX": "Parx Racing", "FPX": "Fairplex", "BHP": "Hollywood Park", "BTP": "Belterra Park",
            "NP": "Northlands Park", "JP": "Jackpot 5", "AJ": "Ajax Downs", "ARP": "Arapahoe Park",
            "KD": "Kentucky Downs", "GPW": "Gulfstream Park West", "LRC": "Los Alamitos Tb", "MVR": "Mahoning Valley Racecourse"
        };

        // Embedded surface mapping (from reference-data/surface.json)
        this.surfaceMapping = {
            "D": "Dirt",
            "T": "Turf",
            "t": "Inner Turf",
            "s": "Steeplechase",
            "h": "Hunt"
        };

        // Embedded race type mapping (from reference-data/race-type.json)
        this.raceTypeMapping = {
            "G1": "Grade I Stk/Hcp",
            "G2": "Grade II Stk/Hcp",
            "G3": "Grade III Stk/Hcp",
            "N": "Nongraded Stake/Handicap",
            "A": "Allowance",
            "R": "Starter Alw",
            "T": "Starter Hcp",
            "C": "Claiming",
            "CO": "Optional Clmg",
            "S": "Mdn Sp Wt",
            "M": "Mdn Claimer",
            "AO": "Alw Opt Clm",
            "MO": "Mdn Opt Clm",
            "NO": "Opt Clm Stk"
        };

        // Embedded age restriction mapping (from reference-data/age-restriction.json)
        this.ageRestrictionMapping = {
            "A": "2 Yrs",
            "B": "3 Yrs",
            "C": "4 Yrs",
            "D": "5 Yrs",
            "E": "3 & 4 Yrs",
            "F": "4 & 5 Yrs",
            "G": "3, 4, & 5 Yrs",
            "H": "All Ages",
            "O": "Only",
            "U": "and Up"
        };

        // Embedded sex restriction mapping (from reference-data/sex-restriction.json)
        this.sexRestrictionMapping = {
            "N": "No Sex Restrictions",
            "M": "Mares and Fillies Only",
            "C": "Colts and/or Geldings Only",
            "F": "Fillies Only"
        };
    }



    /**
     * Get track name from track code
     */
    getTrackName(trackCode) {
        if (!this.trackMapping || !trackCode) {
            return trackCode;
        }

        // Trim the track code to handle spaces
        const trimmedCode = trackCode.trim();
        const trackName = this.trackMapping[trimmedCode] || trackCode;
        return trackName;
    }

    /**
     * Get surface name from surface code
     */
    getSurfaceName(surfaceCode) {
        if (!this.surfaceMapping || !surfaceCode) {
            return surfaceCode;
        }

        // Trim the surface code to handle spaces
        const trimmedCode = surfaceCode.trim();
        const surfaceName = this.surfaceMapping[trimmedCode] || surfaceCode;
        return surfaceName;
    }

    /**
     * Get race type name from race type code
     */
    getRaceTypeName(raceTypeCode) {
        if (!this.raceTypeMapping || !raceTypeCode) {
            return raceTypeCode;
        }

        const trimmedCode = raceTypeCode.trim();
        return this.raceTypeMapping[trimmedCode] || raceTypeCode;
    }

    /**
     * Get age restriction text from codes
     */
    getAgeRestrictionText(ageCode, ageModifier) {
        if (!this.ageRestrictionMapping) {
            return '';
        }

        const agePart = this.ageRestrictionMapping[ageCode] || '';
        const modifierPart = this.ageRestrictionMapping[ageModifier] || '';

        if (!agePart) return '';
        if (!modifierPart) return agePart;

        return `${agePart} ${modifierPart}`;
    }

    /**
     * Get sex restriction text from code
     */
    getSexRestrictionText(sexCode) {
        if (!this.sexRestrictionMapping || !sexCode) {
            return '';
        }

        return this.sexRestrictionMapping[sexCode] || '';
    }

    /**
     * Format currency value
     */
    formatCurrency(value) {
        if (!value) return '';

        const num = parseFloat(value);
        if (isNaN(num)) return value;

        return '$' + num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    /**
     * Generate PDF report from DRF data
     */
    generateReport(data, filename = 'race-report.pdf') {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'letter'
        });

        // Generate a page for each race
        data.races.forEach((race, index) => {
            if (index > 0) {
                this.doc.addPage();
            }
            this.currentY = this.margin;
            this.generateRacePage(race, data.trackCode, data.date);
        });

        // Save the PDF
        this.doc.save(filename);
    }



    /**
     * Generate a single race page
     */
    generateRacePage(race, track, date) {
        // Race header
        this.addRaceHeader(race, track, date);

        // Horse details table with 8 sections
        this.addHorseDetailsTable(race);

        // Add page break
        this.doc.addPage();
        this.currentY = this.margin;

        // Add race header on second page
        this.addRaceHeader(race, track, date);

        // Add statistical data table
        this.addStatisticalDataTable(race);
    }

    /**
     * Add race header information - single line format
     * Format: Track Name | Date (left) | Race # | Distance | Surface (right)
     */
    addRaceHeader(race, trackCode, date) {
        const actualTrackCode = race.trackCode || trackCode;
        const trackName = this.getTrackName(actualTrackCode);
        const formattedDate = this.formatDate(race.date || date);
        const surfaceName = this.getSurfaceName(race.surface);

        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');

        // Left side: Track Name | Date
        const leftText = [trackName, formattedDate].filter(item => item).join(' | ');
        this.doc.text(leftText, this.margin, this.currentY);

        // Right side: Race # | Post Time | Distance | Surface
        const formattedPostTime = this.formatPostTime(race.postTime);
        const rightText = [
                `Race ${race.raceNumber}`,
                formattedPostTime ? `Post: ${formattedPostTime}` : '',
                race.distanceInFurlongs || race.distance,
                `Surface: ${surfaceName}`
        ].filter(item => item).join(' | ');

        const rightTextWidth = this.doc.getTextWidth(rightText);
        this.doc.text(rightText, this.pageWidth - this.margin - rightTextWidth, this.currentY);

        this.currentY += 15;

        // Add secondary header with race specifics
        this.addRaceSpecificsHeader(race);

        // Draw separator line
        this.doc.setDrawColor(0, 0, 0);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);

        this.currentY += 10;
    }

    /**
     * Add secondary header with race specifics
     * Format: Race Type | Age Restriction(s) | Sex Restriction | Purse | Claiming Price | Betting Options (right aligned)
     */
    addRaceSpecificsHeader(race) {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');

        // Build left-aligned portion
        const leftParts = [];

        // Race Type
        if (race.raceType) {
            const raceTypeName = this.getRaceTypeName(race.raceType);
            if (raceTypeName) {
                leftParts.push(raceTypeName);
            }
        }

        // Age Restriction(s) - display each part separately
        const ageParts = [];
        if (race.ageCode) {
            const ageText = this.ageRestrictionMapping[race.ageCode];
            if (ageText) {
                ageParts.push(ageText);
            }
        }
        if (race.ageModifier) {
            const modifierText = this.ageRestrictionMapping[race.ageModifier];
            if (modifierText) {
                ageParts.push(modifierText);
            }
        }
        if (ageParts.length > 0) {
            leftParts.push(ageParts.join(' '));
        }

        // Sex Restriction
        if (race.sexCode) {
            const sexText = this.getSexRestrictionText(race.sexCode);
            if (sexText) {
                leftParts.push(sexText);
            }
        }

        // Purse
        if (race.purse) {
            leftParts.push(`Purse: ${this.formatCurrency(race.purse)}`);
        }

        // Claiming Price
        if (race.claimingPriceHigh) {
            const claimingText = race.claimingPriceLow && race.claimingPriceLow !== race.claimingPriceHigh
                ? `Claiming: ${this.formatCurrency(race.claimingPriceLow)}-${this.formatCurrency(race.claimingPriceHigh)}`
                : `Claiming: ${this.formatCurrency(race.claimingPriceHigh)}`;
            leftParts.push(claimingText);
        }

        const leftText = leftParts.join(' | ');

        // Draw left-aligned text
        this.doc.text(leftText, this.margin, this.currentY);

        // Draw right-aligned betting options
        if (race.wagerTypes) {
            const bettingText = race.wagerTypes.trim();
            if (bettingText) {
                const textWidth = this.doc.getTextWidth(bettingText);
                this.doc.text(bettingText, this.pageWidth - this.margin - textWidth, this.currentY);
            }
        }

        this.currentY += 15;
    }



    /**
     * Add comprehensive horse details table with 8 columns
     * Table structure: 2 header rows + 1 row per horse
     * Each cell contains 4 lines of data
     */
    addHorseDetailsTable(race) {
        // Add table headers - pass first horse to get pace par values
        const firstHorse = race.horses && race.horses.length > 0 ? race.horses[0] : null;
        this.addTableHeaders(firstHorse);

        // Add a row for each horse
        race.horses.forEach((horse, index) => {
            // Check if we need a new page
            if (this.currentY > this.pageHeight - 100) {
                this.doc.addPage();
                this.currentY = this.margin;
                this.addRaceHeader(race, race.trackCode, race.date);
                this.addTableHeaders(firstHorse);
            }

            this.addHorseTableRow(horse, index, race);
        });
    }

    /**
     * Add table headers (2 rows)
     * Row 1: Horse | Money | Speed | J/T | Past Races (spans 4 columns)
     * Row 2: (will be defined based on what data goes in each column)
     */
    addTableHeaders(horse = null) {
        const startY = this.currentY;
        const rowHeight = 12;

        // Define column widths (8 columns total)
        // Column 1: 99 (+8 from 91), Columns 2-3: 40, Column 4: 19 (+4 from 15), Column 5: 290
        // Column 6: 116 (Position), Column 7: 35 (Odd), Column 8: 113 (-12 from 125)
        const colWidths = [99, 40, 40, 19, 290, 116, 35, 113]; // Total = 752 (contentWidth)

        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setDrawColor(0, 0, 0);
        this.doc.setLineWidth(0.5);

        // Header Row 1 - Centered labels
        let x = this.margin;

        // Column 1: Horse
        this.doc.rect(x, startY, colWidths[0], rowHeight);
        const horseText = 'Horse';
        const horseWidth = this.doc.getTextWidth(horseText);
        this.doc.text(horseText, x + (colWidths[0] - horseWidth) / 2, startY + 8);
        x += colWidths[0];

        // Column 2: Money
        this.doc.rect(x, startY, colWidths[1], rowHeight);
        const moneyText = 'Money';
        const moneyWidth = this.doc.getTextWidth(moneyText);
        this.doc.text(moneyText, x + (colWidths[1] - moneyWidth) / 2, startY + 8);
        x += colWidths[1];

        // Column 3: Speed
        this.doc.rect(x, startY, colWidths[2], rowHeight);
        const speedText = 'Speed';
        const speedWidth = this.doc.getTextWidth(speedText);
        this.doc.text(speedText, x + (colWidths[2] - speedWidth) / 2, startY + 8);
        x += colWidths[2];

        // Column 4: J/T
        this.doc.rect(x, startY, colWidths[3], rowHeight);
        const jtText = 'J/T';
        const jtWidth = this.doc.getTextWidth(jtText);
        this.doc.text(jtText, x + (colWidths[3] - jtWidth) / 2, startY + 8);
        x += colWidths[3];

        // Columns 5-8: Past Races (merged header)
        const pastRacesWidth = colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7];
        this.doc.rect(x, startY, pastRacesWidth, rowHeight);
        const pastRacesText = 'Past Races';
        const pastRacesTextWidth = this.doc.getTextWidth(pastRacesText);
        this.doc.text(pastRacesText, x + (pastRacesWidth - pastRacesTextWidth) / 2, startY + 8);

        this.currentY = startY + rowHeight;

        // Header Row 2 will be added here (to be defined based on cell content)
        this.addTableHeaderRow2(colWidths, horse);
    }

    /**
     * Add second header row with column details (4 lines high)
     */
    addTableHeaderRow2(colWidths, horse = null) {
        const startY = this.currentY;
        const rowHeight = 32; // 4 lines * 8pt line height
        const lineHeight = 8;

        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');

        let x = this.margin;

        // Column 1: Horse details (4 lines) - with sections
        this.doc.rect(x, startY, colWidths[0], rowHeight);
        let y = startY + 7;

        // Line 1: 5 sections - PG, PP, SP, SF, ML (evenly spaced)
        const col1Line1SectionWidth = colWidths[0] / 5;
        this.doc.text('PG', x + (col1Line1SectionWidth - this.doc.getTextWidth('PG')) / 2, y);
        this.doc.text('PP', x + col1Line1SectionWidth + (col1Line1SectionWidth - this.doc.getTextWidth('PP')) / 2, y);
        this.doc.text('SP', x + col1Line1SectionWidth * 2 + (col1Line1SectionWidth - this.doc.getTextWidth('SP')) / 2, y);
        this.doc.text('SF', x + col1Line1SectionWidth * 3 + (col1Line1SectionWidth - this.doc.getTextWidth('SF')) / 2, y);
        this.doc.text('ML', x + col1Line1SectionWidth * 4 + (col1Line1SectionWidth - this.doc.getTextWidth('ML')) / 2, y);
        y += lineHeight;

        // Line 2: Name (single section, left-aligned with padding)
        this.doc.text('Name', x + 5, y);
        const prLabelText = "PR(C)";
        const prLabelWidth = this.doc.getTextWidth(prLabelText);
        this.doc.text(prLabelText, x + colWidths[0] - prLabelWidth - 4, y);
        y += lineHeight;

        // Line 3: 4 sections - Age, Sex, Eqp, Med (evenly spaced)
        const col1Line3SectionWidth = colWidths[0] / 4;
        this.doc.text('Age', x + (col1Line3SectionWidth - this.doc.getTextWidth('Age')) / 2, y);
        this.doc.text('Sex', x + col1Line3SectionWidth + (col1Line3SectionWidth - this.doc.getTextWidth('Sex')) / 2, y);
        this.doc.text('Eqp', x + col1Line3SectionWidth * 2 + (col1Line3SectionWidth - this.doc.getTextWidth('Eqp')) / 2, y);
        this.doc.text('Med', x + col1Line3SectionWidth * 3 + (col1Line3SectionWidth - this.doc.getTextWidth('Med')) / 2, y);
        y += lineHeight;

        // Line 4: 3 sections - PR, J/T, Wt
        const col1Line4Section1Width = colWidths[0] * 0.2;  // PR gets 20%
        const col1Line4Section2Width = colWidths[0] * 0.5;  // J/T gets 50%
        const col1Line4Section3Width = colWidths[0] * 0.3;  // Wt gets 30%
        this.doc.text('PR', x + (col1Line4Section1Width - this.doc.getTextWidth('PR')) / 2, y);
        this.doc.text('J/T', x + col1Line4Section1Width + (col1Line4Section2Width - this.doc.getTextWidth('J/T')) / 2, y);
        this.doc.text('Wt', x + col1Line4Section1Width + col1Line4Section2Width + (col1Line4Section3Width - this.doc.getTextWidth('Wt')) / 2, y);
        x += colWidths[0];

        // Column 2: Money details (4 lines) - 2 sections
        this.doc.rect(x, startY, colWidths[1], rowHeight);
        const col2Section1Width = colWidths[1] / 2;
        const col2Section2Width = colWidths[1] / 2;
        y = startY + 7;
        // Line 1: MR (centered in section 1), DST (centered in section 2)
        this.doc.text('MR', x + (col2Section1Width - this.doc.getTextWidth('MR')) / 2, y);
        this.doc.text('DST', x + col2Section1Width + (col2Section2Width - this.doc.getTextWidth('DST')) / 2, y);
        y += lineHeight;
        // Line 2: LF, FST
        this.doc.text('LF', x + (col2Section1Width - this.doc.getTextWidth('LF')) / 2, y);
        this.doc.text('FST', x + col2Section1Width + (col2Section2Width - this.doc.getTextWidth('FST')) / 2, y);
        y += lineHeight;
        // Line 3: TRK, WET
        this.doc.text('TRK', x + (col2Section1Width - this.doc.getTextWidth('TRK')) / 2, y);
        this.doc.text('WET', x + col2Section1Width + (col2Section2Width - this.doc.getTextWidth('WET')) / 2, y);
        y += lineHeight;
        // Line 4: ALL, TRF
        this.doc.text('ALL', x + (col2Section1Width - this.doc.getTextWidth('ALL')) / 2, y);
        this.doc.text('TRF', x + col2Section1Width + (col2Section2Width - this.doc.getTextWidth('TRF')) / 2, y);
        x += colWidths[1];

        // Column 3: Speed details (4 lines) - 2 sections, same labels as column 2
        this.doc.rect(x, startY, colWidths[2], rowHeight);
        const col3Section1Width = colWidths[2] / 2;
        const col3Section2Width = colWidths[2] / 2;
        y = startY + 7;
        // Line 1: MR (centered in section 1), DST (centered in section 2)
        this.doc.text('MR', x + (col3Section1Width - this.doc.getTextWidth('MR')) / 2, y);
        this.doc.text('DST', x + col3Section1Width + (col3Section2Width - this.doc.getTextWidth('DST')) / 2, y);
        y += lineHeight;
        // Line 2: LF, FST
        this.doc.text('LF', x + (col3Section1Width - this.doc.getTextWidth('LF')) / 2, y);
        this.doc.text('FST', x + col3Section1Width + (col3Section2Width - this.doc.getTextWidth('FST')) / 2, y);
        y += lineHeight;
        // Line 3: TRK, WET
        this.doc.text('TRK', x + (col3Section1Width - this.doc.getTextWidth('TRK')) / 2, y);
        this.doc.text('WET', x + col3Section1Width + (col3Section2Width - this.doc.getTextWidth('WET')) / 2, y);
        y += lineHeight;
        // Line 4: ALL, TRF
        this.doc.text('ALL', x + (col3Section1Width - this.doc.getTextWidth('ALL')) / 2, y);
        this.doc.text('TRF', x + col3Section1Width + (col3Section2Width - this.doc.getTextWidth('TRF')) / 2, y);
        x += colWidths[2];

        // Column 4: J/T details (4 lines) - centered
        this.doc.rect(x, startY, colWidths[3], rowHeight);
        y = startY + 7;
        const cm1Width = this.doc.getTextWidth('CM');
        this.doc.text('CM', x + (colWidths[3] - cm1Width) / 2, y);
        y += lineHeight;
        const mr1Width = this.doc.getTextWidth('MR');
        this.doc.text('MR', x + (colWidths[3] - mr1Width) / 2, y);
        y += lineHeight;
        const cm2Width = this.doc.getTextWidth('CM');
        this.doc.text('CM', x + (colWidths[3] - cm2Width) / 2, y);
        y += lineHeight;
        const mr2Width = this.doc.getTextWidth('MR');
        this.doc.text('MR', x + (colWidths[3] - mr2Width) / 2, y);
        x += colWidths[3];

        // Column 5: Past Race 1 with 12 vertical sections (4 lines)
        // Section widths: 1=1.2x, 2=0.7x, 3=1.7x, 4=0.9x, 5=1x, 6-12=0.6x each
        // Total units: 1.2 + 0.7 + 1.7 + 0.9 + 1 + (7 * 0.6) = 9.7 units
        this.doc.rect(x, startY, colWidths[4], rowHeight);
        const baseUnit = colWidths[4] / 9.7;
        const section1Width = baseUnit * 1.2; // P-T-C - increased width
        const section2Width = baseUnit * 0.7; // Par column - increased width
        const section3Width = baseUnit * 1.7; // D-Sf-Cd-Cg gets extra space
        const section4Width = baseUnit * 0.9; // DO - reduced to compensate for P-T-C
        const section5Width = baseUnit;
        const section6to12Width = baseUnit * 0.6; // Sections 6-12 reduced by 40%

        let sectionX = x;
        const section5X = sectionX + section1Width + section2Width + section3Width + section4Width;

        // Line 1: Sections 1-4 blank, Section 5: PT (centered), Sections 6-12 blank
        y = startY + 7;
        const ptText = 'PT';
        const ptWidth = this.doc.getTextWidth(ptText);
        this.doc.text(ptText, section5X + (section5Width - ptWidth) / 2, y);

        // Line 2: Sections 1-4 blank, Section 5: RS (centered), Sections 6-11: "Pace Figures" (centered), Section 12 blank
        y += lineHeight;
        const rsText = 'RS';
        const rsWidth = this.doc.getTextWidth(rsText);
        this.doc.text(rsText, section5X + (section5Width - rsWidth) / 2, y);
        const paceFiguresText = 'Pace Figures';
        const paceFiguresWidth = this.doc.getTextWidth(paceFiguresText);
        const paceFiguresStart = sectionX + section1Width + section2Width + section3Width + section4Width + section5Width;
        const paceFiguresSpan = section6to12Width * 6; // Sections 6-11
        this.doc.text(paceFiguresText, paceFiguresStart + (paceFiguresSpan - paceFiguresWidth) / 2, y);

        // Line 3: Sections 1-4: "Previous" (centered), Section 5: WO (centered), Sections 6-10: Pace Par VALUES
        y += lineHeight;
        const previousText = 'Previous';
        const previousWidth = this.doc.getTextWidth(previousText);
        const previousSpan = section1Width + section2Width + section3Width + section4Width;
        this.doc.text(previousText, sectionX + (previousSpan - previousWidth) / 2, y);
        const woText = 'WO';
        const woWidth = this.doc.getTextWidth(woText);
        this.doc.text(woText, section5X + (section5Width - woWidth) / 2, y);

        // Display pace par values from horse data (Fields 214-218, 217)
        if (horse && horse.pacePar2F !== undefined) {
            const pacePar2F = (horse.pacePar2F || 0) === 0 ? '' : horse.pacePar2F.toString();
            const pacePar4F = (horse.pacePar4F || 0) === 0 ? '' : horse.pacePar4F.toString();
            const pacePar6F = (horse.pacePar6F || 0) === 0 ? '' : horse.pacePar6F.toString();
            const paceParLate = (horse.paceParLate || 0) === 0 ? '' : horse.paceParLate.toString();
            const paceParSpeed = (horse.paceParSpeed || 0) === 0 ? '' : horse.paceParSpeed.toString();

            this.doc.text(pacePar2F, sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + 1, y);
            this.doc.text(pacePar4F, sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + section6to12Width + 1, y);
            this.doc.text(pacePar6F, sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 2) + 1, y);
            this.doc.text(paceParLate, sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 3) + 1, y);
            this.doc.text(paceParSpeed, sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 4) + 1, y);
        }

        // Line 4: All 12 section labels
        y += lineHeight;
        this.doc.text('P-T-C', sectionX + 2, y);
        this.doc.text('Par', sectionX + section1Width + 7, y);
        this.doc.text('D-Sf-Cd-Cg', sectionX + section1Width + section2Width + 2, y);
        this.doc.text('DO', sectionX + section1Width + section2Width + section3Width + 2, y);
        // Center "Rank" label in Section 5
        const rankText = 'Rank';
        const rankWidth = this.doc.getTextWidth(rankText);
        this.doc.text(rankText, section5X + (section5Width - rankWidth) / 2, y);
        this.doc.text('2F', sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + 2, y);
        this.doc.text('4F', sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + section6to12Width + 2, y);
        this.doc.text('6F', sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 2) + 2, y);
        this.doc.text('Late', sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 3) + 2, y);
        this.doc.text('Spd', sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 4) + 2, y);
        this.doc.text('SP', sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 5) + 2, y);
        this.doc.text('*P', sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 6) + 2, y);
        x += colWidths[4];

        // Column 6: Position data (4 lines)
        this.doc.rect(x, startY, colWidths[5], rowHeight);
        y = startY + 7;
        // Line 1: blank
        y += lineHeight;
        // Line 2: blank
        y += lineHeight;
        // Line 3: "Position" (centered)
        const positionText = 'Position';
        const positionWidth = this.doc.getTextWidth(positionText);
        this.doc.text(positionText, x + (colWidths[5] - positionWidth) / 2, y);
        y += lineHeight;
        // Line 4: 5 equally spaced sections with labels: PP, 1, 2, Lt, F
        const sectionWidth = colWidths[5] / 5;
        const labels = ['PP', '1', '2', 'Lt', 'F'];
        labels.forEach((label, idx) => {
            const labelWidth = this.doc.getTextWidth(label);
            this.doc.text(label, x + (idx * sectionWidth) + (sectionWidth - labelWidth) / 2, y);
        });
        x += colWidths[5];

        // Column 7: Odds (4 lines)
        this.doc.rect(x, startY, colWidths[6], rowHeight);
        y = startY + 7;
        // Line 1: blank
        y += lineHeight;
        // Line 2: blank
        y += lineHeight;
        // Line 3: blank
        y += lineHeight;
        // Line 4: "Odd" (centered)
        const oddText = 'Odd';
        const oddWidth = this.doc.getTextWidth(oddText);
        this.doc.text(oddText, x + (colWidths[6] - oddWidth) / 2, y);
        x += colWidths[6];

        // Column 8: Comment (4 lines)
        this.doc.rect(x, startY, colWidths[7], rowHeight);
        y = startY + 7;
        // Line 1: blank
        y += lineHeight;
        // Line 2: blank
        y += lineHeight;
        // Line 3: blank
        y += lineHeight;
        // Line 4: "Comment" (centered)
        const commentText = 'Comment';
        const commentWidth = this.doc.getTextWidth(commentText);
        this.doc.text(commentText, x + (colWidths[7] - commentWidth) / 2, y);
        x += colWidths[7];

        this.currentY = startY + rowHeight;
    }

    /**
     * Add a single horse row with 8 columns, each cell containing 4 lines
     */
    addHorseTableRow(horse, index, race) {
        const startY = this.currentY;
        const rowHeight = 36; // Height for 4 lines of text (8pt font * 4 lines) + extra spacing
        // Column 1: 99 (+8 from 91), Columns 2-3: 40, Column 4: 19 (+4 from 15), Column 5: 290
        // Column 6: 116 (Position), Column 7: 35 (Odd), Column 8: 113 (-12 from 125)
                const colWidths = [99, 40, 40, 19, 290, 116, 35, 113]; // Total = 752
        const lineHeight = 8;
        const raceDate = race.date;
        const currentRaceSpeedPar = race.speedPar; // Field 217

        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setDrawColor(0, 0, 0);
        this.doc.setLineWidth(0.5);

        let x = this.margin;

        // Column 1: Horse (4 lines matching header structure with sections)
        this.doc.rect(x, startY, colWidths[0], rowHeight);
        let y = startY + 9;

        // Line 1: 5 sections - PG, PP, SP, SF, ML (centered in each section)
        const pg = String(horse.programNumber || '');
        const pp = String(horse.postPosition || '');
        const sp = String(this.formatSalesPrice(horse.salesPrice));
        const sf = String(this.formatStudFee(horse.studFee));
        const ml = String(this.formatMorningLine(horse.morningLineOdds));
        const col1Line1SectionWidth = colWidths[0] / 5;
        this.doc.text(pg, x + (col1Line1SectionWidth - this.doc.getTextWidth(pg)) / 2, y);
        this.doc.text(pp, x + col1Line1SectionWidth + (col1Line1SectionWidth - this.doc.getTextWidth(pp)) / 2, y);
        this.doc.text(sp, x + col1Line1SectionWidth * 2 + (col1Line1SectionWidth - this.doc.getTextWidth(sp)) / 2, y);
        this.doc.text(sf, x + col1Line1SectionWidth * 3 + (col1Line1SectionWidth - this.doc.getTextWidth(sf)) / 2, y);
        this.doc.text(ml, x + col1Line1SectionWidth * 4 + (col1Line1SectionWidth - this.doc.getTextWidth(ml)) / 2, y);
        y += lineHeight;

            // Calculate PR(C) score for display on Line 2
            // Get normalized values for this horse
            const normalizedPR = this.calculateNormalizedPR(horse, race);
            const normalizedMoneyMR = this.calculateNormalizedMoneyMR(horse, race);
            const normalizedJockeyMR = this.calculateNormalizedJockeyMR(horse, race);
            const normalizedTrainerMR = this.calculateNormalizedTrainerMR(horse, race);
            const normalizedSpeedMR = this.calculateNormalizedSpeedMR(horse, race);
            const normalizedAvgPar = this.calculateNormalizedAvgPar(horse, race);
            const prScore = this.calculatePRScore(
                normalizedPR,
                normalizedMoneyMR,
                normalizedJockeyMR,
                normalizedTrainerMR,
                normalizedSpeedMR,
                normalizedAvgPar
            );
        
        // Line 2: Name (left-aligned) and PR(C) score (right-aligned)
        const name = this.truncate(horse.horseName || '', 17);
        this.doc.text(name, x + 5, y);
        
                // Display PR(C) score on the right side (without label)
                const prWidth = this.doc.getTextWidth(prScore);
                this.doc.text(prScore, x + colWidths[0] - prWidth - 4, y);
                y += lineHeight;

                // Line 3: 4 sections - Age, Sex, Eqp, Med (centered in each section)
                const age = String(horse.age || '');
                const sex = String(horse.sex || '');
        const eqp = String(horse.equipment || '');
        const med = String(horse.medication || '');
        const col1Line3SectionWidth = colWidths[0] / 4;
        this.doc.text(age, x + (col1Line3SectionWidth - this.doc.getTextWidth(age)) / 2, y);
        this.doc.text(sex, x + col1Line3SectionWidth + (col1Line3SectionWidth - this.doc.getTextWidth(sex)) / 2, y);
        this.doc.text(eqp, x + col1Line3SectionWidth * 2 + (col1Line3SectionWidth - this.doc.getTextWidth(eqp)) / 2, y);
        this.doc.text(med, x + col1Line3SectionWidth * 3 + (col1Line3SectionWidth - this.doc.getTextWidth(med)) / 2, y);
        y += lineHeight;

        // Line 4: 3 sections - PR, J/T, Wt (centered in each section)
        const pr = String(this.formatPowerRating(horse.powerRating));
        const jt = String(this.calculateJTCombo(horse.jtComboStarts, horse.jtComboWins, horse.jtComboPlaces, horse.jtComboShows));
        const wt = String(this.formatWeight(horse.weight, horse.pastPerformances));
        const col1Line4Section1Width = colWidths[0] * 0.2;  // PR gets 20%
        const col1Line4Section2Width = colWidths[0] * 0.5;  // J/T gets 50%
        const col1Line4Section3Width = colWidths[0] * 0.3;  // Wt gets 30%

        // Display PR (section 1)
        this.doc.text(pr, x + (col1Line4Section1Width - this.doc.getTextWidth(pr)) / 2, y);

        // Display J/T (section 2) - apply red italic if starts < 20
        const jtStarts = horse.jtComboStarts || 0;
        if (jtStarts < 20) {
            this.doc.setFont('helvetica', 'italic');
            this.doc.setTextColor(255, 0, 0); // Red
        }
        this.doc.text(jt, x + col1Line4Section1Width + (col1Line4Section2Width - this.doc.getTextWidth(jt)) / 2, y);
        // Reset to normal
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0); // Black

        // Display Wt (section 3)
        this.doc.text(wt, x + col1Line4Section1Width + col1Line4Section2Width + (col1Line4Section3Width - this.doc.getTextWidth(wt)) / 2, y);
        x += colWidths[0];

        // Column 2: Money (MR/DST, LF/FST, TRK/WET, ALL/TRF) - centered in sections
        this.doc.rect(x, startY, colWidths[1], rowHeight);
        const moneyRatings = this.calculateCategoryMoneyRatings(horse);
        const col2Section1Width = colWidths[1] / 2;
        const col2Section2Width = colWidths[1] / 2;
        y = startY + 9;

        // Check if any category has < 5 starts and apply red italic formatting
        const applyMoneyFormatting = (value, starts) => {
            if (starts < 5) {
                this.doc.setFont('helvetica', 'italic');
                this.doc.setTextColor(255, 0, 0); // Red
            } else {
                this.doc.setFont('helvetica', 'normal');
                this.doc.setTextColor(0, 0, 0); // Black
            }
            return value;
        };

        // Line 1: MR (centered in section 1), DST (centered in section 2)
        const mrText = String(applyMoneyFormatting(moneyRatings.mr, moneyRatings.mrStarts));
        this.doc.text(mrText, x + (col2Section1Width - this.doc.getTextWidth(mrText)) / 2, y);
        const dstText = String(applyMoneyFormatting(moneyRatings.dst, moneyRatings.dstStarts));
        this.doc.text(dstText, x + col2Section1Width + (col2Section2Width - this.doc.getTextWidth(dstText)) / 2, y);
        y += lineHeight;
        // Line 2: LF, FST
        const lfText = String(applyMoneyFormatting(moneyRatings.lf, moneyRatings.lfStarts));
        this.doc.text(lfText, x + (col2Section1Width - this.doc.getTextWidth(lfText)) / 2, y);
        const fstText = String(applyMoneyFormatting(moneyRatings.fst, moneyRatings.fstStarts));
        this.doc.text(fstText, x + col2Section1Width + (col2Section2Width - this.doc.getTextWidth(fstText)) / 2, y);
        y += lineHeight;
        // Line 3: TRK, WET
        const trkText = String(applyMoneyFormatting(moneyRatings.trk, moneyRatings.trkStarts));
        this.doc.text(trkText, x + (col2Section1Width - this.doc.getTextWidth(trkText)) / 2, y);
        const wetText = String(applyMoneyFormatting(moneyRatings.wet, moneyRatings.wetStarts));
        this.doc.text(wetText, x + col2Section1Width + (col2Section2Width - this.doc.getTextWidth(wetText)) / 2, y);
        y += lineHeight;
        // Line 4: ALL, TRF
        const allText = String(applyMoneyFormatting(moneyRatings.all, moneyRatings.allStarts));
        this.doc.text(allText, x + (col2Section1Width - this.doc.getTextWidth(allText)) / 2, y);
        const trfText = String(applyMoneyFormatting(moneyRatings.trf, moneyRatings.trfStarts));
        this.doc.text(trfText, x + col2Section1Width + (col2Section2Width - this.doc.getTextWidth(trfText)) / 2, y);

        // Reset to normal
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
        x += colWidths[1];

        // Column 3: Speed (MR/DST, LF/FST, TRK/WET, ALL/TRF) - centered in sections
        this.doc.rect(x, startY, colWidths[2], rowHeight);
        const speedRatings = this.calculateCategorySpeedRatings(horse);
        const col3Section1Width = colWidths[2] / 2;
        const col3Section2Width = colWidths[2] / 2;
        y = startY + 9;
        // Line 1: MR (centered in section 1), DST (centered in section 2)
        const mrSpeedText = `${speedRatings.mr}`;
        this.doc.text(mrSpeedText, x + (col3Section1Width - this.doc.getTextWidth(mrSpeedText)) / 2, y);
        const dstSpeedText = `${speedRatings.dst}`;
        this.doc.text(dstSpeedText, x + col3Section1Width + (col3Section2Width - this.doc.getTextWidth(dstSpeedText)) / 2, y);
        y += lineHeight;
        // Line 2: LF, FST
        const lfSpeedText = `${speedRatings.lf}`;
        this.doc.text(lfSpeedText, x + (col3Section1Width - this.doc.getTextWidth(lfSpeedText)) / 2, y);
        const fstSpeedText = `${speedRatings.fst}`;
        this.doc.text(fstSpeedText, x + col3Section1Width + (col3Section2Width - this.doc.getTextWidth(fstSpeedText)) / 2, y);
        y += lineHeight;
        // Line 3: TRK, WET
        const trkSpeedText = `${speedRatings.trk}`;
        this.doc.text(trkSpeedText, x + (col3Section1Width - this.doc.getTextWidth(trkSpeedText)) / 2, y);
        const wetSpeedText = `${speedRatings.wet}`;
        this.doc.text(wetSpeedText, x + col3Section1Width + (col3Section2Width - this.doc.getTextWidth(wetSpeedText)) / 2, y);
        y += lineHeight;
        // Line 4: ALL, TRF
        const allSpeedText = `${speedRatings.all}`;
        this.doc.text(allSpeedText, x + (col3Section1Width - this.doc.getTextWidth(allSpeedText)) / 2, y);
        const trfSpeedText = `${speedRatings.trf}`;
        this.doc.text(trfSpeedText, x + col3Section1Width + (col3Section2Width - this.doc.getTextWidth(trfSpeedText)) / 2, y);
        x += colWidths[2];

        // Column 4: J/T Money Ratings (CM/MR for Jockey, CM/MR for Trainer)
        this.doc.rect(x, startY, colWidths[3], rowHeight);
        const jtMoneyRatings = this.calculateJockeyTrainerMoneyRatings(horse);
        y = startY + 9;

        // Check for jockey and trainer changes
        const hasJockeyChange = this.hasJockeyChange(horse);
        const hasTrainerChange = this.hasTrainerChange(horse);

        // Apply red italic formatting if starts < 20
        const applyJTFormatting = (value, starts) => {
            if (starts < 20) {
                this.doc.setFont('helvetica', 'italic');
                this.doc.setTextColor(255, 0, 0); // Red
            } else {
                this.doc.setFont('helvetica', 'normal');
                this.doc.setTextColor(0, 0, 0); // Black
            }
            return value;
        };

        // Line 1: Jockey CM (add * if jockey changed)
        const jockeyCMValue = String(applyJTFormatting(jtMoneyRatings.jockeyCM, jtMoneyRatings.jockeyCMStarts)) + (hasJockeyChange ? '*' : '');
        this.doc.text(jockeyCMValue, x + 5, y);
        y += lineHeight;
        // Line 2: Jockey MR
        this.doc.text(String(applyJTFormatting(jtMoneyRatings.jockeyMR, jtMoneyRatings.jockeyMRStarts)), x + 5, y);
        y += lineHeight;
        // Line 3: Trainer CM (add * if trainer changed)
        const trainerCMValue = String(applyJTFormatting(jtMoneyRatings.trainerCM, jtMoneyRatings.trainerCMStarts)) + (hasTrainerChange ? '*' : '');
        this.doc.text(trainerCMValue, x + 5, y);
        y += lineHeight;
        // Line 4: Trainer MR
        this.doc.text(String(applyJTFormatting(jtMoneyRatings.trainerMR, jtMoneyRatings.trainerMRStarts)), x + 5, y);

        // Reset to normal
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
        x += colWidths[3];

        // Column 5: Past Races 1-4 displayed vertically (one per line)
        this.doc.rect(x, startY, colWidths[4], rowHeight);
        // Section widths: 1=1.2x, 2=0.7x, 3=1.7x, 4=0.9x, 5=1x, 6-12=0.6x each
        // Total units: 1.2 + 0.7 + 1.7 + 0.9 + 1 + (7 * 0.6) = 9.7 units
        const baseUnit = colWidths[4] / 9.7;
        const section1Width = baseUnit * 1.2; // P-T-C - increased width
        const section2Width = baseUnit * 0.7; // Par column - increased width
        const section3Width = baseUnit * 1.7; // D-Sf-Cd-Cg gets extra space
        const section4Width = baseUnit * 0.9; // DO - reduced to compensate for P-T-C
        const section5Width = baseUnit; // Rank - leave blank
        const section6to12Width = baseUnit * 0.6; // Sections 6-12 reduced by 40%

        let sectionX = x;

        // Calculate Section 5 values (PT, RS, WO, Rank) - NOT related to past performances
        const section5Values = [
            horse.earlySpeedPoints || '',                    // Line 1: PT (Field 211)
            horse.brisRunStyle || '',                        // Line 2: RS (Field 210)
            this.calculateWorkoutWO(raceDate, horse),        // Line 3: WO
            this.calculateWorkoutRank(horse, raceDate)       // Line 4: Rank
        ];

        // Display 4 lines vertically (one per line)
        for (let i = 0; i < 4; i++) {
            y = startY + 9 + (i * lineHeight);

            // Reset font to normal
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(0, 0, 0); // Black

            // Sections 1-4: Past performance data (if available)
            if (horse.pastPerformances && horse.pastPerformances[i]) {
                const pp = horse.pastPerformances[i];
                const prevPP = horse.pastPerformances[i + 1] || null; // For change detection

                // Format data for this past performance
                const ptc = this.formatPTC(pp.purse, pp.raceType, pp.claimingPrice);
                const par = pp.speedPar || '';
                const dsfcdcg = this.formatDSfCdCg(pp, prevPP);
                const daysOff = this.calculateDaysOff(raceDate, pp.date);
                const spResult = this.calculateSP(pp);
                const weightedPar = this.calculateWeightedPar(pp, currentRaceSpeedPar, spResult.numeric);

                // Display Sections 1-4
                this.doc.text(String(ptc), sectionX + 2, y);
                this.doc.text(String(par), sectionX + section1Width + 7, y);
                this.doc.text(String(dsfcdcg), sectionX + section1Width + section2Width + 2, y);
                this.doc.text(String(daysOff), sectionX + section1Width + section2Width + section3Width + 2, y);

                // Sections 6-10: Pace ratings
                this.doc.text(String(pp.paceFig2F || ''), sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + 2, y);
                this.doc.text(String(pp.paceFig4F || ''), sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + section6to12Width + 2, y);
                this.doc.text(String(pp.paceFig6F || ''), sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 2) + 2, y);
                this.doc.text(String(pp.paceFigLate || ''), sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 3) + 2, y);

                // Section 10: Spd (Bold & Blue)
                this.doc.setFont('helvetica', 'bold');
                this.doc.setTextColor(0, 0, 255); // Blue
                this.doc.text(String(pp.paceFigSpeed || ''), sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 4) + 2, y);

                // Reset to normal for remaining sections
                this.doc.setFont('helvetica', 'normal');
                this.doc.setTextColor(0, 0, 0); // Black

                // Section 11: SP (Speed/Pace average)
                this.doc.text(String(spResult.value), sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 5) + 2, y);
                // Section 12: *P (Weighted Par)
                this.doc.text(String(weightedPar), sectionX + section1Width + section2Width + section3Width + section4Width + section5Width + (section6to12Width * 6) + 2, y);
            }

            // Section 5: ALWAYS display PT/RS/WO/Rank based on line number (NOT past performance data)
            // Center the text in Section 5
            const section5Text = String(section5Values[i]);
            const section5TextWidth = this.doc.getTextWidth(section5Text);
            const section5X = sectionX + section1Width + section2Width + section3Width + section4Width;
            this.doc.text(section5Text, section5X + (section5Width - section5TextWidth) / 2, y);
        }
        x += colWidths[4];

        // Column 6: Position data (5 sections: PP, 1, 2, Lt, F)
        this.doc.rect(x, startY, colWidths[5], rowHeight);
        const col6SectionWidth = colWidths[5] / 5;

        // Display 4 past performances vertically (one per line)
        for (let i = 0; i < 4; i++) {
            y = startY + 9 + (i * lineHeight);

            if (horse.pastPerformances && horse.pastPerformances[i]) {
                const pp = horse.pastPerformances[i];

                // Format position data
                const ppData = `${pp.postPosition || ''}/${pp.numHorses || ''}`;
                const pos1 = String(pp.position2F || '');
                const pos2 = String(pp.position4F || '');
                const posLt = String(pp.positionLate || '');
                const posF = String(pp.finishPosition || '');

                const positions = [ppData, pos1, pos2, posLt, posF];

                // Display each position in its section
                positions.forEach((position, idx) => {
                    const posStr = String(position);
                    const posWidth = this.doc.getTextWidth(posStr);
                    this.doc.text(posStr, x + (idx * col6SectionWidth) + (col6SectionWidth - posWidth) / 2, y);
                });
            }
        }
        x += colWidths[5];

        // Column 7: Odds data (4 lines - one per past performance)
        this.doc.rect(x, startY, colWidths[6], rowHeight);

        // Display 4 past performances vertically (one per line)
        for (let i = 0; i < 4; i++) {
            y = startY + 9 + (i * lineHeight);

            if (horse.pastPerformances && horse.pastPerformances[i]) {
                const pp = horse.pastPerformances[i];
                const formattedOdds = String(this.formatOdds(pp.odds));

                // Center the odds value in the column
                const oddsWidth = this.doc.getTextWidth(formattedOdds);
                this.doc.text(formattedOdds, x + (colWidths[6] - oddsWidth) / 2, y);
            }
        }
        x += colWidths[6];

        // Column 8: Comment data (4 lines - one per past performance)
        const colIndex = 7;
        this.doc.rect(x, startY, colWidths[colIndex], rowHeight);

        // Display 4 past performances vertically (one per line)
        for (let i = 0; i < 4; i++) {
            y = startY + 9 + (i * lineHeight);

            if (horse.pastPerformances && horse.pastPerformances[i]) {
                const pp = horse.pastPerformances[i];
                const comment = pp.comment || '';

                // Truncate comment to fit in column width
                const maxCommentWidth = colWidths[colIndex] - 6; // Leave 3px padding on each side
                const truncatedComment = this.truncateToWidth(comment, maxCommentWidth);

                // Left-align the comment
                this.doc.text(truncatedComment, x + 3, y);
            }
        }

        x += colWidths[colIndex];

        this.currentY = startY + rowHeight;
    }

    /**
     * Add statistical data table with 17 columns
     * Headers: PG, PR, $-MR, J-MR, T-MR, SPD-MR, AVG PAR, AVG PAR, PR, AP*PR, PG, ML, ODDS, RS, PP, DO, LAST WO
     */
    addStatisticalDataTable(race) {
        // Add table headers
        this.addStatisticalTableHeaders();

        // Add a row for each horse
        race.horses.forEach((horse, index) => {
            // Check if we need a new page
            if (this.currentY > this.pageHeight - 100) {
                this.doc.addPage();
                this.currentY = this.margin;
                this.addRaceHeader(race, race.trackCode, race.date);
                this.addStatisticalTableHeaders();
            }

            this.addStatisticalTableRow(horse, index, race);
        });
    }

    /**
     * Add statistical table headers (single row with 11 columns)
     */
    addStatisticalTableHeaders() {
        const startY = this.currentY;
        const rowHeight = 12;

        // 11 columns with ODDS being 3x wider
        // Total units: 11 regular columns + 3 units for ODDS = 14 units
        const baseColumnWidth = this.contentWidth / 14;
        const colWidths = [
            baseColumnWidth,      // PG
            baseColumnWidth,      // PR(B)
            baseColumnWidth,      // $-MR
            baseColumnWidth,      // J-MR
            baseColumnWidth,      // T-MR
            baseColumnWidth,      // SPD-MR
            baseColumnWidth,      // PR(C)
            baseColumnWidth,      // AP
            baseColumnWidth,      // AP VAL
    baseColumnWidth,      // PG (new column)
            baseColumnWidth,      // ML
            baseColumnWidth * 3   // ODDS (3x wider)
        ];

        const headers = [
            'PG', 'PR(B)', '$-MR', 'J-MR', 'T-MR', 'SPD-MR',
            'PR(C)', 'AP', 'AP VAL', 'PG',
            'ML', 'ODDS'
        ];

        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setDrawColor(0, 0, 0);
        this.doc.setLineWidth(0.5);

        let x = this.margin;

        // Draw header cells
        headers.forEach((header, i) => {
            this.doc.rect(x, startY, colWidths[i], rowHeight);
            const headerWidth = this.doc.getTextWidth(header);
            this.doc.text(header, x + (colWidths[i] - headerWidth) / 2, startY + 8);
            x += colWidths[i];
        });

        this.currentY = startY + rowHeight;
    }

    /**
     * Add a single statistical data row
     */
    addStatisticalTableRow(horse, index, race) {
        const startY = this.currentY;
        const rowHeight = 12;

        // 11 columns with ODDS being 3x wider
        // Total units: 11 regular columns + 3 units for ODDS = 14 units
        const baseColumnWidth = this.contentWidth / 14;
        const colWidths = [
            baseColumnWidth,      // PG
            baseColumnWidth,      // PR(B)
            baseColumnWidth,      // $-MR
            baseColumnWidth,      // J-MR
            baseColumnWidth,      // T-MR
            baseColumnWidth,      // SPD-MR
            baseColumnWidth,      // PR(C)
            baseColumnWidth,      // AP
            baseColumnWidth,      // AP VAL
    baseColumnWidth,      // PG (new column)
            baseColumnWidth,      // ML
            baseColumnWidth * 3   // ODDS (3x wider)
        ];

        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setDrawColor(0, 0, 0);
        this.doc.setLineWidth(0.5);

        // Add darker gray background for every other row (even indices: 0, 2, 4, etc.)
        if (index % 2 === 0) {
            this.doc.setFillColor(220, 220, 220); // Darker gray
            this.doc.rect(this.margin, startY, this.contentWidth, rowHeight, 'F');
        }

        let x = this.margin;

        // Calculate normalized PR (Column 2)
        const normalizedPR = this.calculateNormalizedPR(horse, race);

        // Calculate normalized Money Rating (Column 3)
        const normalizedMoneyMR = this.calculateNormalizedMoneyMR(horse, race);

        // Calculate normalized Jockey MR (Column 4)
        const normalizedJockeyMR = this.calculateNormalizedJockeyMR(horse, race);

        // Calculate normalized Trainer MR (Column 5)
        const normalizedTrainerMR = this.calculateNormalizedTrainerMR(horse, race);

        // Calculate normalized Speed MR (Column 6)
        const normalizedSpeedMR = this.calculateNormalizedSpeedMR(horse, race);

        // Calculate Average Par (Column 9)
        const avgPar = this.calculateAveragePar(horse);

        // Calculate normalized Average Par (Column 8)
        const normalizedAvgPar = this.calculateNormalizedAvgPar(horse, race);


    // Calculate PR Score (Column 7)
    const prScore = this.calculatePRScore(
        normalizedPR,
        normalizedMoneyMR,
        normalizedJockeyMR,
        normalizedTrainerMR,
        normalizedSpeedMR,
        normalizedAvgPar
    );

        // Placeholder data - will be replaced with actual calculations
        const rowData = [
            String(horse.programNumber || ''),           // Col 1: PG
            normalizedPR,                                 // Col 2: PR(B) (normalized)
            normalizedMoneyMR,                            // Col 3: $-MR (normalized)
            normalizedJockeyMR,                           // Col 4: J-MR (normalized)
            normalizedTrainerMR,                          // Col 5: T-MR (normalized)
    normalizedSpeedMR,                            // Col 6: SPD-MR (normalized)
            prScore,                                      // Col 7: PR(C) (calculated score)
            normalizedAvgPar,                             // Col 8: AP (normalized)
            avgPar,                                       // Col 9: AP VAL (actual average)
            String(horse.programNumber || ''),         // Col 10: PG (duplicate from Col 1)
            String(horse.morningLineOdds || ''),         // Col 11: ML
            ''                                            // Col 12: ODDS (3x wider, blank for manual entry)
        ];

        // Draw cells and data
        rowData.forEach((data, i) => {
            this.doc.rect(x, startY, colWidths[i], rowHeight);
            const dataWidth = this.doc.getTextWidth(data);
            this.doc.text(data, x + (colWidths[i] - dataWidth) / 2, startY + 8);
            x += colWidths[i];
        });

        this.currentY = startY + rowHeight;
    }

    /**
     * Truncate text to fit in cell
     */
    truncate(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength - 2) + '..' : text;
    }

    /**
     * Truncate text to fit within a specific pixel width
     */
    truncateToWidth(text, maxWidth) {
        if (!text) return '';

        let currentText = text;
        let currentWidth = this.doc.getTextWidth(currentText);

        // If text fits, return as-is
        if (currentWidth <= maxWidth) {
            return currentText;
        }

        // Truncate and add ellipsis
        const ellipsis = '..';
        const ellipsisWidth = this.doc.getTextWidth(ellipsis);

        while (currentText.length > 0 && currentWidth + ellipsisWidth > maxWidth) {
            currentText = currentText.substring(0, currentText.length - 1);
            currentWidth = this.doc.getTextWidth(currentText);
        }

        return currentText + ellipsis;
    }

    /**
     * Format odds value
     * If value < 5: round to nearest 0.5
     *   - If result is .5, display with precision 1
     *   - Otherwise display with precision 0
     * If value >= 5: round to precision 0
     */
    formatOdds(oddsStr) {
        if (!oddsStr) return '';

        const oddsNum = parseFloat(oddsStr);
        if (isNaN(oddsNum)) return oddsStr;

        if (oddsNum < 5) {
            // Round to nearest 0.5
            const rounded = Math.round(oddsNum * 2) / 2;
            // If it's a .5 value, show with precision 1, otherwise precision 0
            if (rounded % 1 === 0.5) {
                return rounded.toFixed(1);
            } else {
                return Math.round(rounded).toString();
            }
        } else {
            // Round to whole number
            return Math.round(oddsNum).toString();
        }
    }

    /**
     * Format past performance date (YYYYMMDD to MM/DD)
     */
    formatPPDate(dateStr) {
        if (!dateStr || dateStr.length < 8) return dateStr;
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${month}/${day}`;
    }

    /**
     * Get jockey/trainer initials (first letter of first and last name)
     */
    getJockeyTrainerInitials(jockey, trainer) {
        const getInitials = (name) => {
            if (!name) return '';
            const parts = name.trim().split(/\s+/);
            if (parts.length === 0) return '';
            if (parts.length === 1) return parts[0].charAt(0);
            return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
        };

        const jInit = getInitials(jockey);
        const tInit = getInitials(trainer);
        return `${jInit}/${tInit}`;
    }

    /**
     * Format currency values (shorten large numbers)
     */
    formatCurrency(value) {
        if (!value || value === '') return '';
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) return '';

        // Format in thousands (K) or millions (M)
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    }

    /**
     * Format Sales Price (SP) - Field 1222
     * Divide by 1000, round to 0 precision, add "k" label
     * Display blank if 0
     */
    formatSalesPrice(value) {
        if (!value || value === '') return '';
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) return '';

        const inThousands = Math.round(num / 1000);
        return inThousands + 'k';
    }

    /**
     * Format Stud Fee (SF) - Field 1177
     * Divide by 1000, round to 0 precision, add "k" label
     */
    formatStudFee(value) {
        if (!value || value === '') return '';
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) return '';

        const inThousands = Math.round(num / 1000);
        return inThousands + 'k';
    }

    /**
     * Format Morning Line (ML)
     * If < 5, round to 1 precision
     * If >= 5, round to 0 precision
     */
    formatMorningLine(value) {
        if (!value || value === '') return '';
        const num = parseFloat(value);
        if (isNaN(num)) return value;

        if (num < 5) {
            // Round to 1 decimal and remove trailing zero
            return parseFloat(num.toFixed(1)).toString();
        } else {
            return Math.round(num).toString();
        }
    }

    /**
     * Format Power Rating (PR) - Field 251
     * Round to 0 precision
     */
    formatPowerRating(value) {
        if (!value || value === '') return '';
        const num = parseFloat(value);
        if (isNaN(num)) return '';

        return Math.round(num).toString();
    }

    /**
     * Calculate J/T Combo weighted average
     * Formula: ((Wins * WIN_WEIGHT) + (Places * PLACE_WEIGHT) + (Shows * SHOW_WEIGHT)) / Starts * 100
     * Display as: Starts-WeightedAverage%
     */
    calculateJTCombo(starts, wins, places, shows) {
        if (!starts || starts === 0) return '0-0';

        const weightedAvg = ((wins * PURSE_WEIGHTS.WIN) + (places * PURSE_WEIGHTS.PLACE) + (shows * PURSE_WEIGHTS.SHOW)) / starts;
        const percentage = Math.round(weightedAvg * 100);

        return `${starts}-${percentage}`;
    }

    /**
     * Format Weight (Wt)
     * If horse has past races, display: pastWeight/currentWeight
     * Otherwise, display: currentWeight
     */
    formatWeight(currentWeight, pastPerformances) {
        const current = currentWeight || '';

        // Check if there's a past race with weight data
        if (pastPerformances && pastPerformances.length > 0 && pastPerformances[0].weight) {
            const pastWeight = pastPerformances[0].weight;
            return `${pastWeight}/${current}`;
        }

        return current;
    }



    /**
     * Calculate money rating for a specific category
     * Formula: earnings / ((wins * WIN_WEIGHT) + (places * PLACE_WEIGHT) + (shows * SHOW_WEIGHT))
     * Divide by 1000 and round to 0 precision
     */
    calculateCategoryMoney(earnings, wins, places, shows) {
        const weightedPerformance = (wins * PURSE_WEIGHTS.WIN) + (places * PURSE_WEIGHTS.PLACE) + (shows * PURSE_WEIGHTS.SHOW);

        if (weightedPerformance === 0) return '0';

        const moneyRating = earnings / weightedPerformance;

        // Divide by 1000 and round to 0 precision
        return Math.round(moneyRating / 1000).toString();
    }

    /**
     * Calculate money ratings for all categories
     */
    calculateCategoryMoneyRatings(horse) {
        // MR - Most Recent (combination of current year and previous year)
        const mrStarts = horse.currentYearStarts + horse.previousYearStarts;
        const mrEarnings = horse.currentYearEarnings + horse.previousYearEarnings;
        const mrWins = horse.currentYearWins + horse.previousYearWins;
        const mrPlaces = horse.currentYearPlaces + horse.previousYearPlaces;
        const mrShows = horse.currentYearShows + horse.previousYearShows;

        return {
            mr: this.calculateCategoryMoney(mrEarnings, mrWins, mrPlaces, mrShows),
            mrStarts: mrStarts,
            dst: this.calculateCategoryMoney(horse.distanceEarnings, horse.distanceWins, horse.distancePlaces, horse.distanceShows),
            dstStarts: horse.distanceStarts || 0,
            lf: this.calculateCategoryMoney(horse.lifetimeEarnings, horse.lifetimeWins, horse.lifetimePlaces, horse.lifetimeShows),
            lfStarts: horse.lifetimeStarts || 0,
            fst: this.calculateCategoryMoney(horse.fastEarnings, horse.fastWins, horse.fastPlaces, horse.fastShows),
            fstStarts: horse.fastStarts || 0,
            trk: this.calculateCategoryMoney(horse.trackEarnings, horse.trackWins, horse.trackPlaces, horse.trackShows),
            trkStarts: horse.trackStarts || 0,
            wet: this.calculateCategoryMoney(horse.wetEarnings, horse.wetWins, horse.wetPlaces, horse.wetShows),
            wetStarts: horse.wetStarts || 0,
            all: this.calculateCategoryMoney(horse.allWeatherEarnings, horse.allWeatherWins, horse.allWeatherPlaces, horse.allWeatherShows),
            allStarts: horse.allWeatherStarts || 0,
            trf: this.calculateCategoryMoney(horse.turfEarnings, horse.turfWins, horse.turfPlaces, horse.turfShows),
            trfStarts: horse.turfStarts || 0
        };
    }

    /**
     * Calculate best speed ratings for all categories
     */
    calculateCategorySpeedRatings(horse) {
        // MR - Most Recent: Highest value from Field 1329 or Field 1330
        const mr = Math.max(horse.bestSpeedMostRecentYear || 0, horse.bestSpeed2ndRecentYear || 0);

        return {
            mr: mr > 0 ? mr.toString() : '0',
            dst: (horse.bestSpeedDistance || 0).toString(),
            lf: (horse.bestSpeedLife || 0).toString(),
            fst: (horse.bestSpeedFast || 0).toString(),
            trk: (horse.bestSpeedTrack || 0).toString(),
            wet: (horse.bestSpeedWet || 0).toString(),
            all: (horse.bestSpeedAllWeather || 0).toString(),
            trf: (horse.bestSpeedTurf || 0).toString()
        };
    }

    /**
     * Calculate Jockey/Trainer money ratings
     * Formula: (((Wins * 0.6) + (Places * 0.2) + (Shows * 0.11)) / Starts) * 100
     * Round to 0 precision
     */
    calculateJockeyTrainerMoneyRatings(horse) {
        // Jockey CM (Current Meet) - Fields 35-38
        const jockeyCM = this.calculatePerformancePercentage(
            horse.jockeyStarts, horse.jockeyWins, horse.jockeyPlaces, horse.jockeyShows
        );

        // Jockey MR (Most Recent) - Sum of Current & Previous Years
        const jockeyMRStarts = horse.jockeyCurrentYearStarts + horse.jockeyPreviousYearStarts;
        const jockeyMRWins = horse.jockeyCurrentYearWins + horse.jockeyPreviousYearWins;
        const jockeyMRPlaces = horse.jockeyCurrentYearPlaces + horse.jockeyPreviousYearPlaces;
        const jockeyMRShows = horse.jockeyCurrentYearShows + horse.jockeyPreviousYearShows;
        const jockeyMR = this.calculatePerformancePercentage(
            jockeyMRStarts, jockeyMRWins, jockeyMRPlaces, jockeyMRShows
        );

        // Trainer CM (Current Meet) - Fields 29-32
        const trainerCM = this.calculatePerformancePercentage(
            horse.trainerStarts, horse.trainerWins, horse.trainerPlaces, horse.trainerShows
        );

        // Trainer MR (Most Recent) - Sum of Current & Previous Years
        const trainerMRStarts = horse.trainerCurrentYearStarts + horse.trainerPreviousYearStarts;
        const trainerMRWins = horse.trainerCurrentYearWins + horse.trainerPreviousYearWins;
        const trainerMRPlaces = horse.trainerCurrentYearPlaces + horse.trainerPreviousYearPlaces;
        const trainerMRShows = horse.trainerCurrentYearShows + horse.trainerPreviousYearShows;
        const trainerMR = this.calculatePerformancePercentage(
            trainerMRStarts, trainerMRWins, trainerMRPlaces, trainerMRShows
        );

        return {
            jockeyCM: jockeyCM.toString(),
            jockeyCMStarts: horse.jockeyStarts || 0,
            jockeyMR: jockeyMR.toString(),
            jockeyMRStarts: jockeyMRStarts,
            trainerCM: trainerCM.toString(),
            trainerCMStarts: horse.trainerStarts || 0,
            trainerMR: trainerMR.toString(),
            trainerMRStarts: trainerMRStarts
        };
    }

    /**
     * Calculate performance percentage using standard money calculation logic
     * Formula: (((Wins * 0.6) + (Places * 0.2) + (Shows * 0.11)) / Starts) * 100
     * Round to 0 precision
     */
    calculatePerformancePercentage(starts, wins, places, shows) {
        if (starts === 0) return 0;

        const weightedPerformance = (wins * PURSE_WEIGHTS.WIN) +
                                     (places * PURSE_WEIGHTS.PLACE) +
                                     (shows * PURSE_WEIGHTS.SHOW);

        return Math.round((weightedPerformance / starts) * 100);
    }

    /**
     * Format P-T-C (Purse-Type-Claiming) for past performance
     * Purse: Divide by 1000, round to 0 precision
     * Type: Display code value
     * Claiming Price: Divide by 1000, if < 10 round to 1 precision, else round to 0 precision
     * If no claiming price, display as Purse-Type
     */
    formatPTC(purse, raceType, claimingPrice) {
        // Format purse: divide by 1000, round to 0
        const purseValue = parseFloat(purse) || 0;
        const purseFormatted = Math.round(purseValue / 1000);

        // Type code (as-is)
        const typeCode = raceType || '';

        // Format claiming price if present
        if (claimingPrice && claimingPrice !== '') {
            const claimValue = parseFloat(claimingPrice) || 0;
            const claimInThousands = claimValue / 1000;

            let claimFormatted;
            if (claimInThousands < 10) {
                // Round to 1 precision
                claimFormatted = (Math.round(claimInThousands * 10) / 10).toString();
            } else {
                // Round to 0 precision
                claimFormatted = Math.round(claimInThousands).toString();
            }

            return `${purseFormatted}-${typeCode}-${claimFormatted}`;
        } else {
            // No claiming price, display as Purse-Type
            return `${purseFormatted}-${typeCode}`;
        }
    }

    /**
     * Convert distance from yards to furlongs
     * 1 furlong = 220 yards
     */
    convertYardsToFurlongs(yards) {
        const yardsValue = parseFloat(yards) || 0;
        const furlongs = yardsValue / 220;

        // Round to 1 decimal place
        return (Math.round(furlongs * 10) / 10).toString();
    }

    /**
     * Calculate changes from previous race
     * J = Jockey Change
     * T = Trainer Change
     * C = Claimed in Previous Race
     * S = Nasal Strip
     */
    calculateChanges(currentPP, previousPP) {
        const changes = [];

        if (!previousPP) {
            return ''; // No previous race to compare
        }

        // Check for jockey change
        if (currentPP.jockey && previousPP.jockey &&
            currentPP.jockey.trim() !== previousPP.jockey.trim()) {
            changes.push('J');
        }

        // Check for trainer change
        if (currentPP.trainer && previousPP.trainer &&
            currentPP.trainer.trim() !== previousPP.trainer.trim()) {
            changes.push('T');
        }

        // Check if claimed in previous race
        if (previousPP.claimedCode && previousPP.claimedCode.toLowerCase() === 'c') {
            changes.push('C');
        }

        // Check for nasal strip
        if (currentPP.nasalStripCode && currentPP.nasalStripCode.toLowerCase() === 's') {
            changes.push('S');
        }

        return changes.join('');
    }

    /**
     * Format D-Sf-Cd-Cg (Distance-Surface-Condition-Changes) for past performance
     * Distance: Convert yards to furlongs
     * Surface: Display code value
     * Condition: Display code or NA if blank
     * Changes: J=Jockey, T=Trainer, C=Claimed, S=Nasal Strip
     */
    formatDSfCdCg(currentPP, previousPP) {
        // Distance in furlongs
        const distance = this.convertYardsToFurlongs(currentPP.distance);

        // Surface code (as-is)
        const surface = currentPP.surface || '';

        // Condition code or NA
        const condition = currentPP.condition || 'NA';

        // Calculate changes
        const changes = this.calculateChanges(currentPP, previousPP);

        // Format output
        if (changes) {
            return `${distance}-${surface}-${condition}-${changes}`;
        } else {
            return `${distance}-${surface}-${condition}`;
        }
    }

    /**
     * Calculate Days Off (DO) - number of days between current race day and past performance race day
     * Race dates are in format YYYYMMDD or YYMMDD
     */
    calculateDaysOff(currentRaceDate, ppRaceDate) {
        if (!currentRaceDate || !ppRaceDate) {
            return '';
        }

        // Parse dates (format: YYYYMMDD or YYMMDD)
        const parseDate = (dateStr) => {
            const str = dateStr.toString().trim();
            let year, month, day;

            if (str.length === 8) {
                // YYYYMMDD
                year = parseInt(str.substring(0, 4));
                month = parseInt(str.substring(4, 6)) - 1; // JS months are 0-based
                day = parseInt(str.substring(6, 8));
            } else if (str.length === 6) {
                // YYMMDD
                const yy = parseInt(str.substring(0, 2));
                year = yy < 50 ? 2000 + yy : 1900 + yy;
                month = parseInt(str.substring(2, 4)) - 1;
                day = parseInt(str.substring(4, 6));
            } else {
                return null;
            }

            return new Date(year, month, day);
        };

        const currentDate = parseDate(currentRaceDate);
        const ppDate = parseDate(ppRaceDate);

        if (!currentDate || !ppDate) {
            return '';
        }

        // Calculate difference in days
        const diffTime = currentDate - ppDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return diffDays.toString();
    }

    /**
 * SP = Average of Late Pace, "Last" Pace, and Par
     * "Last" Pace depends on distance:
     *   - <5.5 Furlongs: use 2F Pace
     *   - >=8 Furlongs: use 6F Pace
     *   - Else: use 4F Pace
     *
     * Returns object with { value: string, numeric: number } for use in *P calculation
     */
    calculateSP(pp) {
        if (!pp) return { value: '', numeric: 0 };

        // Get Late Pace (always used)
        const latePace = parseFloat(pp.paceFigLate) || 0;
        if (latePace === 0) return { value: '', numeric: 0 };


        // Get Par (Speed Par for the race)
        const par = parseFloat(pp.speedPar) || 0;
        if (par === 0) return { value: '', numeric: 0 };
        // Determine which "Last" pace to use based on distance
        // Distance is in yards, convert to furlongs (1 furlong = 220 yards)
        const distanceYards = parseFloat(pp.distance) || 0;
        if (distanceYards === 0) return { value: '', numeric: 0 };

        const distanceFurlongs = distanceYards / 220;

        let lastPace = 0;
        if (distanceFurlongs < 5.5) {
            lastPace = parseFloat(pp.paceFig2F) || 0;
        } else if (distanceFurlongs >= 8) {
            lastPace = parseFloat(pp.paceFig6F) || 0;
        } else {
            lastPace = parseFloat(pp.paceFig4F) || 0;
        }

        if (lastPace === 0) return { value: '', numeric: 0 };

        // Calculate average of Late Pace, Last Pace, and Par
        const average = (latePace + lastPace + par) / 3;
    return {
            value: Math.round(average).toString(),
            numeric: average
        };
    }

    

        /**
         * Calculate *P (Weighted Par) for a past performance
         * *P = (PP Speed Par / Current Race Speed Par) × PP Speed Rating
         * 
         * @param {Object} pp - Past performance object
         * @param {number} currentRaceSpeedPar - Current race BRIS Speed Par (Field 217)
         * @param {number} spNumeric - NOT USED in new formula (kept for compatibility)
         * @returns {string} Weighted par value rounded to precision 0, or empty string if any value is blank
         */
        calculateWeightedPar(pp, currentRaceSpeedPar, spNumeric) {
            if (!pp) return '';
    
            // Get PP Speed Par (PP Column 2 - Par) from Field 1167-1176
            const ppSpeedPar = parseFloat(pp.speedPar) || 0;
            
            // Get Current Race Speed Par (Field 217)
            const currentPar = parseFloat(currentRaceSpeedPar) || 0;
            
            // Get PP Speed Rating (PP Column 10 - Spd) from Field 846-855
            const ppSpeedRating = parseFloat(pp.paceFigSpeed) || 0;
    
            // If any value is blank/zero, return blank
            if (ppSpeedPar === 0 || currentPar === 0 || ppSpeedRating === 0) {
                return '';
            }
            
            // Calculate: (PP Speed Par / Current Race Speed Par) × PP Speed Rating
            const weightedPar = (ppSpeedPar / currentPar) * ppSpeedRating;
    
            // Round to precision 0
            return Math.round(weightedPar).toString();
        }

        /**
         * Calculate jockey/trainer rating
         */
        calculateJockeyTrainerRating(starts, wins, places, shows) {
            if (!starts || starts === 0) return '0.00';
    
            // Win percentage weighted rating
            const rating = ((wins * 3 + places * 2 + shows) / starts * 100).toFixed(2);
            return rating;
        }

    /**
     * Calculate workout data for WO line (Line 3 of Section 5)
     * Format: "# of workouts in last 30 days - Days since last workout"
     * If last workout was more than 30 days ago, return "0"
     */
    calculateWorkoutWO(raceDate, horse) {
        if (!horse.lastWorkoutDate || !raceDate) {
            return '';
        }

        // Calculate days since last workout
        const daysSince = parseInt(this.calculateDaysOff(raceDate, horse.lastWorkoutDate));

        // If last workout was more than 30 days ago, return "0"
        if (daysSince > 30) {
            return '0';
        }

        // Count workouts in last 30 days
        let workoutsIn30Days = 0;
        if (horse.workoutDates && Array.isArray(horse.workoutDates)) {
            const parseDate = (dateStr) => {
                if (!dateStr) return null;
                const str = dateStr.toString().trim();
                let year, month, day;

                if (str.length === 8) {
                    // YYYYMMDD
                    year = parseInt(str.substring(0, 4));
                    month = parseInt(str.substring(4, 6)) - 1;
                    day = parseInt(str.substring(6, 8));
                } else if (str.length === 6) {
                    // YYMMDD
                    const yy = parseInt(str.substring(0, 2));
                    year = yy < 50 ? 2000 + yy : 1900 + yy;
                    month = parseInt(str.substring(2, 4)) - 1;
                    day = parseInt(str.substring(4, 6));
                } else {
                    return null;
                }

                return new Date(year, month, day);
            };

            const raceDateTime = parseDate(raceDate);
            if (raceDateTime) {
                const thirtyDaysAgo = new Date(raceDateTime);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                for (const workoutDate of horse.workoutDates) {
                    const workoutDateTime = parseDate(workoutDate);
                    if (workoutDateTime && workoutDateTime >= thirtyDaysAgo && workoutDateTime <= raceDateTime) {
                        workoutsIn30Days++;
                    }
                }
            }
        }

        // Format: "# of workouts - Days since last workout"
        return `${workoutsIn30Days}-${daysSince}`;
    }

    /**
     * Calculate workout rank data for Rank line (Line 4 of Section 5)
     * Format: "Last Workout Rank / # of horses in workout / Last Workout Description"
     * If last workout was more than 30 days ago, return blank
     */
    calculateWorkoutRank(horse, raceDate) {
        if (!horse.lastWorkoutDate || !raceDate) {
            return '';
        }

        // Calculate days since last workout
        const daysSince = parseInt(this.calculateDaysOff(raceDate, horse.lastWorkoutDate));

        // If last workout was more than 30 days ago, return blank
        if (daysSince > 30) {
            return '';
        }

        if (!horse.lastWorkoutRank) {
            return '';
        }

        const rank = horse.lastWorkoutRank || '';
        const numWorks = horse.lastWorkoutNumWorks || '';
        const description = horse.lastWorkoutDescription || '';

        // Build the string
        let result = rank;
        if (numWorks) {
            result += `/${numWorks}`;
        }
        if (description) {
            result += `/${description}`;
        }

        return result;
    }

    // Helper methods
    formatDate(dateStr) {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${month}/${day}/${year}`;
    }

    formatNumber(numStr) {
        const num = parseFloat(numStr) || 0;
        return num.toLocaleString();
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
     * Check if jockey has changed between current race and last past performance
     * @param {Object} horse - Horse object
     * @returns {boolean} - True if jockey changed
     */
    hasJockeyChange(horse) {
        // Get current jockey name
        const currentJockey = horse.jockeyName || horse.jockey || '';

        // Get jockey from first past performance (most recent race)
        if (!horse.pastPerformances || horse.pastPerformances.length === 0) {
            return false; // No past performance to compare
        }

        const lastPP = horse.pastPerformances[0];
        const lastJockey = lastPP.jockey || '';

        // If either is empty, no change detected
        if (!currentJockey || !lastJockey) {
            return false;
        }

        // Compare jockey names (case-insensitive)
        return currentJockey.toLowerCase().trim() !== lastJockey.toLowerCase().trim();
    }

    /**
     * Check if trainer has changed between current race and last past performance
     * @param {Object} horse - Horse object
     * @returns {boolean} - True if trainer changed
     */
    hasTrainerChange(horse) {
        // Get current trainer name
        const currentTrainer = horse.trainerName || horse.trainer || '';

        // Get trainer from first past performance (most recent race)
        if (!horse.pastPerformances || horse.pastPerformances.length === 0) {
            return false; // No past performance to compare
        }

        const lastPP = horse.pastPerformances[0];
        const lastTrainer = lastPP.trainer || '';

        // If either is empty, no change detected
        if (!currentTrainer || !lastTrainer) {
            return false;
        }

        // Compare trainer names (case-insensitive)
        return currentTrainer.toLowerCase().trim() !== lastTrainer.toLowerCase().trim();
    }

    /**
     * Calculate normalized Power Rating for a horse
     * Formula: (Horse's PR / Maximum PR in race) rounded to 2 decimal places
     * @param {Object} horse - Horse object
     * @param {Object} race - Race object containing all horses
     * @returns {string} - Normalized PR value
     */
        calculateNormalizedPR(horse, race) {
            // Get current horse's power rating
            const horsePR = parseFloat(horse.powerRating) || 0;
    
            // Find maximum power rating among all horses in the race
            let maxPR = 0;
            if (race.horses && race.horses.length > 0) {
                maxPR = Math.max(...race.horses.map(h => parseFloat(h.powerRating) || 0));
            }
    
    
            // If maxPR is 0, return 0.00
            if (maxPR === 0) {
                return '0.00';
            }
    
            // Calculate normalized value
            const normalized = horsePR / maxPR;
    
            // Round to 2 decimal places
            return normalized.toFixed(2);
    
    }
            /**
             * Calculate normalized Money Rating (Most Recent) for a horse
             * Formula: (Horse's MR Money / Maximum MR Money in race) rounded to 2 decimal places
             * @param {Object} horse - Horse object
             * @param {Object} race - Race object containing all horses
             * @returns {string} - Normalized Money MR value
             */
            calculateNormalizedMoneyMR(horse, race) {
                // Calculate MR money rating for current horse
                const moneyRatings = this.calculateCategoryMoneyRatings(horse);
                const horseMR = parseFloat(moneyRatings.mr) || 0;
        
                // Find maximum MR money rating among all horses in the race
                let maxMR = 0;
                if (race.horses && race.horses.length > 0) {
                    maxMR = Math.max(...race.horses.map(h => {
                        const ratings = this.calculateCategoryMoneyRatings(h);
                        return parseFloat(ratings.mr) || 0;
                    }));
                }
        
                // If maxMR is 0, return 0.00
                if (maxMR === 0) {
                    return '0.00';
                }
        
                // Calculate normalized value
                const normalized = horseMR / maxMR;
        
                // Round to 2 decimal places
                return normalized.toFixed(2);
            }
        
            /**
             * Calculate normalized Jockey Most Recent money rating for a horse
             * Formula: (Horse's Jockey MR / Maximum Jockey MR in race) rounded to 2 decimal places
     * @param {Object} horse - Horse object
     * @param {Object} race - Race object containing all horses
     * @returns {string} - Normalized Jockey MR value
     */
    calculateNormalizedJockeyMR(horse, race) {
        // Calculate Jockey MR for current horse
        const jtRatings = this.calculateJockeyTrainerMoneyRatings(horse);
        const horseJockeyMR = parseFloat(jtRatings.jockeyMR) || 0;

        // Find maximum Jockey MR among all horses in the race
        let maxJockeyMR = 0;
        if (race.horses && race.horses.length > 0) {
            maxJockeyMR = Math.max(...race.horses.map(h => {
                const ratings = this.calculateJockeyTrainerMoneyRatings(h);
                return parseFloat(ratings.jockeyMR) || 0;
            }));
        }

        // If maxJockeyMR is 0, return 0.00
        if (maxJockeyMR === 0) {
            return '0.00';
        }

        // Calculate normalized value
        const normalized = horseJockeyMR / maxJockeyMR;

        // Round to 2 decimal places
        return normalized.toFixed(2);
    }

    /**
     * Calculate normalized Trainer Most Recent money rating for a horse
     * Formula: (Horse's Trainer MR / Maximum Trainer MR in race) rounded to 2 decimal places
     * @param {Object} horse - Horse object
     * @param {Object} race - Race object containing all horses
     * @returns {string} - Normalized Trainer MR value
     */
    calculateNormalizedTrainerMR(horse, race) {
        // Calculate Trainer MR for current horse
        const jtRatings = this.calculateJockeyTrainerMoneyRatings(horse);
        const horseTrainerMR = parseFloat(jtRatings.trainerMR) || 0;

        // Find maximum Trainer MR among all horses in the race
        let maxTrainerMR = 0;
        if (race.horses && race.horses.length > 0) {
            maxTrainerMR = Math.max(...race.horses.map(h => {
                const ratings = this.calculateJockeyTrainerMoneyRatings(h);
                return parseFloat(ratings.trainerMR) || 0;
            }));
        }

        // If maxTrainerMR is 0, return 0.00
        if (maxTrainerMR === 0) {
            return '0.00';
        }

        // Calculate normalized value
        const normalized = horseTrainerMR / maxTrainerMR;

        // Round to 2 decimal places
        return normalized.toFixed(2);
    }

    /**
     * Calculate normalized Speed Most Recent rating for a horse
     * Formula: (Horse's Speed MR / Maximum Speed MR in race) rounded to 2 decimal places
     * @param {Object} horse - Horse object
     * @param {Object} race - Race object containing all horses
     * @returns {string} - Normalized Speed MR value
     */
    calculateNormalizedSpeedMR(horse, race) {
        // Calculate Speed MR for current horse
        const speedRatings = this.calculateCategorySpeedRatings(horse);
        const horseSpeedMR = parseFloat(speedRatings.mr) || 0;

        // Find maximum Speed MR among all horses in the race
        let maxSpeedMR = 0;
        if (race.horses && race.horses.length > 0) {
            maxSpeedMR = Math.max(...race.horses.map(h => {
                const ratings = this.calculateCategorySpeedRatings(h);
                return parseFloat(ratings.mr) || 0;
            }));
        }

        // If maxSpeedMR is 0, return 0.00
        if (maxSpeedMR === 0) {
            return '0.00';
        }

        // Calculate normalized value
        const normalized = horseSpeedMR / maxSpeedMR;

        // Round to 2 decimal places
        return normalized.toFixed(2);
    }

    /**
     * Calculate Average Par from past performances (up to 4 races)
     * @param {Object} horse - Horse object
     * @returns {string} - Average Par value rounded to 2 decimal places
     */
    calculateAveragePar(horse) {
        if (!horse.pastPerformances || horse.pastPerformances.length === 0) {
            return '0.00';
        }

        // Get speedPar values from up to 4 past performances
        let parValues = [];
        for (let i = 0; i < Math.min(4, horse.pastPerformances.length); i++) {
            const pp = horse.pastPerformances[i];
            const par = parseFloat(pp.speedPar) || 0;
            if (par > 0) {
                parValues.push(par);
            }
        }

        // If no valid par values, return 0.00
        if (parValues.length === 0) {
            return '0.00';
        }

        // Calculate average of Late Pace, Last Pace, and Par
        const sum = parValues.reduce((acc, val) => acc + val, 0);
        const average = sum / parValues.length;

        // Round to 2 decimal places
        return average.toFixed(2);
    }

    /**
     * Calculate normalized Average Par for a horse
     * Formula: (Horse's Avg Par / Maximum Avg Par in race) rounded to 2 decimal places
     * @param {Object} horse - Horse object
     * @param {Object} race - Race object containing all horses
     * @returns {string} - Normalized Average Par value
     */
    calculateNormalizedAvgPar(horse, race) {
        // Calculate Average Par for current horse
        const horseAvgPar = parseFloat(this.calculateAveragePar(horse)) || 0;

        // Find maximum Average Par among all horses in the race
        let maxAvgPar = 0;
        if (race.horses && race.horses.length > 0) {
            maxAvgPar = Math.max(...race.horses.map(h => {
                return parseFloat(this.calculateAveragePar(h)) || 0;
            }));
        }

        // If maxAvgPar is 0, return 0.00
        if (maxAvgPar === 0) {
            return '0.00';
        }

        // Calculate normalized value
        const normalized = horseAvgPar / maxAvgPar;

        // Round to 2 decimal places
        return normalized.toFixed(2);
    }

    /**
     * Calculate PR Score (Column 7 in Table 2)
     * Formula: Sum of (normalized value * correlation coefficient) for columns 2-8, multiplied by 100
     * @param {string} normalizedPR - Normalized Power Rating (Column 2)
     * @param {string} normalizedMoneyMR - Normalized Money Rating (Column 3)
     * @param {string} normalizedJockeyMR - Normalized Jockey MR (Column 4)
     * @param {string} normalizedTrainerMR - Normalized Trainer MR (Column 5)
     * @param {string} normalizedSpeedMR - Normalized Speed MR (Column 6)
     * @param {string} normalizedAvgPar - Normalized Average Par (Column 8)
     * @returns {string} - PR Score rounded to 0 decimal places
     */
    calculatePRScore(normalizedPR, normalizedMoneyMR, normalizedJockeyMR, normalizedTrainerMR, normalizedSpeedMR, normalizedAvgPar) {
        // Convert string values to floats
        const pr = parseFloat(normalizedPR) || 0;
        const moneyMR = parseFloat(normalizedMoneyMR) || 0;
        const jockeyMR = parseFloat(normalizedJockeyMR) || 0;
        const trainerMR = parseFloat(normalizedTrainerMR) || 0;
        const speedMR = parseFloat(normalizedSpeedMR) || 0;
        const avgPar = parseFloat(normalizedAvgPar) || 0;

        // Calculate weighted sum using correlation coefficients (columns 2-6 and 8)
        const weightedSum =
            (pr * CORRELATION_COEFFICIENTS.PR) +
            (moneyMR * CORRELATION_COEFFICIENTS.MONEY_MR) +
            (jockeyMR * CORRELATION_COEFFICIENTS.JOCKEY_MR) +
            (trainerMR * CORRELATION_COEFFICIENTS.TRAINER_MR) +
            (speedMR * CORRELATION_COEFFICIENTS.SPEED_MR) +
            (avgPar * CORRELATION_COEFFICIENTS.AVG_PAR);

        // Multiply by 100 and round to 0 decimal places
        const prScore = Math.round(weightedSum * 100);

        return String(prScore);
    }
}

