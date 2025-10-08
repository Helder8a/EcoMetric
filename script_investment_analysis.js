document.addEventListener('DOMContentLoaded', () => {

    const inputDefinitions = [
        {
            sectionTitle: 'Datos del Terreno',
            fields: [{ id: 'landArea', label: 'Área Total del Terreno (m²)', placeholder: 'ej: 10000' }]
        },
        {
            sectionTitle: 'Normativa Urbanística',
            fields: [
                { id: 'floorAreaRatio', label: 'Índice de Edificabilidad (m²/m²)', placeholder: 'ej: 2.5' },
                { id: 'maxLotCoverage', label: 'Ocupación Máxima de Parcela (%)', placeholder: 'ej: 60' },
                { id: 'maxBuildingHeight', label: 'Altura Máxima (Nº de plantas)', placeholder: 'ej: 5' }
            ]
        },
        {
            sectionTitle: 'Datos Financieros',
            fields: [
                { id: 'buildCost', label: 'Coste de Construcción (€/m²)', placeholder: 'ej: 950' },
                { id: 'landCost', label: 'Coste Total del Terreno (€)', placeholder: 'ej: 500000' },
                { id: 'sellPrice', label: 'Precio de Venta Estimado (€/m²)', placeholder: 'ej: 2100' }
            ]
        }
    ];

    const formsContainer = document.getElementById('input-forms-container');

    const generateForms = () => { /* ...código sin cambios... */ };

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
        const currencyFormat = { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 };
        
        document.getElementById('resBuildableArea').textContent = `${results.maxBuildableArea.toLocaleString('es-ES')} m²`;
        document.getElementById('resFootprint').textContent = `${results.maxFootprint.toLocaleString('es-ES')} m²`;
        document.getElementById('resFloors').textContent = results.theoreticalFloors.toFixed(1);
        
        document.getElementById('resConstructionCost').textContent = results.totalConstructionCost.toLocaleString('es-ES', currencyFormat);
        document.getElementById('resTotalInvestment').textContent = results.totalInvestment.toLocaleString('es-ES', currencyFormat);
        document.getElementById('resSalesRevenue').textContent = results.totalSalesRevenue.toLocaleString('es-ES', currencyFormat);
        document.getElementById('resGrossProfit').textContent = results.grossProfit.toLocaleString('es-ES', currencyFormat);
        document.getElementById('resMargin').textContent = `${results.margin.toFixed(2)} %`;
        document.getElementById('resROI').textContent = `${results.roi.toFixed(2)} %`;
    };

    generateForms();
    document.getElementById('analyzeBtn').addEventListener('click', runAnalysis);
});