Estrutura de Diretórios e Arquivos
/
├── backend/
│   ├── services/
│   │   ├── AbstractQuotationService.js  # Classe abstrata base para serviços de cotação (define interface e métodos comuns).
│   │   └── quotationService.js  # O motor de decomposição e custeio paramétrico.
│   └── index.js                # Ponto de entrada do backend (servidor Node.js com Express).
│
├── data/
│   ├── catalog.json            # Dicionário de peças com suas propriedades FÍSICAS e receitas.
│   ├── blueprints.json         # "Plantas" que definem as regras de contagem e as receitas dos Módulos Base.
│   └── config.json             # Painel de Parâmetros: centraliza todos os custos e variáveis de negócio.
│
├── frontend/
│   ├── css/
│   │   └── style.css           # Estilos customizados da aplicação.
│   ├── js/
│   │   ├── utils.js            # Funções compartilhadas e utilitárias (ex: formatCurrency, buildFormFields).
│   │   └── app.js              # Cérebro do Frontend: lógica da calculadora e do painel de parâmetros.
│   └── index.html              # A página única da aplicação (Single Page Application).
│
├── meta/
│   ├── comece_aqui.md          # O Guia Mestre que explica a filosofia do projeto (ROM Cognitiva).
│   ├── algoritmomestre.md      # Documento conceitual que descreve a lógica de decomposição e custeio.
│   ├── mapa_codigo.md          # A arquitetura técnica do projeto (este arquivo).
│   ├── metadados.md            # Diário de bordo narrativo com a filosofia e evolução do projeto.
│   ├── controle_versao.md      # Histórico de versões e mudanças do projeto.
│   ├── snapshot.md             # "Instantâneos" que descrevem o estado do projeto em momentos chave.
│   └── metadados.xml           # Parâmetros de configuração e regras operacionais do ecossistema NeoSIS.
│
├── node_modules/ # Diretório com as dependências do Node.js (gerenciado pelo npm).
│
├── package.json                # Define as dependências e scripts do projeto Node.js.
└── package-lock.json           # Grava as versões exatas das dependências para garantir consistência.