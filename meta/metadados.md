# Metadados Narrativos — Projeto NeoSIS

## Filosofia
Este template permite que qualquer pessoa, independentemente do nível técnico, consiga entender, evoluir e participar de projetos de desenvolvimento com suporte de IA. O objetivo é permitir continuidade, transferência de conhecimento e expansão modular, validando a hipótese de que uma ROM cognitiva melhora drasticamente a colaboração homem-IA.

---

## Evolução do Projeto

### Fase de Flexibilidade de Engenharia (v5.3)
Com o sistema estável e a interface de simulação implementada na v5.2, o próximo passo natural foi atacar a rigidez da engenharia do projeto. A pergunta norteadora foi: "Como permitir que o usuário use diferentes perfis de aço para diferentes partes da estrutura em um mesmo projeto?". A resposta exigiu uma refatoração arquitetural na base de dados. O `catalog.json` foi reestruturado para desacoplar a "função" de uma peça (ex: "pilar") de seu "perfil físico" (ex: "Tubo 100x100x3"). Isso foi alcançado com a criação de uma **biblioteca de perfis metálicos** e a modificação dos componentes para apontarem para um perfil padrão, que pode ser sobrescrito dinamicamente. O motor de cálculo foi ensinado a utilizar essa nova estrutura, tornando-se capaz de receber um "mapeamento de perfis" e recalcular instantaneamente peso, área de superfície e custos. Adicionalmente, a granularidade dos custos foi aprimorada com a adição do serviço de "Usinagem" e a correta separação entre o material e o serviço da fundação, refinando ainda mais a precisão do orçamento.

### Fase de Interatividade Avançada (v5.2)
Após consolidar o motor de cálculo na v5.1, o foco se voltou para dar ao usuário controle total sobre as variáveis do sistema e visibilidade completa sobre os resultados. A meta era transformar o NeoSIS de uma calculadora precisa em uma ferramenta de análise e simulação de cenários.
1.  **Painel de Parâmetros Integrado:** A principal entrega foi a implementação de um painel de simulação em tempo real. Após um processo iterativo de desenvolvimento e depuração, a solução final adotou um padrão de aplicação de página única, com um componente dinâmico renderizado pelo `app.js`.
2.  **Visibilidade Total de Custos:** A API foi redesenhada para retornar uma estrutura de custos detalhada, permitindo à interface exibir o valor de cada serviço individualmente (fundação, pintura, montagem, etc.).
3.  **Correção e Robustez:** Múltiplos bugs críticos de lógica, dados e configuração de servidor foram identificados e corrigidos, resultando em um sistema estável.


### Fase de Interatividade Avançada (v5.2)
Após consolidar o motor de cálculo na v5.1, o foco se voltou para dar ao usuário controle total sobre as variáveis do sistema e visibilidade completa sobre os resultados. A meta era transformar o NeoSIS de uma calculadora precisa em uma ferramenta de análise e simulação de cenários.
1.  **Painel de Parâmetros Integrado:** A principal entrega foi a implementação de um painel de simulação em tempo real. Após um processo iterativo de desenvolvimento e depuração para encontrar a arquitetura correta e evitar "remendos", a solução final adotou um padrão de aplicação de página única. A funcionalidade foi implementada como um componente dinâmico, renderizado pelo `app.js` e utilizando um módulo compartilhado (`utils.js`), garantindo uma arquitetura limpa e sem duplicação de código.
2.  **Visibilidade Total de Custos:** Uma demanda crítica do especialista de domínio foi atendida: a capacidade de ver o custo de cada serviço individualmente. A estrutura de dados retornada pela API foi redesenhada para separar os custos em "materiais" e "serviços detalhados". A interface, na aba "Análise de Custos", agora exibe claramente o valor de cada serviço (fundação, pintura, montagem, etc.), permitindo uma análise granular e precisa do orçamento.
3.  **Correção e Robustez:** Durante a implementação, um erro crítico na formatação do arquivo de dados `config.json` foi identificado como a causa raiz de instabilidades no cálculo. A correção deste arquivo, juntamente com a refatoração do motor de cálculo para ser mais explícito e robusto no manuseio de parâmetros, estabilizou o sistema de forma definitiva.

Esta fase elevou drasticamente a usabilidade e o valor profissional do NeoSIS, entregando o controle e a transparência necessários para a tomada de decisão no dia a dia.

### Fase de Consolidação (v5.1): Da Teoria à Realidade da Produção
... (seção anterior permanece a mesma)

## Evolução do Projeto

### Fase de Abstração (v3.x) e Interação (v4.0)
A arquitetura inicial do NeoSIS foi projetada para ser flexível, evoluindo da abstração do cálculo para uma aplicação interativa. O marco inicial foi formalizar o processo de cálculo em duas fases: **Contagem Raiz** e **Materialização**. A Fase 4.0 introduziu a interface de usuário (UI) e um servidor de API para conectar as duas pontas.

### Fase de Refinamento (v5.0): O Motor de Decomposição Paramétrico
A grande evolução da v5.0 foi a mudança para um **"Motor de Decomposição e Custeio Paramétrico"**. A nova filosofia é: "O usuário informa a necessidade (X vagas), e o sistema descobre a melhor forma de construir", decompondo o projeto em "Módulos Base" e aplicando custos a partir de um `config.json` centralizado.

### Fase de Consolidação (v5.1): Da Teoria à Realidade da Produção
Após a validação do motor v5.0, a fase seguinte focou em injetar um nível mais profundo de conhecimento de negócio, aproximando o software da realidade da produção e da montagem.
1.  **Consciência de Matéria-Prima:** A evolução mais significativa foi a introdução da distinção entre a **lista de materiais para o cliente** (peças acabadas) e a **lista de insumos para a fábrica** (matéria-prima). O sistema agora entende que uma "Longarina de 7.5m" é fabricada a partir de "Varas de Aço de 6m", gerando um relatório de produção (`manufacturing_report`) que não interfere no orçamento final, mas que é vital para o controle de estoque e produção.
2.  **Lógica Polimórfica:** O sistema tornou-se mais inteligente e sensível ao contexto. Componentes como a "fundação" deixaram de ser genéricos e passaram a ser "polimórficos": o sistema seleciona e custeia automaticamente a "Base Concretada" para estruturas de ferro e a "Sapata de Fixação" para estruturas de eucalipto.
3.  **Cálculos Dinâmicos:** A quantificação de componentes como o "Kit de Fixação" evoluiu de um número estático para um cálculo dinâmico baseado em regras de negócio (perímetro do módulo), tornando o orçamento mais preciso e adaptável.

Esta fase consolidou o NeoSIS como uma ferramenta que não apenas orça, mas que também compreende nuances do processo de engenharia e fabricação.

## Evolução do Projeto até v4.0: Do Algoritmo à Interface Inteligente

A arquitetura do NeoSIS foi projetada para ser flexível, evoluindo da abstração do cálculo para uma aplicação interativa.

### Fase de Abstração (v3.x)
O marco inicial foi formalizar o processo de cálculo em duas fases. Primeiro, a **Contagem Raiz** calcula as quantidades de componentes (pilares, longarinas, etc.). Essa lógica evoluiu de simples fórmulas para um motor de **padrões de cálculo** (`calculation_pattern`) definidos nos `blueprints`, permitindo cenários complexos como "FF_Pilar_T" e "Vaga_Isolada_Sem_Modulacao". Em seguida, a fase de **Materialização** "veste" essa lista com os materiais do `catalog.json` para calcular custos, peso e outras nuances.

### Fase de Interação (v4.0)
Com o motor de cálculo consolidado, o projeto evoluiu para a construção de uma interface de usuário (UI). Para isso, a arquitetura foi expandida com um **servidor de API** (`backend/index.js`). Este servidor tem duas responsabilidades principais:

1.  **Expor a Lógica de Cálculo:** Disponibiliza a função `generateQuote` para que o frontend possa enviar projetos e receber orçamentos em JSON.
2.  **Fornecer Dados Dinâmicos:** Informa à interface quais modelos estruturais estão disponíveis no `data/blueprints.json`, tornando a UI automaticamente atualizável.

O frontend (`frontend/app.js`) foi construído para consumir esses serviços, garantindo uma experiência de usuário fluida e reativa. 

# Metadados Narrativos — Projeto NeoSIS

## Filosofia
Este template permite que qualquer pessoa, independentemente do nível técnico, consiga entender, evoluir e participar de projetos de desenvolvimento com suporte de IA. O objetivo é permitir continuidade, transferência de conhecimento e expansão modular, validando a hipótese de que uma ROM cognitiva melhora drasticamente a colaboração homem-IA.

---

## Evolução do Projeto

### Fase de Abstração (v3.x) e Interação (v4.0)
A arquitetura inicial do NeoSIS foi projetada para ser flexível, evoluindo da abstração do cálculo para uma aplicação interativa. O marco inicial foi formalizar o processo de cálculo em duas fases: **Contagem Raiz** e **Materialização**, utilizando um motor de **padrões de cálculo** (`calculation_pattern`). Com o motor de cálculo consolidado, a Fase 4.0 introduziu a interface de usuário (UI) e um servidor de API para conectar as duas pontas, resultando em uma aplicação mínima viável.

### Fase de Refinamento (v5.0): O Motor de Decomposição Paramétrico
Após a implementação do MVP v4.0, a fase de "mão na massa" revelou uma oportunidade de refinar drasticamente a inteligência do sistema. A lógica baseada em `calculation_pattern` fixos, embora funcional, era rígida e não refletia a flexibilidade necessária para a montagem de orçamentos no mundo real.

A grande evolução da v5.0 foi a mudança para um **"Motor de Decomposição e Custeio Paramétrico"**. A nova filosofia é: "O usuário informa a necessidade (X vagas), e o sistema descobre a melhor forma de construir".

A nova arquitetura lógica se baseia em dois pilares:
1.  **Decomposição Inteligente:** Um bloco de `X` vagas não é mais calculado por uma fórmula única. Em vez disso, ele é decomposto em uma combinação ótima de **"Módulos Base"** (unidades de 2, 3 ou 4 vagas). O sistema então aplica regras de contagem específicas para cada tipo de modulação (`LL`, `4P`, etc.) para determinar a quantidade de peças estruturais (ex: `Pilares = N Módulos + 1`).
2.  **Custeio Paramétrico:** Os custos foram totalmente desacoplados da lógica de contagem. O arquivo `config.json` foi transformado em um "Painel de Parâmetros" central, onde custos de materiais (R$/kg, R$/m²), serviços e variáveis de negócio podem ser ajustados sem tocar em uma linha de código do motor de cálculo.

Esta nova arquitetura resulta em um sistema mais elegante, preciso e exponencialmente mais flexível, pronto para acomodar novas regras e cenários de engenharia de forma modular.

# Dinâmica do Sistema e Manual de Uso

## Dinâmica do Sistema
O NeoSIS opera como uma plataforma de orçamentação paramétrica e simulação de cenários para projetos modulares. O sistema é composto por três pilares principais:

- **Catálogo de Peças (`catalog.json`)**: Contém todos os componentes físicos e suas propriedades, incluindo perfis metálicos, pesos e receitas de fabricação.
- **Plantas/Blueprints (`blueprints.json`)**: Define as regras de decomposição dos projetos em módulos base e as receitas de montagem.
- **Painel de Parâmetros (`config.json`)**: Centraliza todos os custos (materiais, serviços, variáveis de negócio) e permite ajustes dinâmicos sem necessidade de alterar o código-fonte.

O backend expõe uma API que recebe um projeto (lista de blocos), processa a decomposição, calcula custos e gera relatórios detalhados de materiais e insumos. O frontend consome essa API, permitindo ao usuário simular diferentes cenários em tempo real, ajustar parâmetros e visualizar o impacto de cada decisão.

## Painel de Parâmetros
O painel de parâmetros é o coração da flexibilidade do NeoSIS. Ele permite:
- Alterar preços de materiais (ex: aço, concreto, pintura) e serviços (ex: montagem, usinagem) diretamente no arquivo `config.json`.
- Ajustar variáveis de negócio, como margens, impostos e coeficientes de desperdício.
- Simular cenários alterando parâmetros e visualizando instantaneamente o impacto no orçamento e na lista de insumos.

Todas as alterações são refletidas imediatamente nos cálculos, sem necessidade de reiniciar o sistema ou modificar o código.

## Mini Manual para o Futuro README

### Como usar o NeoSIS
1. **Configuração Inicial:**
   - Edite os arquivos em `data/` para cadastrar novos componentes, receitas ou ajustar parâmetros de custo.
2. **Execução:**
   - Inicie o backend (`node backend/index.js`).
   - Abra o `frontend/index.html` em seu navegador.
3. **Simulação:**
   - Use o painel de parâmetros para ajustar custos e variáveis.
   - Insira os dados do projeto e visualize o orçamento detalhado e o relatório de insumos.
4. **Personalização:**
   - Para novas regras de decomposição ou tipos de módulos, edite `blueprints.json`.
   - Para novos perfis ou componentes, edite `catalog.json`.

### Recomendações
- Sempre mantenha um backup dos arquivos de dados antes de grandes alterações.
- Consulte o arquivo `algoritmomestre.md` para entender a lógica de decomposição e custeio.
- Use o painel de parâmetros para simulações rápidas e análise de sensibilidade de custos.

---