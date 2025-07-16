// frontend/js/app.js

import { buildFormFields, formatCurrency } from './utils.js';

const API_BASE_URL = 'http://localhost:3080';

const state = { projectBlocks: [], currentQuote: null, configData: null, catalogData: null, profileMapping: {}, };
const ui = { vagasInput: document.getElementById('vagas'), estruturaSelect: document.getElementById('estrutura'), addBlockButton: document.getElementById('btnAdicionarBloco'), blockList: document.getElementById('listaBlocos'), totalVagasCard: document.getElementById('totalVagas'), custoPorVagaCard: document.getElementById('custoPorVaga'), precoPorM2Card: document.getElementById('precoPorM2'), totalFinalCard: document.getElementById('totalFinal'), summaryContainer: document.getElementById('resultadoResumo'), materialsContainer: document.getElementById('resultadoMateriais'), costsContainer: document.getElementById('resultadoCustos'), engineeringContainer: document.getElementById('resultadoEngenharia'), profileConfigContainer: document.getElementById('profile-config-body'), togglePanelButton: document.getElementById('btn-toggle-panel'), closePanelButton: document.getElementById('btn-close-panel'), recalculateButton: document.getElementById('btn-recalculate'), saveDefaultsButton: document.getElementById('btn-save-defaults'), simulationPanel: document.getElementById('simulation-panel'), panelFormContainer: document.getElementById('panel-form-container'), panelOverlay: document.getElementById('panel-overlay'), };

function getOverridesFromPanel() { const overrides = {}; const form = ui.panelFormContainer.querySelector('form'); if (!form) return overrides; const formData = new FormData(form); for (const [key, value] of formData.entries()) { const numericValue = parseFloat(value); if (isNaN(numericValue)) continue; const path = key.substring(0, key.lastIndexOf('.')); const keys = path.split('.'); if (keys.length === 2) { const [category, parameter] = keys; if (!overrides[category]) overrides[category] = {}; overrides[category][parameter] = { value: numericValue }; } else if (keys.length === 3) { const [cat, subCat, param] = keys; if (!overrides[cat]) overrides[cat] = {}; if (!overrides[cat][subCat]) overrides[cat][subCat] = {}; overrides[cat][subCat][param] = { value: numericValue }; } } return overrides; }
function togglePanel() { ui.simulationPanel.classList.toggle('visible'); ui.panelOverlay.classList.toggle('visible'); }
async function handleRecalculate() { if (state.projectBlocks.length === 0) { alert('Adicione pelo menos um bloco ao projeto para simular.'); return; } const overrides = getOverridesFromPanel(); await calculateQuote(overrides); togglePanel(); }
async function handleSaveDefaults() { if (!confirm('Tem certeza que deseja salvar estes parâmetros como o novo padrão?')) return; const newConfigData = getOverridesFromPanel(); const configToSave = JSON.parse(JSON.stringify(state.configData)); for (const category in newConfigData) { for (const param in newConfigData[category]) { if (configToSave[category]?.[param]) { configToSave[category][param].value = newConfigData[category][param].value; } else if (typeof newConfigData[category][param] === 'object') { if (!configToSave[category]) configToSave[category] = {}; if (!configToSave[category][param]) configToSave[category][param] = {}; for (const subParam in newConfigData[category][param]) { if(configToSave[category]?.[param]?.[subParam]) { configToSave[category][param][subParam].value = newConfigData[category][param][subParam].value; } } } } } try { const response = await fetch(`${API_BASE_URL}/api/data/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configToSave) }); if (!response.ok) throw new Error('Falha ao salvar configurações.'); alert('Parâmetros salvos com sucesso!'); state.configData = configToSave; } catch (error) { console.error(error); alert(error.message); } }
async function populateInitialData() { try { const [configRes, blueprintsRes, catalogRes] = await Promise.all([ fetch(`${API_BASE_URL}/api/data/config`), fetch(`${API_BASE_URL}/api/blueprints`), fetch(`${API_BASE_URL}/api/data/catalog`) ]); if (!configRes.ok) throw new Error('Falha ao carregar config.json'); if (!blueprintsRes.ok) throw new Error('Falha ao carregar blueprints.json'); if (!catalogRes.ok) throw new Error('Falha ao carregar catalog.json'); state.configData = await configRes.json(); const blueprints = await blueprintsRes.json(); state.catalogData = await catalogRes.json(); const formHtml = buildFormFields(state.configData); ui.panelFormContainer.innerHTML = `<form>${formHtml}</form>`; ui.estruturaSelect.innerHTML = blueprints.map(bp => `<option value="${bp.id}">${bp.name}</option>`).join(''); } catch (error) { console.error("Erro fatal na inicialização:", error); alert(`Erro na inicialização: ${error.message}`); } }
async function calculateQuote(overrides = null) { if (state.projectBlocks.length === 0) { state.currentQuote = null; renderUI(); return; } try { const requestBody = { projectBlocks: state.projectBlocks, profileMapping: state.profileMapping }; if (overrides && Object.keys(overrides).length > 0) { requestBody.overrides = overrides; } const response = await fetch(`${API_BASE_URL}/api/quote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) }); if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || 'O servidor retornou um erro no cálculo.'); } state.currentQuote = await response.json(); renderUI(); } catch (error) { console.error("Erro ao calcular orçamento:", error); alert(`Erro no cálculo: ${error.message}`); } }
function handleAddBlock() { const vagas = parseInt(ui.vagasInput.value, 10); if (isNaN(vagas) || vagas <= 0) { alert("Por favor, insira um número de vagas válido."); return; } const estruturaId = ui.estruturaSelect.value; if (!estruturaId) { alert("Por favor, selecione um modelo estrutural."); return; } const estruturaName = ui.estruturaSelect.options[ui.estruturaSelect.selectedIndex].text; state.projectBlocks.push({ vagas, estrutura: estruturaId, name: estruturaName }); calculateQuote(); }
function handleRemoveBlock(e) { const button = e.target.closest('.btn-remove-block'); if (button) { const indexToRemove = parseInt(button.dataset.index, 10); state.projectBlocks.splice(indexToRemove, 1); calculateQuote(); } }
function handleProfileChange(e) { const selectElement = e.target; const partId = selectElement.dataset.partid; const profileId = selectElement.value; if (profileId) { state.profileMapping[partId] = profileId; } else { delete state.profileMapping[partId]; } calculateQuote(); }

function renderUI() { renderProjectBlocks(); renderSummaryCards(); renderSummaryView(); renderBillOfMaterials(); renderCostAnalysis(); renderEngineeringReport(); renderProfileSelectors(); }
function renderProjectBlocks() { if (!ui.blockList) return; if (state.projectBlocks.length === 0) { ui.blockList.innerHTML = '<li class="list-group-item text-muted" id="placeholderLista">Nenhum bloco adicionado.</li>'; } else { ui.blockList.innerHTML = state.projectBlocks.map((block, index) => ` <li class="list-group-item d-flex justify-content-between align-items-center"> <span><b>${block.vagas} vagas</b> - ${block.name}</span> <button class="btn btn-danger btn-sm btn-remove-block" data-index="${index}"><i class="bi bi-trash"></i></button> </li> `).join(''); } }
function renderSummaryCards() { const totalVagas = state.projectBlocks.reduce((acc, block) => acc + parseInt(block.vagas, 10), 0); ui.totalVagasCard.textContent = totalVagas; const quote = state.currentQuote; const config = state.configData; if (!quote || !quote.project_totals || !config) { ui.custoPorVagaCard.textContent = 'R$ 0,00'; ui.precoPorM2Card.textContent = 'R$ 0,00'; ui.totalFinalCard.textContent = 'R$ 0,00'; return; } const totals = quote.project_totals; const custoPorVaga = totalVagas > 0 ? (totals.grand_total / totalVagas) : 0; ui.custoPorVagaCard.textContent = formatCurrency(custoPorVaga); const areaPorVaga = config.standard_dimensions.largura_vaga_padrao_m.value * config.standard_dimensions.profundidade_vaga_padrao_m.value; const areaTotal = totalVagas * areaPorVaga; const precoPorM2 = areaTotal > 0 ? (totals.grand_total / areaTotal) : 0; ui.precoPorM2Card.textContent = formatCurrency(precoPorM2); ui.totalFinalCard.textContent = formatCurrency(totals.grand_total); }
function renderSummaryView() { const quote = state.currentQuote; if (!quote || !quote.cost_summary?.totais_agrupados) { ui.summaryContainer.innerHTML = '<p class="text-muted">Adicione blocos para ver o resumo.</p>'; return; } const totals = quote.project_totals; const groupedCosts = quote.cost_summary.totais_agrupados; ui.summaryContainer.innerHTML = ` <h5 class="mb-3">Composição do Preço Final</h5> <table class="table table-hover"> <tbody> <tr><td>Custo Total de Materiais</td><td class="text-end">${formatCurrency(groupedCosts.total_materiais)}</td></tr> <tr><td>Custo Total de Serviços</td><td class="text-end">${formatCurrency(groupedCosts.total_servicos)}</td></tr> <tr class="table-light"><td><strong>Subtotal (Custo Direto)</strong></td><td class="text-end"><strong>${formatCurrency(totals.subtotal)}</strong></td></tr> <tr><td>BDI (${totals.bdi_percent}%)</td><td class="text-end">${formatCurrency(totals.bdi_value)}</td></tr> <tr class="table-light"><td><strong>Subtotal com BDI</strong></td><td class="text-end"><strong>${formatCurrency(totals.subtotal + totals.bdi_value)}</strong></td></tr> <tr><td>Impostos (${totals.tax_percent}%)</td><td class="text-end">${formatCurrency(totals.tax_value)}</td></tr> <tr class="table-success fs-5"><td><strong>Total Final do Projeto</strong></td><td class="text-end"><strong>${formatCurrency(totals.grand_total)}</strong></td></tr> </tbody> </table>`; }
function renderBillOfMaterials() { const bom = state.currentQuote?.bill_of_materials; if (!bom || bom.length === 0) { ui.materialsContainer.innerHTML = '<p class="text-muted">Nenhum material para exibir.</p>'; return; } const tableRows = bom.map(item => ` <tr> <td>${item.name || 'Item desconhecido'}</td> <td class="text-end">${(item.qty || 0).toFixed(2)} ${item.unit || 'un'}</td> <td class="text-end">${formatCurrency(item.price_per_unit_applied)}</td> <td class="text-end">${formatCurrency(item.total_cost)}</td> </tr>`).join(''); ui.materialsContainer.innerHTML = ` <table class="table table-sm table-hover"> <thead><tr><th>Item</th><th class="text-end">Quantidade</th><th class="text-end">Preço Unit. Aplicado</th><th class="text-end">Custo Total</th></tr></thead> <tbody>${tableRows}</tbody> </table>`; }
function renderCostAnalysis() { const summary = state.currentQuote?.cost_summary; const subtotal = state.currentQuote?.project_totals?.subtotal; if (!summary || !subtotal || subtotal === 0) { ui.costsContainer.innerHTML = '<p class="text-muted">Nenhum custo para analisar.</p>'; return; } const renderCategoryRows = (categoryData) => { return Object.entries(categoryData).filter(([, cost]) => cost > 0).map(([name, cost]) => { const percentage = ((cost / subtotal) * 100).toFixed(1); return `<tr><td class="text-capitalize ps-4">${name.replace(/_/g, ' ')}</td><td class="text-end">${formatCurrency(cost)}</td><td class="text-end">${percentage}%</td></tr>`; }).join(''); }; const materialRows = renderCategoryRows(summary.materiais); const serviceRows = renderCategoryRows(summary.servicos_detalhados); ui.costsContainer.innerHTML = ` <table class="table"> <thead><tr><th>Categoria / Item de Custo</th><th class="text-end">Custo Total</th><th class="text-end">Percentual</th></tr></thead> <tbody> <tr class="table-light"><td colspan="3"><strong><i class="bi bi-box-seam"></i> Materiais</strong></td></tr> ${materialRows} <tr class="table-light"><td colspan="3"><strong><i class="bi bi-tools"></i> Serviços</strong></td></tr> ${serviceRows} </tbody> </table>`; }

function renderEngineeringReport() {
    const report = state.currentQuote?.engineering_report;
    if (!report) {
        ui.engineeringContainer.innerHTML = '<p class="text-muted">Nenhum dado de engenharia para exibir.</p>';
        return;
    }

    const rawMaterialsRows = report.raw_materials && report.raw_materials.length > 0 ?
        report.raw_materials.map(item => `
        <tr>
            <td>${item.name}</td>
            <td class="text-end">${item.total_linear_meters.toFixed(2)} m</td>
            <td class="text-end">${item.units_to_buy} un</td>
        </tr>`).join('') : '<tr><td colspan="3" class="text-muted">Nenhuma matéria-prima de aço para este projeto.</td></tr>';

    const rawMaterialsCard = `
        <div class="card h-100">
            <div class="card-header"><i class="bi bi-box-seam"></i> Lista de Insumos para Compra (Aço)</div>
            <div class="card-body">
                <table class="table table-sm table-borderless">
                    <thead><tr><th>Matéria-Prima</th><th class="text-end">Metros Lineares</th><th class="text-end">Unidades de Compra</th></tr></thead>
                    <tbody>${rawMaterialsRows}</tbody>
                </table>
            </div>
        </div>`;

    let physicalIndicatorsHtml = '';
    if (report.total_weight_steel_kg > 0) {
        physicalIndicatorsHtml += `<li class="list-group-item d-flex justify-content-between"><span>Peso Total do Aço</span><strong>${report.total_weight_steel_kg.toFixed(2)} kg</strong></li>`;
        physicalIndicatorsHtml += `<li class="list-group-item d-flex justify-content-between"><span>Área de Pintura (Aço)</span><strong>${report.total_paint_area_m2.toFixed(2)} m²</strong></li>`;
    }
    if (report.total_weight_wood_kg > 0) {
        physicalIndicatorsHtml += `<li class="list-group-item d-flex justify-content-between"><span>Peso Total da Madeira</span><strong>${report.total_weight_wood_kg.toFixed(2)} kg</strong></li>`;
        physicalIndicatorsHtml += `<li class="list-group-item d-flex justify-content-between"><span>Área de Tratamento (Madeira)</span><strong>${report.total_treatment_area_m2.toFixed(2)} m²</strong></li>`;
    }
    if (!physicalIndicatorsHtml) {
        physicalIndicatorsHtml = '<li class="list-group-item text-muted">Nenhum indicador físico a ser exibido.</li>';
    }

    const physicalIndicatorsCard = `
        <div class="card h-100">
            <div class="card-header"><i class="bi bi-rulers"></i> Indicadores Físicos</div>
            <div class="card-body">
                <ul class="list-group list-group-flush">${physicalIndicatorsHtml}</ul>
            </div>
        </div>`;

    const paintReportHtml = report.paint_report && report.paint_report.total_paint_area_m2 > 0 ? `
        <div class="card mt-4">
            <div class="card-header"><i class="bi bi-palette-fill"></i> Relatório de Insumos de Pintura (Aço)</div>
            <div class="card-body">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center">Consumo de Primer<small class="text-muted d-block ms-2">(${report.paint_report.primer_liters.toFixed(2)} L)</small><strong>${formatCurrency(report.paint_report.primer_cost)}</strong></li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">Consumo de Tinta PU<small class="text-muted d-block ms-2">(${report.paint_report.pu_liters.toFixed(2)} L)</small><strong>${formatCurrency(report.paint_report.pu_cost)}</strong></li>
                    <li class="list-group-item d-flex justify-content-between align-items-center table-light"><strong>Custo Total (Insumos de Tinta)</strong><strong>${formatCurrency(report.paint_report.total_paint_cost)}</strong></li>
                </ul>
            </div>
        </div>` : '';

    const woodTreatmentReportHtml = report.wood_treatment_report && report.wood_treatment_report.total_treatment_area_m2 > 0 ? `
        <div class="card mt-4">
            <div class="card-header"><i class="bi bi-shield-shaded"></i> Relatório de Tratamento (Madeira)</div>
            <div class="card-body">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center">Consumo de Osmocolor<small class="text-muted d-block ms-2">(${report.wood_treatment_report.osmocolor_gallons.toFixed(2)} galões)</small><strong>${formatCurrency(report.wood_treatment_report.material_cost)}</strong></li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">Custo da Mão de Obra<strong>${formatCurrency(report.wood_treatment_report.labor_cost)}</strong></li>
                    <li class="list-group-item d-flex justify-content-between align-items-center table-light"><strong>Custo Total do Tratamento</strong><strong>${formatCurrency(report.wood_treatment_report.total_cost)}</strong></li>
                </ul>
            </div>
        </div>` : '';

    ui.engineeringContainer.innerHTML = `
        <div class="row g-3">
            <div class="col-lg-6">${physicalIndicatorsCard}</div>
            <div class="col-lg-6">${rawMaterialsCard}</div>
        </div>
        ${paintReportHtml}
        ${woodTreatmentReportHtml}
    `;
}

function renderProfileSelectors() { if (!state.currentQuote || !state.catalogData) { ui.profileConfigContainer.innerHTML = '<p class="text-muted small">Adicione componentes metálicos ao projeto para configurar seus perfis.</p>'; return; } const metalParts = state.currentQuote.bill_of_materials.filter(item => item.category === 'metal' && state.catalogData.componentes_acabados[item.partId]?.default_profile_id); const uniquePartIds = [...new Set(metalParts.map(item => item.partId))]; if (uniquePartIds.length === 0) { ui.profileConfigContainer.innerHTML = '<p class="text-muted small">Nenhum componente com perfil customizável neste projeto.</p>'; return; } const selectorsHtml = uniquePartIds.map(partId => { const component = state.catalogData.componentes_acabados[partId]; const currentProfile = state.profileMapping[partId] || component.default_profile_id; return ` <div class="mb-2"> <label for="profile-select-${partId}" class="form-label small">${component.name}</label> <select id="profile-select-${partId}" class="form-select form-select-sm" data-partid="${partId}"> ${Object.entries(state.catalogData.perfis_metalicos).map(([id, profile]) => `<option value="${id}" ${id === currentProfile ? 'selected' : ''}>${profile.name}</option>`).join('')} </select> </div> `; }).join(''); ui.profileConfigContainer.innerHTML = selectorsHtml; }

document.addEventListener('DOMContentLoaded', () => { Object.values(ui).forEach(element => { if (!element) console.warn('Um elemento da UI não foi encontrado no DOM.'); }); ui.addBlockButton.addEventListener('click', handleAddBlock); ui.blockList.addEventListener('click', handleRemoveBlock); ui.profileConfigContainer.addEventListener('change', handleProfileChange); ui.togglePanelButton.addEventListener('click', togglePanel); ui.closePanelButton.addEventListener('click', togglePanel); ui.panelOverlay.addEventListener('click', togglePanel); ui.recalculateButton.addEventListener('click', handleRecalculate); ui.saveDefaultsButton.addEventListener('click', handleSaveDefaults); populateInitialData(); renderUI(); });
