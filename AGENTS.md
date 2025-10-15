# GEMINI.md – Instruções de Contexto para a *Gemini CLI*

---

## 1 Contexto Resumido do Projeto

* **Domínio:** plataforma educacional que gera e corrige provas ENEM, oferece feedback via IA e cria planos de estudo/flashcards.
* **Stack front‑end:** Vue 3 (Composition API + Pinia), Tailwind CSS v4, Axios, jsPDF, Google Gemini SDK para IA.
* **Arquitetura desejada:** SOLID + Clean Architecture (frontend em Feature‑Sliced).

  > *A LLM deve produzir código que NÃO quebre esses princípios.*

## 2 Regras de Código e Arquitetura

### 2.1 Padrões obrigatórios

| Tema                | Regra                                                                              | Exemplo                                      |
| ------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- |
| **SRP**             | Um componente/composable = 1 responsabilidade clara.                               | `useTimer.ts` só lida com cronometragem.     |
| **Dependência**     | Serviços externos (Axios, Gemini) devem ser injetados, não importados diretamente. | `const http = useHttp()`                     |
| **Estrutura FSD**   | Arquivos em `src/{shared,entities,features}/...`.                                  | `src/features/quiz/ui/QuizRunView.vue`       |
| **Nomenclatura**    | PascalCase p/ components, kebab-case p/ files, sufixo *Store* para Pinia.          | `quizStore.ts`                               |
| **Estilo Tailwind** | Apenas classes utilitárias; proibir CSS inline; radius e cores via tokens.         | `class="bg-primary text-white rounded-md"`   |
| **Comentários**     | JSDoc de *intenção* no topo; sem repetir óbvio do código.                          | `/** Cria PDF A4 com cabeçalho da escola */` |

### 2.2 Anti‑Padrões proibidos

* *God components* (>200 LOC).
* Lógica de negócios dentro do template Vue.
* Mutação direta de estado Pinia fora de actions.
* Strings de chave API hard‑coded.

## 4 Padrão de Saída Esperada

1. **Se for código único**: bloco `ts / `vue dentro de Markdown.
2. **Se múltiplos arquivos**: JSON no último bloco com `"path": "conteúdo base64"`.
3. **Checklist interno** no fim confirmando: lint ✔, tests ✔, SOLID ✔.

## 5 Auto‑Validação (responsabilidade da LLM)

Antes de retornar, a IA deve:

* Deve...?

## 8 Referência Rápida de Bibliotecas

* **Tailwind v4 Plugin** (`@tailwindcss/vite`) – obrigatório.
* **Axios instance** em `src/shared/api/hlient.ts`.
* **jsPDF** v2 para exportar A4.

---

> **Resumo para a IA:** produzir código Vue 3/TS seguindo SOLID + FSD, sem anti‑padrões, testes incluídos, saídas claras conforme seção 4, e registrar todo prompt/resposta.
