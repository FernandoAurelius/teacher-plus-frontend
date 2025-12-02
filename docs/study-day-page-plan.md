# StudyDayPage - plano para migrar do modal para uma pagina completa

## Objetivo e contexto
- Hoje o dia de estudos abre dentro do Dialog `DayTaskModal` no workspace do plano, comprimindo conteudo e controles.
- Precisamos de uma pagina dedicada (`StudyDayPage`) que aproveite toda a largura/altura para mostrar resumo do dia, lista de atividades e execucao das tarefas com mais espacamento.
- As atividades devem aparecer em cards planos conectados horizontalmente, na ordem entregue pelo backend, e clicaveis para dar foco ao componente especifico via Transport.
- Manter componentes atuais das atividades; apenas reposicionar o pomodoro para o canto superior direito da pagina.

## Escopo
- Em escopo: rota dedicada do dia, layout full-width/full-height, timeline horizontal de atividades, painel de execucao com foco via Transport, pomodoro fixo, checklist para revisar o dia antes de comecar.
- Fora de escopo: mudancas de API/backend, novos tipos de tarefa, revisao de prompts de IA, alteracao de logica interna de FlashcardSession/QuickTest/ReadingBlock.

## Assumptions
- `useStudyPlanWorkspaceStore` continua sendo a fonte de verdade para plano/dias; nao ha cache externo.
- A ordem das tarefas ja vem correta do backend e pode ser usada diretamente na timeline horizontal.
- Existe (ou criaremos) um Transport/event bus simples em `shared/lib` para emitir/escutar `study-day:focus` e rolar/selecionar a tarefa; nao ha dependencia em libs externas alem das ja usadas (Vue/Pinia).
- A navegacao principal passa por `/portal/:planId`; podemos adicionar rota filha para o dia sem quebrar fluxos atuais.

## Dados e store
- Estender `useStudyPlanWorkspaceStore`:
  - `activeTaskId` + `setActiveTask(taskId)` e `resetTaskFocus()`.
  - `loadDay(dayId)` para garantir fetch do dia quando acessado direto por rota (fallback caso `plan.days` esteja vazio/incompleto), setando `activeDayId`.
  - Getter `dayTasksOrdered` que devolve `day.tasks` na ordem atual, com status simplificado para a timeline.
  - Estado de pomodoro por dia (`pomodoroState[dayId]` com modo, segundos restantes, running) para evitar reset ao navegar.
- Reaproveitar `updateTaskProgress` para marcar conclusao e refletir status na timeline e no painel.

## UX e layout da pagina
- `StudyDayPage` (feature `study-plans/day/ui`) com tres faixas principais:
  - **Hero**: titulo do dia, foco/resumo curto, status badge, datas e progresso geral; pomodoro compacto fixo no canto superior direito com iniciar/pausar/reset.
  - **Timeline horizontal**: cards planos por atividade, conectados por linhas/pontos; mostra tipo, titulo, duracao estimada e status; scroll horizontal com snap; botao `Ver atividade` dispara foco via Transport.
  - **Painel de conteudo**: coluna larga com seccoes para cada atividade (FlashcardSession, QuickTestRunner, ReadingBlock, fallback generico), header com infos da tarefa selecionada e CTA `Marcar concluido`; coluna lateral opcional para notas e checklist "Antes de comecar".
- Estados: skeletons para hero/timeline enquanto carrega; mensagem de vazio/erro se `dayId` invalido; toast para falhas de foco/Transport indisponivel.

## Fluxos principais
- Acesso: ao clicar em um dia no roadmap ou via deep link, router leva para `/portal/:planId/day/:dayId`; guard assegura `planId` e dispara `loadPlan` + `loadDay`.
- Foco em atividade: clique em card da timeline chama `setActiveTaskId` e `Transport.emit('study-day:focus', { taskId })`; painel escuta e faz `scrollIntoView` no bloco correspondente, destacando o card.
- Revisao antes de iniciar: checklist no topo da timeline (materiais, tempo, metas) sem alterar backend; pode marcar itens localmente.
- Completar atividade: cada bloco chama `updateTaskProgress(task.id, payload)`; ao concluir, status muda para `completed` e timeline atualiza cor/icone; proximo card recebe foco opcional.
- Pomodoro: `usePomodoroTimer` guarda estado por dia; botao de atalho no hero para colar/soltar temporizador; nao interrompe conteudo ao trocar atividade.

## Componentes planejados
- `StudyDayPage.vue` (container/rota).
- `study-day-hero.vue` (props `plan`, `day`, `pomodoroState`, eventos do timer).
- `study-day-timeline.vue` (render horizontal com conectores, estados de tarefa, emite `focus`).
- `study-day-activity-panel.vue` (renderiza atividades e notas, integra Transport para foco/scroll).
- `usePomodoroTimer.ts` (composable SRP para timer e persistencia simples por `dayId`).
- `transport/study-day-focus.ts` (adapter do Transport/event bus com typings).
- Ajustes em `study-roadmap.vue`/`study-plan-workspace.vue` para abrir a rota em vez de modal, mantendo flag de compatibilidade se precisarmos de rollback.

## Rotas e navegacao
- Nova rota dedicada: `/portal/:planId/day/:dayId` (ou equivalente usado no router atual).
- `StudyRoadmap` e cards de semana passam a usar `router.push` para a nova rota; se query `dayId` vier na rota antiga, redirecionar para a rota nova.
- Guardas: se `planId` ausente, volta para dashboard de planos; se `dayId` nao encontrado, mostrar estado vazio com CTA para voltar.

## Telemetria e observabilidade
- Eventos: `study_day_opened`, `study_day_task_focused`, `study_day_task_completed`, `pomodoro_toggled`, com `planId`, `dayId`, `taskId`, `duration_ms`, `status`.
- Logs de erro para falhas de Transport e update de tarefas; toasts de feedback ja usados em outras telas.

## Riscos e mitigacao
- Transport inexistente ou com API diferente: criar adapter fino em `shared/lib/transport` com contrato documentado.
- Muitas atividades no dia podem quebrar layout horizontal: aplicar scroll horizontal com snap e limite de altura; fallback para empilhar em telas pequenas.
- Usuarios habituados ao modal: manter feature flag/rota secundaria para o modal enquanto validamos a pagina.

## Entregaveis
- Documento de plano (este) em `docs/study-day-page-plan.md`.
- Pagina `StudyDayPage` com timeline horizontal, painel de atividades e pomodoro reposicionado.
- Ajustes de store/rota e tests unitarios do `usePomodoroTimer` + adapter de Transport; smoke test do fluxo de foco/completar tarefa.
