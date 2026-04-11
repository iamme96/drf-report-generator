# Changelog

## [1.2.0] - 2026-03-02

### Changed
- **\*P Formula**: Now uses PP Speed Rating (Column 10) instead of PP Speed Par
  - Formula: (PP Speed Par / Current Race Speed Par) × PP Speed Rating
- **PP Section Layout**: Adjusted column widths
  - P-T-C column: Increased to 1.2x (from 1.0x)
  - DO column: Decreased to 0.9x (from 1.1x)

### Fixed
- PP section data alignment - header and data columns now properly aligned
- Syntax errors in calculateSP and calculateWeightedPar functions

### Removed
- SP calculation debug logging
- PR(B) calculation debug logging

## [1.1.0] - 2026-01-02

### Added
- Post time display with Pacific to Central Time conversion (+2 hours)
- Post time format: "Post: H:MM AM/PM CT"
- PG column on Page 2 between AP VAL and ML
- Favicon with gold horse icon on dark green background

### Changed
- Correlation coefficients updated:
  - PR: 0.295
  - MONEY: 0.130
  - JOCKEY: 0.128
  - TRAINER: 0.154
  - SPEED: 0.183
  - AVG_PAR: 0.110

### Fixed
- Page 2 ODDS column overflow (updated from /13 to /14 units)

## [1.0.0] - Initial Release

### Features
- DRF file parsing and visualization
- PDF report generation with 2 pages per race
- Past performance analysis with 12 columns
- Pace and speed figure charts (4 graphs)
- Normalized ratings and composite scores
