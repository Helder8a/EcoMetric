document.addEventListener('DOMContentLoaded', () => {

    const inputDefinitions = [
        {
            sectionTitle: 'Land & Zoning Data',
            fields: [
                { id: 'landArea', label: 'Total Land Area (m²)', placeholder: 'e.g., 10000', description: 'The total surface area of the property lot.' },
                { id: 'floorAreaRatio', label: 'Floor Area Ratio (m²/m²)', placeholder: 'e.g., 2.5', description: 'Ratio of a building\'s total floor area to the size of the land. Determines the maximum buildable area.' },
                { id: 'maxLotCoverage', label: 'Max Lot Coverage (%)', placeholder: 'e.g., 60', description: 'The maximum percentage of the land that can be covered by the building\'s footprint.' },
                { id: 'maxBuildingHeight', label: 'Max Height (Number of floors)', placeholder: 'e.g., 5', description: 'The maximum number of floors allowed by local regulations.' }
            ]
        },
        {
            sectionTitle: 'Parking & Unit Data',
            fields: [
                { id: 'avgUnitSize', label: 'Average Residential Unit Size (m²)', placeholder: 'e.g., 90', description: 'The average gross area of a single apartment or housing unit to be built.' },
                { id: 'parkingPerUnit', label: 'Parking Spaces per Unit', placeholder: 'e.g., 1.5', description: 'Number of parking spaces required for each residential unit.' },
                { id: 'visitorParkingPercent', label: 'Visitor Parking (%)', placeholder: 'e.g., 10', description: 'Additional parking for visitors, as a percentage of residential spaces.' },
                { id: 'bikeParkingPerUnit', label: 'Bicycle Spaces per Unit', placeholder: 'e.g., 2', description: 'Number of secure bicycle parking spaces required for each unit.' }
            ]
        },
        {
            sectionTitle: 'Financial Data',
            fields: [
                { id: 'buildCost', label: 'Construction Cost ($/m²)', placeholder: 'e.g., 950', description: 'The estimated cost to build one square meter (includes parking areas).' },
                { id: 'landCost', label: 'Total Land Cost ($)', placeholder: 'e.g., 500000', description: 'The total acquisition price of the land.' },
                { id: 'sellPrice', label: 'Estimated Sale Price ($/m²)', placeholder: 'e.g., 2100', description: 'The projected price for one square meter of sellable residential area.' }
            ]
        },
        {
            sectionTitle: 'Advanced Costs & Financing',
            fields: [
                { id: 'softCostsPercent', label: 'Soft Costs (licenses, fees, etc.) (%)', placeholder: 'e.g., 15', description: 'Percentage of construction cost for non-construction expenses like permits, design fees, etc.' },
                { id: 'marketingCostsPercent', label: 'Marketing & Sales Costs (%)', placeholder: 'e.g., 5', description: 'Percentage of sales revenue for marketing and commission expenses.' },
                { id: 'taxRatePercent', label: 'Tax Rate on Profit (%)', placeholder: 'e.g., 25', description: 'The corporate tax rate applied to the gross profit.' },
                { id: 'loanToValuePercent', label: 'Financing / Loan-to-Value (%)', placeholder: 'e.g., 70', description: 'The percentage of the total investment that will be financed by a loan.' }
            ]
        }
    ];

    const formsContainer = document.getElementById('input-forms-container');

    const generateForms = () => {
        let html = '';
        inputDefinitions.forEach(section => {
            html += `<div class="card mb-4"><div class="card-header"><h5>${section.sectionTitle}</h5></div><div class="card-body">`;
            section.fields.forEach(field => {
                html += `<div class="form-group">
                           <label for="${field.id}">${field.label}</label>
                           <input type="number" class="form-control" id="${field.id}" placeholder="${field.placeholder}" aria-describedby="${field.id}Help">
                           <small id="${field.id}Help" class="form-text text-muted">${field.description}</small>
                         </div>`;
            });
            html += `</div></div>`;
        });
        if (formsContainer) {
            formsContainer.innerHTML = html;
        }
    };
    
    // --- Main Calculation Function ---
    const calculateFinancials = (inputs) => {
        const { maxBuildableArea, totalParkingArea, landCost, buildCostPerArea, sellPricePerArea, softCostsPercent, marketingCostsPercent, taxRatePercent, loanToValuePercent } = inputs;
        
        const totalConstructionCost = maxBuildableArea * buildCostPerArea;
        const softCosts = totalConstructionCost * softCostsPercent;
        
        const netSellableArea = maxBuildableArea - totalParkingArea;
        const grossSalesRevenue = netSellableArea * sellPricePerArea;
        const marketingCosts = grossSalesRevenue * marketingCostsPercent;

        const otherCosts = softCosts + marketingCosts;
        const totalInvestment = landCost + totalConstructionCost + otherCosts;
        
        const grossProfit = grossSalesRevenue - totalInvestment;
        const taxes = grossProfit > 0 ? grossProfit * taxRatePercent : 0;
        const netProfit = grossProfit - taxes;

        const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
        
        const loanAmount = totalInvestment * loanToValuePercent;
        const equity = totalInvestment - loanAmount;
        const cashOnCashReturn = equity > 0 ? (netProfit / equity) * 100 : 0;

        return { totalConstructionCost, otherCosts, totalInvestment, grossSalesRevenue, grossProfit, taxes, netProfit, roi, cashOnCashReturn };
    };

    const runAnalysis = () => {
        const getValue = (id) => parseFloat(document.getElementById(id).value) || 0;
        
        // --- Get all input values ---
        const baseInputs = {
            landArea: getValue('landArea'),
            far: getValue('floorAreaRatio'),
            lotCoverage: getValue('maxLotCoverage') / 100,
            maxHeight: getValue('maxBuildingHeight'),
            avgUnitSize: getValue('avgUnitSize'),
            parkingPerUnit: getValue('parkingPerUnit'),
            visitorParkingPercent: getValue('visitorParkingPercent') / 100,
            bikeParkingPerUnit: getValue('bikeParkingPerUnit'),
            buildCost: getValue('buildCost'),
            landCost: getValue('landCost'),
            sellPrice: getValue('sellPrice'),
            softCostsPercent: getValue('softCostsPercent') / 100,
            marketingCostsPercent: getValue('marketingCostsPercent') / 100,
            taxRatePercent: getValue('taxRatePercent') / 100,
            loanToValuePercent: getValue('loanToValuePercent') / 100
        };

        // --- Constants ---
        const GROSS_AREA_PER_CAR_SPACE = 28;
        const GROSS_AREA_PER_BIKE_SPACE = 1.5;

        // --- Urban Calculations ---
        const maxBuildableArea = baseInputs.landArea * baseInputs.far;
        const maxFootprint = baseInputs.landArea * baseInputs.lotCoverage;
        let theoreticalFloors = maxFootprint > 0 ? maxBuildableArea / maxFootprint : 0;
        if (baseInputs.maxHeight > 0 && theoreticalFloors > baseInputs.maxHeight) {
            theoreticalFloors = baseInputs.maxHeight;
        }
        const numberOfUnits = baseInputs.avgUnitSize > 0 ? Math.floor(maxBuildableArea / baseInputs.avgUnitSize) : 0;
        
        const residentialSpaces = numberOfUnits * baseInputs.parkingPerUnit;
        const visitorSpaces = residentialSpaces * baseInputs.visitorParkingPercent;
        const totalCarSpaces = Math.ceil(residentialSpaces + visitorSpaces);
        const totalBikeSpaces = Math.ceil(numberOfUnits * baseInputs.bikeParkingPerUnit);
        const totalParkingArea = (totalCarSpaces * GROSS_AREA_PER_CAR_SPACE) + (totalBikeSpaces * GROSS_AREA_PER_BIKE_SPACE);

        // --- Base Financial Calculation ---
        const finInputs = { maxBuildableArea, totalParkingArea, landCost: baseInputs.landCost, buildCostPerArea: baseInputs.buildCost, sellPricePerArea: baseInputs.sellPrice, ...baseInputs };
        const baseFinancials = calculateFinancials(finInputs);

        updateResults({
            maxBuildableArea, maxFootprint, theoreticalFloors, numberOfUnits,
            totalCarSpaces, totalBikeSpaces, totalParkingArea,
            ...baseFinancials
        });

        // --- Sensitivity Analysis ---
        const sensitivityResults = {};
        const variations = [-0.10, 0, 0.10]; // -10%, Base, +10%

        // Vary Sell Price
        sensitivityResults.sellPrice = variations.map(v => {
            const variedFinInputs = { ...finInputs, sellPricePerArea: baseInputs.sellPrice * (1 + v) };
            return calculateFinancials(variedFinInputs).netProfit;
        });

        // Vary Build Cost
        sensitivityResults.buildCost = variations.map(v => {
            const variedFinInputs = { ...finInputs, buildCostPerArea: baseInputs.buildCost * (1 + v) };
            return calculateFinancials(variedFinInputs).netProfit;
        });
        
        updateSensitivityTable(sensitivityResults);
    };

    const updateResults = (results) => {
        const currency = (val) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
        const number = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        
        document.getElementById('resBuildableArea').textContent = `${number(results.maxBuildableArea)} m²`;
        document.getElementById('resFootprint').textContent = `${number(results.maxFootprint)} m²`;
        document.getElementById('resFloors').textContent = results.theoreticalFloors.toFixed(1);
        document.getElementById('resTotalUnits').textContent = number(results.numberOfUnits);
        document.getElementById('resCarSpaces').textContent = number(results.totalCarSpaces);
        document.getElementById('resBikeSpaces').textContent = number(results.totalBikeSpaces);
        document.getElementById('resParkingArea').textContent = `${number(results.totalParkingArea)} m²`;
        document.getElementById('resConstructionCost').textContent = currency(results.totalConstructionCost);
        document.getElementById('resOtherCosts').textContent = currency(results.otherCosts);
        document.getElementById('resTotalInvestment').textContent = currency(results.totalInvestment);
        document.getElementById('resSalesRevenue').textContent = currency(results.grossSalesRevenue);
        document.getElementById('resGrossProfit').textContent = currency(results.grossProfit);
        document.getElementById('resTaxes').textContent = currency(results.taxes);
        document.getElementById('resNetProfit').textContent = currency(results.netProfit);
        document.getElementById('resROI').textContent = `${results.roi.toFixed(2)} %`;
        document.getElementById('resCoC').textContent = `${results.cashOnCashReturn.toFixed(2)} %`;
    };

    const updateSensitivityTable = (results) => {
        const currency = (val) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

        document.getElementById('sensSellPriceLow').textContent = currency(results.sellPrice[0]);
        document.getElementById('sensSellPriceBase').textContent = currency(results.sellPrice[1]);
        document.getElementById('sensSellPriceHigh').textContent = currency(results.sellPrice[2]);

        document.getElementById('sensBuildCostLow').textContent = currency(results.buildCost[0]);
        document.getElementById('sensBuildCostBase').textContent = currency(results.buildCost[1]);
        document.getElementById('sensBuildCostHigh').textContent = currency(results.buildCost[2]);
    };

    generateForms();
    document.getElementById('analyzeBtn')?.addEventListener('click', runAnalysis);
});