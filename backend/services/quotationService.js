// backend/services/quotationService.js

const catalog = require('../../data/catalog.json');
const blueprints = require('../../data/blueprints.json');
const baseConfig = require('../../data/config.json');

function decomposeVagas(totalVagas, availableModuleSizes) { if (!availableModuleSizes || availableModuleSizes.length === 0) return null; const sortedSizes = [...availableModuleSizes].sort((a, b) => b - a); let composition = {}; let remainingVagas = totalVagas; for (const size of sortedSizes) { if (remainingVagas <= 0) break; const count = Math.floor(remainingVagas / size); if (count > 0) { composition[size] = count; remainingVagas -= size * count; } } if (remainingVagas > 0) { const smallestSize = sortedSizes[sortedSizes.length - 1]; const fallbackCount = Math.ceil(remainingVagas / smallestSize); composition[smallestSize] = (composition[smallestSize] || 0) + fallbackCount; } return Object.keys(composition).length > 0 ? composition : null; }
function getComponentListForBlock(block) { const blueprint = blueprints[block.estrutura]; if (!blueprint) return new Map(); const moduleComposition = decomposeVagas(block.vagas, blueprint.available_modules); if (!moduleComposition) return new Map(); const totalComponents = new Map(); let totalModules = 0; for (const [size, count] of Object.entries(moduleComposition)) { totalModules += count; const moduleKey = `modulo_${size}_vagas`; const baseModule = blueprint.base_modules[moduleKey]; if (baseModule && baseModule.components_per_module) { baseModule.components_per_module.forEach(component => { const existing = totalComponents.get(component.partId) || { quantity: 0 }; existing.quantity += component.quantity * count; totalComponents.set(component.partId, existing); }); } } let numPilares = 0; if (blueprint.pillar_rule) { const pillarId = blueprint.base_material === 'ferro' ? 'pilar_ferro_padrao' : 'pilar_eucalipto_padrao'; if (blueprint.pillar_rule === 'N+1') numPilares = totalModules + 1; if (blueprint.pillar_rule === '2*N+2') numPilares = (totalModules * 2) + 2; if (pillarId && numPilares > 0) { totalComponents.set(pillarId, { quantity: (totalComponents.get(pillarId)?.quantity || 0) + numPilares }); } } if (blueprint.arm_rule) { const armId = blueprint.base_material === 'ferro' ? 'braco_ferro_padrao' : 'braco_eucalipto_padrao'; let qty = 0; if (blueprint.arm_rule === 'N+1') qty = totalModules + 1; if (qty > 0) { totalComponents.set(armId, { quantity: (totalComponents.get(armId)?.quantity || 0) + qty }); } } if (blueprint.mao_francesa_rule) { const partId = 'mao_francesa_eucalipto'; let qty = 0; if (blueprint.mao_francesa_rule === 'eucalipto_4p_LL') { if (totalModules === 1) { qty = numPilares * 2; } else if (totalModules > 1) { const pilaresExtremidade = 4; const pilaresIntermediarios = numPilares - pilaresExtremidade; qty = (pilaresExtremidade * 2) + (pilaresIntermediarios * 3); } } else if (blueprint.mao_francesa_rule === 'pilares * 2') { qty = numPilares * 2; } if (qty > 0) { totalComponents.set(partId, { quantity: (totalComponents.get(partId)?.quantity || 0) + qty }); } } if (blueprint.separador_rule) { const partId = 'separador_eucalipto_padrao'; let qty = 0; if (blueprint.separador_rule === 'N') qty = totalModules; if (qty > 0) { totalComponents.set(partId, { quantity: (totalComponents.get(partId)?.quantity || 0) + qty }); } } if (numPilares > 0 && blueprint.base_material === 'ferro') { const materialId = 'sapata_fundacao_metalica'; const servicoId = 'servico_instalacao_fundacao'; totalComponents.set(materialId, { quantity: (totalComponents.get(materialId)?.quantity || 0) + numPilares }); totalComponents.set(servicoId, { quantity: (totalComponents.get(servicoId)?.quantity || 0) + numPilares }); } const kitComponent = totalComponents.get('kit_fixacao_tela') || { quantity: 0 }; kitComponent.quantity += totalModules * 60; totalComponents.set('kit_fixacao_tela', kitComponent); return totalComponents; }

function generateQuote(projectBlocks, overrides = {}, profileMapping = {}) {
    const params = {
        bdi_percent: overrides?.financials?.bdi_percent?.value ?? baseConfig.financials.bdi_percent.value,
        tax_percent: overrides?.financials?.tax_percent?.value ?? baseConfig.financials.tax_percent.value,
        valor_aco_kg: overrides?.material_costs?.valor_aco_kg?.value ?? baseConfig.material_costs.valor_aco_kg.value,
        valor_eucalipto_un: overrides?.material_costs?.valor_eucalipto_un?.value ?? baseConfig.material_costs.valor_eucalipto_un.value,
        valor_braco_eucalipto_un: overrides?.material_costs?.valor_braco_eucalipto_un?.value ?? baseConfig.material_costs.valor_braco_eucalipto_un.value,
        valor_longarina_eucalipto_un: overrides?.material_costs?.valor_longarina_eucalipto_un?.value ?? baseConfig.material_costs.valor_longarina_eucalipto_un.value,
        valor_mao_francesa_eucalipto_un: overrides?.material_costs?.valor_mao_francesa_eucalipto_un?.value ?? baseConfig.material_costs.valor_mao_francesa_eucalipto_un.value,
        valor_separador_eucalipto_un: overrides?.material_costs?.valor_separador_eucalipto_un?.value ?? baseConfig.material_costs.valor_separador_eucalipto_un.value,
        valor_tela_m2: overrides?.material_costs?.valor_tela_m2?.value ?? baseConfig.material_costs.valor_tela_m2.value,
        valor_kit_fixacao_un: overrides?.material_costs?.valor_kit_fixacao_un?.value ?? baseConfig.material_costs.valor_kit_fixacao_un.value,
        mao_de_obra_pintura_m2: overrides?.service_costs?.mao_de_obra_pintura_m2?.value ?? baseConfig.service_costs.mao_de_obra_pintura_m2.value,
        custo_servico_fundacao_un: overrides?.service_costs?.custo_servico_fundacao_un?.value ?? baseConfig.service_costs.custo_servico_fundacao_un.value,
        custo_usinagem_kg: overrides?.service_costs?.custo_usinagem_kg?.value ?? baseConfig.service_costs.custo_usinagem_kg.value,
        custo_preparacao_madeira_peca: overrides?.service_costs?.custo_preparacao_madeira_peca?.value ?? baseConfig.service_costs.custo_preparacao_madeira_peca.value,
        preco_galvanizacao_fogo_kg: overrides?.service_costs?.preco_galvanizacao_fogo_kg?.value ?? baseConfig.service_costs.preco_galvanizacao_fogo_kg.value,
        largura_vaga_padrao_m: overrides?.standard_dimensions?.largura_vaga_padrao_m?.value ?? baseConfig.standard_dimensions.largura_vaga_padrao_m.value,
        profundidade_vaga_padrao_m: overrides?.standard_dimensions?.profundidade_vaga_padrao_m?.value ?? baseConfig.standard_dimensions.profundidade_vaga_padrao_m.value,
        logistica_ativo: overrides?.logistica?.ativo?.value ?? baseConfig.logistica.ativo.value,
        logistica_custo_base_kg: overrides?.logistica?.custo_base_kg?.value ?? baseConfig.logistica.custo_base_kg.value,
        logistica_coeficiente: overrides?.logistica?.coeficiente?.value ?? baseConfig.logistica.coeficiente.value,
        montagem_ativo: overrides?.montagem?.ativo?.value ?? baseConfig.montagem.ativo.value,
        montagem_custo_por_modulo: overrides?.montagem?.custo_por_modulo?.value ?? baseConfig.montagem.custo_por_modulo.value,
        primer_yield: overrides?.service_costs?.paint_calculation_params?.primer_yield_m2_per_liter?.value ?? baseConfig.service_costs.paint_calculation_params.primer_yield_m2_per_liter.value,
        primer_price: overrides?.service_costs?.paint_calculation_params?.primer_price_per_liter?.value ?? baseConfig.service_costs.paint_calculation_params.primer_price_per_liter.value,
        pu_yield: overrides?.service_costs?.paint_calculation_params?.pu_yield_m2_per_liter?.value ?? baseConfig.service_costs.paint_calculation_params.pu_yield_m2_per_liter.value,
        pu_price: overrides?.service_costs?.paint_calculation_params?.pu_price_per_liter?.value ?? baseConfig.service_costs.paint_calculation_params.pu_price_per_liter.value,
        pu_coats: overrides?.service_costs?.paint_calculation_params?.pu_coats?.value ?? baseConfig.service_costs.paint_calculation_params.pu_coats.value,
        safety_margin: overrides?.service_costs?.paint_calculation_params?.safety_margin_percent?.value ?? baseConfig.service_costs.paint_calculation_params.safety_margin_percent.value,
        osmocolor_yield: overrides?.service_costs?.wood_treatment_params?.osmocolor_yield_m2_per_gallon?.value ?? baseConfig.service_costs.wood_treatment_params.osmocolor_yield_m2_per_gallon.value,
        osmocolor_price: overrides?.service_costs?.wood_treatment_params?.osmocolor_price_per_gallon?.value ?? baseConfig.service_costs.wood_treatment_params.osmocolor_price_per_gallon.value,
        osmocolor_coats: overrides?.service_costs?.wood_treatment_params?.osmocolor_coats?.value ?? baseConfig.service_costs.wood_treatment_params.osmocolor_coats.value,
        osmocolor_labor_cost: overrides?.service_costs?.wood_treatment_params?.labor_cost_per_m2?.value ?? baseConfig.service_costs.wood_treatment_params.labor_cost_per_m2.value,
    };
    const finalBomMap = new Map();
    projectBlocks.forEach(block => { getComponentListForBlock(block).forEach((data, partId) => { const existing = finalBomMap.get(partId) || { quantity: 0 }; existing.quantity += data.quantity; finalBomMap.set(partId, existing); }); });
    const detailedBom = [];
    const costSummary = {
        materiais: { metal: 0, madeira: 0, cobertura: 0, acessorios: 0, tinta: 0, tratamento_madeira: 0 },
        servicos_detalhados: { fundacao: 0, mao_de_obra_pintura: 0, usinagem_metal: 0, preparacao_madeira: 0, aplicacao_osmocolor: 0, galvanizacao: 0, montagem: 0, logistica: 0 },
        totais_agrupados: { total_materiais: 0, total_servicos: 0 }
    };
    let physicalTotals = { total_weight_metal: 0, total_surface_area_metal: 0, total_weight_wood_kg: 0, total_surface_area_madeira: 0, total_wood_pieces: 0 };
    const manufacturingNeeds = new Map();
    finalBomMap.forEach((data, partId) => {
        const component = catalog.componentes_acabados[partId] || catalog.outros_componentes[partId];
        if (!component) return;
        const profileId = profileMapping[partId] || component.default_profile_id;
        const profile = profileId ? catalog.perfis_metalicos[profileId] : null;
        const qty = data.quantity;
        let itemCost = 0; let totalWeight = 0; let totalSurfaceArea = 0;
        if (profile) { totalWeight = (profile.weight_kg_per_meter || 0) * (component.length_m || 0) * qty; totalSurfaceArea = (profile.surface_area_m2_per_meter || 0) * (component.length_m || 0) * qty; } else { totalWeight = ((component.weight_kg_per_meter || 0) * (component.length_m || 0) + (component.weight_kg_per_unit || 0)) * qty; totalSurfaceArea = ((component.surface_area_m2_per_meter || 0) * (component.length_m || 0) + (component.surface_area_m2_per_unit || 0)) * qty; }
        if (component.manufacturing_recipe && profileId) { const rawMaterialKey = `${component.manufacturing_recipe.raw_material_key_prefix}${profileId}`; const rawMaterial = catalog.materias_primas[rawMaterialKey]; if (rawMaterial) { const existingNeed = manufacturingNeeds.get(rawMaterialKey) || { total_length: 0 }; existingNeed.total_length += (component.length_m || 0) * qty; manufacturingNeeds.set(rawMaterialKey, existingNeed); } }
        switch (component.category) {
            case 'metal': itemCost = totalWeight * params.valor_aco_kg; costSummary.materiais.metal += itemCost; physicalTotals.total_weight_metal += totalWeight; physicalTotals.total_surface_area_metal += totalSurfaceArea; break;
            case 'madeira': physicalTotals.total_wood_pieces += qty; physicalTotals.total_weight_wood_kg += totalWeight; physicalTotals.total_surface_area_madeira += totalSurfaceArea; if (partId === 'pilar_eucalipto_padrao') itemCost = qty * params.valor_eucalipto_un; else if (partId === 'braco_eucalipto_padrao') itemCost = qty * params.valor_braco_eucalipto_un; else if (partId === 'longarina_eucalipto_5m') itemCost = qty * params.valor_longarina_eucalipto_un; else if (partId === 'mao_francesa_eucalipto') itemCost = qty * params.valor_mao_francesa_eucalipto_un; else if (partId === 'separador_eucalipto_padrao') itemCost = qty * params.valor_separador_eucalipto_un; else itemCost = qty * params.valor_eucalipto_un; costSummary.materiais.madeira += itemCost; break;
            case 'acessorios': itemCost = qty * params.valor_kit_fixacao_un; costSummary.materiais.acessorios += itemCost; break;
            case 'servicos': if (partId === 'servico_instalacao_fundacao') itemCost = qty * params.custo_servico_fundacao_un; costSummary.servicos_detalhados.fundacao += itemCost; break;
        }
        const itemName = profile ? `${component.name} (${profile.name})` : component.name;
        detailedBom.push({ partId, name: itemName, category: component.category, qty, unit: component.unit || 'un', total_cost: itemCost, price_per_unit_applied: qty > 0 ? itemCost / qty : 0 });
    });
    const totalVagas = projectBlocks.reduce((acc, b) => acc + parseInt(b.vagas, 10), 0);
    const totalTelaArea = totalVagas * params.largura_vaga_padrao_m * params.profundidade_vaga_padrao_m;
    const telaCost = totalTelaArea * params.valor_tela_m2;
    costSummary.materiais.cobertura += telaCost;
    detailedBom.push({ partId: 'tela_cobertura', name: 'Tela de Sombreamento 80%', category: 'cobertura', qty: totalTelaArea, unit: 'm²', total_cost: telaCost, price_per_unit_applied: params.valor_tela_m2 });
    costSummary.servicos_detalhados.usinagem_metal = physicalTotals.total_weight_metal * params.custo_usinagem_kg;
    costSummary.servicos_detalhados.preparacao_madeira = physicalTotals.total_wood_pieces * params.custo_preparacao_madeira_peca;
    costSummary.servicos_detalhados.mao_de_obra_pintura = physicalTotals.total_surface_area_metal * params.mao_de_obra_pintura_m2;
    costSummary.servicos_detalhados.galvanizacao = physicalTotals.total_weight_metal * params.preco_galvanizacao_fogo_kg;
    
    const marginMultiplier = 1 + (params.safety_margin / 100);
    const osmocolorAreaTotal = physicalTotals.total_surface_area_madeira * params.osmocolor_coats;
    const osmocolorGallonsNeeded = physicalTotals.total_surface_area_madeira > 0 ? Math.ceil((osmocolorAreaTotal / params.osmocolor_yield) * marginMultiplier) : 0;
    const osmocolorMaterialCost = osmocolorGallonsNeeded * params.osmocolor_price;
    const osmocolorLaborCost = physicalTotals.total_surface_area_madeira * params.osmocolor_labor_cost;
    costSummary.servicos_detalhados.aplicacao_osmocolor = osmocolorLaborCost;
    costSummary.materiais.tratamento_madeira = osmocolorMaterialCost;
    if (osmocolorMaterialCost > 0) { detailedBom.push({ partId: 'insumo_osmocolor', name: 'Tratamento (Osmocolor)', category: 'tratamento_madeira', qty: osmocolorGallonsNeeded, unit: 'galão(ões)', total_cost: osmocolorMaterialCost, price_per_unit_applied: params.osmocolor_price }); }
    
    const primerLitersNeeded = physicalTotals.total_surface_area_metal > 0 ? (physicalTotals.total_surface_area_metal / params.primer_yield) * marginMultiplier : 0;
    const primerCost = primerLitersNeeded * params.primer_price;
    const puLitersNeeded = physicalTotals.total_surface_area_metal > 0 ? (physicalTotals.total_surface_area_metal / params.pu_yield) * params.pu_coats * marginMultiplier : 0;
    const puCost = puLitersNeeded * params.pu_price;
    costSummary.materiais.tinta = primerCost + puCost;
    if (primerCost > 0) { detailedBom.push({ partId: 'insumo_primer', name: 'Tinta de Fundo (Primer)', category: 'tinta', qty: primerLitersNeeded, unit: 'L', total_cost: primerCost, price_per_unit_applied: params.primer_price }); }
    if (puCost > 0) { detailedBom.push({ partId: 'insumo_pu', name: 'Tinta de Acabamento (PU)', category: 'tinta', qty: puLitersNeeded, unit: 'L', total_cost: puCost, price_per_unit_applied: params.pu_price }); }
    
    const totalModules = projectBlocks.reduce((acc, block) => acc + Object.values(decomposeVagas(block.vagas, blueprints[block.estrutura].available_modules) || {}).reduce((a, b) => a + b, 0), 0);
    if (params.montagem_ativo) costSummary.servicos_detalhados.montagem = totalModules * params.montagem_custo_por_modulo;
    if (params.logistica_ativo) costSummary.servicos_detalhados.logistica = (physicalTotals.total_weight_metal + physicalTotals.total_weight_wood_kg) * params.logistica_custo_base_kg * params.logistica_coeficiente;
    
    costSummary.totais_agrupados.total_materiais = Object.values(costSummary.materiais).reduce((a, b) => a + b, 0);
    costSummary.totais_agrupados.total_servicos = Object.values(costSummary.servicos_detalhados).reduce((a, b) => a + b, 0);
    const subtotal = costSummary.totais_agrupados.total_materiais + costSummary.totais_agrupados.total_servicos;
    const bdiValue = subtotal * (params.bdi_percent / 100);
    const taxValue = (subtotal + bdiValue) * (params.tax_percent / 100);
    const grandTotal = subtotal + bdiValue + taxValue;
    
    const engineering_report = {
        total_weight_steel_kg: physicalTotals.total_weight_metal,
        total_paint_area_m2: physicalTotals.total_surface_area_metal,
        total_weight_wood_kg: physicalTotals.total_weight_wood_kg,
        total_treatment_area_m2: physicalTotals.total_surface_area_madeira,
        raw_materials: Array.from(manufacturingNeeds.entries()).map(([rawId, needs]) => { const rawItem = catalog.materias_primas[rawId]; if (!rawItem) return null; const units_needed = Math.ceil(needs.total_length / rawItem.length_m); return { name: rawItem.name, profile_id: rawItem.profile_id, total_linear_meters: needs.total_length, units_to_buy: units_needed, unit_length_m: rawItem.length_m }; }).filter(item => item !== null),
        paint_report: { total_paint_area_m2: physicalTotals.total_surface_area_metal, primer_liters: primerLitersNeeded, primer_cost: primerCost, pu_liters: puLitersNeeded, pu_cost: puCost, total_paint_cost: primerCost + puCost },
        wood_treatment_report: { total_treatment_area_m2: physicalTotals.total_surface_area_madeira, osmocolor_gallons: osmocolorGallonsNeeded, material_cost: osmocolorMaterialCost, labor_cost: osmocolorLaborCost, total_cost: osmocolorMaterialCost + osmocolorLaborCost }
    };

    return { bill_of_materials: detailedBom.sort((a, b) => b.total_cost - a.total_cost), cost_summary: costSummary, project_totals: { subtotal, bdi_value: bdiValue, tax_value: taxValue, grand_total: grandTotal, bdi_percent: params.bdi_percent, tax_percent: params.tax_percent }, engineering_report: engineering_report };
}

module.exports = { generateQuote };
