# requirements.md – MVP Quiz ENEM Interativo (rev. Gemini SDK & Tailwind v4)

## 1 Objetivo

Permitir que o usuário resolva um conjunto de questões do ENEM dentro da plataforma, com cronometragem, correção automática local e **feedback gerado por IA (Google Gemini‑pro)**. A prova (ou PDF gerado) poderá ser exportada com cabeçalho institucional.

## 2 Requisitos Funcionais

1. **Listar provas disponíveis** – `GET https://api.enem.dev/v1/exams`.
2. **Selecionar prova** – usuário escolhe ano, disciplina, idioma.
3. **Iniciar prova** – front‐end monta quiz; contador regressivo global e barra de progresso.
4. **Responder questões** – múltipla escolha, navegação livre; respostas armazenadas na _Pinia store_.
5. **Enviar** – ao terminar ou zerar timer, calcular acerto local e invocar **Gemini** para feedback.
6. **Gerar feedback IA** – `@google/generative-ai` SDK chama modelo _gemini‑pro_ com prompt estruturado; exibe explicações por questão.
7. **Exportar PDF** – usar `jsPDF` para baixar prova resolvida.

## 3 Requisitos Não‑Funcionais

- **Performance**: carregar prova & feedback < 3 s na média.
- **Acessibilidade**: navegação via teclado, contraste AA.
- **Stack**: Vue 3 + TypeScript + Tailwind CSS v4 + Pinia + Google Gemini JS SDK.
- **Segurança**: chave `VITE_GEMINI_API_KEY` no `.env` em runtime (não commitada).

## 4 Fluxo de dados

```
[enem.dev ↘]──(Questões JSON)──▶[Pinia store]
                                │
                   submit        ▼
[Front]──prompt json──▶ Gemini SDK ──▶(feedback JSON)──▶ Render / PDF
```

### 4.1 Prompt

a. **System**: "You are an exam tutor…"
b. **User**: JSON com objetos `{id, question, chosen, correct}`.
c. **Model must return**:

```json
{
  "feedback": [
    {
      "id": 123,
      "is_correct": false,
      "explanation": "…",
      "tip": "…"
    }
  ]
}
```

## 5 Store Pinia (`quizStore`)

- `state` : `questions[]`, `answers{}`, `timer`, `feedback[]`.
- `actions`: `fetchQuestions()`, `start()`, `submit()`, `generateFeedback()`.
- `getters`: `currentQuestion`, `isFinished`, `score`.

## 6 Dependências

- `@google/generative-ai` ≥ 0.6 (SDK)
- `axios` ≥ 1.6 (enem.dev requests)
- `jsPDF`
- `pinia`, `vue-router`, `tailwindcss@^4`.

## 7 Critérios de Aceite

- Usuário resolve prova end‑to‑end sem erros de console.
- IA retorna explicações coerentes (>90 % dos testes manuais).
- PDF exporta com logo e metadados.
- Vitest ≥ 90 % coverage; Cypress flow verde.
