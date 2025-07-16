// backend/services/AbstractQuotationService.js

/**
 * @class AbstractQuotationService
 * @description Classe abstrata que define a interface e o comportamento comum para todos os serviços de cotação no NeoSIS.
 * Garante que qualquer serviço de cotação implemente os métodos essenciais para o cálculo de orçamentos e relatórios de insumos.
 */
class AbstractQuotationService {
    /**
     * @constructor
     * @param {Array<Object>} catalog - O catálogo de peças e materiais.
     * @param {Array<Object>} blueprints - As plantas de modulação com regras e receitas.
     * @param {Object} config - O painel de parâmetros com custos e variáveis de negócio.
     * @throws {TypeError} Lança um erro se a classe abstrata for instanciada diretamente.
     */
    constructor(catalog, blueprints, config) {
        // Impede a instanciação direta da classe abstrata
        if (new.target === AbstractQuotationService) {
            throw new TypeError("Cannot instantiate AbstractQuotationService directly. Please extend it.");
        }

        // Armazena as dependências essenciais para o serviço de cotação
        this.catalog = catalog;
        this.blueprints = blueprints;
        this.config = config;
    }

    /**
     * @method generateQuote
     * @description Método principal abstrato para gerar um orçamento completo e relatório de insumos para um projeto.
     * Deve ser implementado pelas classes concretas.
     * @param {Array<Object>} projectBlocks - Uma lista de blocos de projeto, cada um descrevendo uma parte da estrutura a ser orçada.
     * @returns {Promise<Object>} Uma promessa que resolve para o relatório final do orçamento.
     * @throws {Error} Deve ser implementado pelas classes concretas.
     */
    async generateQuote(projectBlocks) {
        throw new Error("Method 'generateQuote()' must be implemented by the concrete class.");
    }

    /**
     * @method getComponentListForBlock
     * @description Sub-rotina abstrata para contar os componentes necessários para um único bloco de projeto.
     * Deve ser implementada pelas classes concretas.
     * @param {Object} block - O objeto do bloco de projeto a ser analisado.
     * @returns {Promise<Object>} Uma promessa que resolve para um mapa de componentes e suas quantidades para o bloco.
     * @throws {Error} Deve ser implementado pelas classes concretas.
     */
    async getComponentListForBlock(block) {
        throw new Error("Method 'getComponentListForBlock()' must be implemented by the concrete class.");
    }

    /**
     * @method parametricCosting
     * @description Sub-rotina abstrata para calcular os custos paramétricos com base na lista total de componentes.
     * Deve ser implementada pelas classes concretas.
     * @param {Object} totalComponentsMap - Um mapa de todos os componentes e suas quantidades acumuladas do projeto.
     * @returns {Promise<Object>} Uma promessa que resolve para um objeto contendo o subtotal, total com BDI, total final e custos detalhados.
     * @throws {Error} Deve ser implementado pelas classes concretas.
     */
    async parametricCosting(totalComponentsMap) {
        throw new Error("Method 'parametricCosting()' must be implemented by the concrete class.");
    }

    /**
     * @method generateMaterialReport
     * @description Sub-rotina abstrata para gerar o relatório de insumos (matéria-prima) necessário para a fabricação.
     * Deve ser implementada pelas classes concretas.
     * @param {Object} finalComponentList - A lista final de componentes do projeto.
     * @returns {Promise<Object>} Uma promessa que resolve para um mapa de matérias-primas e suas quantidades.
     * @throws {Error} Deve ser implementado pelas classes concretas.
     */
    async generateMaterialReport(finalComponentList) {
        throw new Error("Method 'generateMaterialReport()' must be implemented by the concrete class.");
    }

    /**
     * @method consolidateReport
     * @description Método para consolidar o orçamento e o relatório de insumos em um único objeto de relatório final.
     * Pode ter uma implementação padrão ou ser sobrescrito pelas classes concretas se a lógica de consolidação variar.
     * @param {Object} quote - O objeto de orçamento gerado.
     * @param {Object} materialReport - O objeto de relatório de insumos gerado.
     * @returns {Object} O relatório final consolidado.
     */
    consolidateReport(quote, materialReport) {
        // Implementação padrão de consolidação
        return {
            quote,
            materialReport,
            // Adicionar outros dados consolidados aqui, se necessário
        };
    }

    /**
     * @method _calculateWeight
     * @description Método auxiliar para calcular o peso de um componente. Pode ser usado pelas classes concretas.
     * @param {string} componentId - O ID do componente.
     * @param {number} quantity - A quantidade do componente.
     * @returns {number} O peso total do componente.
     * @protected
     */
    _calculateWeight(componentId, quantity) {
        const item = this.catalog.find(p => p.id === componentId);
        if (item && item.peso) {
            return item.peso * quantity;
        }
        return 0;
    }
}

module.exports = AbstractQuotationService;
