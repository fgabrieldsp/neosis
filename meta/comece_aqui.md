# 🚀 NeoSIS — Guia Mestre | Comece Aqui

## 🔥 Missão
Este documento é a ROM (Read-Only Memory) Cognitiva do projeto **NeoSIS**. Ele serve como um sistema operacional conceitual para a colaboração entre humanos e a IA no desenvolvimento deste software.

A missão é construir um **software comercial robusto, escalável e de fácil manutenção para cálculos de engenharia e orçamento**, utilizando uma metodologia que garante clareza, rastreabilidade e evolução contínua do contexto.

## 🏛 Estrutura do Projeto
O NeoSIS é organizado sobre uma arquitetura limpa, documentada nos seguintes arquivos de controle:

- `comece_aqui.md` — **(Você está aqui)** O Guia Mestre que explica a filosofia do projeto.
- `metadados.xml` — Contém os parâmetros de configuração e regras operacionais do NeoSIS.
- `metadados.md` — O diário de bordo narrativo, com a filosofia, a história e a evolução da arquitetura e lógica do NeoSIS.
- `mapa_codigo.md` — A arquitetura técnica do NeoSIS: a estrutura de pastas e arquivos.
- `controle_versao.md` — A linha do tempo cronológica das mudanças no projeto.
- `snapshot.md` — Um "instantâneo" que descreve o estado exato do projeto em um dado momento.

## ✅ Como Trabalhar no NeoSIS
1.  **Entenda a Filosofia:** Leia este guia e o `metadados.md` para compreender o "porquê" do projeto.
2.  **Consulte a Arquitetura:** Use o `mapa_codigo.md` para navegar pela estrutura de arquivos.
3.  **Acesse os Dados:** Os parâmetros dinâmicos (materiais, preços, regras de montagem) residem nos arquivos `.json` dentro do diretório `/data`.
4.  **Encontre a Lógica:** O "cérebro" dos cálculos está em `/backend/services/quotationService.js`.
5.  **Mantenha a Sincronia:** Após modificações relevantes na estrutura ou lógica, sempre utilize o comando `ATUALIZAR_ECOSISTEMA` para manter os arquivos de controle consistentes.

---

👾 **O NeoSIS nasceu da colaboração entre um especialista de domínio humano e uma inteligência artificial. Nosso objetivo é transformar conhecimento de engenharia em uma ferramenta de software precisa e elegante.**