# Plano do Roadmap de Semanas e Dias

## Objetivo
- Transformar o calendário atual em um roadmap navegável por arrasto, com dias em círculos conectados por um caminho ondulado vertical, agrupados por semana e com detalhes de semana acessíveis por botão de info.

## Escopo e entregáveis
- Nova feature `features/study-roadmap` com UI, estados e serviços isolados.
- Componente principal `StudyRoadmap.vue` exibindo semanas, dias e conector ondulado em SVG.
- Suporte a pan/drag para rolagem fluida (mouse e touch) e navegação por wheel.
- Popover/Sheet de info da semana (título/meta/resumo rápido e CTA para detalhes).
- Estados de dia (pendente, em progresso, concluído, bloqueado) com ícones/cores tokens.
- Testes de interação (drag/scroll), render de semanas/dias e fallback vazio.

## Arquitetura (FSD + SOLID)
- `entities/week/model/week.ts`: tipos Week/Day, status e mapper vindo da API.
- `entities/week/ui/WeekHeader.vue`: título/meta, botão de info, slots para ações.
- `entities/day/ui/DayNode.vue`: círculo de dia com badge de número e status.
- `features/study-roadmap/model/useStudyRoadmap.ts`: estado derivado (layout, seleção), computeds e handlers de interação (drag, click, info open).
- `features/study-roadmap/ui/StudyRoadmap.vue`: orquestração (lista de semanas, SVG path ondulado, delega interações).
- `features/study-roadmap/lib/buildWavePath.ts`: função pura que recebe coordenadas dos dias e retorna string `d` de path SVG com curvas suaves.
- Serviços externos injetados via `useHttp`/`client` para buscar roadmap; sem imports diretos de Axios.

## Experiência e interações
- Panning: container com `overflow-hidden` + transform `translate` controlado por `useDraggable` (`@vueuse/core`) e suporte a wheel (deltaY -> translateY). Inércia leve opcional com `requestAnimationFrame`.
- Navegação por teclado: setas/pgup/pgdn movem foco para semana anterior/seguinte; `Enter` abre detalhes de dia.
- Dia: círculo 40-48px, borda de status; tooltip com título curto; click abre drawer/aside com detalhes do dia (dependente do fluxo existente).
- Conector ondulado: SVG em camada atrás dos dias, recalculado onResize/onDataChange; linha suavizada (`curveCatmullRom` manual em lib) com cores por estado dominante da semana.
- Semana: cabeçalho com título/meta e botão “Info”; ao abrir popover mostra descrição breve, objetivos e ações (ex.: “Ver plano”, “Editar metas”).
- Responsivo: em mobile mantém coluna única; drag por touch ativo; limitar zoom (sem scale) para evitar borra.

## Dependências sugeridas
- `@vueuse/core` para `useDraggable` e `useElementSize` (já provável no stack).
- Se precisar de pan com limites/inércia pronta: `@panzoom/panzoom` (wrapper simples em `lib/useRoadmapPan.ts`).
- Sem CSS custom: apenas Tailwind utilitário + tokens existentes.

## Layout e tokens
- Círculo base: `h-12 w-12 rounded-full flex items-center justify-center font-semibold`.
- Estados: `pending=bg-surface/outline`, `progress=border-primary text-primary`, `done=bg-primary text-surface`, `blocked=border-dashed border-error`.
- Conector: `stroke-primary/40` default, `stroke-success/50` para blocos concluídos; `strokeWidth` 3-4.
- Semana: card leve com `rounded-lg shadow-sm bg-surface` e `sticky` heading opcional para seção visível.

## Testes previstos (Vitest + Testing Library)
- Render mínimo sem dados mostra mensagem e botão de recarregar.
- Calcula path ondulado consistente dado conjunto fixo de coordenadas (snapshot da string `d`).
- Drag altera `translateY` do container e respeita limites de top/bottom.
- Clique em info de semana abre popover com dados injetados; evento de fechamento funciona via ESC/click fora.
- Acessibilidade: cada dia com `role="button"` e `aria-label` contendo título + status.

## Roadmap de implementação
1) Definir tipos Week/Day/status e mapper na pasta `entities/week`.
2) Criar `buildWavePath.ts` com testes unitários para path e limites.
3) Montar `StudyRoadmap.vue` com layout estático (sem drag), renderizando semanas/dias e path SVG.
4) Adicionar pan/drag (VueUse) e wheel, com limites baseados em altura do conteúdo.
5) Implementar popover/drawer de info de semana e click de dia (abrindo callback/emit).
6) Ajustar tokens de cor, espaçamentos e animações suaves (`transition-transform/opacity`).
7) Escrever testes de interação e snapshots básicos; QA manual em desktop/mobile.
