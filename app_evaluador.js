document.addEventListener("DOMContentLoaded", function () {
    const getEl = id => document.getElementById(id);

    // --- Elementos DOM Principais ---
    const evaluationForm = getEl("evaluationForm");
    const totalScoreEl = getEl("totalScore");
    const maxScoreEl = getEl("maxScore");
    const scoreUnitEl = getEl("scoreUnit");
    const certNameEl = getEl("certName");
    const progressBarEl = getEl("progressBar");
    const levelTextEl = getEl("levelText");
    const projectNameEl = getEl("projectName");
    const memoriaGeneratorBtn = getEl("memoriaGeneratorBtn");

    let evaluationData = {};
    let currentCertification = "lidera";
    let lccaChartInstance = null;

    // --- Funções de Avaliação Principal ---

    function initializeEvaluation() {
        evaluationData = {};
        const certData = certificationsDB[currentCertification]?.data;
        if (!certData) {
            updateScoreDisplay();
            return;
        }
        for (let vertente in certData) {
            evaluationData[vertente] = {};
            for (let area in certData[vertente]) {
                evaluationData[vertente][area] = 0;
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
            const weights = certConfig.weights.edificio;
            let weightedSum = 0;
            let totalWeight = 0;
            for (const vertente in evaluationData) {
                const weight = weights[vertente] || 1;
                totalWeight += weight;
                let vertenteScore = 0;
                let maxVertenteScore = 0;
                for (const area in evaluationData[vertente]) {
                    vertenteScore += evaluationData[vertente][area];
                    if (certConfig.data[vertente] && certConfig.data[vertente][area] && certConfig.data[vertente][area].credits) {
                        maxVertenteScore += Object.values(certConfig.data[vertente][area].credits).reduce((sum, val) => sum + val, 0);
                    }
                }
                if (maxVertenteScore > 0) {
                    weightedSum += (vertenteScore / maxVertenteScore) * weight;
                }
            }
            totalScore = totalWeight > 0 ? (weightedSum / totalWeight) * certConfig.maxScore : 0;
        }
        return totalScore;
    }

    // --- Geração Dinâmica do Formulário ---

    function renderForm() {
        const certConfig = certificationsDB[currentCertification];
        evaluationForm.innerHTML = "";
        if (!certConfig || !certConfig.data) {
            evaluationForm.innerHTML = '<p class="text-muted">Este sistema de certificação ainda não tem critérios definidos na base de dados.</p>';
            initializeEvaluation();
            return;
        }

        Object.entries(certConfig.data).forEach(([vertente, areas], index) => {
            let areaHTML = "";
            Object.entries(areas).forEach(([area, details]) => {
                let creditsHTML = "";
                if (details.credits) {
                    Object.keys(details.credits).forEach(creditName => {
                        const creditId = `${currentCertification}-${vertente}-${area}-${creditName}`.replace(/[^a-zA-Z0-9]/g, "");
                        creditsHTML += `
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="${creditId}" data-vertente="${vertente}" data-area="${area}" data-credit="${creditName}">
                                <label class="custom-control-label" for="${creditId}">${creditName}</label>
                            </div>`;
                    });
                }
                const solutionsIcon = details.solucoes_pt ? `<i class="fas fa-cubes solutions-icon" data-vertente="${vertente}" data-area="${area}" title="Ver Soluções de Mercado"></i>` : "";
                areaHTML += `
                    <div class="mb-4">
                        <h5>
                            <span class="area-label">${area}
                                <span class="icon-group">
                                    <i class="fas fa-info-circle info-icon" data-vertente="${vertente}" data-area="${area}"></i>
                                    ${solutionsIcon}
                                </span>
                            </span>
                        </h5>
                        ${creditsHTML}
                    </div>`;
            });

            const vertenteHTML = `
                <div class="card mb-3">
                    <div class="card-header vertente-header" data-toggle="collapse" data-target="#vertente-${index}">
                        <h4 class="mb-0">${vertente}</h4>
                    </div>
                    <div id="vertente-${index}" class="collapse ${index === 0 ? "show" : ""}" data-parent="#evaluationForm">
                        <div class="card-body">
                            ${areaHTML.replace(/<div class="mb-4">/g, '<hr class="my-4"><div class="mb-4">').replace('<hr class="my-4">', '')}
                        </div>
                    </div>
                </div>`;
            evaluationForm.insertAdjacentHTML("beforeend", vertenteHTML);
        });
        initializeEvaluation();
    }

    // --- Lógica dos Modais ---

    function showInfoModal(vertente, area) {
        const info = certificationsDB[currentCertification]?.data[vertente]?.[area]?.info;
        if (info) {
            const modalTitle = document.querySelector("#infoModal .modal-title");
            if (modalTitle) modalTitle.textContent = `Critério: ${area}`;

            let normativaHTML = "";
            if (info.normativa_pt) {
                normativaHTML = `
                    <div class="normativa-section">
                        <h6>Normativa Aplicável em Portugal</h6>
                        <p><strong>${info.normativa_pt.nome}</strong><br>
                           <a href="${info.normativa_pt.link}" target="_blank" rel="noopener noreferrer">Consultar Documento Oficial <i class="fas fa-external-link-alt fa-xs"></i></a>
                        </p>
                    </div>`;
            }

            const modalBody = document.querySelector("#infoModal .modal-body");
            if (modalBody) {
                modalBody.innerHTML = `
                    <h6>Objetivo</h6><p>${info.objetivo}</p>
                    <h6>Exemplo de Aplicação</h6><p>${info.exemplo}</p>
                    <h6>Benefícios do Projeto</h6><p>${info.beneficios}</p>
                    ${normativaHTML}`;
                $("#infoModal").modal("show");
            }
        }
    }

    function showSolutionsModal(vertente, area) {
        const solutions = certificationsDB[currentCertification].data[vertente][area]?.solucoes_pt;
        if (!solutions) return;

        const modalTitle = document.querySelector("#solutionsModal .modal-title");
        if (modalTitle) modalTitle.textContent = `Soluções de Mercado para: ${area}`;

        const modalBody = document.querySelector("#solutionsModal .modal-body");
        if (modalBody) {
            const solutionsHTML = solutions.map(sol => {
                const lccaButton = (sol.lcca_id && typeof lccaDB !== 'undefined' && lccaDB[sol.lcca_id])
                    ? `<button class="btn btn-success btn-sm mt-2 launch-lcca-btn" data-lcca-id="${sol.lcca_id}">Analisar Custo de Ciclo de Vida</button>`
                    : "";
                return `
                    <div class="solution-card">
                        <h5>${sol.nome}</h5>
                        <p class="solution-manufacturer"><strong>Fabricante/Marca:</strong> ${sol.fabricante}</p>
                        <p><strong>Descrição:</strong> ${sol.descricao}</p>
                        <p><strong>Aplicação Típica:</strong> ${sol.aplicacao}</p>
                        <a href="${sol.link}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm">Visitar Website <i class="fas fa-external-link-alt"></i></a>
                        ${lccaButton}
                    </div>`;
            }).join("");
            modalBody.innerHTML = solutionsHTML;
            $("#solutionsModal").modal("show");
        }
    }

    memoriaGeneratorBtn.addEventListener("click", () => {
        const projectName = projectNameEl.value.trim() || "este projeto";
        let memoriaText = `MEMÓRIA DESCRITIVA DE SUSTENTABILIDADE\n`;
        memoriaText += `PROJETO: ${projectName.toUpperCase()}\n\n`;
        memoriaText += `A presente memória descreve as estratégias de sustentabilidade adotadas para ${projectName}, com base nos critérios do sistema de avaliação LiderA.\n\n`;

        const checkedBoxes = document.querySelectorAll('#evaluationForm input[type="checkbox"]:checked');

        if (checkedBoxes.length === 0) {
            memoriaText += "Nenhum critério de sustentabilidade foi selecionado na avaliação.";
        } else {
            const processedVertentes = new Set();
            const processedAreas = new Set();
            checkedBoxes.forEach(checkbox => {
                const { vertente, area } = checkbox.dataset;
                if (!processedVertentes.has(vertente)) {
                    memoriaText += `\n--- ${vertente.toUpperCase()} ---\n\n`;
                    processedVertentes.add(vertente);
                }
                if (!processedAreas.has(area)) {
                    const info = certificationsDB[currentCertification]?.data[vertente]?.[area]?.info;
                    if (info && info.memoria_descritiva) {
                        memoriaText += `>> CRITÉRIO: ${area.toUpperCase()}\n`;
                        memoriaText += `${info.memoria_descritiva}\n\n`;
                        processedAreas.add(area);
                    }
                }
            });
        }

        getEl("memoria-output").value = memoriaText;
        $("#memoriaModal").modal("show");
    });

    getEl("copyMemoriaBtn").addEventListener("click", () => {
        const memoriaOutput = getEl("memoria-output");
        memoriaOutput.select();
        memoriaOutput.setSelectionRange(0, 99999);
        document.execCommand("copy");
        alert("Texto copiado para a área de transferência!");
    });


    // --- Lógica da Calculadora LCCA (NOVO E CORRIGIDO) ---

    function calculateLCCA(material, quantity, discountRate) {
        const rate = discountRate / 100;
        const years = material.vida_util;
        let maintenanceCosts = 0;
        let replacementCosts = 0;
        let energySavings = 0;

        for (let i = 1; i <= years; i++) {
            // Manutenção
            maintenanceCosts += (material.custo_manutencao_anual * quantity) / Math.pow(1 + rate, i);
            // Substituição (assume-se no final da vida útil)
            if (i === years) {
                replacementCosts += (material.custo_inicial * material.custo_substituicao * quantity) / Math.pow(1 + rate, i);
            }
            // Poupança
            energySavings += (material.poupanca_energetica_anual * quantity) / Math.pow(1 + rate, i);
        }

        const initialCost = material.custo_inicial * quantity;
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
                labels: ['Custo Inicial', 'Manutenção', 'Substituição', 'Poupança'],
                datasets: [{
                    data: [results.initialCost, results.maintenanceCosts, results.replacementCosts, -results.energySavings],
                    backgroundColor: ['#0a3d62', '#ffc107', '#dc3545', '#28a745'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Distribuição de Custos para ${quantity} ${material.unidade}` }
                }
            }
        });
    }

    function launchLccaCalculator(lccaId) {
        const material = lccaDB[lccaId];
        if (!material) {
            alert("Erro: Dados do material não encontrados.");
            return;
        }

        getEl('lccaMaterialName').textContent = material.nome;
        getEl('lccaUnit').textContent = material.unidade;

        const quantityInput = getEl('lccaQuantity');
        const discountRateInput = getEl('lccaDiscountRate');

        // Remove event listeners antigos para evitar duplicação
        const newQuantityInput = quantityInput.cloneNode(true);
        quantityInput.parentNode.replaceChild(newQuantityInput, quantityInput);

        const newDiscountRateInput = discountRateInput.cloneNode(true);
        discountRateInput.parentNode.replaceChild(newDiscountRateInput, discountRateInput);

        const updateHandler = () => {
            const quantity = parseFloat(newQuantityInput.value) || 1;
            const discountRate = parseFloat(newDiscountRateInput.value) || 0;
            updateLccaDisplay(material, quantity, discountRate);
        };

        newQuantityInput.addEventListener('input', updateHandler);
        newDiscountRateInput.addEventListener('input', updateHandler);

        updateHandler(); // Chamar uma vez para o cálculo inicial
        $("#lccaModal").modal("show");
    }

    // --- Event Listeners ---

    evaluationForm.addEventListener("change", e => {
        if (e.target.matches('input[type="checkbox"]')) {
            const { vertente, area, credit } = e.target.dataset;
            const certConfig = certificationsDB[currentCertification];
            const creditValue = certConfig.data[vertente][area].credits[credit];
            evaluationData[vertente][area] += e.target.checked ? creditValue : -creditValue;
            updateScoreDisplay();
        }
    });

    evaluationForm.addEventListener("click", e => {
        const infoIcon = e.target.closest(".info-icon");
        if (infoIcon) {
            const { vertente, area } = infoIcon.dataset;
            showInfoModal(vertente, area);
        }
        const solutionsIcon = e.target.closest(".solutions-icon");
        if (solutionsIcon) {
            const { vertente, area } = solutionsIcon.dataset;
            showSolutionsModal(vertente, area);
        }
    });

    // Event Delegation para o botão da calculadora LCCA
    document.querySelector("#solutionsModal .modal-body").addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('launch-lcca-btn')) {
            const lccaId = e.target.dataset.lccaId;
            launchLccaCalculator(lccaId);
        }
    });

    // --- Inicialização ---
    renderForm();
});