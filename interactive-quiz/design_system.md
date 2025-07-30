# design_system.md – Diretrizes de Código e UI (rev. Tailwind v4 + Gemini SDK)

## 1 Estrutura de Pastas

```
src/
  assets/
  components/
  composables/
  stores/
  views/
  lib/        # http.ts, gemini.ts, helpers
```

## 2 Convenções de Nomenclatura

- **Componentes Vue**: PascalCase (`QuizTimer.vue`).
- **Arquivos**: kebab‑case (`quiz-timer.vue`).
- **Stores Pinia**: camelCase com sufixo _Store_ (`quizStore`).

## 3 Estilo & Tokens

- Usar tokens do `NeoDash Gradient System` (JSON).
- **Tailwind v4**: configurar em `src/assets/main.css` seguindo diretrizes do Tailwind 4.
  - Ativar modo JIT (padrão v4).
  - Customização via `theme.extend` para cores de tokens.

- Utilizar util classes para espaçamento, grade CSS e estados (hover/focus).

## 4 Componentização

- **shadcn‑vue** como camada de UI: `npx shadcn-vue@latest init`.
- Adicionar componentes via `npx shadcn-vue add <name>`.

## 5 Acessibilidade

- Todos componentes interativos devem ter atributos ARIA.
- Constraste AA mínimo (WCAG 2.1).
- Teclas de atalho e navegação por teclado.

## 6 Animações

- Vue `<transition>` para fades/slides simples.
- GSAP para hero/scroll effects.
- Respeitar `prefers-reduced-motion`.

## 7 Lint & Formatação

- **ESLint** com `eslint-plugin-vue` + `@typescript-eslint`.
- **Prettier** integrado via Husky pre‑commit.

## 8 Testes

- **Vitest** para unitário/componente (80 %+ cobertura).
- **Cypress** para e2e (login, fluxo quiz completo).
- Mocks de API usando `msw` local.

## 9 Integração com Gemini

- Biblioteca oficial: `@google/generative-ai`.
- Wrapper em `src/lib/gemini.ts` para:

  ```ts
  import { GoogleGenerativeAI } from '@google/generative-ai'

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  ```

- Usar modelos `gemini-pro` (text) e `gemini-pro-vision` (imagem) quando aplicável.
- Obedecer limites de token, dividir prompt/append.

## 10 Commits

- Padrão Conventional Commits (`feat:`, `fix:`, `docs:`).
- `commitlint` + Husky para validação.

---

_Última revisão: 2025‑07‑29_
