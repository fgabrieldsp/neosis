# 🏛️ algoritmomestre.md — A Lógica Central do NeoSIS (v5.1)

## Objetivo
O objetivo deste algoritmo é traduzir uma requisição de projeto em um orçamento de engenharia e um relatório de insumos, utilizando um modelo de decomposição de módulos e custeio paramétrico.

## 1. Entidades e Variáveis Principais

### 1.1. Catálogo de Peças (`catalog.json`)
O sistema conhece um dicionário de todas as peças e materiais, que possuem:
- **`id`**: um identificador único (ex: `pilar_ferro_padrao`, `vara_aco_6m`).
- **`categoria`**: metal, madeira, servicos, **materia_prima_aco**, etc.
- **Propriedades Físicas**: `peso`, `comprimento`, etc.
- **Receita de Fabricação (`manufacturing_recipe`)**: Para peças acabadas, descreve qual matéria-prima é usada.

### 1.2. Blueprints de Modulação (`blueprints.json`)
Define as "receitas" para cada tipo de modulação, contendo:
- **`id`**: um nome único (ex: `Ferro_Reto_LL`).
- **`regras_de_contagem`**: fórmulas para componentes estruturais (ex: `pillar_rule: "N+1"`).
- **`modulos_base`**: a lista de "receitas" para cada módulo, contendo as peças principais do vão.

### 1.3. Painel de Parâmetros (`config.json`)
O centro de controle financeiro. Contém todos os custos unitários e variáveis de negócio:
- **Custos de Materiais**: `valor_aco_kg`, `valor_tela_m2`.
- **Custos de Serviços**: `custo_base_ferro_un`, `preco_pintura_m2`.
- **Financeiro**: `bdi_percent`, `tax_percent`.

---

## 2. Processo Principal (Função `generateQuote`)

INÍCIO

1.  **RECEBER** a lista de `blocosDoProjeto`.
2.  **INICIALIZAR** um `mapaDeComponentesTotal` vazio.
3.  **PARA CADA** `bloco` na lista:
    a. **EXECUTAR** a `Sub-rotina de Contagem de Componentes` para o `bloco`.
    b. **SOMAR** o resultado ao `mapaDeComponentesTotal`.
4.  **EXECUTAR** a `Sub-rotina de Custeio Paramétrico` com o `mapaDeComponentesTotal` para gerar a lista de materiais do cliente.
5.  **EXECUTAR** a `Sub-rotina de Relatório de Insumos` para gerar a lista de matérias-primas.
6.  **EXECUTAR** a `Sub-rotina de Consolidação de Relatório` para montar o objeto final.
7.  **RETORNAR** o `relatorioFinal` (contendo orçamento e relatório de insumos).

FIM

---

## 3. Sub-rotinas

### 3.1. Contagem de Componentes (`getComponentListForBlock`)
1.  **LER** o `bloco` e consultar o `blueprint` correspondente.
2.  **EXECUTAR** o `Algoritmo de Decomposição` para obter a lista de `módulos_base`.
3.  **APLICAR** as `regras_de_contagem` (ex: `Pilares = N Módulos + 1`).
4.  **PARA CADA** tipo de módulo na decomposição:
    a. **SOMAR** os componentes definidos no `blueprint`.
    b. **CALCULAR** dinamicamente os componentes baseados em regras (ex: `Kits de Fixação = Perímetro / 0.25`).
5.  **SELECIONAR** componentes polimórficos com base no `base_material` (ex: `base_fundacao_ferro` vs `base_fundacao_eucalipto`).
6.  **RETORNAR** a lista de todos os componentes e suas quantidades.

### 3.2. Custeio Paramétrico
1.  **PARA CADA** `componente` na lista total:
    a. **CONSULTAR** suas propriedades físicas no `catalog.json`.
    b. **CALCULAR** os totais físicos do projeto (Peso Total de Aço, Área para Pintura, etc.).
2.  **PARA CADA** `total_fisico` ou `componente`:
    a. **CONSULTAR** o `config.json` para obter o custo unitário correspondente (ex: `valor_aco_kg`, `custo_base_ferro_un`).
    b. **CALCULAR** o custo do serviço/material.
3.  **SOMAR** todos os custos para obter o `subtotal`.

### 3.3. Relatório de Insumos
1.  **PARA CADA** `componente` na lista final:
    a. **VERIFICAR** se possui uma `manufacturing_recipe` no `catalog.json`.
    b. Se sim, **ACUMULAR** a quantidade de matéria-prima necessária.
2.  **CALCULAR** o número de unidades de matéria-prima a comprar (ex: `Nº de Varas = Total de Metros / 6`, arredondado para cima).
3.  **RETORNAR** o relatório de insumos.