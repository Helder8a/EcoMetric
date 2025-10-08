// He renombrado 'app_build_evaluador.js' a este nombre para estandarizar
document.addEventListener("DOMContentLoaded", function () {
    const getEl = id => document.getElementById(id);

    const evaluationForm = getEl("evaluationForm");
    const totalScoreEl = getEl("totalScore");
    const maxScoreEl = getEl("maxScore");
    const certNameEl = getEl("certName");
    const progressBarEl = getEl("progressBar");
    const levelTextEl = getEl("levelText");
    const projectNameEl = getEl("projectName");
    const reportGeneratorBtn = getEl("reportGeneratorBtn");

    let evaluationData = {};
    let currentCertification = "lidera";
    let lccaChartInstance = null;
    
    function initializeEvaluation() { /* ...código sin cambios... */ }
    function updateScoreDisplay() { /* ...código sin cambios... */ }
    function calculateScore() { /* ...código sin cambios... */ }
    function renderForm() { /* ...código sin cambios... */ }
    function showInfoModal(aspect, area) { /* ...código sin cambios... */ }
    function showSolutionsModal(aspect, area) { /* ...código sin cambios... */ }

    if(reportGeneratorBtn) {
        reportGeneratorBtn.addEventListener("click", () => {
            const projectName = projectNameEl.value.trim() || "un proyecto sin nombre";
            const score = parseFloat(totalScoreEl.textContent);
            const level = levelTextEl.textContent;
            
            let reportText = `MEMORIA DESCRIPTIVA DE SOSTENIBILIDAD\n`;
            reportText += `PROYECTO: ${projectName.toUpperCase()}\n\n`;
            
            reportText += `== RESUMEN EJECUTIVO ==\n`;
            reportText += `El proyecto ha alcanzado una puntuación de ${score.toFixed(1)} sobre 20.0 puntos en el sistema LiderA, obteniendo una Clase de Sostenibilidad "${level}".\n\n`;

            reportText += `== ESTRATEGIAS ADOPTADAS ==\n`;
            reportText += `A continuación se describen las estrategias de sostenibilidad adoptadas para ${projectName}, basadas en los criterios del sistema de evaluación LiderA.\n\n`;

            const checkedBoxes = document.querySelectorAll('#evaluationForm input[type="checkbox"]:checked');

            if (checkedBoxes.length === 0) {
                reportText += "No se han seleccionado criterios de sostenibilidad en la evaluación.";
            } else {
                const processedAspects = new Set();
                checkedBoxes.forEach(checkbox => {
                    const { aspect, area } = checkbox.dataset;
                    if (!processedAspects.has(aspect)) {
                        reportText += `\n--- ÁREA DE PONDERACIÓN: ${aspect.toUpperCase()} ---\n\n`;
                        processedAspects.add(aspect);
                    }
                    const info = certificationsDB[currentCertification]?.data[aspect]?.[area]?.info;
                    if (info && info.descriptive_report) {
                        reportText += `>> CRITERIO: ${area.toUpperCase()}\n`;
                        reportText += `${info.descriptive_report}\n\n`;
                    }
                });
            }

            getEl("report-output").value = reportText;
            $("#reportModal").modal("show");
        });
    }

    const copyReportBtn = getEl("copyReportBtn");
    if(copyReportBtn) { /* ...código sin cambios... */ }

    function calculateLCCA(material, quantity, discountRate) { /* ...código sin cambios... */ }
    function updateLccaDisplay(material, quantity, discountRate) { /* ...código sin cambios... */ }
    function launchLccaCalculator(lccaId) { /* ...código sin cambios... */ }

    evaluationForm.addEventListener("change", e => { /* ...código sin cambios... */ });
    evaluationForm.addEventListener("click", e => { /* ...código sin cambios... */ });

    const solutionsModalBody = document.querySelector("#solutionsModal .modal-body");
    if(solutionsModalBody){ /* ...código sin cambios... */ }

    renderForm();
});