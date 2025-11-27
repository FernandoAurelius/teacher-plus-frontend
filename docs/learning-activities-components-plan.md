# Plano de Componentes: Flashcards, Testes e Leituras

## Objetivo
- Padronizar UI e estado dos blocos de aprendizado (flashcards, testes rápidos e leituras) seguindo FSD, com experiências consistentes e reutilizáveis.

## Estrutura proposta (FSD)
- `entities/content-block`: tipos comuns (`ContentBlockBase`, status, metadata) e helpers.
- `features/flashcards`: sessão de estudo com decks, navegação e feedback.
- `features/quick-tests`: testes curtos (ENEM/diagnóstico) com timers, scoring e feedback.
- `features/readings`: blocos de leitura/resumo com ações (marcar como lido, salvar notas).
- `shared/ui` recebe componentes genéricos entre features (Card, Tag, Progress, StatusBadge).

## Papeis e contratos
- Estados base: `new`, `in_progress`, `done`, `review`, `blocked` (indisponível).
- Eventos comuns: `onSelect`, `onMarkDone`, `onSaveNotes`, `onRetry`, `onFavorite`.
- Acessibilidade: roles e aria-labels em todos os controles; foco consistente para teclado.

## Flashcards
- Componentes:
  - `FlashcardSession.vue`: orquestra deck e estado (índice, frente/verso, acertos).
  - `FlashcardCard.vue`: carta com flip 3D leve; teclas `Space`/clique para virar.
  - `FlashcardControls.vue`: botões Lembrar/Não lembrar/Pular, progresso e tempo restante.
  - `FlashcardSummary.vue`: resultado final com métricas (acertos %, tempo gasto, itens a revisar).
- Interações:
  - Atalhos: `ArrowRight/ArrowLeft` navegam, `Space` vira, `1/2/3` registram dificuldade (fácil/médio/difícil).
  - Mobile: swipe via `useSwipe` (VueUse).
  - Persistência opcional em `localStorage` (`tp_flashcards_<deckId>`).
- Dados:
  - Tipos `FlashcardDeck`, `FlashcardItem` (front/back, tags, hint).
  - Serviços injetados (client) para carregar deck e registrar performance.
- Testes:
  - Navegação por teclado e swipe.
  - Flip e troca de estado sem mutação direta.
  - Resumo exibe estatísticas corretas.

## Testes rápidos
- Componentes:
  - `QuickTestRunner.vue`: host do teste (enunciado, opções, timer, barra de progresso).
  - `QuestionCard.vue`: mostra questão + alternativas/inputs conforme tipo.
  - `ResultPanel.vue`: score, tempo, sugestões de revisão/flashcards gerados.
- Interações:
  - Timer opcional (useCountdown) com pausa controlada.
  - Atalhos: `1-5` selecionam alternativas; `Enter` confirma; `Shift+Enter` avança.
  - Feedback imediato (modo treino) ou ao final (modo prova).
- Dados:
  - Tipos `QuickTest`, `QuickQuestion`, `AnswerSubmission`.
  - Action para enviar respostas via `client.submitQuickTest` (ou similar); retries e estados de loading/erro no store.
- Testes:
  - Timer decrementa e dispara auto-submit opcional.
  - Seleção via teclado e clique mantém consistência.
  - Resultados renderizados conforme payload.

## Leituras e resumos
- Componentes:
  - `ReadingBlock.vue`: título, meta de leitura, tempo estimado e botões (Marcar como lido, Ver resumo, Favoritar).
  - `ReadingContent.vue`: corpo resumido; colapso/expandir.
  - `ReadingNotes.vue`: notas rápidas (local ou via service).
- Interações:
  - Botão Info/Resumo abre drawer com resumo/insights.
  - Ação Marcar como lido atualiza estado e dispara toast.
  - Atalho `Ctrl+S` salva notas; `Ctrl+K` abre busca de palavra (se suportado).
- Dados:
  - Tipos `ReadingItem` (id, title, summary, estimateMinutes, status).
  - Mapper alinhado ao schema existente de leituras (definir no lib).
- Testes:
  - Render de estados (não lido, lido, favorito).
  - Persistência das notas locais e reidratação.

## UI e estilos
- Somente Tailwind utilitário; cards `rounded-lg shadow-sm bg-surface`.
- `shared/ui/StatusBadge`: tokens para `new`, `in_progress`, `done`, `review`, `blocked`.
- Animações leves: flip (`transition-transform duration-300`), progresso animado, hover/focus claros.

## Cronograma incremental
1) Definir tipos e mappers em `entities/content-block` e derivados (flashcards, tests, readings).
2) Implementar flashcards (UI + store + interações teclado/swipe) com testes.
3) Implementar quick-tests com timer e envio ao client; testes de timer/teclado.
4) Implementar blocos de leitura com drawer de resumo e notas.
5) Revisar tokens Tailwind e acessibilidade (roles, aria-labels, foco).
