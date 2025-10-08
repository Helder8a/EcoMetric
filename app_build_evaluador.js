document.addEventListener("DOMContentLoaded", function () {
    const getEl = id => document.getElementById(id);

    // --- Main DOM Elements ---
    const evaluationForm = getEl("evaluationForm");
    const totalScoreEl = getEl("totalScore");
    const maxScoreEl = getEl("maxScore");
    const scoreUnitEl = getEl("scoreUnit");
    const certNameEl = getEl("certName");
    const progressBarEl = getEl("progressBar");
    const levelTextEl = getEl("levelText");
    const projectNameEl = getEl("projectName");
    const reportGeneratorBtn = getEl("reportGeneratorBtn");

    let evaluationData = {};
    let currentCertification = "lidera";
    let lccaChartInstance = null;

    // --- Main Evaluation Functions ---

    function initializeEvaluation() {
        evaluationData = {};
        const certData = certificationsDB[currentCertification]?.data;
        if (!certData) {
            updateScoreDisplay();
            return;
        }
        for (let aspect in certData) {
            evaluationData[aspect] = {};
            for (let area in certData[aspect]) {
                evaluationData[aspect][area] = 0;
            }
        }
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        const certConfig = certificationsDB[currentCertification];
        if (!certConfig) {
            totalScoreEl.textContent = "0.0";
            maxScoreEl.textContent = "0.0";
            certNameEl.textContent = "N/A";
            levelTextEl.textContent = "N/A";
            progressBarEl.style.width = "0%";
            return;
        }

        const score = calculateScore();
        totalScoreEl.textContent = score.toFixed(1);
        maxScoreEl.textContent = certConfig.maxScore.toFixed(1);
        scoreUnitEl.textContent = certConfig.scoreUnit;
        certNameEl.textContent = certConfig.name;

        const progress = certConfig.maxScore > 0 ? (score / certConfig.maxScore) * 100 : 0;
        progressBarEl.style.width = `${progress}%`;

        let level = "N/A";
        if (certConfig.levels) {
            const sortedLevels = Object.entries(certConfig.levels).sort((a, b) => b[0] - a[0]);
            for (const [minScore, levelName] of sortedLevels) {
                if (score >= parseFloat(minScore)) {
                    level = levelName;
                    break;
                }
            }
        }
        levelTextEl.textContent = level;
    }

    function calculateScore() {
        const certConfig = certificationsDB[currentCertification];
        if (!certConfig) return 0;
        let totalScore = 0;
        if (certConfig.name === "LiderA" && certConfig.data) {
            // Using 'building' weights as default for now
            const weights = certConfig.weights.building; 
            let weightedSum = 0;
            let totalWeight = 0;
            for (const aspect in evaluationData) {
                const weight = weights[aspect] || 1;
                totalWeight += weight;
                let aspectScore = 0;
                let maxAspectScore = 0;
                for (const area in evaluationData[aspect]) {
                    aspectScore += evaluationData[aspect][area];
                    if (certConfig.data[aspect] && certConfig.data[aspect][area] && certConfig.data[aspect][area].credits) {
                        maxAspectScore += Object.values(certConfig.data[aspect][area].credits).reduce((sum, val) => sum + val, 0);
                    }
                }
                if (maxAspectScore > 0) {
                    weightedSum += (aspectScore / maxAspectScore) * weight;
                }
            }
            totalScore = totalWeight > 0 ? (weightedSum / totalWeight) * certConfig.maxScore : 0;
        }
        return totalScore;
    }

    // --- Dynamic Form Generation ---

    function renderForm() {
        const certConfig = certificationsDB[currentCertification];
        evaluationForm.innerHTML = "";
        if (!certConfig || !certConfig.data) {
            evaluationForm.innerHTML = '<p class="text-muted">This certification system does not have defined criteria in the database yet.</p>';
            initializeEvaluation();
            return;
        }

        Object.entries(certConfig.data).forEach(([aspect, areas], index) => {
            let areaHTML = "";
            Object.entries(areas).forEach(([area, details]) => {
                let creditsHTML = "";
                if (details.credits) {
                    Object.keys(details.credits).forEach(creditName => {
                        // Sanitize IDs for valid query selectors
                        const creditId = `${currentCertification}-${aspect}-${area}-${creditName}`.replace(/[^a-zA-Z0-9-_]/g, "");
                        creditsHTML += `
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="${creditId}" data-aspect="${aspect}" data-area="${area}" data-credit="${creditName}">
                                <label class="custom-control-label" for="${creditId}">${creditName}</label>
                            </div>`;
                    });
                }
                const solutionsIcon = details.solutions_pt ? `<i class="fas fa-cubes solutions-icon" data-aspect="${aspect}" data-area="${area}" title="View Market Solutions"></i>` : "";
                areaHTML += `
                    <div class="mb-4">
                        <h5>
                            <span class="area-label">${area}
                                <span class="icon-group">
                                    <i class="fas fa-info-circle info-icon" data-aspect="${aspect}" data-area="${area}" title="Criterion Information"></i>
                                    ${solutionsIcon}
                                </span>
                            </span>
                        </h5>
                        ${creditsHTML}
                    </div>`;
            });

            const aspectHTML = `
                <div class="card mb-3">
                    <div class="card-header aspect-header" id="header-${index}" data-toggle="collapse" data-target="#collapse-${index}">
                        <h4 class="mb-0">${aspect}</h4>
                    </div>
                    <div id="collapse-${index}" class="collapse ${index === 0 ? "show" : ""}" aria-labelledby="header-${index}" data-parent="#evaluationForm">
                        <div class="card-body">
                            ${areaHTML}
                        </div>
                    </div>
                </div>`;
            evaluationForm.insertAdjacentHTML("beforeend", aspectHTML);
        });
        initializeEvaluation();
    }

    // --- Modal Logic ---

    function showInfoModal(aspect, area) {
        const info = certificationsDB[currentCertification]?.data[aspect]?.[area]?.info;
        if (info) {
            const modalTitle = document.querySelector("#infoModal .modal-title");
            if (modalTitle) modalTitle.textContent = `Criterion: ${area}`;

            let regulationsHTML = "";
            if (info.normativa_pt) {
                regulationsHTML = `
                    <div class="regulations-section">
                        <h6>Applicable Regulations in Portugal</h6>
                        <p><strong>${info.normativa_pt.name}</strong><br>
                           <a href="${info.normativa_pt.link}" target="_blank" rel="noopener noreferrer">Consult Official Document <i class="fas fa-external-link-alt fa-xs"></i></a>
                        </p>
                    </div>`;
            }

            const modalBody = document.querySelector("#infoModal .modal-body");
            if (modalBody) {
                modalBody.innerHTML = `
                    <h6>Objective</h6><p>${info.objective}</p>
                    <h6>Application Example</h6><p>${info.example}</p>
                    <h6>Project Benefits</h6><p>${info.benefits}</p>
                    ${regulationsHTML}`;
                $("#infoModal").modal("show");
            }
        }
    }

    function showSolutionsModal(aspect, area) {
        const solutions = certificationsDB[currentCertification].data[aspect][area]?.solutions_pt;
        if (!solutions) return;

        const modalTitle = document.querySelector("#solutionsModal .modal-title");
        if (modalTitle) modalTitle.textContent = `Market Solutions for: ${area}`;

        const modalBody = document.querySelector("#solutionsModal .modal-body");
        if (modalBody) {
            const solutionsHTML = solutions.map(sol => {
                const lccaButton = (sol.lcca_id && typeof lccaDB !== 'undefined' && lccaDB[sol.lcca_id])
                    ? `<button class="btn btn-success btn-sm mt-2 launch-lcca-btn" data-lcca-id="${sol.lcca_id}">Analyze Life Cycle Cost</button>`
                    : "";
                return `
                    <div class="solution-card">
                        <h5>${sol.name}</h5>
                        <p class="solution-manufacturer"><strong>Manufacturer/Brand:</strong> ${sol.manufacturer}</p>
                        <p><strong>Description:</strong> ${sol.description}</p>
                        <p><strong>Typical Application:</strong> ${sol.application}</p>
                        <a href="${sol.link}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm">Visit Website <i class="fas fa-external-link-alt"></i></a>
                        ${lccaButton}
                    </div>`;
            }).join("");
            modalBody.innerHTML = solutionsHTML;
            $("#solutionsModal").modal("show");
        }
    }

    if(reportGeneratorBtn) {
        reportGeneratorBtn.addEventListener("click", () => {
            const projectName = projectNameEl.value.trim() || "this project";
            let reportText = `SUSTAINABILITY DESCRIPTIVE REPORT\n`;
            reportText += `PROJECT: ${projectName.toUpperCase()}\n\n`;
            reportText += `This report describes the sustainability strategies adopted for ${projectName}, based on the criteria of the LiderA evaluation system.\n\n`;

            const checkedBoxes = document.querySelectorAll('#evaluationForm input[type="checkbox"]:checked');

            if (checkedBoxes.length === 0) {
                reportText += "No sustainability criteria were selected in the evaluation.";
            } else {
                const processedAspects = new Set();
                const processedAreas = new Set();
                checkedBoxes.forEach(checkbox => {
                    const { aspect, area } = checkbox.dataset;
                    if (!processedAspects.has(aspect)) {
                        reportText += `\n--- ${aspect.toUpperCase()} ---\n\n`;
                        processedAspects.add(aspect);
                    }
                    if (!processedAreas.has(area)) {
                        const info = certificationsDB[currentCertification]?.data[aspect]?.[area]?.info;
                        if (info && info.descriptive_report) {
                            reportText += `>> CRITERION: ${area.toUpperCase()}\n`;
                            reportText += `${info.descriptive_report}\n\n`;
                            processedAreas.add(area);
                        }
                    }
                });
            }

            getEl("report-output").value = reportText;
            $("#reportModal").modal("show");
        });
    }

    const copyReportBtn = getEl("copyReportBtn");
    if(copyReportBtn) {
        copyReportBtn.addEventListener("click", () => {
            const reportOutput = getEl("report-output");
            reportOutput.select();
            reportOutput.setSelectionRange(0, 99999); // For mobile devices
            try {
                document.execCommand("copy");
                alert("Text copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy text: ", err);
            }
        });
    }

    // --- LCCA Calculator Logic ---
    function calculateLCCA(material, quantity, discountRate) {
        const rate = discountRate / 100;
        const years = material.useful_life;
        let maintenanceCosts = 0;
        let replacementCosts = 0;
        let energySavings = 0;

        for (let i = 1; i <= years; i++) {
            maintenanceCosts += (material.annual_maintenance_cost * quantity) / Math.pow(1 + rate, i);
            if (i % material.useful_life === 0 && i < years) { // Simplified replacement logic
                 replacementCosts += (material.initial_cost * material.replacement_cost_factor * quantity) / Math.pow(1 + rate, i);
            }
            energySavings += (material.annual_energy_saving * quantity) / Math.pow(1 + rate, i);
        }

        const initialCost = material.initial_cost * quantity;
        const totalCost = initialCost + maintenanceCosts + replacementCosts - energySavings;

        return { initialCost, maintenanceCosts, replacementCosts, energySavings, totalCost };
    }
    
    function updateLccaDisplay(material, quantity, discountRate) {
        const results = calculateLCCA(material, quantity, discountRate);
        const formatCurrency = val => `€ ${val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        getEl('lccaInitialCost').textContent = formatCurrency(results.initialCost);
        getEl('lccaMaintenanceCost').textContent = formatCurrency(results.maintenanceCosts);
        getEl('lccaReplacementCost').textContent = formatCurrency(results.replacementCosts);
        getEl('lccaSavings').textContent = formatCurrency(results.energySavings);
        getEl('lccaTotalCost').textContent = formatCurrency(results.totalCost);

        const ctx = getEl('lccaChart').getContext('2d');
        if (lccaChartInstance) {
            lccaChartInstance.destroy();
        }
        lccaChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Initial Cost', 'Maintenance', 'Replacement', 'Savings'],
                datasets: [{
                    data: [
                        Math.max(0, results.initialCost), 
                        Math.max(0, results.maintenanceCosts), 
                        Math.max(0, results.replacementCosts), 
                        Math.max(0, -results.energySavings)
                    ],
                    backgroundColor: ['#0a3d62', '#ffc107', '#dc3545', '#28a745'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Cost Distribution for ${quantity} ${material.unit}` }
                }
            }
        });
    }

    function launchLccaCalculator(lccaId) {
        const material = lccaDB[lccaId];
        if (!material) {
            alert("Error: Material data not found.");
            return;
        }

        getEl('lccaMaterialName').textContent = material.name;
        getEl('lccaUnit').textContent = material.unit;

        const quantityInput = getEl('lccaQuantity');
        const discountRateInput = getEl('lccaDiscountRate');
        
        const updateHandler = () => {
            const quantity = parseFloat(quantityInput.value) || 1;
            const discountRate = parseFloat(discountRateInput.value) || 0;
            updateLccaDisplay(material, quantity, discountRate);
        };
        
        // Remove old listeners before adding new ones, using a more robust method
        if (window.lccaUpdateHandler) {
            quantityInput.removeEventListener('input', window.lccaUpdateHandler);
            discountRateInput.removeEventListener('input', window.lccaUpdateHandler);
        }

        window.lccaUpdateHandler = updateHandler; // Store handler to remove it later
        
        quantityInput.addEventListener('input', window.lccaUpdateHandler);
        discountRateInput.addEventListener('input', window.lccaUpdateHandler);

        updateHandler(); // Initial calculation
        $("#lccaModal").modal("show");
    }

    // --- Event Listeners ---

    evaluationForm.addEventListener("change", e => {
        if (e.target.matches('input[type="checkbox"]')) {
            const { aspect, area, credit } = e.target.dataset;
            const certConfig = certificationsDB[currentCertification];
            const creditValue = certConfig.data[aspect][area].credits[credit];
            evaluationData[aspect][area] += e.target.checked ? creditValue : -creditValue;
            updateScoreDisplay();
        }
    });

    evaluationForm.addEventListener("click", e => {
        const infoIcon = e.target.closest(".info-icon");
        if (infoIcon) {
            const { aspect, area } = infoIcon.dataset;
            showInfoModal(aspect, area);
        }
        const solutionsIcon = e.target.closest(".solutions-icon");
        if (solutionsIcon) {
            const { aspect, area } = solutionsIcon.dataset;
            showSolutionsModal(aspect, area);
        }
    });

    // Event Delegation for the LCCA calculator button
    const solutionsModalBody = document.querySelector("#solutionsModal .modal-body");
    if(solutionsModalBody){
        solutionsModalBody.addEventListener('click', function (e) {
            const lccaBtn = e.target.closest('.launch-lcca-btn');
            if (lccaBtn) {
                const lccaId = lccaBtn.dataset.lccaId;
                launchLccaCalculator(lccaId);
            }
        });
    }

    // --- Initialization ---
    renderForm();
});