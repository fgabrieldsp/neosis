/**
 * @file utils.js
 * @description Módulo de funções utilitárias compartilhadas para o frontend do NeoSIS.
 * @version 1.0
 */

/**
 * Formata um valor numérico como uma string de moeda no padrão BRL (Real Brasileiro).
 * @param {number} value - O valor numérico a ser formatado.
 * @returns {string} A string formatada, ex: "R$ 1.234,56".
 */
export function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Constrói recursivamente campos de formulário HTML a partir de um objeto de configuração.
 * Esta função é o motor por trás do painel de parâmetros dinâmico.
 * @param {object} configObject - O objeto (ou sub-objeto) de configuração a ser percorrido.
 * @param {string} [parentKey=''] - A chave pai, usada para construir o atributo 'name' aninhado.
 * @returns {string} Uma string HTML contendo os campos do formulário.
 */
export function buildFormFields(configObject, parentKey = '') {
    let html = '';

    for (const key in configObject) {
        // Garante que estamos lidando com as propriedades do próprio objeto.
        if (Object.prototype.hasOwnProperty.call(configObject, key)) {
            const currentObject = configObject[key];
            // Constrói a chave completa para o campo do formulário (ex: 'financials.bdi_percent').
            const fullKey = parentKey ? `${parentKey}.${key}` : key;

            // Se o objeto tem as propriedades 'value' e 'description', é um parâmetro editável.
            if (typeof currentObject === 'object' && currentObject !== null && 'value' in currentObject && 'description' in currentObject) {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Transforma 'valor_aco_kg' em 'Valor Aco Kg'
                
                html += `
                    <div class="mb-3">
                        <label for="${fullKey}" class="form-label small">${label}</label>
                        <input type="number" class="form-control form-control-sm" id="${fullKey}" name="${fullKey}.value" value="${currentObject.value}" step="0.01">
                        <div class="form-text small">${currentObject.description}</div>
                    </div>
                `;
            } 
            // Se for um objeto, mas não um campo de parâmetro, trata-se de uma categoria.
            // A função então se chama recursivamente para construir os campos dentro dessa categoria.
            else if (typeof currentObject === 'object' && currentObject !== null) {
                const categoryTitle = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                html += `
                    <fieldset class="mb-3">
                        <legend class="h6 text-primary border-bottom pb-1 mb-2">${categoryTitle}</legend>
                        ${buildFormFields(currentObject, fullKey)}
                    </fieldset>
                `;
            }
        }
    }
    return html;
}
