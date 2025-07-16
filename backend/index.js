// VERSÃO FINAL CORRIGIDA - Adicionada a rota para o catalog.json

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { generateQuote } = require('./services/quotationService.js');

const app = express();
const PORT = 3080;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Servir os arquivos estáticos da pasta 'frontend'
app.use(express.static(path.join(__dirname, '../frontend')));


// --- FUNÇÕES AUXILIARES ---
const readDataFile = async (fileName) => {
    const filePath = path.join(__dirname, '../data', fileName);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Não foi possível ler o arquivo de dados ${fileName}.`);
    }
};

const writeDataFile = async (fileName, content) => {
    const filePath = path.join(__dirname, '../data', fileName);
    try {
        await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
    } catch (error) {
        throw new Error(`Não foi possível salvar o arquivo de dados ${fileName}.`);
    }
};


// --- ENDPOINTS DA API ---

app.get('/api/blueprints', async (req, res) => {
    try {
        const blueprints = await readDataFile('blueprints.json');
        const blueprintOptions = Object.keys(blueprints).map(key => ({
            id: key,
            name: blueprints[key].name 
        }));
        res.json(blueprintOptions);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível carregar os modelos estruturais.' });
    }
});

app.post('/api/quote', (req, res) => {
    try {
        const { projectBlocks, overrides, profileMapping } = req.body;
        if (!projectBlocks || !Array.isArray(projectBlocks)) {
            return res.status(400).json({ error: 'A entrada deve ser um array de blocos de projeto válido.' });
        }
        const report = generateQuote(projectBlocks, overrides, profileMapping);
        res.json(report);
    } catch (error) {
        console.error("Erro ao gerar orçamento:", error.stack);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor ao gerar o orçamento.' });
    }
});

app.get('/api/data/config', async (req, res) => {
    try {
        const data = await readDataFile('config.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível ler as configurações.' });
    }
});

// ### ROTA FALTANTE ADICIONADA AQUI ###
app.get('/api/data/catalog', async (req, res) => {
    try {
        const data = await readDataFile('catalog.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível ler o catálogo.' });
    }
});

app.post('/api/data/config', async (req, res) => {
    try {
        await writeDataFile('config.json', req.body);
        res.json({ success: true, message: 'Configurações salvas com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível salvar as configurações.' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor do Backend NeoSIS v5.2 rodando na porta ${PORT}`);
    console.log(`   Acesse a aplicação em http://localhost:${PORT}`);
});