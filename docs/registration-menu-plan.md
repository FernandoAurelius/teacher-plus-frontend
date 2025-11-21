# Plano de migracao do cadastro para menu guiado

## Objetivo
- Substituir o fluxo de chat do `WizardChat` por um menu passo a passo que coleta e envia o `UserContext` pelo endpoint POST `/api/user-context/` via `client.updateUserContext`.
- Preservar principios FSD e SOLID: responsabilidade unica por step, validacao de dados isolada, servicos externos injetados.
- Entregar uma experiencia moderna com animacoes entre etapas, feedback claro e sem uso de chat.

## Escopo e entregaveis
- Nova feature `features/user-context-wizard` com paginas/componentes de steps, validacao e estado.
- Atualizar `pages/wizard/WizardPage.vue` para usar o menu guiado e remover dependencias do chat.
- Manter rota `/wizard` e guardas de auth inalterados.
- UI baseada em componentes shadcn-vue ja existentes ou adicionados (Button, Input, Label, Select, RadioGroup, Tabs, Card, Progress, Dialog/Sheet, Sonner para toast).

## Fluxo proposto (steps e campos)
1) **Perfil e objetivo rapido**: persona, goal, deadline (input date ou text curto), weekly_time_hours.
2) **Rotina e disponibilidade**: study_routine (textarea), preferencias de formato (checkbox/chips para preferences_formats quando suportado), notifications.
3) **Background academico**: background_level, background_institution_type, interests (multiselect opcional).
4) **Tecnologia e acesso**: tech_device, tech_connectivity, preferences_language, preferences_accessibility.
5) **Revisao e consentimento**: resumo dos valores, consent_lgpd (checkbox), botao de enviar.
- Campos opcionais do schema (`self_assessment`, `diagnostic_snapshot`, `materials`) permanecem fora do escopo inicial, mas com extensibilidade prevista.

## Arquitetura tecnica (FSD)
- `features/user-context-wizard/model/userContextStore.ts`: Pinia store para estado dos steps, dados parciais e status de envio. Actions para `setField`, `nextStep`, `prevStep`, `submit`.
- `features/user-context-wizard/lib/validation.ts`: schema zod alinhado a `schemas.UserContext` para tipagem e validacao de cada step (parcial) e do payload final.
- `features/user-context-wizard/lib/mapUserContext.ts`: funcao pura que normaliza os dados do form para o payload da API (strings, numeros, booleanos).
- `features/user-context-wizard/ui/UserContextWizard.vue`: orquestrador dos steps com barra de progresso, transicoes e botoes de navegacao.
- `features/user-context-wizard/ui/steps/*.vue`: componentes pequenos, cada um responsavel por um conjunto de campos do schema.
- `features/user-context-wizard/ui/ReviewDialog.vue`: confirmacao final usando Dialog ou Sheet.
- `pages/wizard/WizardPage.vue`: hospeda o wizard, contexto de pagina (titulo, copy) e remove referencias ao chat.

## UX e validacao
- Validacao por step: bloquear `next` se campos obrigatorios estiverem faltando ou invalidos; mostrar mensagens inline.
- Mostrar progresso (Progress + indicador textual Step X/Total).
- Navegacao livre entre steps anteriores; evitar perda de dados usando store unico.
- Salvamento final: `submit` chama `client.updateUserContext`, exibe loading e toast de sucesso/erro; redirecionamento configuravel apos sucesso (ex.: home ou dashboard).
- Edge cases: reenvio em caso de erro, tratamento de timeout e mensagens amigaveis.

## Animacao e microinteracoes
- Usar `<Transition>` com classes Tailwind para fade/slide entre steps (`duration-300 ease-out`, `translate-y-4`).
- Adicionar stagger leve nos campos de cada step com CSS keyframes utilitarios (`animate-[fadeInUp_0.35s_ease-out]`).
- Indicadores de progresso com animacao no `Progress` e foco/hover em botoes com `active:scale-[.98]`.
- Dialog de revisao com `transition` para scale/fade e backdrop blur ligero.

## Migracao e tarefas
1) Criar feature folder e scaffolding de store, validation e mapeamento.
2) Implementar componentes de steps com campos shadcn-vue e wiring ao store.
3) Criar orquestrador e barras de progresso; integrar validacao passo a passo.
4) Implementar submit final chamando `client.updateUserContext`, toasts e redirecionamento.
5) Atualizar `pages/wizard/WizardPage.vue` para usar o novo wizard e remover `WizardChat`.
6) Revisar dependencias shadcn que faltarem (ex.: Select, RadioGroup, Checkbox, Progress); gerar via CLI se necessario.
7) QA/manual: fluxos happy path, validacao bloqueando campos vazios, erro de rede, reload mantendo estado com localStorage.
OBS.: manter componentes atuais de chat que serao refatorados futuramente.

## Testes previstos
- Pular por enquanto.
