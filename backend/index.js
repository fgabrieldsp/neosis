// backend/index.js

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { generateQuote } = require('./services/quotationService.js');

const app = express();
const PORT = 3080;

// --- MIDDLEWARE ---
// Habilita CORS para permitir que o frontend (em um domínio diferente durante o desenvolvimento) acesse a API.
app.use(cors());
// Habilita o parsing de JSON no corpo das requisições, com um limite de 10mb para projetos maiores.
app.use(express.json({ limit: '10mb' }));

// --- SERVIR ARQUIVOS ESTÁTICOS ---
// Aponta para a pasta 'frontend' para servir o index.html e seus assets (JS, CSS).
// O path.join garante que isso funcione em qualquer sistema operacional.
app.use(express.static(path.join(__dirname, '../frontend')));


// --- FUNÇÕES AUXILIARES DE DADOS ---

/**
 * Lê e faz o parse de um arquivo JSON do diretório /data.
 * @param {string} fileName - O nome do arquivo a ser lido (ex: 'config.json').
 * @returns {Promise<object>} O conteúdo do arquivo como um objeto JavaScript.
 */
const readDataFile = async (fileName) => {
    const filePath = path.join(__dirname, '../data', fileName);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erro ao ler o arquivo ${fileName}:`, error);
        throw new Error(`Não foi possível ler o arquivo de dados ${fileName}.`);
    }
};

/**
 * Escreve um objeto JavaScript em um arquivo JSON no diretório /data.
 * @param {string} fileName - O nome do arquivo a ser escrito (ex: 'config.json').
 * @param {object} content - O objeto a ser salvo como JSON.
 */
const writeDataFile = async (fileName, content) => {
    const filePath = path.join(__dirname, '../data', fileName);
    try {
        // JSON.stringify com null e 2 para formatar o arquivo de forma legível (pretty-print).
        await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Erro ao salvar o arquivo ${fileName}:`, error);
        throw new Error(`Não foi possível salvar o arquivo de dados ${fileName}.`);
    }
};


// --- ENDPOINTS DA API ---

// Endpoint para fornecer os modelos estruturais disponíveis para o seletor do frontend.
app.get('/api/blueprints', async (req, res) => {
    try {
        const blueprints = await readDataFile('blueprints.json');
        // Formata os dados para o formato que o frontend espera (id, name).
        const blueprintOptions = Object.keys(blueprints).map(key => ({
            id: key,
            name: blueprints[key].name 
        }));
        res.json(blueprintOptions);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível carregar os modelos estruturais.' });
    }
});

// O endpoint principal que recebe um projeto e retorna o orçamento calculado.
app.post('/api/quote', (req, res) => {
    try {
        const { projectBlocks, overrides, profileMapping } = req.body;
        if (!projectBlocks || !Array.isArray(projectBlocks)) {
            return res.status(400).json({ error: 'A entrada deve ser um array de blocos de projeto válido.' });
        }
        // Chama a função central do motor de cálculo.
        const report = generateQuote(projectBlocks, overrides, profileMapping);
        res.json(report);
    } catch (error) {
        console.error("Erro ao gerar orçamento:", error.stack);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor ao gerar o orçamento.' });
    }
});

// Endpoint para fornecer os dados de configuração para o painel de parâmetros.
app.get('/api/data/config', async (req, res) => {
    try {
        const data = await readDataFile('config.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível ler as configurações.' });
    }
});

// Endpoint para fornecer o catálogo de peças, necessário para a configuração de perfis.
app.get('/api/data/catalog', async (req, res) => {
    try {
        const data = await readDataFile('catalog.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível ler o catálogo.' });
    }
});

// Endpoint para salvar as novas configurações padrão enviadas pelo painel de parâmetros.
app.post('/api/data/config', async (req, res) => {
    try {
        await writeDataFile('config.json', req.body);
        res.json({ success: true, message: 'Configurações salvas com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível salvar as configurações.' });
    }
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor do Backend NeoSIS v5.3 rodando na porta ${PORT}`);
    console.log(`   Acesse a aplicação em http://localhost:${PORT}`);
});
