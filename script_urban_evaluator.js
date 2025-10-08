document.addEventListener('DOMContentLoaded', function () {
    const getEl = id => document.getElementById(id);

    const propertyTypeSelector = getEl('propertyType');
    const dynamicFieldsContainer = getEl('dynamicFields');
    const valuationForm = getEl('urban-evaluator-app');

    const propertyFields = {
        Apartment: `
            <div class="form-group"><label for="area">Private Gross Area (m²)</label><input type="number" class="form-control" id="area" placeholder="e.g., 120"></div>
            <div class="form-group"><label for="bedrooms">Number of Bedrooms</label><input type="number" class="form-control" id="bedrooms" placeholder="e.g., 3"></div>
            <div class="form-group"><label for="floor">Floor Level</label><input type="number" class="form-control" id="floor" placeholder="e.g., 2"></div>
            <div class="form-group"><label for="marketValue">Market Value/m² in the area ($)</label><input type="number" class="form-control" id="marketValue" placeholder="e.g., 2500"></div>
        `,
        House: `
            <div class="form-group"><label for="area">Gross Construction Area (m²)</label><input type="number" class="form-control" id="area" placeholder="e.g., 250"></div>
            <div class="form-group"><label for="landArea">Land Area (m²)</label><input type="number" class="form-control" id="landArea" placeholder="e.g., 500"></div>
            <div class="form-group"><label for="marketValue">Market Value/m² in the area ($)</label><input type="number" class="form-control" id="marketValue" placeholder="e.g., 2200"></div>
        `,
        Land: `
            <div class="form-group"><label for="area">Total Land Area (m²)</label><input type="number" class="form-control" id="area" placeholder="e.g., 5000"></div>
            <div class="form-group"><label for="far">Floor Area Ratio (m²/m²)</label><input type="number" class="form-control" id="far" placeholder="e.g., 0.8"></div>
            <div class="form-group"><label for="marketValue">Land Value per buildable m² ($)</label><input type="number" class="form-control" id="marketValue" placeholder="e.g., 800"></div>
        `
    };

    if (propertyTypeSelector) {
        propertyTypeSelector.addEventListener('change', () => {
            const selectedType = propertyTypeSelector.value;
            if (dynamicFieldsContainer) {
                dynamicFieldsContainer.innerHTML = propertyFields[selectedType] || '';
            }
        });
    }

    if (valuationForm) {
        valuationForm.addEventListener('submit', generateReport);
    }

    function generateReport() {
        const applicantName = getEl('applicantName')?.value || 'Not specified';
        const evaluatorName = getEl('evaluatorName')?.value || 'EcoMetric Evaluator';
        const propertyType = propertyTypeSelector.value;
        const today = new Date().toLocaleDateString('en-US');

        const getValue = id => parseFloat(getEl(id)?.value) || 0;
        let valuation = 0;
        let detailsHTML = '';
        let swotHTML = '';

        switch (propertyType) {
            case 'Apartment':
                const areaApt = getValue('area');
                const marketValueApt = getValue('marketValue');
                valuation = areaApt * marketValueApt;
                detailsHTML = `<li><strong>Private Gross Area:</strong> ${areaApt} m²</li><li><strong>Number of Bedrooms:</strong> ${getValue('bedrooms')}</li>`;
                swotHTML = `
                    <p><strong>Strengths:</strong> Stable demand in urban centers.</p>
                    <p><strong>Weaknesses:</strong> Condo fees, horizontal property regulations.</p>
                    <p><strong>Opportunities:</strong> Potential for short or long-term rental.</p>
                    <p><strong>Threats:</strong> Real estate market fluctuations, rising interest rates.</p>`;
                break;
            case 'House':
                const areaHouse = getValue('area');
                const marketValueHouse = getValue('marketValue');
                valuation = areaHouse * marketValueHouse;
                detailsHTML = `<li><strong>Gross Construction Area:</strong> ${areaHouse} m²</li><li><strong>Land Area:</strong> ${getValue('landArea')} m²</li>`;
                 swotHTML = `
                    <p><strong>Strengths:</strong> Greater privacy and space, potential for expansion.</p>
                    <p><strong>Weaknesses:</strong> Higher maintenance costs than an apartment.</p>
                    <p><strong>Opportunities:</strong> Value increase from garden or energy efficiency improvements.</p>
                    <p><strong>Threats:</strong> Higher property taxes, nearby urban development.</p>`;
                break;
            case 'Land':
                const areaLand = getValue('area');
                const far = getValue('far');
                const marketValueLand = getValue('marketValue');
                const buildableArea = areaLand * far;
                valuation = buildableArea * marketValueLand;
                detailsHTML = `<li><strong>Total Area:</strong> ${areaLand} m²</li><li><strong>Potential Buildable Area:</strong> ${buildableArea.toFixed(2)} m²</li>`;
                swotHTML = `
                    <p><strong>Strengths:</strong> Flexibility to develop a custom project.</p>
                    <p><strong>Weaknesses:</strong> Requires high initial investment for construction, regulatory uncertainty.</p>
                    <p><strong>Opportunities:</strong> Development of high-demand projects (residential, commercial).</p>
                    <p><strong>Threats:</strong> Changes in urban planning, delays in obtaining licenses.</p>`;
                break;
        }

        const reportHTML = `
            <div class="report-header text-center mb-4"><h2>Commercial Appraisal Report</h2><p><strong>Issue Date:</strong> ${today}</p></div>
            <div class="card p-4 mb-4"><h4>1. General Information</h4><p><strong>Applicant:</strong> ${applicantName}</p><p><strong>Appraiser:</strong> ${evaluatorName}</p><p><strong>Asset Type:</strong> ${propertyType}</p></div>
            <div class="card p-4 mb-4"><h4>2. Details and Valuation</h4><ul>${detailsHTML}</ul><hr><div class="text-center"><h4>Estimated Market Value</h4><h2 class="text-success">${valuation.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h2></div></div>
            <div class="card p-4"><h4>3. Preliminary SWOT Analysis</h4>${swotHTML}</div>
        `;

        const reportOutput = getEl('reportOutput');
        if (reportOutput) {
            reportOutput.innerHTML = reportHTML;
        }
        $('#reportModal').modal('show');
    }
});

function printReport() {
    const reportContent = document.getElementById('reportOutput').innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write('<html><head><title>Appraisal Report</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"><link rel="stylesheet" href="style.css">');
    printWindow.document.write('</head><body><div class="container py-4">' + reportContent + '</div></body></html>');
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
}