document.addEventListener('DOMContentLoaded', () => {

    const inputDefinitions = [
        {
            sectionTitle: 'Land Data',
            fields: [{ id: 'landArea', label: 'Total Land Area (m²)', placeholder: 'e.g., 10000' }]
        },
        {
            sectionTitle: 'Urban Planning Regulations',
            fields: [
                { id: 'floorAreaRatio', label: 'Floor Area Ratio (m²/m²)', placeholder: 'e.g., 2.5' },
                { id: 'maxLotCoverage', label: 'Max Lot Coverage (%)', placeholder: 'e.g., 60' },
                { id: 'maxBuildingHeight', label: 'Max Height (Number of floors)', placeholder: 'e.g., 5' }
            ]
        },
        {
            sectionTitle: 'Financial Data',
            fields: [
                { id: 'buildCost', label: 'Construction Cost ($/m²)', placeholder: 'e.g., 950' },
                { id: 'landCost', label: 'Total Land Cost ($)', placeholder: 'e.g., 500000' },
                { id: 'sellPrice', label: 'Estimated Sale Price ($/m²)', placeholder: 'e.g., 2100' }
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
                           <input type="number" class="form-control" id="${field.id}" placeholder="${field.placeholder}">
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
        
        const landArea = getValue('landArea');
        const far = getValue('floorAreaRatio');
        const lotCoverage = getValue('maxLotCoverage') / 100;
        const maxHeight = getValue('maxBuildingHeight');
        const buildCostPerArea = getValue('buildCost');
        const landCost = getValue('landCost');
        const sellPricePerArea = getValue('sellPrice');

        const maxBuildableArea = landArea * far;
        const maxFootprint = landArea * lotCoverage;
        let theoreticalFloors = maxFootprint > 0 ? maxBuildableArea / maxFootprint : 0;
        if (maxHeight > 0 && theoreticalFloors > maxHeight) {
            theoreticalFloors = maxHeight;
        }

        const totalConstructionCost = maxBuildableArea * buildCostPerArea;
        const totalInvestment = landCost + totalConstructionCost;
        const totalSalesRevenue = maxBuildableArea * sellPricePerArea;
        const grossProfit = totalSalesRevenue - totalInvestment;
        const margin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;
        const roi = totalInvestment > 0 ? (grossProfit / totalInvestment) * 100 : 0;

        updateResults({
            maxBuildableArea, maxFootprint, theoreticalFloors,
            totalConstructionCost, totalInvestment, totalSalesRevenue,
            grossProfit, margin, roi
        });
    };

    const updateResults = (results) => {
        const currencyFormat = { style: 'currency', currency: 'USD', minimumFractionDigits: 0 };
        
        document.getElementById('resBuildableArea').textContent = `${results.maxBuildableArea.toLocaleString('en-US')} m²`;
        document.getElementById('resFootprint').textContent = `${results.maxFootprint.toLocaleString('en-US')} m²`;
        document.getElementById('resFloors').textContent = results.theoreticalFloors.toFixed(1);
        
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