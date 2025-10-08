document.addEventListener('DOMContentLoaded', function () {
    const getEl = id => document.getElementById(id);

    const propertyTypeSelector = getEl('propertyType');
    const dynamicFieldsContainer = getEl('dynamicFields');
    const valuationForm = getEl('urban-evaluator-app');

    const propertyFields = {
        Apartment: `
            <div class="form-group"><label for="area">Área Bruta Privada (m²)</label><input type="number" class="form-control" id="area" placeholder="ej: 120"></div>
            <div class="form-group"><label for="bedrooms">Nº de Habitaciones</label><input type="number" class="form-control" id="bedrooms" placeholder="ej: 3"></div>
            <div class="form-group"><label for="floor">Planta</label><input type="number" class="form-control" id="floor" placeholder="ej: 2"></div>
            <div class="form-group"><label for="marketValue">Valor de Mercado/m² en la zona (€)</label><input type="number" class="form-control" id="marketValue" placeholder="ej: 2500"></div>
        `,
        House: `
            <div class="form-group"><label for="area">Área Bruta de Construcción (m²)</label><input type="number" class="form-control" id="area" placeholder="ej: 250"></div>
            <div class="form-group"><label for="landArea">Área de Terreno (m²)</label><input type="number" class="form-control" id="landArea" placeholder="ej: 500"></div>
            <div class="form-group"><label for="marketValue">Valor de Mercado/m² en la zona (€)</label><input type="number" class="form-control" id="marketValue" placeholder="ej: 2200"></div>
        `,
        Land: `
            <div class="form-group"><label for="area">Área Total del Terreno (m²)</label><input type="number" class="form-control" id="area" placeholder="ej: 5000"></div>
            <div class="form-group"><label for="far">Índice de Edificabilidad (m²/m²)</label><input type="number" class="form-control" id="far" placeholder="ej: 0.8"></div>
            <div class="form-group"><label for="marketValue">Valor de Repercusión del Suelo/m² edificable (€)</label><input type="number" class="form-control" id="marketValue" placeholder="ej: 800"></div>
        `
    };

    propertyTypeSelector.addEventListener('change', () => {
        const selectedType = propertyTypeSelector.value;
        dynamicFieldsContainer.innerHTML = propertyFields[selectedType] || '';
    });

    valuationForm.addEventListener('submit', () => {
        generateReport();
    });

    function generateReport() {
        const applicantName = getEl('applicantName').value || 'No especificado';
        const evaluatorName = getEl('evaluatorName').value || 'EcoMetric Evaluator';
        const propertyType = propertyTypeSelector.value;
        const today = new Date().toLocaleDateString('es-ES');

        const getValue = id => parseFloat(getEl(id)?.value) || 0;
        let valuation = 0;
        let detailsHTML = '';
        let swotHTML = '';

        switch (propertyType) {
            case 'Apartment':
                const areaApt = getValue('area');
                const marketValueApt = getValue('marketValue');
                valuation = areaApt * marketValueApt;
                detailsHTML = `<li><strong>Área Bruta Privada:</strong> ${areaApt} m²</li><li><strong>Nº Habitaciones:</strong> ${getValue('bedrooms')}</li>`;
                swotHTML = `
                    <p><strong>Fortalezas:</strong> Demanda estable en centros urbanos.</p>
                    <p><strong>Debilidades:</strong> Gastos de comunidad, normativas de propiedad horizontal.</p>
                    <p><strong>Oportunidades:</strong> Potencial para alquiler a corto o largo plazo.</p>
                    <p><strong>Amenazas:</strong> Fluctuaciones del mercado inmobiliario, aumento de tipos de interés.</p>`;
                break;
            case 'House':
                const areaHouse = getValue('area');
                const marketValueHouse = getValue('marketValue');
                valuation = areaHouse * marketValueHouse;
                detailsHTML = `<li><strong>Área Bruta Construcción:</strong> ${areaHouse} m²</li><li><strong>Área Terreno:</strong> ${getValue('landArea')} m²</li>`;
                 swotHTML = `
                    <p><strong>Fortalezas:</strong> Mayor privacidad y espacio, potencial de ampliación.</p>
                    <p><strong>Debilidades:</strong> Mayores costes de mantenimiento que un apartamento.</p>
                    <p><strong>Oportunidades:</strong> Valorización por mejoras en el jardín o eficiencia energética.</p>
                    <p><strong>Amenazas:</strong> Impuestos sobre la propiedad más elevados, desarrollo urbano cercano.</p>`;
                break;
            case 'Land':
                const areaLand = getValue('area');
                const far = getValue('far');
                const marketValueLand = getValue('marketValue');
                const buildableArea = areaLand * far;
                valuation = buildableArea * marketValueLand;
                detailsHTML = `<li><strong>Área Total:</strong> ${areaLand} m²</li><li><strong>Área Edificable Potencial:</strong> ${buildableArea.toFixed(2)} m²</li>`;
                swotHTML = `
                    <p><strong>Fortalezas:</strong> Flexibilidad para desarrollar un proyecto a medida.</p>
                    <p><strong>Debilidades:</strong> Requiere una inversión inicial elevada para la construcción, incertidumbre normativa.</p>
                    <p><strong>Oportunidades:</strong> Desarrollo de proyectos con alta demanda (residencial, comercial).</p>
                    <p><strong>Amenazas:</strong> Cambios en la planificación urbana, retrasos en la obtención de licencias.</p>`;
                break;
        }

        const reportHTML = `
            <div class="report-header text-center mb-4"><h2>Informe de Tasación Comercial</h2><p><strong>Fecha de Emisión:</strong> ${today}</p></div>
            <div class="card p-4 mb-4"><h4>1. Datos Generales</h4><p><strong>Solicitante:</strong> ${applicantName}</p><p><strong>Tasador:</strong> ${evaluatorName}</p><p><strong>Tipo de Activo:</strong> ${propertyType}</p></div>
            <div class="card p-4 mb-4"><h4>2. Detalles y Valoración</h4><ul>${detailsHTML}</ul><hr><div class="text-center"><h4>Valor de Mercado Estimado</h4><h2 class="text-success">${valuation.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</h2></div></div>
            <div class="card p-4"><h4>3. Análisis SWOT Preliminar</h4>${swotHTML}</div>
        `;

        getEl('reportOutput').innerHTML = reportHTML;
        $('#reportModal').modal('show');
    }
});

function printReport() {
    const reportContent = document.getElementById('reportOutput').innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write('<html><head><title>Informe de Tasación</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"><link rel="stylesheet" href="style.css">');
    printWindow.document.write('</head><body><div class="container py-4">' + reportContent + '</div></body></html>');
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
}