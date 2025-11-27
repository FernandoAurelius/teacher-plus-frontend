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

## Campos e regras de negocio por step
- **Step 1 – Perfil**: `persona` (string max 20, radio/select), `goal` (string max 100, textarea curta), `deadline` (string; usar input date e salvar como ISO simples ou texto validado), `weekly_time_hours` (int; normalizar para 0–60, parse seguro).
- **Step 2 – Rotina**: `study_routine` (string obrigatoria, min 10 chars), `preferences_formats` (array de string opcional; chips multiselect pronto para futura API), `notifications` (string max 100; valores sugeridos: email / push / whatsapp).
- **Step 3 – Background**: `background_level` (string max 100; radios com iniciante/intermediario/avancado), `background_institution_type` (string max 20; public/privado/outros), `interests` (array de string opcional).
- **Step 4 – Tecnologia**: `tech_device` (string max 100; select com desktop/notebook/mobile), `tech_connectivity` (string max 100; boa/instavel/offline ocasional), `preferences_language` (string max 50; select pt-BR/en/es), `preferences_accessibility` (array opcional; checar caixa para leitor de tela, alto contraste, legendas).
- **Step 5 – Revisao**: `diagnostic_status` deve ser enviado mesmo fora do fluxo; definir default `'pending'` (string max 20) no mapper ate API definir enum. `consent_lgpd` tratado como obrigatorio para prosseguir (boolean). `materials` permanece opcional e vazio por padrao.
- Validacoes: trim em todos os campos de texto, impedir envio com strings vazias, coerção de numeros, garantir limites de tamanho alinhados ao `schemas.UserContext`.

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
- Persistencia: guardar rascunho no `localStorage` (`tp_user_context_wizard`) com TTL leve (limpar ao sucesso ou logout); hidratar store na montagem do wizard.
- Acessibilidade: focus management na troca de steps, aria-live para mensagens de erro, labels conectadas a inputs e ordem de tab consistente.

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

## Plano incremental (fases rapidas)
- Fase 1: scaffolding de pasta `features/user-context-wizard` com store vazio, tipos, e importacao em `pages/wizard/WizardPage.vue`.
- Fase 2: implementar validacao zod e mapper com defaults (`diagnostic_status: 'pending'`), conectando ao store.
- Fase 3: construir steps UI + navegacao + persistencia localStorage, cobrindo validacao bloqueante.
- Fase 4: integrar `client.updateUserContext`, toasts e redirecionamento final; QA manual e ajustes de copy/UX.

## Componentes/UI a confirmar no kit
- Buttons, Input, Label ja existentes; garantir `Select`, `RadioGroup`, `Checkbox`, `Textarea`, `Progress`, `Dialog/Sheet`, `Sonner` configurados.
- Tokens Tailwind para cores/radius; criar util `FormFieldMessage` se nao existir para erros inline.
- Utilitario de mascara/normalizacao de numero (weekly_time_hours) pode ser um helper rapido no lib.

## Testes previstos
- Validar cada step bloqueando prosseguimento quando incompleto ou invalido (incluindo `consent_lgpd`).
- Garantir que rascunho persiste apos refresh e e limpo apos sucesso.
- Simular erro 400/timeout no `updateUserContext` exibindo toast e reabilitando botao.
- Navegacao retroativa mantendo dados e reposicionando foco no primeiro campo do step.
