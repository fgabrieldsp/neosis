// Conteúdo para: frontend/js/utils.js
export function buildFormFields(obj, parentKey = '') {
    let html = '';
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        const valueObj = obj[key];
        const isValueNode = typeof valueObj === 'object' && valueObj !== null && 'value' in valueObj;

        if (isValueNode) {
            const id = newKey.replace(/\./g, '-');
            html += `
                <div class="row mb-3 align-items-center">
                    <label for="${id}" class="col-sm-5 col-form-label text-capitalize">${key.replace(/_/g, ' ')}</label>
                    <div class="col-sm-7">
                        <input type="number" class="form-control" 
                               id="${id}" name="${newKey}.value" 
                               value="${valueObj.value}" step="0.01" 
                               aria-describedby="${id}-help">
                        ${valueObj.description ? `<small id="${id}-help" class="form-text text-muted">${valueObj.description}</small>` : ''}
                    </div>
                </div>
            `;
        } else if (typeof valueObj === 'object' && valueObj !== null && !Array.isArray(valueObj)) {
            html += `<fieldset class="border p-3 mb-3"><legend class="w-auto px-2 fs-6 text-capitalize">${key.replace(/_/g, ' ')}</legend>`;
            html += buildFormFields(valueObj, newKey);
            html += `</fieldset>`;
        }
    }
    return html;
}
export const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);