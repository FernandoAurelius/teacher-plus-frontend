# Plano de Refatoração do Portal de Planos de Estudo

## 1. Objetivos e restrições
- Recriar o `/portal` como hub completo de planos: cards listando `StudyPlanSummary[]` (GET `/api/ai/study-plans/`) e um workspace detalhado para cada plano (GET `/api/ai/study-plans/{plan_id}/`).
- UI precisa espelhar a composição e microinterações de `sample.html`, porém utilizando os tokens definidos em `docs/design_token.json` (radius, cores, tipografia Inter) para manter consistência com o restante da aplicação.
- Integrar todos os fluxos do guia de planos assíncronos: geração inicial, monitoramento de jobs, extensão de seções, upload de materiais, tratamento de erros.
- Manter FSD + SOLID: separar entidades (tipos puros), features (stores, serviços, UI). Componentes <200 LOC e funções com responsabilidade única.

## 2. Arquitetura proposta
1. **Camadas**
   - `entities/study-plan`: schemas tipados (weeks/days/tasks) + formatters utilitários.
   - `features/study-plans/dashboard`: store + serviços para lista de planos e cards.
   - `features/study-plans/workspace`: store (evolução do `study-plan-store.ts`), composables de renderização tipada dos conteúdos, UI inspirada em `sample.html`.
   - `shared/api`: atualizar `schemas.ts` para refletir o payload completo descrito no guia (arrays de `weeks`, `rag_document_ids: string[]`, etc.). Mantemos o `client` como ponto único de injeção.
   - `shared/lib/jobs`: novo composable `useJobMonitor` encapsulando SSE/polling para qualquer `job_id`.
2. **Roteamento**
   - `/portal` → página dividida em duas colunas: à esquerda cards/lista, à direita "hero" com CTA de geração. Click em card navega para `/portal/:planId`.
   - `/portal/:planId` → carrega workspace. Rota guarda `meta: { bgIcons: false }` e lazy-load do bundle para evitar carregamento do workspace quando só listamos cards.
3. **Estado global**
   - `useStudyPlanDashboardStore`: mantém `plans`, `loading`, `selectedPlanId`, paginação/filtros e job status de cada card.
   - `useStudyPlanWorkspaceStore`: mantém `plan`, `activeWeek`, `activeDay/section`, `materials`, `jobState`. Reusa helpers atuais (`persistPlanId`) porém desacoplando da lista.
   - Ambos dependem apenas do `client` e do `useJobMonitor` (injeção por parâmetro nas ações para facilitar testes).

## 3. Atualização visual e tokens
1. **Tailwind config**
   - Mapear tokens do `design_token.json` para CSS vars em `src/assets/global.css` e para o `@theme` do Tailwind v4 (`--color-brand` → `palette.primary`, etc.).
   - Incluir `font-family: Space Grotesk` como base para manter o flavour do `sample.html`.
2. **Portais / Layout**
   - Reproduzir cabeçalho fixo, gradiente de fundo e blocos com blur observados em `sample.html`, trocando as cores originais pelos tokens `appBackground`, `primary`, `secondary` e sombras definidas.
   - Criar componentes de baixo nível reutilizáveis (`NeoSurface`, `NeoBadge`, `TimelineRail`) no namespace `shared/ui` para evitar CSS customizado.
3. **Motion**
   - Aplicar animações `fadeSlideUp` em cards e seções do workspace (usar `@keyframes` baseadas no token `motion.animations.fadeSlideUp`).

## 4. Dashboard de Planos (cards)
1. **Fluxo de dados**
   - Ao montar `/portal`, `useStudyPlanDashboardStore.loadPlans()` dispara `client.listStudyPlans()`.
   - Cada `StudyPlanSummary` alimenta `StudyPlanCard.vue` (status, semana atual, erros). Cards exibem spinners quando `generation_status` ∈ {`pending`,`running`} e exibem CTA "Abrir" + "Monitorar job".
2. **UI**
   - Grid responsivo inspirado no bloco de "weeks overview" do `sample.html`: gradiente radial leve, ícones, badges de status.
   - CTA global "Novo plano" abre `CreatePlanSheet.vue`, com formulário equivalente ao antigo `planForm`. Após `POST /generate` armazenar `job_id` na store e iniciar monitoramento.
3. **Integração com jobs**
   - Quando um card está aguardando job, mostrar barra de progresso e permitir "Retentar" (`POST /generate` com os últimos dados) caso `generation_status = failed`.
   - Dashboard observa atualizações via `useJobMonitor` e dispara `loadPlans()` ao concluir.
4. **UX extra**
   - Filtros rápidos (dropdown) por status (`active`, `completed`, `failed`) e busca textual (client-side).
   - Atalhos para duplicar plano (stub) e abrir modal de exclusão (se endpoint existir; se não, mostrar placeholder).

## 5. Workspace do Plano (detalhe)
1. **Layout inspirado em `sample.html`**
   - Header fixo com breadcrumbs (Voltar → `/portal`), título do plano, status chip e botões "Gerar novas tarefas" / "Upload de material".
   - Coluna esquerda: painel com progresso semanal, notas rápidas, materiais (RAG). Coluna direita: timeline central com semanas → dias → tasks, visualmente próxima da timeline do sample (cards translúcidos, gradiente, ícones circulares).
2. **Renderização de conteúdos tipados**
   - Criar `entities/study-plan/task-content.ts` contendo mappers `mapStudyTaskContent(task)` para gerar DTOs prontos para UI.
   - Componentes específicos: `LessonTaskCard`, `FlashcardTaskCard`, `AssessmentTaskCard`, etc., registrados dinamicamente via `componentMap[task.content_type]`.
   - Flashcards: reaproveitar UI do sample (stack com flipping) adaptada para tokens e dados reais (`content.cards[]`).
3. **Controles**
   - Tabs secundárias (dias, metas, tarefas, flashcards) migradas para sub-componentes que ocupam seções equivalentes às do sample (ex.: painel lateral).
   - Botão "Expandir dia" chama `POST /study-plans/{plan_id}/tasks/` com `section_id` e mostra skeleton nas tasks daquele dia até job concluir.
4. **Estado**
   - `useStudyPlanWorkspaceStore.fetchPlan(planId)` popula `plan`, `weeks`, `days`. Ao trocar `:planId` na rota, store limpa estado e refaz fetch.
   - Persistir `activeWeek/day` em query params (`?week=2&day=d5`) para links compartilháveis.

## 6. Orquestração de Jobs e uploads
1. **`useJobMonitor`**
   - API: `const { start, stop, state } = useJobMonitor({ jobId, strategy: 'sse' | 'polling', onSuccess, onError })`.
   - Implementa `EventSource` com fallback para polling (`GET /api/ai/jobs/{job_id}/` a cada 5s), reaproveitando lógica de `study-plan-store.ts` e tornando-a reutilizável pelos cards, workspace e uploads.
2. **Geração e atualização**
   - `generatePlan` (dashboard) e `extendSection` (workspace) recebem `job_id` → `useJobMonitor.start(jobId)` atualiza store. Ao `succeeded`, `fetchPlan`/`loadPlans`.
   - Para uploads (`POST /materials/`), monitorar `job_id` e amadurecer `rag_document_ids` quando `ingest_status = succeeded`.
3. **Erro / retry UX**
   - `last_error` do plano mostrado tanto no card quanto no header do workspace, com CTA "Tentar novamente" que reusa os últimos inputs.

## 7. Atualizações na camada de dados
1. **Schemas**
   - Ajustar `StudyPlan.weeks` para `z.array(Week)` e criar `Week` + `Day.tasks[].content` tipados conforme guia.
   - Garantir que `GeneratePlanRequest` aceite `title` opcional e `goal_override` opcional (já parcial) mas documentar nas ações.
2. **Normalização**
   - Criar helpers em `entities/study-plan/normalizers.ts` para:
     - `groupByWeek(plan.days)` → `Week[]`.
     - `getCurrentWeek(plan)` e `getNextAction(plan)` (para cards/resumos).
     - `mapRagDocuments(plan.rag_document_ids)` (placeholder até termos endpoint de detalhes).
3. **Error boundaries**
   - Caso o backend ainda não entregue conteúdo tipado, adicionar type-guards e fallback friendly (exibir JSON bruto em accordion debug).

## 8. Estratégia de implementação e milestones
1. **Milestone 1 – Fundamentos**
   - Atualizar tokens/Tailwind, criar `useJobMonitor`, revisar schemas, criar stores base (com testes unitários de estado/fetch).
2. **Milestone 2 – Dashboard**
   - Implementar rota `/portal`, cards, criação de plano, monitoração de jobs nos cards, cobertura de testes de integração (Vitest + testing-library) para fluxos principais.
3. **Milestone 3 – Workspace**
   - Migrar `study-plan-portal.vue` para novo workspace modular, implementar timeline e renderização de tasks por tipo, controles de extensão/upload.
4. **Milestone 4 – Refinos**
   - Flashcards interativos, notas persistentes (local storage), navegação teclado, skeletons animados (motion tokens).
5. **QA**
   - Storybook/Chromatic para os novos componentes (cards e task views), e2e Cypress cobrindo: geração completa, abertura de plano existente, upload RAG falho.

## 9. Testes e monitoramento
- **Unitários**: stores (`loadPlans`, `generatePlan`, `extendSection`), helpers (`groupByWeek`).
- **Component tests**: `StudyPlanCard`, `WorkspaceTimeline`.
- **E2E**: fluxo de geração + polling, extensão de tarefas, upload de material.
- **Observabilidade**: adicionar logs estruturados nos toasts e breadcrumbs (Sentry) para jobs falhos.

## 10. Entregáveis finais
- Rota `/portal` com cards estilizados no padrão sample/tokens.
- Rota `/portal/:planId` com workspace completo, integrando todas as ações/estados.
- Documentação atualizada (`docs/registration-menu-plan.md` + novo `docs` file descrevendo fluxos) e scripts de seeds/dados mockados para Storybook.
- Checklist interno (lint ✔, tests ✔, SOLID ✔) executado antes do merge.
