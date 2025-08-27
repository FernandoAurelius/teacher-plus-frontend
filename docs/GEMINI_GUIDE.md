# GEMINI.md – Guia de Uso da Gemini CLI no Projeto

> **Objetivo**: padronizar como usamos a *Gemini CLI* (agente de IA em linha de comando) e a Google Gen AI SDK para acelerar o desenvolvimento, mantendo segurança, rastreabilidade e qualidade de código.

---

## 1 Visão Geral

A **Gemini CLI** é um agente open‑source mantido pelo Google que utiliza a família de modelos *Gemini Pro* para responder prompts e executar fluxos *ReAct* no terminal. Neste projeto ela servirá como:

* Gerador de trechos TypeScript/Vue/Tailwind.
* Explicador de código legado.
* Assistente para testes Vitest/Cypress.
* Redator de documentação (ex.: comentários JSDoc, trechos README).

## 2 Instalação

```bash
npm install -g @google/gemini-cli
# opcional para atualizar
npm update -g @google/gemini-cli
```

## 3 Autenticação

1. Crie uma chave em [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Defina no shell (não versionar!):

   ```bash
   export GEMINI_API_KEY="<sua-key>"
   ``
   ```
3. A CLI detecta `GEMINI_API_KEY` automaticamente.

## 4 Comandos Úteis

| Ação            | Exemplo                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| Gerar código    | `gemini code "composable Vue useCountdown com TypeScript"`               |
| Explicar trecho | `gemini explain src/components/QuizTimer.vue`                            |
| Refatorar       | `gemini fix src/stores/quiz.ts --goal "replace any with explicit types"` |
| Testes          | `gemini test src/components/Flashcard.vue`                               |
| Docstring       | `gemini doc src/lib/gemini.ts`                                           |

## 5 Boas Práticas de Prompt

* **Contexto conciso**: cole apenas a parte relevante do arquivo.
* **Expectativa clara**: indique formato de saída (ex.: “retorne apenas PATCH git”).
* **Token‑budget**: limite a 200–300 linhas de código por prompt.
* **Idioma**: escreva prompts em **português**, mas peça comentários em inglês se for para JSDoc.

### Template recomendado

```txt
# Função
descrição curta

## Arquivo alvo
path/nome.ext

## Goal
bullet list do que mudar

## Constraints
• Stack: Vue 3, Tailwind v4, Composition API
• Estilo ESLint padrão projeto
• Saída: git patch somente
```

## 6 Registro de Atividades

1. Toda execução relevante deve ser logada no `docs/ai_logs/YYYY-MM-DD.md`:

   ```md
   ### 2025‑07‑29 | gemini code (QuizStore)
   *Prompt*: …
   *Resumo da resposta*: …
   *Commit*: abc123
   ```
2. Commits assistidos devem conter `[AI]` no começo da mensagem.
3. Pull Requests devem citar os arquivos de log correspondentes.

## 7 Política de Segurança

* **Proibido** colar secrets, `.env` ou dados de usuário nos prompts.
* Use placeholders (`<TOKEN>`).
* Limite a 30 requisições/min para evitar rate‑limit.

## 8 Integração com SDK

* Wrapper `src/lib/gemini.ts` já exporta `generateContent()` para uso runtime.
* Não misturar CLI e SDK em tests; mockar SDK com Vitest.

## 9 Testes e QA

* Código gerado deve ter testes Vitest ≥ 90 % cobertos antes do merge.
* Rodar `npm run lint` e `npm run typecheck` pós‑geração.

## 10 Custos & Cotas

* Free tier: 60 req/min, 1000 req/dia.
* Monitorar var `AI_QUOTA_USED` no README semanalmente.

---

**Revisão:** Atualizar este arquivo quando a Google alterar limites, modelo ou CLI major version.
