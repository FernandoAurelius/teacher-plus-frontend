# tasks.md – Tarefas sequenciais para implementar o **Quiz ENEM Interativo**

_A stack definida é Vue 3 (+Composition API), Tailwind CSS v4, NPM, Pinia, Axios, jsPDF e Google Gemini SDK._

---

## 0 Fundação do projeto

1. **Criar repositório `platform-frontend`** no GitHub e proteger branch `main`.
2. **Inicializar projeto Vue 3** com _npm create vue\@latest_ (TypeScript, Router, Pinia, ESLint, Vitest).
3. **Instalar Tailwind v4**
   `npm install -D tailwindcss@latest postcss autoprefixer @tailwindcss/vite`
   `npx tailwindcss init -p`
   • Adicionar plugin `@tailwindcss/vite` no `vite.config.ts`.
   • Configurar `content` para `./index.html`, `./src/**/*.{vue,ts}`.
4. **Adicionar dependências de runtime**
   `npm i axios @google/generative-ai jspdf`
5. **Adicionar dependências de teste e qualidade**
   `npm i -D vitest @vue/test-utils cypress eslint prettier husky lint-staged`
6. **Criar `.gitignore` e `.editorconfig`.**
7. **Criar `.env.example`** com:

   ```env
   VITE_GEMINI_API_KEY=
   VITE_GEMINI_MODEL=gemini-pro
   ```

8. Garantir que `.env` está no `.gitignore`.

---

## 1 Estrutura de diretórios inicial (`src/`)

```
assets/
components/
composables/
lib/          # http.ts, gemini.ts
stores/
views/
router/
```

---

## 2 Infra de comunicação

9. **`src/lib/http.ts`** – axios instance

   ```ts
   import axios from 'axios'
   export const http = axios.create({
     baseURL: 'https://api.enem.dev/v1',
     timeout: 10000,
   })
   ```

10. **`src/lib/gemini.ts`** – wrapper Gemini SDK

```ts
import { GoogleGenerativeAI } from '@google/generative-ai'
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
export async function getFeedback(prompt: string) {
  const model = genAI.getGenerativeModel({ model: import.meta.env.VITE_GEMINI_MODEL })
  const res = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { response_mime_type: 'application/json' },
  })
  return JSON.parse(res.response.text())
}
```

---

## 3 Estado Central (Pinia)

11. **`src/stores/quizStore.ts`**

```ts
interface Answer {
  questionId: string
  choice: string
  isCorrect: boolean
}
interface Feedback {
  explanation: string
  tip: string
}
export const useQuizStore = defineStore('quiz', {
  state: () => ({
    examMeta: null,
    questions: [] as Question[],
    current: 0,
    answers: [] as Answer[],
    feedback: [] as Feedback[],
    secondsLeft: 0,
    status: 'idle' as 'idle' | 'running' | 'finished',
  }),
  actions: {
    async loadExam(year: number, subject: string) {
      /* fetch questions */
    },
    selectAnswer(idx: number, choice: string) {
      /* mutate answers */
    },
    async finish() {
      /* call getFeedback() per Q */
    },
  },
})
```

---

## 4 Componentes e Views

12. **`QuizSetupView.vue`** – dropdowns ano/disciplinas → `startQuiz()`.
13. **`QuizRunView.vue`** – exibe pergunta, opções, `<QuizTimer>`; salva seleção.
14. **`QuizTimer.vue`** – composable `useTimer()`; opções *start*, _pause_.
15. **`QuizSummaryView.vue`** – mostra score, feedback IA, botão _Export PDF_.
16. **`FlashMessage.vue`** – para erros/sucesso globais.

---

## 5 Roteamento

17. Configurar `router/index.ts` com rotas:

- `/quiz` (setup)
- `/quiz/run` (run)
- `/quiz/summary` (summary)

---

## 6 PDF Export (jsPDF)

18. Criar `exportPdf.ts` util com jsPDF; montar cabeçalho com nome da escola/logotipo, tabela de questões e respostas; salvar `Quiz_<ano>_<disciplina>.pdf`.

---

## 7 Estilo (Tailwind v4)

19. Importar `tailwind.css` no `main.ts`.
20. Adicionar tokens do design‑system via `@layer base {}` e CSS variables.
21. Aplicar classes utilitárias a botões, cards, timer.

---

## 8 Testes

22. **Vitest unitários**

- store actions (`loadExam`, `selectAnswer`, `finish`).
- componentes `QuizTimer`, `QuizRunView` (render, props, emits).

23. **Cypress e2e**

- fluxo completo: setup → responder 3 questões → summary com score.
- mockar chamada Gemini com fixture.

---

## 9 Qualidade de código

24. ESLint + Prettier configs alinhados (airbnb/vue).
25. Husky pre‑commit: `lint-staged` (eslint + vitest).

---

## 10 Scripts NPM

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test:unit": "vitest",
  "test:e2e": "cypress run",
  "lint": "eslint src --ext .vue,.ts",
  "prepare": "husky install"
}
```

---

## 11 Docker

26. **`Dockerfile`** (multi‑stage)
    • Stage 1: `node:18-alpine`, `npm ci`, `npm run build`.
    • Stage 2: `nginx:alpine`, copy `dist` to `/usr/share/nginx/html`.
27. **`docker-image-publish.sh`** – tag & push para Docker Hub.

---

## 12 CI GitHub Actions

28. Workflow `.github/workflows/ci.yml`:

- checkout
- setup‑node
- `npm ci`
- `npm run lint && npm run test:unit`
- Cypress run
- `npm run build`
- build Docker image -> push se `main`.

---

## 13 Documentação

29. Atualizar `README.md` com requisitos, env vars, scripts e fluxo de contribuição.

> **Resultado esperado**: ao concluir a tarefa 29, um usuário pode clonar o repo, definir `VITE_GEMINI_API_KEY`, rodar `npm run dev`, fazer o quiz completo, receber feedback do Gemini e exportar o PDF.
