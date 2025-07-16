// Importa funções auxiliares para construir o formulário e formatar moeda.
// Assumimos que 'utils.js' existe e exporta estas funções.
import { buildFormFields, formatCurrency } from './utils.js';

// URL base da nossa API backend.
const API_BASE_URL = 'http://localhost:3080';

/**
 * @description Mantém todo o estado da aplicação em um único objeto para fácil gerenciamento.
 */
const state = {
    projectBlocks: [],      // Armazena os blocos adicionados pelo usuário.
    currentQuote: null,     // Armazena o último orçamento calculado retornado pela API.
    configData: null,       // Armazena os dados do config.json.
    catalogData: null,      // Armazena os dados do catalog.json.
    profileMapping: {},     // Mapeia qual perfil foi selecionado para cada tipo de peça.
};

/**
 * @description Mapeia os elementos da UI para fácil acesso no código.
 */
const ui = {
    vagasInput: document.getElementById('vagas'),
    estruturaSelect: document.getElementById('estrutura'),
    addBlockButton: document.getElementById('btnAdicionarBloco'),
    blockList: document.getElementById('listaBlocos'),
    totalVagasCard: document.getElementById('totalVagas'),
    custoPorVagaCard: document.getElementById('custoPorVaga'),
    precoPorM2Card: document.getElementById('precoPorM2'),
    totalFinalCard: document.getElementById('totalFinal'),
    summaryContainer: document.getElementById('resultadoResumo'),
    materialsContainer: document.getElementById('resultadoMateriais'),
    costsContainer: document.getElementById('resultadoCustos'),
    engineeringContainer: document.getElementById('resultadoEngenharia'),
    profileConfigContainer: document.getElementById('profile-config-body'),
    togglePanelButton: document.getElementById('btn-toggle-panel'),
    closePanelButton: document.getElementById('btn-close-panel'),
    recalculateButton: document.getElementById('btn-recalculate'),
    saveDefaultsButton: document.getElementById('btn-save-defaults'),
    simulationPanel: document.getElementById('simulation-panel'),
    panelFormContainer: document.getElementById('panel-form-container'),
    panelOverlay: document.getElementById('panel-overlay'),
};

/**
 * @description Lê os valores do formulário do painel de simulação e os formata como um objeto de 'overrides'.
 * @returns {object} Objeto com os parâmetros que o usuário modificou.
 */
function getOverridesFromPanel() {
    const overrides = {};
    const form = ui.panelFormContainer.querySelector('form');
    if (!form) return overrides;

    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) continue;

        const path = key.substring(0, key.lastIndexOf('.'));
        const keys = path.split('.');

        if (keys.length === 2) {
            const [category, parameter] = keys;
            if (!overrides[category]) overrides[category] = {};
            overrides[category][parameter] = { value: numericValue };
        } else if (keys.length === 3) {
            const [cat, subCat, param] = keys;
            if (!overrides[cat]) overrides[cat] = {};
            if (!overrides[cat][subCat]) overrides[cat][subCat] = {};
            overrides[cat][subCat][param] = { value: numericValue };
        }
    }
    return overrides;
}

/**
 * @description Alterna a visibilidade do painel de simulação e do overlay.
 */
function togglePanel() {
    ui.simulationPanel.classList.toggle('visible');
    ui.panelOverlay.classList.toggle('visible');
}

/**
 * @description Lida com o clique no botão de recalcular.
 */
async function handleRecalculate() {
    if (state.projectBlocks.length === 0) {
        alert('Adicione pelo menos um bloco ao projeto para simular.');
        return;
    }
    const overrides = getOverridesFromPanel();
    await calculateQuote(overrides);
    togglePanel();
}

/**
 * @description Lida com o clique no botão para salvar os parâmetros como padrão.
 */
async function handleSaveDefaults() {
    if (!confirm('Tem certeza que deseja salvar estes parâmetros como o novo padrão?')) return;
    
    const newConfigData = getOverridesFromPanel();
    const configToSave = JSON.parse(JSON.stringify(state.configData));

    // Atualiza o objeto de configuração com os novos valores do painel.
    for (const category in newConfigData) {
        for (const param in newConfigData[category]) {
            if (configToSave[category]?.[param]) {
                configToSave[category][param].value = newConfigData[category][param].value;
            } else if (typeof newConfigData[category][param] === 'object') { // Para estruturas aninhadas
                 if (!configToSave[category]) configToSave[category] = {};
                 if (!configToSave[category][param]) configToSave[category][param] = {};
                 for (const subParam in newConfigData[category][param]) {
                    if(configToSave[category]?.[param]?.[subParam]) {
                        configToSave[category][param][subParam].value = newConfigData[category][param][subParam].value;
                    }
                 }
            }
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/data/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configToSave)
        });
        if (!response.ok) throw new Error('Falha ao salvar configurações.');
        alert('Parâmetros salvos com sucesso!');
        state.configData = configToSave; // Atualiza o estado local
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}


/**
 * @description Busca todos os dados iniciais da API (config, blueprints, catalog).
 * Esta é a função chave para popular a UI na inicialização.
 */
async function populateInitialData() {
    try {
        const [configRes, blueprintsRes, catalogRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/data/config`),
            fetch(`${API_BASE_URL}/api/blueprints`),
            fetch(`${API_BASE_URL}/api/data/catalog`)
        ]);

        if (!configRes.ok) throw new Error('Falha ao carregar config.json');
        if (!blueprintsRes.ok) throw new Error('Falha ao carregar blueprints.json');
        if (!catalogRes.ok) throw new Error('Falha ao carregar catalog.json');

        state.configData = await configRes.json();
        const blueprints = await blueprintsRes.json();
        state.catalogData = await catalogRes.json();

        // ---- PONTO CRÍTICO: CONSTRUÇÃO DO PAINEL DE PARÂMETROS ----
        // Chama a função utilitária para transformar o JSON de configuração em campos de formulário HTML.
        const formHtml = buildFormFields(state.configData);
        // Insere o HTML gerado no container do painel.
        ui.panelFormContainer.innerHTML = `<form>${formHtml}</form>`;
        // ---------------------------------------------------------

        // Popula o <select> de modelos estruturais com os dados dos blueprints.
        ui.estruturaSelect.innerHTML = blueprints.map(bp => `<option value="${bp.id}">${bp.name}</option>`).join('');

    } catch (error) {
        console.error("Erro fatal na inicialização:", error);
        alert(`Erro na inicialização: ${error.message}`);
    }
}

/**
 * @description Envia os blocos do projeto para a API para obter um novo orçamento.
 * @param {object|null} overrides - Objeto com parâmetros modificados para simulação.
 */
async function calculateQuote(overrides = null) {
    if (state.projectBlocks.length === 0) {
        state.currentQuote = null;
        renderUI(); // Limpa a UI se não houver blocos
        return;
    }
    try {
        const requestBody = { 
            projectBlocks: state.projectBlocks,
            profileMapping: state.profileMapping
        };
        if (overrides && Object.keys(overrides).length > 0) {
            requestBody.overrides = overrides;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'O servidor retornou um erro no cálculo.');
        }
        state.currentQuote = await response.json();
        renderUI(); // Re-renderiza toda a UI com os novos dados do orçamento.
    } catch (error) {
        console.error("Erro ao calcular orçamento:", error);
        alert(`Erro no cálculo: ${error.message}`);
    }
}

/**
 * @description Lida com o clique no botão "Adicionar ao Orçamento".
 */
function handleAddBlock() {
    const vagas = parseInt(ui.vagasInput.value, 10);
    if (isNaN(vagas) || vagas <= 0) {
        alert("Por favor, insira um número de vagas válido.");
        return;
    }
    const estruturaId = ui.estruturaSelect.value;
    if (!estruturaId) {
        alert("Por favor, selecione um modelo estrutural.");
        return;
    }
    const estruturaName = ui.estruturaSelect.options[ui.estruturaSelect.selectedIndex].text;
    
    state.projectBlocks.push({ vagas, estrutura: estruturaId, name: estruturaName });
    calculateQuote(); // Calcula o orçamento com o novo bloco.
}

/**
 * @description Lida com cliques na lista de blocos, especificamente para remoção.
 */
function handleRemoveBlock(e) {
    const button = e.target.closest('.btn-remove-block');
    if (button) {
        const indexToRemove = parseInt(button.dataset.index, 10);
        state.projectBlocks.splice(indexToRemove, 1);
        calculateQuote(); // Recalcula após remover um bloco.
    }
}

/**
 * @description Lida com a mudança de seleção de um perfil metálico.
 */
function handleProfileChange(e) {
    const selectElement = e.target;
    const partId = selectElement.dataset.partid;
    const profileId = selectElement.value;
    if (profileId) {
        state.profileMapping[partId] = profileId;
    } else {
        delete state.profileMapping[partId];
    }
    calculateQuote(); // Recalcula com o novo perfil.
}


// --- Funções de Renderização (Render Functions) ---
// Cada função é responsável por atualizar uma parte específica da UI.

function renderUI() {
    renderProjectBlocks();
    renderSummaryCards();
    renderSummaryView();
    renderBillOfMaterials();
    renderCostAnalysis();
    renderEngineeringReport();
    renderProfileSelectors();
}

function renderProjectBlocks() {
    if (!ui.blockList) return;
    if (state.projectBlocks.length === 0) {
        ui.blockList.innerHTML = '<li class="list-group-item text-muted" id="placeholderLista">Nenhum bloco adicionado.</li>';
    } else {
        ui.blockList.innerHTML = state.projectBlocks.map((block, index) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><b>${block.vagas} vagas</b> - ${block.name}</span>
                <button class="btn btn-danger btn-sm btn-remove-block" data-index="${index}"><i class="bi bi-trash"></i></button>
            </li>
        `).join('');
    }
}

function renderSummaryCards() {
    const totalVagas = state.projectBlocks.reduce((acc, block) => acc + parseInt(block.vagas, 10), 0);
    ui.totalVagasCard.textContent = totalVagas;
    const quote = state.currentQuote;
    const config = state.configData;

    if (!quote || !quote.project_totals || !config) {
        ui.custoPorVagaCard.textContent = 'R$ 0,00';
        ui.precoPorM2Card.textContent = 'R$ 0,00';
        ui.totalFinalCard.textContent = 'R$ 0,00';
        return;
    }

    const totals = quote.project_totals;
    const custoPorVaga = totalVagas > 0 ? (totals.grand_total / totalVagas) : 0;
    ui.custoPorVagaCard.textContent = formatCurrency(custoPorVaga);

    const areaPorVaga = config.standard_dimensions.largura_vaga_padrao_m.value * config.standard_dimensions.profundidade_vaga_padrao_m.value;
    const areaTotal = totalVagas * areaPorVaga;
    const precoPorM2 = areaTotal > 0 ? (totals.grand_total / areaTotal) : 0;
    ui.precoPorM2Card.textContent = formatCurrency(precoPorM2);
    ui.totalFinalCard.textContent = formatCurrency(totals.grand_total);
}

function renderSummaryView() {
    const quote = state.currentQuote;
    if (!quote || !quote.cost_summary?.totais_agrupados) {
        ui.summaryContainer.innerHTML = '<p class="text-muted">Adicione blocos para ver o resumo.</p>';
        return;
    }
    const totals = quote.project_totals;
    const groupedCosts = quote.cost_summary.totais_agrupados;

    ui.summaryContainer.innerHTML = `
        <h5 class="mb-3">Composição do Preço Final</h5>
        <table class="table table-hover">
            <tbody>
                <tr><td>Custo Total de Materiais</td><td class="text-end">${formatCurrency(groupedCosts.total_materiais)}</td></tr>
                <tr><td>Custo Total de Serviços</td><td class="text-end">${formatCurrency(groupedCosts.total_servicos)}</td></tr>
                <tr class="table-light"><td><strong>Subtotal (Custo Direto)</strong></td><td class="text-end"><strong>${formatCurrency(totals.subtotal)}</strong></td></tr>
                <tr><td>BDI (${totals.bdi_percent}%)</td><td class="text-end">${formatCurrency(totals.bdi_value)}</td></tr>
                <tr class="table-light"><td><strong>Subtotal com BDI</strong></td><td class="text-end"><strong>${formatCurrency(totals.subtotal + totals.bdi_value)}</strong></td></tr>
                <tr><td>Impostos (${totals.tax_percent}%)</td><td class="text-end">${formatCurrency(totals.tax_value)}</td></tr>
                <tr class="table-success fs-5"><td><strong>Total Final do Projeto</strong></td><td class="text-end"><strong>${formatCurrency(totals.grand_total)}</strong></td></tr>
            </tbody>
        </table>`;
}

function renderBillOfMaterials() {
    const bom = state.currentQuote?.bill_of_materials;
    if (!bom || bom.length === 0) {
        ui.materialsContainer.innerHTML = '<p class="text-muted">Nenhum material para exibir.</p>';
        return;
    }
    const tableRows = bom.map(item => `
        <tr>
            <td>${item.name || 'Item desconhecido'}</td>
            <td class="text-end">${(item.qty || 0).toFixed(2)} ${item.unit || 'un'}</td>
            <td class="text-end">${formatCurrency(item.price_per_unit_applied)}</td>
            <td class="text-end">${formatCurrency(item.total_cost)}</td>
        </tr>`).join('');
    ui.materialsContainer.innerHTML = `
        <table class="table table-sm table-hover">
            <thead><tr><th>Item</th><th class="text-end">Quantidade</th><th class="text-end">Preço Unit. Aplicado</th><th class="text-end">Custo Total</th></tr></thead>
            <tbody>${tableRows}</tbody>
        </table>`;
}

function renderCostAnalysis() {
    const summary = state.currentQuote?.cost_summary;
    const subtotal = state.currentQuote?.project_totals?.subtotal;
    if (!summary || !subtotal || subtotal === 0) {
        ui.costsContainer.innerHTML = '<p class="text-muted">Nenhum custo para analisar.</p>';
        return;
    }
    const renderCategoryRows = (categoryData) => {
        return Object.entries(categoryData)
            .filter(([, cost]) => cost > 0)
            .map(([name, cost]) => {
                const percentage = ((cost / subtotal) * 100).toFixed(1);
                return `<tr><td class="text-capitalize ps-4">${name.replace(/_/g, ' ')}</td><td class="text-end">${formatCurrency(cost)}</td><td class="text-end">${percentage}%</td></tr>`;
            }).join('');
    };

    const materialRows = renderCategoryRows(summary.materiais);
    const serviceRows = renderCategoryRows(summary.servicos_detalhados);

    ui.costsContainer.innerHTML = `
        <table class="table">
            <thead><tr><th>Categoria / Item de Custo</th><th class="text-end">Custo Total</th><th class="text-end">Percentual</th></tr></thead>
            <tbody>
                <tr class="table-light"><td colspan="3"><strong><i class="bi bi-box-seam"></i> Materiais</strong></td></tr>
                ${materialRows}
                <tr class="table-light"><td colspan="3"><strong><i class="bi bi-tools"></i> Serviços</strong></td></tr>
                ${serviceRows}
            </tbody>
        </table>`;
}

function renderEngineeringReport() {
    const report = state.currentQuote?.engineering_report;
    if (!report) {
        ui.engineeringContainer.innerHTML = '<p class="text-muted">Nenhum dado de engenharia para exibir.</p>';
        return;
    }
    const rawMaterialsRows = report.raw_materials.map(item => `
        <tr>
            <td>${item.name}</td>
            <td class="text-end">${item.total_linear_meters.toFixed(2)} m</td>
            <td class="text-end">${item.units_to_buy} un</td>
        </tr>`).join('');
    
    const paintReportHtml = report.paint_report && report.paint_report.total_paint_area_m2 > 0 ? `
        <div class="card mt-4">
            <div class="card-header"><i class="bi bi-palette-fill"></i> Relatório de Insumos de Pintura</div>
            <div class="card-body">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center"><div>Consumo de Primer <small class="text-muted d-block">com margem de segurança</small></div><strong>${report.paint_report.primer_liters.toFixed(2)} L</strong></li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">Custo do Primer<strong>${formatCurrency(report.paint_report.primer_cost)}</strong></li>
                    <li class="list-group-item d-flex justify-content-between align-items-center"><div>Consumo de Tinta PU <small class="text-muted d-block">com margem de segurança</small></div><strong>${report.paint_report.pu_liters.toFixed(2)} L</strong></li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">Custo da Tinta PU<strong>${formatCurrency(report.paint_report.pu_cost)}</strong></li>
                    <li class="list-group-item d-flex justify-content-between align-items-center table-light"><strong>Custo Total (Insumos de Tinta)</strong><strong>${formatCurrency(report.paint_report.total_paint_cost)}</strong></li>
                </ul>
            </div>
        </div>` : '';

    ui.engineeringContainer.innerHTML = `
        <div class="row g-3">
            <div class="col-lg-6">
                <div class="card h-100">
                    <div class="card-header"><i class="bi bi-rulers"></i> Indicadores Físicos</div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between"><span>Peso Total do Aço</span><strong>${report.total_weight_steel_kg.toFixed(2)} kg</strong></li>
                            <li class="list-group-item d-flex justify-content-between"><span>Área de Pintura (Aço)</span><strong>${report.total_paint_area_m2.toFixed(2)} m²</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card h-100">
                    <div class="card-header"><i class="bi bi-box-seam"></i> Lista de Insumos para Compra</div>
                    <div class="card-body">
                        <table class="table table-sm table-borderless">
                            <thead><tr><th>Matéria-Prima</th><th class="text-end">Metros Lineares</th><th class="text-end">Unidades de Compra</th></tr></thead>
                            <tbody>${rawMaterialsRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        ${paintReportHtml}`;
}

function renderProfileSelectors() {
    if (!state.currentQuote || !state.catalogData) {
        ui.profileConfigContainer.innerHTML = '<p class="text-muted small">Adicione componentes metálicos ao projeto para configurar seus perfis.</p>';
        return;
    }

    const metalParts = state.currentQuote.bill_of_materials.filter(item => 
        item.category === 'metal' && state.catalogData.componentes_acabados[item.partId]?.default_profile_id
    );

    const uniquePartIds = [...new Set(metalParts.map(item => item.partId))];

    if (uniquePartIds.length === 0) {
        ui.profileConfigContainer.innerHTML = '<p class="text-muted small">Nenhum componente com perfil customizável neste projeto.</p>';
        return;
    }

    const selectorsHtml = uniquePartIds.map(partId => {
        const component = state.catalogData.componentes_acabados[partId];
        const currentProfile = state.profileMapping[partId] || component.default_profile_id;
        return `
            <div class="mb-2">
                <label for="profile-select-${partId}" class="form-label small">${component.name}</label>
                <select id="profile-select-${partId}" class="form-select form-select-sm" data-partid="${partId}">
                    ${Object.entries(state.catalogData.perfis_metalicos).map(([id, profile]) => 
                        `<option value="${id}" ${id === currentProfile ? 'selected' : ''}>${profile.name}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    }).join('');

    ui.profileConfigContainer.innerHTML = selectorsHtml;
}


/**
 * @description Ponto de entrada da aplicação. Roda quando o DOM está totalmente carregado.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se todos os elementos da UI foram encontrados.
    Object.values(ui).forEach(element => {
        if (!element) console.warn('Um elemento da UI não foi encontrado no DOM.');
    });

    // Adiciona todos os event listeners aos elementos da UI.
    ui.addBlockButton.addEventListener('click', handleAddBlock);
    ui.blockList.addEventListener('click', handleRemoveBlock);
    ui.profileConfigContainer.addEventListener('change', handleProfileChange);
    ui.togglePanelButton.addEventListener('click', togglePanel);
    ui.closePanelButton.addEventListener('click', togglePanel);
    ui.panelOverlay.addEventListener('click', togglePanel);
    ui.recalculateButton.addEventListener('click', handleRecalculate);
    ui.saveDefaultsButton.addEventListener('click', handleSaveDefaults);

    // Inicia a aplicação buscando os dados e renderizando a UI inicial.
    populateInitialData();
    renderUI();
});
