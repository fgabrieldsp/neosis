# 📚 leia-me.md — Guia de Início Rápido do NeoSIS 🚀

Bem-vindo ao **NeoSIS**!

O NeoSIS é um software comercial robusto e flexível para cálculos de engenharia e orçamento, com foco em estruturas modulares. Ele permite a simulação de cenários em tempo real, a customização de parâmetros de custo e a geração de relatórios detalhados de orçamento e insumos.

Este guia rápido o ajudará a configurar e iniciar o sistema.

---

## 🛠️ Tecnologias Utilizadas

O NeoSIS é construído com as seguintes tecnologias principais:

**Backend:**
- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express.js**: Framework web para Node.js, utilizado para construir a API REST.
- **JSON**: Formato de dados para o catálogo, blueprints e configurações.

**Frontend:**
- **HTML5**: Estrutura da página web.
- **CSS3**: Estilização da interface de usuário.
- **JavaScript (ES6+)**: Lógica interativa do lado do cliente.
- **Bootstrap**: Framework CSS para design responsivo e componentes de UI.

**Gerenciamento de Pacotes:**
- **npm**: Gerenciador de pacotes para dependências do Node.js.

---

## 🏛️ Estrutura do Projeto

O projeto NeoSIS segue uma arquitetura limpa e modular. Para uma visão detalhada da estrutura de diretórios e arquivos, consulte o documento `meta/mapa_codigo.md`.

Os principais diretórios são:

- `backend/`: Contém a lógica de negócio e o servidor da API.
- `data/`: Armazena os arquivos JSON com o catálogo de peças, blueprints e configurações.
- `frontend/`: Contém os arquivos da interface de usuário (HTML, CSS, JavaScript).
- `meta/`: Armazena os documentos de metadados do projeto (o "ROM Cognitiva").

---

## ▶️ Como Iniciar o Sistema

Siga os passos abaixo para colocar o NeoSIS em funcionamento:

### 1. Instalar Dependências do Backend

Navegue até o diretório raiz do projeto no seu terminal e execute o comando para instalar as dependências do Node.js:

```bash
npm install
```

### 2. Iniciar o Backend (Servidor API)

Ainda no diretório raiz do projeto, inicie o servidor Node.js:

```bash
node backend/index.js
```

Você deverá ver uma mensagem no console indicando que o servidor está rodando (ex: "Servidor rodando na porta 3000").

### 3. Abrir a Interface do Usuário (Frontend)

Com o servidor backend em execução, abra o arquivo `frontend/index.html` em seu navegador web preferido.

> **Dica:** Você pode simplesmente arrastar e soltar o arquivo `index.html` para a janela do navegador, ou usar uma extensão de servidor local (como "Live Server" para VS Code) para servi-lo, o que é recomendado para desenvolvimento.

---

## ⚙️ Configuração e Personalização

O NeoSIS é altamente configurável através dos arquivos JSON no diretório `data/`:

- **`data/config.json`**: Painel de Parâmetros. Edite este arquivo para ajustar custos de materiais (R$/kg, R$/m²), custos de serviços (montagem, usinagem, pintura), variáveis financeiras (BDI, impostos) e outras variáveis de negócio. As alterações são refletidas nos cálculos em tempo real na interface.
- **`data/catalog.json`**: Catálogo de Peças. Defina novas peças, materiais, suas propriedades físicas (peso, comprimento) e receitas de fabricação.
- **`data/blueprints.json`**: Blueprints de Modulação. Crie ou edite as "receitas" para diferentes tipos de estruturas, definindo regras de contagem e os módulos base.

---

## 💡 Recomendações

- **Backup:** Sempre faça um backup dos arquivos em `data/` antes de realizar grandes alterações.
- **Lógica Central:** Para entender a lógica de decomposição e custeio, consulte o documento `meta/algoritmomestre.md`.
- **Simulação:** Utilize o painel de parâmetros na interface para simulações rápidas e análise de sensibilidade de custos.
- **Documentação:** Mantenha-se atualizado com os documentos em `meta/` para entender a evolução e a filosofia do projeto.

---

Desenvolvido com a colaboração entre um especialista de domínio humano e uma inteligência artificial.