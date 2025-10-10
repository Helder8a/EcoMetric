document.addEventListener('DOMContentLoaded', () => {

    const getEl = id => document.getElementById(id);
    const habitechForm = getEl('habitech-form');
    const generatePOEBtn = getEl('generatePOEBtn');

    // --- UTILITY FUNCTIONS ---
    const getValue = (id) => parseFloat(document.getElementById(id).value) || 0;
    const formatCurrency = (val) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

    // --- CALCULATION LOGIC ---

    function calculateHabitech(inputs) {
        // 1. POE Score (Simple Average of Comfort Metrics, Max 5.0)
        const totalComfort = inputs.comfortScore + inputs.airQualityScore + inputs.acousticScore;
        const poeScore = totalComfort / 3;

        // 2. Energy Deviation
        const deviationRaw = (inputs.realConsumption - inputs.projectedConsumption);
        const deviationPercent = inputs.projectedConsumption > 0 ? (deviationRaw / inputs.projectedConsumption) * 100 : 0;
        
        let energyRecommendation = 'Performance validated.';
        let deviationColor = 'text-success';
        if (deviationPercent > 10) {
            energyRecommendation = 'High overconsumption. Calibrate BMS.';
            deviationColor = 'text-danger';
        } else if (deviationPercent > 0) {
            energyRecommendation = 'Slight overconsumption. Investigate.';
            deviationColor = 'text-warning';
        }

        // 3. Maintenance Predictivo (Simulado)
        // Checks lccaDB for the material with the soonest useful life end.
        let nextAlert = 'No critical alerts.';
        let replacementYear = 'N/A';
        let earliestYear = Infinity;
        
        // Assuming current year is 2025
        const currentYear = new Date().getFullYear();

        // lccaDB is assumed to be loaded globally from lcca_db.js
        if (typeof lccaDB !== 'undefined') {
            for (const key in lccaDB) {
                const material = lccaDB[key];
                if (material.useful_life > 0 && material.useful_life < earliestYear) {
                    earliestYear = material.useful_life;
                    nextAlert = material.name;
                    replacementYear = currentYear + earliestYear;
                }
            }
        }

        return {
            poeScore,
            deviationPercent,
            energyRecommendation,
            deviationColor,
            nextAlert,
            replacementYear
        };
    }

    // --- DISPLAY LOGIC ---

    function updateResults(results, inputs) {
        getEl('habitechScore').textContent = results.poeScore.toFixed(2);
        getEl('habitechScore').className = `display-3 font-weight-bold ${results.poeScore >= 4.0 ? 'text-success' : (results.poeScore >= 3.0 ? 'text-warning' : 'text-danger')}`;
        
        getEl('energyDeviation').textContent = `${results.deviationPercent.toFixed(1)} %`;
        getEl('energyDeviation').className = results.deviationColor;
        
        getEl('realCons').textContent = `${inputs.realConsumption.toFixed(0)} kWh/m²`;
        
        getEl('energyRec').textContent = results.energyRecommendation;
        getEl('energyRec').className = results.deviationColor;

        getEl('nextAlert').textContent = results.nextAlert;
        getEl('replacementYear').textContent = results.replacementYear;

        generatePOEBtn.style.display = 'block';
    }

    // --- REPORT GENERATION ---

    function generateComprehensiveReport(inputs, results) {
        const today = new Date().toLocaleDateString('en-US');
        
        let poeStatus = 'Good habitability score, indicating high occupant satisfaction.';
        if (results.poeScore < 3.0) poeStatus = 'Low score. Detailed acoustic and thermal investigation is recommended.';

        let deviationSection = '';
        if (Math.abs(results.deviationPercent) > 10) {
            deviationSection = `<p class="alert alert-danger"><strong>Critical Deviation:</strong> The real energy consumption is ${results.deviationPercent.toFixed(1)}% higher than projected. This indicates a major failure in the Digital Twin or Building Management System (BMS). Immediate recalibration is required.</p>`;
        } else if (results.deviationPercent < 0) {
             deviationSection = `<p class="alert alert-success"><strong>Efficiency Bonus:</strong> The asset consumes ${Math.abs(results.deviationPercent).toFixed(1)}% LESS than projected, confirming high efficiency or low occupancy.</p>`;
        } else {
             deviationSection = `<p class="alert alert-info"><strong>Validated Performance:</strong> The energy deviation is within the tolerance (${results.deviationPercent.toFixed(1)}%), validating the initial design models.</p>`;
        }


        const reportContent = `
            <div class="row">
                <div class="col-12 text-center mb-4"><h1 class="text-info">OPERATIONAL VALIDATION REPORT: HABI-TECH PRO</h1><p class="lead">Analysis Date: ${today}</p></div>
                
                <div class="col-md-6 mb-4">
                    <div class="card p-3 h-100 bg-light">
                        <h4>I. KEY HABITABILITY METRICS (POE)</h4>
                        <ul class="list-unstyled">
                            <li><strong>Thermal Comfort Score:</strong> <strong>${inputs.comfortScore.toFixed(1)} / 5.0</strong></li>
                            <li><strong>Air Quality Score:</strong> <strong>${inputs.airQualityScore.toFixed(1)} / 5.0</strong></li>
                            <li><strong>Acoustic Comfort Score:</strong> <strong>${inputs.acousticScore.toFixed(1)} / 5.0</strong></li>
                        </ul>
                        <hr>
                        <h4 class="text-success">OVERALL HABITABILITY SCORE</h4>
                        <h2 class="display-4 font-weight-bold" style="color:${results.poeScore >= 4.0 ? '#28A745' : '#FFAB00'};">${results.poeScore.toFixed(2)} / 5.0</h2>
                        <p class="small mt-3">${poeStatus}</p>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card p-3 h-100 bg-light">
                        <h4>II. DIGITAL TWIN CALIBRATION</h4>
                        <ul class="list-unstyled">
                            <li><strong>Projected Consumption:</strong> <strong>${inputs.projectedConsumption} kWh/m²</strong> (from Design Phase)</li>
                            <li><strong>Real Consumption (Sensor/Billing):</strong> <strong>${inputs.realConsumption} kWh/m²</strong></li>
                            <li><strong>Real Deviation:</strong> <strong>${results.deviationPercent.toFixed(1)} %</strong></li>
                            <li><strong>Projected Maintenance Cost:</strong> <strong>${formatCurrency(inputs.projectedMaintenance)} / year</strong></li>
                        </ul>
                        <hr>
                        <h4>ENERGY VALIDATION STATUS</h4>
                        ${deviationSection}
                    </div>
                </div>
                
                <div class="col-md-12 mb-4">
                    <div class="card p-4 bg-warning-light">
                        <h4>III. PREDICTIVE MAINTENANCE (LCCA FEEDBACK)</h4>
                        <p>The system, based on the Life Cycle Cost Analysis (LCCA) database, generates alerts for proactive maintenance, minimizing unforeseen costs:</p>
                        <ul class="list-unstyled">
                            <li><strong>Earliest Critical Alert:</strong> <strong>${results.nextAlert}</strong></li>
                            <li><strong>Projected Replacement Year:</strong> <strong>${results.replacementYear}</strong></li>
                            <li><strong>Recommendation:</strong> Initiate the process for capital expenditure planning in the year ${results.replacementYear - 3}.</li>
                        </ul>
                        <p class="small text-muted">This predictive approach transforms reactive maintenance into a planned investment, maximizing the Return on Investment (ROI) of the component.</p>
                    </div>
                </div>
            </div>
        `;

        getEl('POEOutputContent').innerHTML = reportContent;
        $('#POEModal').modal('show');
    }

    // --- EVENT HANDLERS ---
    
    if (habitechForm) {
        habitechForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = {
                comfortScore: getValue('comfortScore'),
                airQualityScore: getValue('airQualityScore'),
                acousticScore: getValue('acousticScore'),
                projectedConsumption: getValue('projectedConsumption'),
                realConsumption: getValue('realConsumption'),
                projectedMaintenance: getValue('projectedMaintenance')
            };

            if (habitechForm.checkValidity()) {
                const results = calculateHabitech(inputs);
                updateResults(results, inputs);
                window.finalHabitechInputs = inputs;
                window.finalHabitechResults = results;
            }
        });
    }

    if (generatePOEBtn) {
        generatePOEBtn.addEventListener('click', () => {
            if (window.finalHabitechInputs && window.finalHabitechResults) {
                 generateComprehensiveReport(window.finalHabitechInputs, window.finalHabitechResults);
            } else {
                 alert('Please run the analysis first.');
            }
        });
    }
    
    window.printReportPOE = function() {
        const reportContent = getEl('POEOutputContent').innerHTML;
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>POE Report</title>');
        printWindow.document.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"><link rel="stylesheet" href="style.css">');
        printWindow.document.write('<style>@media print {.btn, .modal-footer {display: none;}}</style>');
        printWindow.document.write('</head><body><div class="container py-5">' + reportContent + '</div></body></html>');
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    }

});