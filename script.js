// ==================== History Management ====================
class HistoryManager {
    constructor() {
        this.storageKey = 'ironAnalyticsHistory';
        this.maxEntries = 20;
    }

    saveAnalysis(data, analysis) {
        const history = this.getHistory();
        const entry = {
            id: Date.now(),
            fileName: data[0] ? 'Dataset' : 'Unknown',
            timestamp: new Date().toLocaleString(),
            dataPoints: data.length,
            totalRevenue: analysis.totalRevenue.toFixed(2),
            totalSpend: analysis.totalSpend.toFixed(2),
            roi: analysis.roi.toFixed(2),
            data: data,
            analysis: analysis
        };

        history.unshift(entry);
        
        // Keep only last 20 entries
        if (history.length > this.maxEntries) {
            history.pop();
        }

        localStorage.setItem(this.storageKey, JSON.stringify(history));
        this.updateHistoryUI();
        return entry.id;
    }

    getHistory() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading history:', e);
            return [];
        }
    }

    getEntry(id) {
        const history = this.getHistory();
        return history.find(entry => entry.id === id);
    }

    deleteEntry(id) {
        let history = this.getHistory();
        history = history.filter(entry => entry.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(history));
        this.updateHistoryUI();
    }

    clearAll() {
        if (confirm('Are you sure you want to delete all history? This cannot be undone.')) {
            localStorage.removeItem(this.storageKey);
            this.updateHistoryUI();
        }
    }

    updateHistoryUI() {
        const history = this.getHistory();
        const historyList = document.getElementById('historyList');
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="history-empty">No history yet. Upload a file to get started!</p>';
            return;
        }

        historyList.innerHTML = history.map(entry => `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-item-title">📊 ${entry.fileName}</div>
                <div class="history-item-date">📅 ${entry.timestamp}</div>
                <div class="history-item-stats">
                    <div>📈 Points: ${entry.dataPoints}</div>
                    <div>💰 Revenue: $${entry.totalRevenue}</div>
                    <div>📊 ROI: ${entry.roi}%</div>
                </div>
                <div class="history-item-actions">
                    <button class="history-item-btn load-history" data-id="${entry.id}">Load</button>
                    <button class="history-item-btn delete-history" data-id="${entry.id}">Delete</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.load-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadAnalysis(parseInt(btn.dataset.id));
            });
        });

        document.querySelectorAll('.delete-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteEntry(parseInt(btn.dataset.id));
            });
        });
    }

    loadAnalysis(id) {
        const entry = this.getEntry(id);
        if (!entry) {
            alert('History entry not found');
            return;
        }

        currentData = entry.data;
        currentAnalysis = entry.analysis;
        displayResults();
        
        // Close history panel
        document.getElementById('historyPanel').classList.remove('open');
    }

    searchHistory(query) {
        const history = this.getHistory();
        const filtered = history.filter(entry => 
            entry.fileName.toLowerCase().includes(query.toLowerCase()) ||
            entry.timestamp.toLowerCase().includes(query.toLowerCase())
        );
        
        const historyList = document.getElementById('historyList');
        
        if (filtered.length === 0) {
            historyList.innerHTML = '<p class="history-empty">No matching history found</p>';
            return;
        }

        historyList.innerHTML = filtered.map(entry => `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-item-title">📊 ${entry.fileName}</div>
                <div class="history-item-date">📅 ${entry.timestamp}</div>
                <div class="history-item-stats">
                    <div>📈 Points: ${entry.dataPoints}</div>
                    <div>💰 Revenue: $${entry.totalRevenue}</div>
                    <div>📊 ROI: ${entry.roi}%</div>
                </div>
                <div class="history-item-actions">
                    <button class="history-item-btn load-history" data-id="${entry.id}">Load</button>
                    <button class="history-item-btn delete-history" data-id="${entry.id}">Delete</button>
                </div>
            </div>
        `).join('');

        // Re-attach event listeners
        document.querySelectorAll('.load-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadAnalysis(parseInt(btn.dataset.id));
            });
        });

        document.querySelectorAll('.delete-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteEntry(parseInt(btn.dataset.id));
            });
        });
    }
}

const historyManager = new HistoryManager();
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
            row[header] = isNaN(values[index]) ? values[index] : parseFloat(values[index]);
        });
        data.push(row);
    }

    return { headers, data };
}

// ==================== Validation ====================
function validateData(headers, data) {
    const requiredColumns = ['Month', 'TV_Spend', 'Radio_Spend', 'SocialMedia_Spend', 'Sales_Revenue'];
    
    // Check if all required columns exist
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Check minimum data rows
    if (data.length < 3) {
        throw new Error('Minimum 3 rows of data required for analysis');
    }

    // Validate numeric columns
    const numericColumns = ['TV_Spend', 'Radio_Spend', 'SocialMedia_Spend', 'Sales_Revenue'];
    for (const row of data) {
        for (const col of numericColumns) {
            if (isNaN(row[col]) || row[col] === '' || row[col] === null) {
                throw new Error(`Invalid numeric value in ${col}: ${row[col]}`);
            }
        }
    }

    return true;
}

// ==================== Statistical Functions ====================
function calculateMean(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateStandardDeviation(values) {
    const mean = calculateMean(values);
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

function calculateCorrelation(x, y) {
    const n = x.length;
    const meanX = calculateMean(x);
    const meanY = calculateMean(y);
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }
    
    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationStrength(correlation) {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return 'Very Strong';
    if (abs >= 0.6) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
}

// ==================== Linear Regression ====================
function linearRegression(x, y) {
    const n = x.length;
    const meanX = calculateMean(x);
    const meanY = calculateMean(y);
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
        numerator += (x[i] - meanX) * (y[i] - meanY);
        denominator += (x[i] - meanX) * (x[i] - meanX);
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    return { slope, intercept };
}

function predictValue(x, slope, intercept) {
    return slope * x + intercept;
}

// ==================== Multiple Linear Regression ====================
function multipleLinearRegression(features, target) {
    // Using simple multiple regression by calculating weighted contribution
    const n = features[0].length;
    const coefficients = [];
    
    for (let i = 0; i < features.length; i++) {
        const regression = linearRegression(features[i], target);
        const correlation = calculateCorrelation(features[i], target);
        coefficients.push({
            slope: regression.slope,
            correlation: correlation,
            weight: Math.abs(correlation)
        });
    }
    
    // Normalize weights
    const totalWeight = coefficients.reduce((sum, c) => sum + c.weight, 0);
    coefficients.forEach(c => {
        c.normalizedWeight = totalWeight > 0 ? c.weight / totalWeight : 0;
    });
    
    return coefficients;
}

// ==================== Data Analysis ====================
function analyzeData(data) {
    const sales = data.map(d => d.Sales_Revenue);
    const tvSpend = data.map(d => d.TV_Spend);
    const radioSpend = data.map(d => d.Radio_Spend);
    const socialSpend = data.map(d => d.SocialMedia_Spend);
    const months = data.map(d => d.Month);
    
    const totalSpend = tvSpend.reduce((a, b) => a + b, 0) + 
                      radioSpend.reduce((a, b) => a + b, 0) + 
                      socialSpend.reduce((a, b) => a + b, 0);
    
    const totalRevenue = sales.reduce((a, b) => a + b, 0);
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100) : 0;
    
    return {
        months,
        sales,
        tvSpend,
        radioSpend,
        socialSpend,
        totalTVSpend: tvSpend.reduce((a, b) => a + b, 0),
        totalRadioSpend: radioSpend.reduce((a, b) => a + b, 0),
        totalSocialSpend: socialSpend.reduce((a, b) => a + b, 0),
        totalSpend,
        totalRevenue,
        roi,
        avgROI: roi / data.length,
        correlations: {
            tv: calculateCorrelation(tvSpend, sales),
            radio: calculateCorrelation(radioSpend, sales),
            social: calculateCorrelation(socialSpend, sales)
        },
        regressions: {
            tv: linearRegression(tvSpend, sales),
            radio: linearRegression(radioSpend, sales),
            social: linearRegression(socialSpend, sales)
        },
        multipleRegression: multipleLinearRegression([tvSpend, radioSpend, socialSpend], sales)
    };
}

// ==================== DOM Elements ====================
const uploadArea = document.getElementById('uploadArea');
const csvInput = document.getElementById('csvInput');
const errorMessage = document.getElementById('errorMessage');
const uploadSection = document.getElementById('uploadSection');
const resultsSection = document.getElementById('resultsSection');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const predictBtn = document.getElementById('predictBtn');

// History elements
const historyToggle = document.getElementById('historyToggle');
const closeHistory = document.getElementById('closeHistory');
const historyPanel = document.getElementById('historyPanel');
const historySearch = document.getElementById('historySearch');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

let currentData = null;
let currentAnalysis = null;
let charts = {};

// ==================== Event Listeners ====================
uploadArea.addEventListener('click', () => csvInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
});

csvInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
    }
});

resetBtn.addEventListener('click', () => {
    uploadSection.style.display = 'block';
    resultsSection.style.display = 'none';
    csvInput.value = '';
    errorMessage.style.display = 'none';
    currentData = null;
    currentAnalysis = null;
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
});

predictBtn.addEventListener('click', predictRevenue);
downloadBtn.addEventListener('click', downloadReport);

// History Panel Events
historyToggle.addEventListener('click', () => {
    historyPanel.classList.add('open');
});

closeHistory.addEventListener('click', () => {
    historyPanel.classList.remove('open');
});

historySearch.addEventListener('input', (e) => {
    if (e.target.value.trim()) {
        historyManager.searchHistory(e.target.value);
    } else {
        historyManager.updateHistoryUI();
    }
});

clearHistoryBtn.addEventListener('click', () => {
    historyManager.clearAll();
});

// Close history panel when clicking outside
document.addEventListener('click', (e) => {
    if (!historyPanel.contains(e.target) && e.target !== historyToggle) {
        historyPanel.classList.remove('open');
    }
});

// Initialize history UI on page load
document.addEventListener('DOMContentLoaded', () => {
    historyManager.updateHistoryUI();
});

// ==================== File Upload Handler ====================
function handleFileUpload(file) {
    if (!file.name.endsWith('.csv')) {
        showError('Please upload a CSV file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const { headers, data } = parseCSV(e.target.result);
            validateData(headers, data);
            currentData = data;
            currentAnalysis = analyzeData(data);
            displayResults();
            errorMessage.style.display = 'none';
        } catch (error) {
            showError(error.message);
        }
    };
    reader.readAsText(file);
}

// ==================== Error Display ====================
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// ==================== Results Display ====================
function displayResults() {
    uploadSection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Save to history
    historyManager.saveAnalysis(currentData, currentAnalysis);

    // Populate data table
    populateDataTable();

    // Update statistics
    updateStatistics();

    // Update correlations
    updateCorrelations();

    // Create charts
    createCharts();

    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function populateDataTable() {
    const table = document.getElementById('dataTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    const headers = Object.keys(currentData[0]);
    const headerRow = thead.insertRow();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    currentData.forEach(row => {
        const tr = tbody.insertRow();
        headers.forEach(header => {
            const td = tr.insertCell();
            const value = row[header];
            td.textContent = typeof value === 'number' ? value.toFixed(2) : value;
        });
    });
}

function updateStatistics() {
    const analysis = currentAnalysis;
    
    document.getElementById('dataPointsCount').textContent = currentData.length;
    document.getElementById('totalTVSpend').textContent = '$' + analysis.totalTVSpend.toFixed(2);
    document.getElementById('totalRadioSpend').textContent = '$' + analysis.totalRadioSpend.toFixed(2);
    document.getElementById('totalSocialSpend').textContent = '$' + analysis.totalSocialSpend.toFixed(2);
    document.getElementById('totalRevenue').textContent = '$' + analysis.totalRevenue.toFixed(2);
    document.getElementById('avgROI').textContent = analysis.roi.toFixed(2) + '%';
}

function updateCorrelations() {
    const analysis = currentAnalysis;
    
    // TV Correlation
    document.getElementById('tvCorrelation').textContent = analysis.correlations.tv.toFixed(2);
    document.getElementById('tvStrength').textContent = getCorrelationStrength(analysis.correlations.tv);
    
    // Radio Correlation
    document.getElementById('radioCorrelation').textContent = analysis.correlations.radio.toFixed(2);
    document.getElementById('radioStrength').textContent = getCorrelationStrength(analysis.correlations.radio);
    
    // Social Correlation
    document.getElementById('socialCorrelation').textContent = analysis.correlations.social.toFixed(2);
    document.getElementById('socialStrength').textContent = getCorrelationStrength(analysis.correlations.social);
}

// ==================== Chart Creation ====================
function createCharts() {
    const analysis = currentAnalysis;
    const months = analysis.months;
    
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};

    // Spending Trends Chart
    const spendingCtx = document.getElementById('spendingChart').getContext('2d');
    charts.spending = new Chart(spendingCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'TV Spend',
                    data: analysis.tvSpend,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Radio Spend',
                    data: analysis.radioSpend,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Social Media Spend',
                    data: analysis.socialSpend,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Revenue Trend Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    charts.revenue = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Sales Revenue',
                    data: analysis.sales,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Comparison Chart
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    const totalSpendByMonth = [];
    for (let i = 0; i < analysis.tvSpend.length; i++) {
        totalSpendByMonth.push(analysis.tvSpend[i] + analysis.radioSpend[i] + analysis.socialSpend[i]);
    }
    
    charts.comparison = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Total Spend',
                    data: totalSpendByMonth,
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                },
                {
                    label: 'Sales Revenue',
                    data: analysis.sales,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Channel Performance Chart
    const channelCtx = document.getElementById('channelChart').getContext('2d');
    charts.channel = new Chart(channelCtx, {
        type: 'doughnut',
        data: {
            labels: ['TV', 'Radio', 'Social Media'],
            datasets: [
                {
                    data: [analysis.totalTVSpend, analysis.totalRadioSpend, analysis.totalSocialSpend],
                    backgroundColor: ['#ef4444', '#f59e0b', '#8b5cf6'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// ==================== Prediction ====================
function predictRevenue() {
    if (!currentAnalysis) return;

    const tvSpend = parseFloat(document.getElementById('predictTVSpend').value) || 0;
    const radioSpend = parseFloat(document.getElementById('predictRadioSpend').value) || 0;
    const socialSpend = parseFloat(document.getElementById('predictSocialSpend').value) || 0;

    if (tvSpend === 0 && radioSpend === 0 && socialSpend === 0) {
        alert('Please enter at least one spending amount');
        return;
    }

    const analysis = currentAnalysis;
    const mr = analysis.multipleRegression;
    
    // Calculate predicted revenue using multiple regression
    let predictedRevenue = 0;
    const baselineRevenue = calculateMean(analysis.sales);
    
    predictedRevenue += mr[0].slope * tvSpend * mr[0].normalizedWeight;
    predictedRevenue += mr[1].slope * radioSpend * mr[1].normalizedWeight;
    predictedRevenue += mr[2].slope * socialSpend * mr[2].normalizedWeight;
    predictedRevenue += baselineRevenue;
    
    // Ensure positive prediction
    predictedRevenue = Math.max(predictedRevenue, 0);

    document.getElementById('predictionValue').textContent = '$' + predictedRevenue.toFixed(2);
    document.getElementById('predictionResult').style.display = 'block';
}

// ==================== Download Report ====================
function downloadReport() {
    if (!currentData || !currentAnalysis) return;

    const analysis = currentAnalysis;
    let reportContent = 'MARKETING ANALYTICS REPORT\n';
    reportContent += '============================\n\n';
    
    reportContent += 'SUMMARY STATISTICS\n';
    reportContent += '------------------\n';
    reportContent += `Total Data Points: ${currentData.length}\n`;
    reportContent += `Total TV Spend: $${analysis.totalTVSpend.toFixed(2)}\n`;
    reportContent += `Total Radio Spend: $${analysis.totalRadioSpend.toFixed(2)}\n`;
    reportContent += `Total Social Media Spend: $${analysis.totalSocialSpend.toFixed(2)}\n`;
    reportContent += `Total Spend: $${analysis.totalSpend.toFixed(2)}\n`;
    reportContent += `Total Revenue: $${analysis.totalRevenue.toFixed(2)}\n`;
    reportContent += `Overall ROI: ${analysis.roi.toFixed(2)}%\n\n`;
    
    reportContent += 'CORRELATION ANALYSIS\n';
    reportContent += '--------------------\n';
    reportContent += `TV Spend vs Sales: ${analysis.correlations.tv.toFixed(2)} (${getCorrelationStrength(analysis.correlations.tv)})\n`;
    reportContent += `Radio Spend vs Sales: ${analysis.correlations.radio.toFixed(2)} (${getCorrelationStrength(analysis.correlations.radio)})\n`;
    reportContent += `Social Media Spend vs Sales: ${analysis.correlations.social.toFixed(2)} (${getCorrelationStrength(analysis.correlations.social)})\n\n`;
    
    reportContent += 'DETAILED DATA\n';
    reportContent += '-------------\n';
    reportContent += 'Month,TV_Spend,Radio_Spend,SocialMedia_Spend,Sales_Revenue\n';
    currentData.forEach((row, index) => {
        reportContent += `${row.Month},${row.TV_Spend.toFixed(2)},${row.Radio_Spend.toFixed(2)},${row.SocialMedia_Spend.toFixed(2)},${row.Sales_Revenue.toFixed(2)}\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent));
    element.setAttribute('download', 'marketing-analytics-report.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
