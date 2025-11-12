# Marketing Analytics Tool

A full-featured web application for analyzing advertising spend vs sales correlation with ROI prediction capabilities.

## Features

✅ **CSV File Upload** - Drag & drop or click to upload your advertising and sales data
✅ **Data Validation** - Automatic validation of required columns and data formats
✅ **Statistical Analysis** - Calculates correlations between spend channels and sales
✅ **Visualization** - Interactive charts showing spending trends, revenue trends, and channel performance
✅ **ROI Prediction** - Predict future revenue based on advertising spend inputs
✅ **Report Generation** - Download detailed analysis reports

## Required CSV Format

Your CSV file must contain the following columns:

| Column | Type | Description |
|--------|------|-------------|
| Month | Text | Time period identifier (e.g., "Jan-2023") |
| TV_Spend | Number | TV advertising expenditure |
| Radio_Spend | Number | Radio advertising expenditure |
| SocialMedia_Spend | Number | Social media advertising expenditure |
| Sales_Revenue | Number | Sales revenue for the period |

**Minimum Requirements:**
- At least 3 rows of data
- All numeric columns must contain valid numbers
- No empty cells in required columns

### Example CSV Format

```csv
Month,TV_Spend,Radio_Spend,SocialMedia_Spend,Sales_Revenue
Jan-2023,5000,3000,2000,15000
Feb-2023,5500,3200,2500,16500
Mar-2023,6000,3500,2800,17500
Apr-2023,5800,3100,2300,16800
May-2023,6200,3400,3000,18200
```

## Installation

1. **Clone or Download** the project files
2. **No dependencies required** - This is a standalone HTML/CSS/JavaScript application
3. **Open `index.html`** in any modern web browser

## Usage

### 1. Upload Data
- Click the upload area or drag & drop a CSV file
- The file will be automatically validated
- If there are errors, they will be displayed

### 2. View Analysis
Once data is uploaded, you'll see:

- **Summary Statistics** - Total spend, revenue, and ROI calculations
- **Correlation Analysis** - See which channels have the strongest impact on sales
- **Interactive Charts:**
  - Spending trends over time
  - Sales revenue trend
  - Total spend vs revenue comparison
  - Channel performance breakdown

### 3. Predict Revenue
- Enter your planned spending amounts for each channel
- Click "Predict Revenue" to get an estimated sales forecast
- Predictions are based on multiple linear regression analysis

### 4. Download Report
- Click "Download Report" to save a detailed text report
- Includes all statistics, correlations, and raw data

## Technical Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Charting:** Chart.js 4.x
- **Browser Support:** All modern browsers (Chrome, Firefox, Safari, Edge)
- **Size:** ~50KB total (HTML + CSS + JS)

## Key Algorithms

### Correlation Analysis
- Pearson correlation coefficient to measure linear relationships
- Range: -1 to 1 (strong negative to strong positive correlation)

### ROI Calculation
- Formula: `ROI = ((Total Revenue - Total Spend) / Total Spend) × 100`

### Revenue Prediction
- Multiple linear regression combining all three advertising channels
- Weighted by correlation strength for optimal prediction

### Correlation Strength Scale
- **Very Strong:** |r| ≥ 0.8
- **Strong:** |r| ≥ 0.6
- **Moderate:** |r| ≥ 0.4
- **Weak:** |r| ≥ 0.2
- **Very Weak:** |r| < 0.2

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # Complete styling
├── script.js           # All JavaScript logic
└── README.md           # This file
```

## Running Locally

### Option 1: Direct Browser Opening
Simply double-click `index.html` to open in your default browser.

### Option 2: Python HTTP Server (Recommended)
```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

### Option 3: Node.js HTTP Server
```bash
# Using http-server package
npx http-server

# Then open: http://localhost:8080
```

## Features Explained

### Data Validation
- Checks for required columns
- Validates minimum data rows (3+)
- Ensures numeric columns contain numbers
- Provides clear error messages

### Statistical Metrics
- **Mean:** Average values for each metric
- **Standard Deviation:** Variability in the data
- **Correlation:** Linear relationship strength
- **Regression:** Predictive modeling

### Chart Types
- **Line Charts:** Trends over time
- **Bar Charts:** Comparisons and totals
- **Doughnut Chart:** Channel distribution

## Browser Requirements

- ES6 JavaScript support
- HTML5 Canvas API
- FileReader API for CSV upload

**Tested on:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Limitations

- Maximum practical CSV size: 10,000 rows
- Supports only linear regression modeling
- No external data API integration
- Browser-based processing (no server required)

## Tips for Best Results

1. **Consistent Data:** Ensure monthly/regular data intervals
2. **Sufficient Data:** More data points = better predictions
3. **Data Quality:** Clean data without outliers works best
4. **Channel Balance:** Include spending across multiple channels
5. **Format:** Follow the exact CSV format requirements

## Troubleshooting

### "Missing required columns" Error
- Verify column names match exactly (case-sensitive): Month, TV_Spend, Radio_Spend, SocialMedia_Spend, Sales_Revenue

### "Invalid numeric value" Error
- Check that spend and revenue columns contain only numbers
- No text or symbols in numeric columns

### "Minimum 3 rows" Error
- Ensure your CSV has at least 3 data rows (plus header)

### Charts not displaying
- Try refreshing the page
- Check browser console for errors
- Ensure JavaScript is enabled

## Future Enhancements

- Polynomial regression modeling
- Seasonal trend analysis
- Confidence intervals for predictions
- CSV export with analysis
- Mobile app version
- API integration

## License

This tool is provided as-is for educational and business analytics purposes.

## Support

For questions or issues:
1. Check the CSV format requirements
2. Review the error messages
3. Verify browser compatibility
4. Check browser console for technical errors

---

**Version:** 1.0  
**Last Updated:** November 2025
