# Plano do Editor Notion-Lite

## Objetivo
- Criar um editor básico estilo Notion (texto rico + blocos) com atalhos de teclado e inserção de elementos visuais simples, mantendo baixo acoplamento e aderência ao FSD.

## Escopo e entregáveis
- Feature `features/notion-lite-editor` com UI, estado e comandos.
- Componentes: editor principal, barra de comandos rápida (slash menu), toolbar minimal, bloco de inserção visual (callouts, checklist, código, imagem).
- Persistência local opcional (autosave em `localStorage`) e callback para salvar remoto via serviço injetado.
- Testes de comandos, atalhos e serialização básica.

## Arquitetura (FSD + SOLID)
- `entities/editor/model/editorTypes.ts`: tipos `EditorDoc`, `EditorBlock`, enums de bloco (`paragraph`, `heading`, `todo`, `quote`, `code`, `callout`, `image`).
- `features/notion-lite-editor/model/useNotionLite.ts`: orquestra instancia do editor, registra extensões/atalhos, expõe comandos (toggleBold, insertBlock, toggleTodo, undo/redo, saveDraft).
- `features/notion-lite-editor/ui/NotionLiteEditor.vue`: wrapper Vue que recebe `content`, `onSave`, `readonly`, injeta comandos e eventos.
- `features/notion-lite-editor/ui/SlashMenu.vue`: menu acionado por `/` com lista de blocos disponíveis (filtrável por texto).
- `features/notion-lite-editor/ui/BlockRenderer.vue`: renderiza blocos com estilos simples e controles contextuais (mover, duplicar, deletar).
- `features/notion-lite-editor/lib/persistence.ts`: helpers para salvar/carregar rascunho (local) e mapear payload para API.

## Biblioteca sugerida
- `@tiptap/vue-3` com extensões básicas (StarterKit) + minimal set custom:
  - CheckList/Todo, CodeBlock, Blockquote, Heading, Bold/Italic/Strike, Bullet/Ordered list.
  - Extensão custom `Callout` (container com ícone + bg sutil).
  - Extensão `SlashCommand` leve para abrir menu.
- Justificativa: integra bem com Vue 3, oferece keyboard shortcuts e serialização JSON/HTML; manter config no model e não no template.

## Experiência e atalhos
- Atalhos padrão: `Ctrl/Cmd+B/I/U`, `Ctrl/Cmd+K` link, `Ctrl+Shift+7/8` para listas, `Ctrl+Shift+H` heading, `Ctrl+E` código inline, `Ctrl+Shift+C` callout, `Ctrl+Enter` toggla todo, `Ctrl+Z/Y` undo/redo.
- `/` abre menu; setas e Enter navegam/selecionam blocos (parágrafo, título, lista, checklist, callout, quote, code, divider, imagem).
- Drag handle ao lado esquerdo de cada bloco para reordenação (usar `@dnd-kit/sortable` ou `vue-draggable` leve se já existente; senão, fallback com move up/down buttons).
- Inserção de imagem: input de URL simples (sem upload); validação básica.
- Barra superior minimal com botões de salvar, desfazer/refazer e modo pré-visualização.

## Estilos
- Tailwind utilitário, foco em legibilidade: `prose` limitada + tokens de cor.
- Callout: `rounded-md border-l-4` com variações (`info`, `warning`, `success`).
- Blocos exibem handle/toolbar ao hover para manter clean no modo leitura.
- Modo focado: largura máxima 920px, fundo `bg-surface` e bordas sutis.

## Testes previstos
- Render inicial com conteúdo vazio gera um parágrafo.
- Atalhos executam comandos (ex.: `Ctrl+B` aplica bold; `Ctrl+Shift+H` cria heading).
- Slash menu abre com `/`, filtra itens e insere bloco correto.
- Serialização para JSON/HTML preserva ordem e tipos de blocos.
- Autosave grava em `localStorage` e reidrata; `onSave` é chamado com payload normalizado.

## Passos de implementação
1) Adicionar tipos e helpers em `entities/editor`.
2) Configurar `useNotionLite` com instancia do Tiptap (StarterKit + extensões) e comandos.
3) Criar `NotionLiteEditor.vue` com toolbar, body do editor e eventos.
4) Implementar `SlashMenu` com navegação teclado/mouse e inserção.
5) Adicionar callout/checklist/image simples e estilos Tailwind.
6) Implementar autosave + callback `onSave`; testes de comandos e serialização.
