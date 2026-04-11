# Horse Racing DRF Report Generator

A comprehensive tool for parsing Daily Racing Form (DRF) files and generating detailed PDF reports with visualizations for horse racing analysis.

## Current Version: 1.2.0 (March 2, 2026)

## Features

### 📊 Visualization Page (`race-graphics.html`)
- Four interactive pace/speed analysis charts
- BRIS 2F Pace, Last Call Pace, Late Pace, and Speed Rating graphs
- Color-coded by post position
- Min-max range bars for performance visualization

### 📄 PDF Report Generation (`pdf-integration.html`)
- 2-page report per race
- **Page 1**: Detailed past performance analysis
  - 12-column PP section: P-T-C, Par, D-Sf-Cd-Cg, DO, Rank, 2F, 4F, 6F, Late, Spd, SP, *P
  - Post time with Pacific to Central Time conversion
  - Money, Speed, and Position statistics
- **Page 2**: Comparative analysis
  - Normalized ratings (PR(B), $-MR, J-MR, T-MR, SPD-MR)
  - Composite PR Score
  - Average Par calculations

## Quick Start

1. **Open the application:**
   - For visualization: Open `race-graphics.html` in a web browser
   - For PDF reports: Open `pdf-integration.html` in a web browser

2. **Load DRF file:**
   - Click "Choose File" and select your DRF file
   - Data will be automatically parsed

3. **Generate reports:**
   - View interactive charts on the visualization page
   - Generate and download PDF reports from the PDF page

## File Structure

```
├── race-graphics.html          # Main visualization page
├── pdf-integration.html        # PDF report generation page
├── drf-parser.js              # DRF file parser
├── drf-pdf-generator.js       # PDF generation logic
├── pdf-report-generator.js    # Additional PDF utilities
├── post-position-colors.js    # Racing color schemes
├── racing-data-model.js       # Data models
├── favicon.svg                # Application icon
├── README.md                  # This file
└── CHANGELOG.md              # Version history
```

## Key Formulas

### *P (Weighted Par)
```
*P = (PP Speed Par / Current Race Speed Par) × PP Speed Rating
```

### SP (Speed/Pace Average)
```
SP = (Late Pace + Last Pace + Par) / 3
```
Where Last Pace is distance-dependent:
- < 5.5 furlongs: 2F Pace
- ≥ 8 furlongs: 6F Pace
- Otherwise: 4F Pace

### PR Score (Composite Rating)
```
PR = (PR × 0.295) + (Money MR × 0.130) + (Jockey MR × 0.128) + 
     (Trainer MR × 0.154) + (Speed MR × 0.183) + (Avg Par × 0.110)
```

## Updating

### From Git Repository
```bash
git pull origin main
```

### From ZIP File
1. Backup your current installation
2. Extract the new ZIP file
3. Replace all files (keep your DRF data files)

## Recent Changes

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### Version 1.2.0 Highlights
- ✅ Updated *P formula to use PP Speed Rating
- ✅ Fixed PP section alignment issues
- ✅ Improved column width distribution

## Technical Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No server required - runs entirely in browser

## Support Files

- **DRF Files**: Daily Racing Form data files in CSV format
- **Libraries**: jsPDF, Chart.js (included via CDN)

## Notes

- All calculations use BRISNET field specifications
- Time zones: DRF post times are Pacific, displayed as Central (+2 hours)
- Field numbering: BRISNET uses 1-based indexing

## License

Proprietary - For authorized use only

---

For questions or issues, contact your system administrator.
