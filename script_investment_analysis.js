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

    const runAnalysis = () => {
        const getValue = (id) => parseFloat(document.getElementById(id).value) || 0;
        
        // --- Get all input values ---
        const landArea = getValue('landArea');
        const far = getValue('floorAreaRatio');
        const lotCoverage = getValue('maxLotCoverage') / 100;
        const maxHeight = getValue('maxBuildingHeight');
        
        const avgUnitSize = getValue('avgUnitSize');
        const parkingPerUnit = getValue('parkingPerUnit');
        const visitorParkingPercent = getValue('visitorParkingPercent') / 100;
        const bikeParkingPerUnit = getValue('bikeParkingPerUnit');

        const buildCostPerArea = getValue('buildCost');
        const landCost = getValue('landCost');
        const sellPricePerArea = getValue('sellPrice');

        // --- Constants ---
        const GROSS_AREA_PER_CAR_SPACE = 28; // Includes circulation (m²)
        const GROSS_AREA_PER_BIKE_SPACE = 1.5; // (m²)

        // --- Calculations ---
        const maxBuildableArea = landArea * far;
        const maxFootprint = landArea * lotCoverage;
        let theoreticalFloors = maxFootprint > 0 ? maxBuildableArea / maxFootprint : 0;
        if (maxHeight > 0 && theoreticalFloors > maxHeight) {
            theoreticalFloors = maxHeight;
        }

        const numberOfUnits = avgUnitSize > 0 ? Math.floor(maxBuildableArea / avgUnitSize) : 0;

        // Parking calculations
        const residentialSpaces = numberOfUnits * parkingPerUnit;
        const visitorSpaces = residentialSpaces * visitorParkingPercent;
        const totalCarSpaces = Math.ceil(residentialSpaces + visitorSpaces);
        const totalBikeSpaces = Math.ceil(numberOfUnits * bikeParkingPerUnit);

        const totalParkingArea = (totalCarSpaces * GROSS_AREA_PER_CAR_SPACE) + (totalBikeSpaces * GROSS_AREA_PER_BIKE_SPACE);

        // Financial calculations
        const totalConstructionCost = maxBuildableArea * buildCostPerArea;
        const totalInvestment = landCost + totalConstructionCost;
        
        // Revenue is calculated on NET sellable area (buildable area minus parking area)
        const netSellableArea = maxBuildableArea - totalParkingArea;
        const totalSalesRevenue = netSellableArea * sellPricePerArea;
        
        const grossProfit = totalSalesRevenue - totalInvestment;
        const margin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;
        const roi = totalInvestment > 0 ? (grossProfit / totalInvestment) * 100 : 0;

        updateResults({
            maxBuildableArea, maxFootprint, theoreticalFloors, numberOfUnits,
            totalCarSpaces, totalBikeSpaces, totalParkingArea,
            totalConstructionCost, totalInvestment, totalSalesRevenue,
            grossProfit, margin, roi
        });
    };

    const updateResults = (results) => {
        const currencyFormat = { style: 'currency', currency: 'USD', minimumFractionDigits: 0 };
        const numberFormat = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
        
        document.getElementById('resBuildableArea').textContent = `${results.maxBuildableArea.toLocaleString('en-US', numberFormat)} m²`;
        document.getElementById('resFootprint').textContent = `${results.maxFootprint.toLocaleString('en-US', numberFormat)} m²`;
        document.getElementById('resFloors').textContent = results.theoreticalFloors.toFixed(1);
        document.getElementById('resTotalUnits').textContent = results.numberOfUnits.toLocaleString('en-US', numberFormat);

        document.getElementById('resCarSpaces').textContent = results.totalCarSpaces.toLocaleString('en-US', numberFormat);
        document.getElementById('resBikeSpaces').textContent = results.totalBikeSpaces.toLocaleString('en-US', numberFormat);
        document.getElementById('resParkingArea').textContent = `${results.totalParkingArea.toLocaleString('en-US', numberFormat)} m²`;
        
        document.getElementById('resConstructionCost').textContent = results.totalConstructionCost.toLocaleString('en-US', currencyFormat);
        document.getElementById('resTotalInvestment').textContent = results.totalInvestment.toLocaleString('en-US', currencyFormat);
        document.getElementById('resSalesRevenue').textContent = results.totalSalesRevenue.toLocaleString('en-US', currencyFormat);
        document.getElementById('resGrossProfit').textContent = results.grossProfit.toLocaleString('en-US', currencyFormat);
        document.getElementById('resMargin').textContent = `${results.margin.toFixed(2)} %`;
        document.getElementById('resROI').textContent = `${results.roi.toFixed(2)} %`;
    };

    generateForms();
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', runAnalysis);
    }
});