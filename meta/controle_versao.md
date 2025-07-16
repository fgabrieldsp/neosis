# 🕓 controle_versao.md — Linha do Tempo

## 🔖 v5.3.0 — 2025-07-14
- **Implementação da Seleção Dinâmica de Perfis:**
    - **Feature:** O sistema agora permite a seleção, por projeto, do perfil metálico específico a ser usado para cada tipo de componente (pilar, braço, longarina, etc.), tornando o orçamento totalmente customizável.
    - **Refatoração:** O `catalog.json` foi reestruturado para desacoplar a "função" da peça de seu "perfil físico", com a criação de uma biblioteca de `perfis_metalicos` e componentes que utilizam um `default_profile_id`.
    - **Refatoração:** O motor de cálculo (`quotationService.js`) foi atualizado para utilizar o perfil selecionado pelo usuário ou o perfil padrão, calculando peso e área de superfície dinamicamente.
- **Adição de Novos Custos de Serviço e Refinamento:**
    - **Feature:** Adicionado um novo custo de serviço para "Usinagem" (cortes, preparação), calculado com base no peso total do aço (R$/kg) e ajustável no painel de parâmetros.
    - **Refatoração:** O custo da "Base de Fundação" foi corretamente desmembrado em um item de **material** (a sapata metálica) e um item de **serviço** (a instalação), para maior precisão na análise de custos.
- **Melhoria de UI/UX:**
    - **Feature:** O card de indicador "Total + BDI" foi substituído pelo indicador "Preço / m²", mais relevante para a análise de custos do negócio.


## 🔖 v5.2.0 — 2025-07-14
- **Implementação da Interface de Simulação em Tempo Real:**
    - **Feature:** Implementado um painel de parâmetros integrado à interface principal, permitindo a edição e simulação de todas as variáveis de negócio em tempo real.
    - **Feature:** O painel permite tanto a simulação temporária (para análise de cenários) quanto a gravação permanente de novos valores padrão no `config.json`.
- **Implementação da Visibilidade Detalhada de Custos:**
    - **Feature:** A API e a interface agora processam e exibem uma análise de custos detalhada, separando os custos de materiais e cada serviço individualmente (Fundação, Pintura, Montagem, Logística, etc.).
- **Refatoração e Correção de Bugs Críticos:**
    - **Refatoração:** A arquitetura do frontend foi otimizada com a criação de um módulo de utilitários (`utils.js`), eliminando código duplicado e seguindo um padrão de desenvolvimento mais limpo.
    - **Refatoração:** O motor de cálculo (`quotationService.js`) foi reescrito com uma lógica mais robusta e explícita para o manuseio de parâmetros dinâmicos.
    - **Correção de Bug Crítico:** Identificado e corrigido um erro de formatação no `config.json` que era a causa raiz de falhas de cálculo e exibição.

## 🔖 v5.1.0 — 2025-07-14
- **Refinamento do Motor de Cálculo v5:**
    - **Implementada a Camada de Matéria-Prima:** O sistema agora diferencia "peças acabadas" de "matéria-prima". O `catalog.json` foi enriquecido com receitas de fabricação (`manufacturing_recipe`) e a API agora gera um `manufacturing_report` para controle de insumos.
    - **Implementada a Lógica de Fundações Polimórficas:** O sistema agora seleciona e custeia o tipo de fundação correto ("Base Concretada" para Ferro, "Sapata de Fixação" para Eucalipto) com base no material da estrutura, utilizando custos distintos do `config.json`.
    - **Implementado o Cálculo Dinâmico de Componentes:** A lógica para o "Kit de Fixação de Tela" foi removida de valores estáticos nos `blueprints` e agora é calculada dinamicamente.
- **Correção de Bugs Críticos:**
    - Corrigido o bug que exibia o custo da fundação como R$ 0,00 na lista de materiais.
    - Corrigidos bugs de estabilidade no backend que causavam erros 500.
    - Corrigido o bug da aba "Resumo" que não exibia o conteúdo.

## 🔖 v5.0.0 — 2025-07-11
- **Pivô Arquitetural para "Motor de Decomposição":** A lógica central foi refatorada. O sistema agora decompõe um número de vagas em uma combinação ótima de "Módulos Base".
- **Implementação do Custeio Paramétrico:** Os custos foram desacoplados da lógica e centralizados no arquivo `config.json`.
- **Refatoração do `quotationService.js`:** O serviço foi reescrito para acomodar a nova lógica.

... (versões anteriores)

## (versões anteriores)

## 🔖 v5.0.0 — 2025-07-11
- **Pivô Arquitetural para "Motor de Decomposição":** A lógica central foi refatorada. O sistema agora decompõe um número de vagas em uma combinação ótima de "Módulos Base" (2, 3, 4 vagas).
- **Implementação do Custeio Paramétrico:** Os custos foram desacoplados da lógica e centralizados no arquivo `config.json`, que atua como um "Painel de Parâmetros" para custos de materiais (R$/kg, R$/m²) e serviços.
- **Implementação de Cenários Funcionais:** A lógica de contagem e custeio para as modulações `Ferro / Reto / LL` e `Eucalipto 4P / Reto / LL` foi implementada, testada e depurada, resultando em orçamentos funcionais.
- **Refatoração do `quotationService.js`:** O serviço foi reescrito para acomodar a nova lógica, eliminando os antigos `calculation_pattern`.
- **Validação do Fluxo de Trabalho:** O ciclo completo, desde a seleção na interface até a exibição do orçamento calculado com a nova lógica, foi validado.

## 🔖 v4.0.1 — 2025-07-10
- **Integração Frontend-Backend:** Conexão bem-sucedida entre a interface do usuário e o motor de cálculo. O sistema agora opera de ponta a ponta.
- **Interface Dinâmica:** O frontend agora carrega dinamicamente os modelos estruturais (`blueprints`) a partir do backend, tornando a adição de novos modelos transparente para a interface.
- **UI Funcional:** Implementada a lógica de adicionar/remover blocos, recalcular o orçamento em tempo real e exibir os resultados em cards e tabelas.
- **Servidor de API:** Criado um servidor Node.js com Express para expor a lógica de cálculo através de uma API REST.

... (versões anteriores)
## 🔖 v4.0.0 — 2025-07-10
- **Integração Frontend-Backend:** Conexão bem-sucedida entre a interface do usuário e o motor de cálculo. O sistema agora opera de ponta a ponta.
- **Interface Dinâmica:** O frontend agora carrega dinamicamente os modelos estruturais (`blueprints`) a partir do backend, tornando a adição de novos modelos transparente para a interface.
- **UI Funcional:** Implementada a lógica de adicionar/remover blocos, recalcular o orçamento em tempo real e exibir os resultados em cards e tabelas.
- **Servidor de API:** Criado um servidor Node.js com Express para expor a lógica de cálculo através de uma API REST.

## 🔖 v3.1.0 — 2025-07-09
- **Expansão para Estruturas Metálicas:** O sistema agora tem a lógica fundamental para orçar estruturas de ferro.
- **Modelo de Dados de Metais:** Definido um modelo de dados robusto para perfis metálicos no `catalog.json`.
- **Cálculo de Nuances:** Implementada a lógica para calcular serviços e custos dependentes do material.
- **Blueprint de Ferro:** Criado o primeiro `structureBlueprint` para ferro (`ferro_pilar_simples_3v`).
- **Refinamento do Algoritmo:** O algoritmo mestre foi refinado para um modelo de duas fases: "Contagem Raiz" e "Materialização".

## 🔖 v3.0.0 — 2025-07-09
- **Definição da Lógica de Negócio Avançada:** Incorporação da inteligência de montagem para múltiplos cenários (LL, FF, Vaga Isolada).
- **Projetos Multi-Bloco:** O sistema tornou-se capaz de orçar projetos complexos compostos por múltiplos blocos.

## 🔖 v2.1.1 — 2025-07-09
- **Definição do Manifesto do Projeto:** O arquivo `metadados.md` específico do projeto NeoSIS foi atualizado.

## 🔖 v2.1.0 — 2025-07-09
- **Refatoração Arquitetural:** A arquitetura do projeto foi redefinida para um modelo "Clean Architecture".

## 🔖 v2.0.0 — 2025-07-09
- **Reboot Estratégico:** Início do desenvolvimento do algoritmo unificado (NeoSIS).