# Plano de adaptação frontend — StudyContext, plano semanal e dias on-demand

## Contexto e objetivos
- Backend agora expõe StudyContext (com start_date/end_date) e endpoints para plano semanal e geração/persistência de dias sob demanda.
- Meta: alinhar UX e dados do frontend para criar o plano base logo após o contexto, carregar semana resumida rapidamente e gerar dias conforme necessidade, preservando histórico.

## Escopo
- Reaproveitar partes genéricas do formulário (StudyContext) para múltiplos planos.
- Persistir datas e metadados, disparando criação do plano semanal base após submissão.
- Consumir novos endpoints: criar contexto/plano, ler semana, gerar dia, salvar resultados.
- Ajustar prompts/UX para feedback de carregamento e estados vazios.

## Assunções
- Endpoints (REST) disponíveis conforme plano backend:
  - POST `/study-contexts` → cria contexto + plano semanal esqueleto.
  - GET `/plans/{planId}/week` → resumo semanal com status dos dias.
  - POST `/plans/{planId}/days` → gera dia detalhado sob demanda.
  - POST `/plans/{planId}/days/{dayId}/results` → persiste resultados.
- Schemas TS (OpenAPI client) já gerados/atualizados em `src/shared/api/schemas.ts` via `client`.
- Identificador de plano retornado no POST de contexto.

## Mudanças de dados e stores
- Entidade/DTOs:
  - Incluir `start_date`, `end_date`, `plan_id`, `week_summary` (slots por dia com status).
  - Modelar `DaySummary` (id, date, status, title?, metrics parciais) e `DayDetail` (tarefas, IA prompts, etc).
- Pinia (provável `studyPlanStore`):
  - Estado: `context`, `planId`, `weekSummary`, `currentDay`, `loadingContext`, `loadingWeek`, `loadingDay`, `savingResults`, `error`.
  - Actions:
    - `createContextAndPlan(payload)` → chama POST `/study-contexts`, salva `planId`, `context`, `weekSummary`.
    - `loadWeek(planId)` → GET `/plans/{planId}/week`.
    - `generateDay(planId, dateOrSlot)` → POST `/plans/{planId}/days`, atualiza `weekSummary` e `currentDay`.
    - `saveDayResults(planId, dayId, results)` → POST `/plans/{planId}/days/{dayId}/results`, atualiza `weekSummary`.
  - Getters: `todaySlot`, `pendingDays`, `canGenerate(date)`.

## Fluxos UX
1) **Cadastro de contexto/novo plano**
   - Form em duas etapas: (a) dados reutilizáveis (StudyContext) + datas; (b) parâmetros do plano atual.
   - Ao submeter: mostrar loader “Criando plano base…”, chamar `createContextAndPlan`, redirecionar para workspace com `planId`.
2) **Portal / resumo semanal**
   - Em `PlanWorkspacePage`: on mount, `loadWeek(planId)`; estado de carregamento e vazio.
   - Cards por dia (D1-D7) mostrando status (vazio, gerado, concluído, bloqueado) e CTA “Gerar dia” quando aplicável.
3) **Geração de dia**
   - Ao clicar “Gerar dia”: spinner inline; bloqueio de múltiplos cliques; erro com retry.
   - Atualizar `weekSummary` e abrir o dia gerado na coluna de tarefas.
4) **Persistir resultados do dia**
   - Ao marcar tarefas/concluir quick tests/flashcards, compor payload para `saveDayResults`.
   - Feedback visual “Salvando…” / sucesso / erro.
5) **Estado offline/erro**
   - Mensagens claras e botão “Tentar novamente” para week e dia.

## Ajustes de componentes/páginas
- `PlanWorkspacePage` (ou equivalente):
  - Hook on mount para `loadWeek`.
  - Nova coluna/section de “Semana” com cards clicáveis; CTA “Gerar dia”.
  - Guarda de rota: requer `planId` retornado no fluxo de criação.
- `StudyContextForm`:
  - Campos `start_date`, `end_date`; seleção de plano base anterior para herdar (opcional).
  - Submit chama `createContextAndPlan`.
- `ReadingBlock`/`QuickTestRunner`/`FlashcardSession` integrados ao `saveDayResults` via action central (para evitar duplicação).

## Integração com API client
- Adicionar chamadas no serviço compartilhado (ex: `src/features/study-plans/api`):
  - `createStudyContext(payload)` → client.createStudyContext? (ajustar para nome real).
  - `getWeek(planId)` → client.getPlanWeek.
  - `createDay(planId, body)` → client.createPlanDay.
  - `saveDayResults(planId, dayId, body)` → client.savePlanDayResults.
- Garantir tipagem a partir de `schemas.ts` e remover imports diretos de axios (usar client injetado).

## Estados de carregamento e vazios
- Week: skeleton cards; mensagem “Nenhum dia gerado ainda. Clique em Gerar dia.”
- Day: placeholder “Selecione ou gere um dia”.
- Botões desabilitados enquanto loading; retry em toast ou inline.

## Navegação e deep links
- Rotas já aceitam `planId`; garantir fallback quando aberto sem contexto (redirect para seleção de plano).
- Permitir abrir `/portal/:planId?dayId=...` para carregar direto um dia já gerado (chamar generateDay se não existir no summary? ou mostrar erro amigável).

## Telemetria
- Eventos: `study_context_created`, `plan_week_loaded`, `plan_day_generated`, `plan_day_results_saved`, com `planId`, `dayId`, `status`, `duration_ms`, `error`.
- Hooks em actions do store, enviando via logger central (já existente).

## Checklist de implementação (incremental)
1) Models/DTOs: adicionar tipos `WeekSummary`, `DaySummary`, `DayDetail`.
2) Service layer: encapsular chamadas aos novos endpoints.
3) Store: estados/actions conforme seção “Mudanças de dados e stores”.
4) Form de contexto: novos campos e submit chamando `createContextAndPlan`.
5) Workspace UI: cards semanais + CTA “Gerar dia” + loaders/erros.
6) Integrações de resultados: centralizar `saveDayResults` em ações de tarefas.
7) Telemetria e toasts.
8) QA: mocks para week/day; testes unit (store) + e2e leves (gerar dia, salvar resultados).

## Riscos e mitigação
- Erros de sincronização (gerar dia duplicado): aplicar disable durante request; confiar no idempotency do backend.
,- Latência de geração: feedback progressivo (“Gerando dia…”); fallback para retry.
- Dados legados sem `planId`: rota de migração/seleção de plano antes de acessar workspace.

## Entregáveis
- Código: store + serviços + ajustes de UI.
- Documentação: este plano, mais exemplos de payloads no README/API map se necessário.
