document.addEventListener('DOMContentLoaded', () => {

    // --- PROJECT TYPE DEFINITIONS (Energy/Ecometrics removed from Restoration) ---
    const projectDefinitions = {
        'obra-nueva': {
            title: 'Investment Analysis: New Construction',
            inputDefinitions: [
                { sectionTitle: '1. Urban and Land Data', fields: [
                    { id: 'landArea', label: 'Total Land Area (m²)', placeholder: 'e.g., 10000', description: 'The total surface area of the property lot.' },
                    { id: 'floorAreaRatio', label: 'Floor Area Ratio (m²/m²)', placeholder: 'e.g., 2.5', description: 'Ratio of a building\'s total floor area to the size of the land (determines maximum Gross Floor Area).' },
                    { id: 'maxLotCoverage', label: 'Max Lot Coverage (%)', placeholder: 'e.g., 60', description: 'The maximum percentage of the land that can be covered by the building\'s footprint.' },
                    { id: 'maxBuildingHeight', label: 'Max Height (Number of floors)', placeholder: 'e.g., 5', description: 'The maximum number of floors allowed by local regulations.' }
                ]},
                { sectionTitle: '2. Units and Parking', fields: [
                    { id: 'avgUnitSize', label: 'Average Residential Unit Size (m²)', placeholder: 'e.g., 90', description: 'The average gross area of a single apartment or housing unit to be built.' },
                    { id: 'parkingPerUnit', label: 'Parking Spaces per Unit', placeholder: 'e.g., 1.5', description: 'Number of car parking spaces required for each residential unit.' },
                    { id: 'visitorParkingPercent', label: 'Visitor Parking (%)', placeholder: 'e.g., 10', description: 'Additional parking required for visitors, expressed as a percentage of residential spaces.' },
                    { id: 'bikeParkingPerUnit', label: 'Bicycle Spaces per Unit', placeholder: 'e.g., 2', description: 'Number of secure bicycle parking spaces required for each unit.' }
                ]},
                { sectionTitle: '3. Costs and Prices', fields: [
                    { id: 'buildCost', label: 'Construction Cost (per m² of GFA)', placeholder: 'e.g., 950', description: 'The estimated cost to build one square meter of Gross Floor Area (GFA), including subterranean levels like parking.' },
                    { id: 'landCost', label: 'Total Land Acquisition Cost', placeholder: 'e.g., 500000', description: 'The total acquisition price of the land plot, including brokerage fees.' },
                    { id: 'sellPrice', label: 'Estimated Sale Price (per m² of NSA)', placeholder: 'e.g., 2100', description: 'The projected price for one square meter of Net Sellable Area (NSA).' }
                ]},
                { sectionTitle: '4. Advanced Costs & Financing', fields: [
                    { id: 'softCostsPercent', label: 'Soft Costs (%)', placeholder: 'e.g., 15', description: 'Percentage of the total Construction Cost for non-construction expenses like permits, design fees, supervision, and legal costs.' },
                    { id: 'marketingCostsPercent', label: 'Marketing & Sales Costs (%)', placeholder: 'e.g., 5', description: 'Percentage of the Gross Sales Revenue used for marketing and sales commissions.' },
                    { id: 'taxRatePercent', label: 'Tax Rate on Profit (%)', placeholder: 'e.g., 25', description: 'The corporate tax rate applied to the Gross Profit (Profit before Tax).' },
                    { id: 'loanToValuePercent', label: 'Financing / Loan-to-Value (%)', placeholder: 'e.g., 70', description: 'The percentage of the Total Investment that will be financed by a loan or third-party capital.' }
                ]}
            ]
        },
        'restauracion': {
            title: 'Investment Analysis: Restoration/Rehabilitation',
            inputDefinitions: [
                { sectionTitle: '1. Initial Investment', fields: [
                    { id: 'acquisitionCost', label: 'Property Acquisition Cost', placeholder: 'e.g., 800000', description: 'The purchase cost of the existing building.' },
                    { id: 'rehabilitationCost', label: 'Total Rehabilitation Cost', placeholder: 'e.g., 350000', description: 'The estimated cost of the restoration/rehabilitation work.' },
                    { id: 'softCostsPercent', label: 'Soft Costs (%)', placeholder: 'e.g., 10', description: 'Percentage of the Rehabilitation Cost for non-construction expenses like permits, design fees, and project management.' },
                    { id: 'sellPriceAfter', label: 'Estimated Post-Rehab Sale/Rent Value', placeholder: 'e.g., 1500000', description: 'Projected sale price after rehabilitation (used as Residual Value if Cap Rate is 0).' }
                ]},
                { sectionTitle: '2. Discounted Cash Flow (DCF)', fields: [ // Combined sections
                    { id: 'yearsOfOperation', label: 'Years of Projection (Analysis Horizon)', placeholder: 'e.g., 25', description: 'Time horizon for the Discounted Cash Flow (DCF) analysis.' },
                    { id: 'annualRevenue', label: 'Net Annual Operating Income', placeholder: 'e.g., 80000', description: 'Net annual income from rent or operation after operating expenses (NOI).' },
                    { id: 'capRate', label: 'Capitalization Rate (Cap Rate) (%)', placeholder: 'e.g., 5', description: 'Rate used to calculate the Terminal Value of the investment (NOI / Cap Rate).' },
                    { id: 'discountRate', label: 'Discount Rate (WACC) (%)', placeholder: 'e.g., 8', description: 'Weighted Average Cost of Capital (WACC) used for calculating Net Present Value (NPV).' },
                ]}
            ]
        }
    };
    
    // --- GLOBAL VARIABLES & UTILITIES ---
    let currentProjectType = '';
    let finalResults = {}; 
    let finalSensitivity = {}; 
    let currentCurrency = 'USD'; 
    let currentLocale = 'en-US'; 
    
    const getEl = id => document.getElementById(id);
    const formsContainer = getEl('input-forms-container');
    const analyzeBtn = getEl('analyzeBtn');
    const generateReportBtn = getEl('generateReportBtn');
    const projectTypeTitle = getEl('project-type-title');
    const analysisForm = getEl('investment-analysis-form');
    const currencySelector = getEl('currencySelector');

    // Helper to get input value as float (0 if empty)
    const getValue = (id) => parseFloat(document.getElementById(id).value) || 0;

    // Function to update currency settings
    function updateCurrency(code) {
        currentCurrency = code;
        // Set locale for correct number/currency formatting
        if (code === 'EUR') {
            currentLocale = 'de-DE'; 
        } else if (code === 'GBP') {
            currentLocale = 'en-GB';
        } else {
            currentLocale = 'en-US';
        }
    }

    // Currency formatting (Updated to use selected currency)
    const formatCurrency = (val) => val.toLocaleString(currentLocale, { style: 'currency', currency: currentCurrency, minimumFractionDigits: 0 });
    const formatNumber = (val) => val.toLocaleString(currentLocale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // Helper for percentage formatting in reports (shows 1-2 decimals)
    const formatPercent = (val) => val.toLocaleString(currentLocale, { minimumFractionDigits: 1, maximumFractionDigits: 2 });


    // --- NAVIGATION FUNCTIONS (Unchanged) ---
    function switchScreen(activeId) {
        document.querySelectorAll('.app-screen').forEach(screen => {
            screen.classList.remove('active-screen');
            screen.style.display = 'none';
        });
        const activeScreen = getEl(activeId);
        if(activeScreen) {
            activeScreen.classList.add('active-screen');
            activeScreen.style.display = 'block';
        }
    }

    window.resetAppInvestment = function() {
        switchScreen('selection-screen');
        getEl('project-type-title').textContent = '';
        getEl('generateReportBtn').style.display = 'none';
        formsContainer.innerHTML = '';
        getEl('obra-nueva-results-container').style.display = 'block';
        getEl('restauracion-results').style.display = 'none';
        if (analysisForm) analysisForm.reset(); 
        if (currencySelector) currencySelector.value = 'USD';
        updateCurrency('USD');
    }

    function renderForm(type) {
        currentProjectType = type;
        const definition = projectDefinitions[type];
        if (!definition) return;
        
        projectTypeTitle.textContent = definition.title;
        let html = '';
        definition.inputDefinitions.forEach(section => {
            html += `<div class="card mb-4"><div class="card-header"><h5>${section.sectionTitle}</h5></div><div class="card-body">`;
            section.fields.forEach(field => {
                const inputType = field.type || 'number'; 
                html += `<div class="form-group">
                           <label for="${field.id}">${field.label}</label>
                           <input type="${inputType}" class="form-control" id="${field.id}" placeholder="${field.placeholder}" aria-describedby="${field.id}Help" required min="0" step="any">
                           <small id="${field.id}Help" class="form-text text-muted">${field.description}</small>
                         </div>`;
            });
            html += `</div></div>`;
        });
        formsContainer.innerHTML = html;
        switchScreen('analysis-screen');
        
        if (type === 'obra-nueva') {
            getEl('obra-nueva-results-container').style.display = 'block';
            getEl('restauracion-results').style.display = 'none';
            getEl('sensitivity-analysis-container-on').style.display = 'block';
            getEl('sensitivity-analysis-container-restauracion').style.display = 'none';
        } else {
            getEl('obra-nueva-results-container').style.display = 'none';
            getEl('restauracion-results').style.display = 'block';
            getEl('sensitivity-analysis-container-on').style.display = 'none';
            getEl('sensitivity-analysis-container-restauracion').style.display = 'block';
        }
        
        if (analysisForm) analysisForm.reset(); 
    }

    document.querySelectorAll('.btn-project-type').forEach(button => {
        button.addEventListener('click', (e) => {
            renderForm(e.currentTarget.dataset.type);
        });
    });
    
    // --- FINANCIAL AND ECOMETRIC CALCULATION LOGIC ---
    
    function collectInputs() {
        const inputs = {};
        const definition = projectDefinitions[currentProjectType];
        definition.inputDefinitions.forEach(section => {
            section.fields.forEach(field => {
                inputs[field.id] = getValue(field.id);
            });
        });
        return inputs;
    }

    // New Construction Calculation (Unchanged - purely financial)
    const calculateObraNueva = (inputs) => {
        // Constants
        const GROSS_AREA_PER_CAR_SPACE = 28;
        const GROSS_AREA_PER_BIKE_SPACE = 1.5;

        // Conversion to decimals
        const softCostsPercent = inputs.softCostsPercent / 100;
        const marketingCostsPercent = inputs.marketingCostsPercent / 100;
        const taxRatePercent = inputs.taxRatePercent / 100;
        const loanToValuePercent = inputs.loanToValuePercent / 100;
        const lotCoverage = inputs.maxLotCoverage / 100;

        // 1. Urban Calculations
        const maxBuildableArea = inputs.landArea * inputs.floorAreaRatio;
        const maxFootprint = inputs.landArea * lotCoverage;
        let theoreticalFloors = maxFootprint > 0 ? maxBuildableArea / maxFootprint : 0;
        if (inputs.maxBuildingHeight > 0 && theoreticalFloors > inputs.maxBuildingHeight) {
            theoreticalFloors = inputs.maxBuildingHeight;
        }
        const numberOfUnits = inputs.avgUnitSize > 0 ? Math.floor(maxBuildableArea / inputs.avgUnitSize) : 0;
        
        const residentialSpaces = numberOfUnits * inputs.parkingPerUnit;
        const visitorSpaces = residentialSpaces * (inputs.visitorParkingPercent / 100);
        const totalCarSpaces = Math.ceil(residentialSpaces + visitorSpaces);
        const totalBikeSpaces = Math.ceil(numberOfUnits * inputs.bikeParkingPerUnit);
        const totalParkingArea = (totalCarSpaces * GROSS_AREA_PER_CAR_SPACE) + (totalBikeSpaces * GROSS_AREA_PER_BIKE_SPACE);
        
        const netSellableArea = maxBuildableArea - totalParkingArea; 

        // 2. Financial Calculations
        const totalConstructionCost = maxBuildableArea * inputs.buildCost;
        const softCosts = totalConstructionCost * softCostsPercent;
        
        const grossSalesRevenue = netSellableArea * inputs.sellPrice;
        const marketingCosts = grossSalesRevenue * marketingCostsPercent;

        const totalInvestment = inputs.landCost + totalConstructionCost + softCosts + marketingCosts;
        
        const grossProfit = grossSalesRevenue - totalInvestment;
        const taxes = grossProfit > 0 ? grossProfit * taxRatePercent : 0;
        const netProfit = grossProfit - taxes;

        const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
        const equity = totalInvestment * (1 - loanToValuePercent);
        const cashOnCashReturn = equity > 0 ? (netProfit / equity) * 100 : 0;

        return { 
            // Urban
            maxBuildableArea, numberOfUnits, totalParkingArea, maxFootprint, theoreticalFloors, totalCarSpaces, totalBikeSpaces, netSellableArea,
            // Financials
            totalConstructionCost, softCosts, marketingCosts, totalInvestment, grossSalesRevenue, grossProfit, taxes, netProfit, roi, cashOnCashReturn 
        };
    };

    // Restoration Calculation (Ecometrics removed)
    const calculateRestauracion = (inputs) => {
        // Conversion to decimals
        const softCostsPercent = inputs.softCostsPercent / 100;
        const capRate = inputs.capRate / 100;
        const discountRate = inputs.discountRate / 100;
        
        // 1. Financial Calculations
        const softCosts = inputs.rehabilitationCost * softCostsPercent;
        const totalInvestment = inputs.acquisitionCost + inputs.rehabilitationCost + softCosts;
        
        // Residual Value / Terminal Value
        const residualValue = capRate > 0 ? inputs.annualRevenue / capRate : inputs.sellPriceAfter; 
        
        // Net Present Value (NPV) Calculation
        let van = -totalInvestment;
        const rate = discountRate;
        for (let i = 1; i <= inputs.yearsOfOperation; i++) {
            let cashFlow = inputs.annualRevenue;
            if (i === inputs.yearsOfOperation) {
                cashFlow += residualValue; // Add residual value in the final year
            }
            van += cashFlow / Math.pow(1 + rate, i);
        }
        
        // Simple Profit
        const totalProfitSimple = (inputs.annualRevenue * inputs.yearsOfOperation) + residualValue - totalInvestment;

        // Ecometric results are removed from the return object
        return { 
            totalInvestment, van, residualValue, totalProfitSimple 
        };
    };


    // --- MAIN ANALYSIS EXECUTION (Unchanged) ---
    function runAnalysis() {
        if (currencySelector) updateCurrency(currencySelector.value);
        
        const form = document.querySelector('#analysis-screen form');
        
        if (form && form.checkValidity()) {
             const inputs = collectInputs();

            if (currentProjectType === 'obra-nueva') {
                const results = calculateObraNueva(inputs);
                
                const variations = [-0.10, 0, 0.10]; 
                finalSensitivity.sellPrice = variations.map(v => calculateObraNueva({ ...inputs, sellPrice: inputs.sellPrice * (1 + v) }).netProfit);
                finalSensitivity.buildCost = variations.map(v => calculateObraNueva({ ...inputs, buildCost: inputs.buildCost * (1 + v) }).netProfit);
                
                finalResults = results;
                updateResultsObraNueva(results);
                updateSensitivityTable(finalSensitivity);

            } else if (currentProjectType === 'restauracion') {
                const results = calculateRestauracion(inputs);
                
                const variationsRehab = [-0.10, 0, 0.10]; 
                const variationsRate = [-0.02, 0, 0.02]; 
                
                finalSensitivity.rehabCost = variationsRehab.map(v => calculateRestauracion({ ...inputs, rehabilitationCost: inputs.rehabilitationCost * (1 + v) }).van);
                finalSensitivity.discountRate = variationsRate.map(v => calculateRestauracion({ ...inputs, discountRate: inputs.discountRate + (v * 100) }).van); 

                finalResults = results;
                updateResultsRestauracion(results);
                updateSensitivityRestauracion(finalSensitivity);
            }
            
            getEl('generateReportBtn').style.display = 'block';
        } else {
            alert('Please fill in all required fields.');
        }
    }


    // --- DISPLAY RESULTS IN SIDEBAR ---

    // Updates sidebar for New Construction (Unchanged)
    function updateResultsObraNueva(results) {
        getEl('obra-nueva-results-container').style.display = 'block';
        getEl('restauracion-results').style.display = 'none';

        getEl('resBuildableArea').textContent = `${formatNumber(results.maxBuildableArea)} m²`;
        getEl('resFootprint').textContent = `${formatNumber(results.maxFootprint)} m²`;
        getEl('resFloors').textContent = results.theoreticalFloors.toFixed(1);
        getEl('resTotalUnits').textContent = formatNumber(results.numberOfUnits);
        getEl('resCarSpaces').textContent = formatNumber(results.totalCarSpaces);
        getEl('resBikeSpaces').textContent = formatNumber(results.totalBikeSpaces);
        getEl('resParkingArea').textContent = `${formatNumber(results.totalParkingArea)} m²`;
        
        getEl('resConstructionCost').textContent = formatCurrency(results.totalConstructionCost);
        getEl('resOtherCosts').textContent = formatCurrency(results.softCosts + results.marketingCosts); 
        getEl('resTotalInvestment').textContent = formatCurrency(results.totalInvestment);
        getEl('resSalesRevenue').textContent = formatCurrency(results.grossSalesRevenue);
        getEl('resGrossProfit').textContent = formatCurrency(results.grossProfit);
        getEl('resTaxes').textContent = formatCurrency(results.taxes);
        getEl('resNetProfit').textContent = formatCurrency(results.netProfit);
        getEl('resROI').textContent = `${results.roi.toFixed(2)} %`;
        getEl('resCoC').textContent = `${results.cashOnCashReturn.toFixed(2)} %`;
    }

    // Updates sidebar for Restoration (Ecometrics removed)
    function updateResultsRestauracion(results) {
        getEl('obra-nueva-results-container').style.display = 'none';
        getEl('restauracion-results').style.display = 'block';

        const vanStatus = results.van >= 0 ? '<span class="text-success"><i class="fas fa-check-circle"></i> Profitable</span>' : '<span class="text-danger"><i class="fas fa-times-circle"></i> Risk</span>';

        getEl('restauracion-results').innerHTML = `
            <h4 class="mb-3">💰 Financial Viability (DCF)</h4>
            <ul class="list-group mb-4">
                <li class="list-group-item d-flex justify-content-between">Total Projected Investment: <strong>${formatCurrency(results.totalInvestment)}</strong></li>
                <li class="list-group-item d-flex justify-content-between text-success"><strong>Net Present Value (NPV):</strong> <strong>${formatCurrency(results.van)}</strong> ${vanStatus}</li>
                <li class="list-group-item d-flex justify-content-between">Residual (Terminal) Value: <strong>${formatCurrency(results.residualValue)}</strong></li>
                <li class="list-group-item d-flex justify-content-between text-primary">Projected Simple Profit: <strong>${formatCurrency(results.totalProfitSimple)}</strong></li>
            </ul>
        `;
    }
    
    // Updates sensitivity table for New Construction (Unchanged)
    function updateSensitivityTable(results) {
        getEl('sensitivity-analysis-container-on').style.display = 'block';
        getEl('sensitivity-analysis-container-restauracion').style.display = 'none';
        
        const currency = (val) => val.toLocaleString(currentLocale, { style: 'currency', currency: currentCurrency, minimumFractionDigits: 0 });

        getEl('sensSellPriceLow').textContent = currency(results.sellPrice[0]);
        getEl('sensSellPriceBase').textContent = currency(results.sellPrice[1]);
        getEl('sensSellPriceHigh').textContent = currency(results.sellPrice[2]);

        getEl('sensBuildCostLow').textContent = currency(results.buildCost[0]);
        getEl('sensBuildCostBase').textContent = currency(results.buildCost[1]);
        getEl('sensBuildCostHigh').textContent = currency(results.buildCost[2]);
    }
    
    // Updates sensitivity table for Restoration (Unchanged)
    function updateSensitivityRestauracion(results) {
        getEl('sensitivity-analysis-container-on').style.display = 'none';
        getEl('sensitivity-analysis-container-restauracion').style.display = 'block';

        const tableHTML = `
            <h4 class="mb-3">Sensitivity Analysis (NPV) - Values in ${currentCurrency}</h4>
            <table class="table table-bordered text-center table-sm">
                <thead>
                    <tr><th>Variable</th><th>-10% (NPV)</th><th>Base (NPV)</th><th>+10% (NPV)</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Rehabilitation Cost</td>
                        <td>${formatCurrency(results.rehabCost[0])}</td>
                        <td>${formatCurrency(results.rehabCost[1])}</td>
                        <td>${formatCurrency(results.rehabCost[2])}</td>
                    </tr>
                </tbody>
            </table>
             <table class="table table-bordered text-center table-sm mt-3">
                <thead>
                    <tr><th>Variable</th><th>-${formatPercent(2)}% (NPV)</th><th>Base (NPV)</th><th>+${formatPercent(2)}% (NPV)</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Discount Rate (WACC)</td>
                        <td>${formatCurrency(results.discountRate[0])}</td>
                        <td>${formatCurrency(results.discountRate[1])}</td>
                        <td>${formatCurrency(results.discountRate[2])}</td>
                    </tr>
                </tbody>
            </table>
            <small class="text-muted">The table shows the resulting NPV when varying the Rehabilitation Cost (±10%) or the Discount Rate (±2%).</small>
        `;
        getEl('sensitivity-analysis-container-restauracion').innerHTML = tableHTML;
    }

    // Helper to generate detailed expense descriptions (Ecometrics removed)
    function getExpenseDescriptions(type) {
        const definitions = projectDefinitions[type].inputDefinitions;
        let html = '';
        definitions.forEach(section => {
            // Only show relevant financial/cost sections
            if (section.sectionTitle.includes('Costs') || section.sectionTitle.includes('Investment') || section.sectionTitle.includes('Financing') || section.sectionTitle.includes('DCF')) {
                 html += `<h5>${section.sectionTitle}</h5>`;
                 html += '<ul class="list-unstyled mb-4">';
                 section.fields.filter(f => 
                    f.label.includes('Cost') || 
                    f.label.includes('Price') || 
                    f.label.includes('Tax') || 
                    f.label.includes('Financing') || 
                    f.label.includes('Revenue') || 
                    f.label.includes('Rate') || 
                    f.label.includes('Value') ||
                    f.label.includes('Horizon') // Keep Years of Projection for DCF context
                 ).forEach(field => {
                     html += `<li><strong>${field.label}:</strong> ${field.description}</li>`;
                 });
                 html += '</ul>';
            }
        });
        return html;
    }


    // --- COMPREHENSIVE REPORT GENERATION (Ecometrics removed) ---
    function generateComprehensiveReport() {
        const inputs = collectInputs();
        const results = finalResults;
        const sensitivity = finalSensitivity;
        const reportTitle = projectDefinitions[currentProjectType].title;
        let reportContent = '';
        const today = new Date().toLocaleDateString(currentLocale);

        // Helper function to generate list of inputs
        const generateInputList = (type) => {
            const definition = projectDefinitions[type];
            let list = '<ul class="list-unstyled">';
            list += `<li><strong>-- Currency: ${currentCurrency} --</strong></li>`;
            definition.inputDefinitions.forEach(section => {
                list += `<li><strong>-- ${section.sectionTitle} --</strong></li>`;
                section.fields.forEach(field => {
                    // Check if value is a percentage and format accordingly
                    const isPercent = field.label.includes('(%)');
                    const value = isPercent ? `${formatPercent(inputs[field.id])} %` : formatNumber(inputs[field.id]);
                    list += `<li>${field.label}: <strong>${value}</strong></li>`;
                });
            });
            list += '</ul>';
            return list;
        };

        // --- Structure for NEW CONSTRUCTION ---
        if (currentProjectType === 'obra-nueva') {
            const vanStatusText = results.netProfit >= 0 ? 'The project yields a positive Net Profit. It is recommended to proceed.' : 'The Net Profit is negative. Re-evaluate costs or increase sale price.';

            reportContent = `
                <div class="row">
                    <div class="col-12 text-center mb-4"><h1 class="text-primary">VIABILITY REPORT: ${reportTitle.toUpperCase()}</h1><p class="lead">Analysis Date: ${today}</p></div>
                    
                    <div class="col-md-6 mb-4">
                        <div class="card p-3 h-100 bg-light">
                            <h4>I. INPUT PARAMETERS (URBAN & FINANCIAL)</h4>
                            ${generateInputList('obra-nueva')}
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-4">
                        <div class="card p-3 h-100 bg-light">
                            <h4>II. VIABILITY SUMMARY</h4>
                            <p class="lead text-success"><strong>PROJECTED NET PROFIT: ${formatCurrency(results.netProfit)}</strong></p>
                            <p class="lead text-primary"><strong>RETURN ON INVESTMENT (ROI): ${results.roi.toFixed(2)} %</strong></p>
                            <hr>
                            <h5>Cost Distribution (Values in ${currentCurrency})</h5>
                            <ul class="list-unstyled">
                                <li><strong>Total Investment:</strong> ${formatCurrency(results.totalInvestment)}</li>
                                <li>Land Cost: ${formatCurrency(inputs.landCost)}</li>
                                <li>Construction Cost: ${formatCurrency(results.totalConstructionCost)}</li>
                                <li>Soft & Mkt Costs: ${formatCurrency(results.softCosts + results.marketingCosts)}</li>
                            </ul>
                             <p class="small mt-3">${vanStatusText}</p>
                        </div>
                    </div>
                    
                    <div class="col-md-12 mb-4">
                        <div class="card p-4">
                            <h4>III. DETAILED URBAN ANALYSIS</h4>
                            <p>The project maximizes the lot's potential with a buildable area of <strong>${formatNumber(results.maxBuildableArea)} m²</strong>, allowing for the development of <strong>${formatNumber(results.numberOfUnits)} residential units</strong>.</p>
                            <p>The design incorporates a parking infrastructure of <strong>${formatNumber(results.totalCarSpaces)} car spaces</strong> and <strong>${formatNumber(results.totalBikeSpaces)} bicycle spaces</strong>, occupying <strong>${formatNumber(results.totalParkingArea)} m²</strong>.</p>
                        </div>
                    </div>

                    <div class="col-md-12 mb-4">
                        <div class="card p-4 bg-warning-light">
                            <h4>IV. RISK ANALYSIS (SENSITIVITY) - Net Profit in ${currentCurrency}</h4>
                            <p>The key metric (Net Profit) remains positive even with significant variations in critical market variables:</p>
                            <table class="table table-bordered text-center table-sm">
                                <thead><tr><th>Variable</th><th>-10% (Net Profit)</th><th>Base</th><th>+10% (Net Profit)</th></tr></thead>
                                <tbody>
                                    <tr><td>Sale Price</td><td>${formatCurrency(sensitivity.sellPrice[0])}</td><td>${formatCurrency(sensitivity.sellPrice[1])}</td><td>${formatCurrency(sensitivity.sellPrice[2])}</td></tr>
                                    <tr><td>Construction Cost</td><td>${formatCurrency(sensitivity.buildCost[0])}</td><td>${formatCurrency(sensitivity.buildCost[1])}</td><td>${formatCurrency(sensitivity.buildCost[2])}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="col-md-12 mb-4">
                        <div class="card p-4">
                            <h4>V. DETAILED EXPENSE DEFINITIONS</h4>
                            ${getExpenseDescriptions('obra-nueva')}
                        </div>
                    </div>
                </div>
            `;
        } 
        
        // --- Structure for RESTORATION (Updated) ---
        else if (currentProjectType === 'restauracion') {
             const vanStatusText = results.van >= 0 ? 'The project yields value above the discount rate. It is recommended to proceed.' : 'The Net Present Value is negative. Re-evaluate rehabilitation costs or increase residual value.';

            reportContent = `
                <div class="row">
                    <div class="col-12 text-center mb-4"><h1 class="text-primary">INVESTMENT VIABILITY REPORT: ${reportTitle.toUpperCase()}</h1><p class="lead">Analysis Date: ${today}</p></div>
                    
                    <div class="col-md-6 mb-4">
                        <div class="card p-3 h-100 bg-light">
                            <h4>I. KEY INPUT PARAMETERS</h4>
                            ${generateInputList('restauracion')}
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-4">
                        <div class="card p-3 h-100 bg-info text-white">
                            <h4>II. NET PRESENT VALUE (NPV) SUMMARY</h4>
                            <p class="lead"><strong>TOTAL INVESTMENT: ${formatCurrency(results.totalInvestment)}</strong></p>
                            <p class="display-4"><strong>NPV: ${formatCurrency(results.van)}</strong></p>
                            <p><strong>Status:</strong> ${vanStatusText}</p>
                            <p class="small">Residual (Terminal) Value: ${formatCurrency(results.residualValue)}</p>
                            <hr style="border-color: rgba(255,255,255,.5);">
                            <p class="small">All financial values are calculated using a Discount Rate (WACC) of ${inputs.discountRate}% and are reported in ${currentCurrency}.</p>
                            <p class="small">Projected Simple Profit: ${formatCurrency(results.totalProfitSimple)}</p>
                        </div>
                    </div>
                    
                    <div class="col-md-12 mb-4">
                        <div class="card p-4 bg-warning-light">
                            <h4>III. RISK ANALYSIS (NPV SENSITIVITY) - NPV in ${currentCurrency}</h4>
                            <p>The table shows the variation of the NPV against the two main sources of risk in a rehabilitation: cost overruns and changes in the discount rate (WACC):</p>
                             <table class="table table-bordered text-center table-sm">
                                <thead><tr><th>Variable</th><th>-10% (NPV)</th><th>Base (NPV)</th><th>+10% (NPV)</th></tr></thead>
                                <tbody><tr><td>Rehabilitation Cost</td><td>${formatCurrency(sensitivity.rehabCost[0])}</td><td>${formatCurrency(sensitivity.rehabCost[1])}</td><td>${formatCurrency(sensitivity.rehabCost[2])}</td></tr></tbody>
                            </table>
                            <table class="table table-bordered text-center table-sm mt-3">
                                <thead><tr><th>Variable</th><th>-${formatPercent(2)}% (NPV)</th><th>Base (NPV)</th><th>+${formatPercent(2)}% (NPV)</th></tr></thead>
                                <tbody><tr><td>Discount Rate (WACC)</td><td>${formatCurrency(sensitivity.discountRate[0])}</td><td>${formatCurrency(sensitivity.discountRate[1])}</td><td>${formatCurrency(sensitivity.discountRate[2])}</td></tr></tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="col-md-12 mb-4">
                        <div class="card p-4">
                            <h4>IV. DETAILED EXPENSE DEFINITIONS (DCF)</h4>
                            ${getExpenseDescriptions('restauracion')}
                        </div>
                    </div>
                </div>
            `;
        }


        // Show the modal
        getEl('reportOutputContent').innerHTML = reportContent;
        $('#completeReportModal').modal('show');
    }

    // --- REPORT PRINTING FUNCTIONALITY (Unchanged) ---
    window.printReportInvestment = function() {
        const reportContent = getEl('reportOutputContent').innerHTML;
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Investment Report</title>');
        printWindow.document.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"><link rel="stylesheet" href="style.css">');
        printWindow.document.write('<style>@media print {.btn, .modal-footer {display: none;}}</style>');
        printWindow.document.write('</head><body><div class="container py-5">' + reportContent + '</div></body></html>');
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    }


    // --- FINAL EVENT LISTENERS (Unchanged) ---
    if (currencySelector) {
        currencySelector.addEventListener('change', (e) => {
            updateCurrency(e.target.value);
            if (getEl('analysis-screen').classList.contains('active-screen')) {
                const form = document.querySelector('#analysis-screen form');
                if (form && form.checkValidity()) {
                    runAnalysis();
                }
            }
        });
    }

    if(analysisForm) {
        analysisForm.addEventListener('submit', function(e) {
            e.preventDefault();
            runAnalysis();
        });
    }

    if(generateReportBtn) generateReportBtn.addEventListener('click', generateComprehensiveReport);

    // Initial load: show the selection screen
    switchScreen('selection-screen');

});