# ADR‑001: Escopo do MVP do Front‑end e Decisões Técnicas Iniciais

**Status**: Proposta – 2025‑07‑

## Contexto / Problema

Precisamos entregar um protótipo _utilizável_ para a banca de novembro. Enquanto o back‑end (Django + DRF) ainda está sendo estruturado, Miguel já deve iterar sobre as telas de interface. Portanto, definimos **o que** implementar imediatamente no front‑end e **como** arquitetar para que a integração futura com a API seja simples.

## Fatores que Influenciam a Decisão

1. **Tempo limitado** (5 semanas de estudo + sprints até novembro).
2. Necessidade de **feedback visual rápido** para validar UX com colegas/professores.
3. **Baixo acoplamento**: front deve funcionar com dados mockados/localStorage até a API estar pronta.
4. Reaproveitamento de **tokens de design** (Tailwind + shadcn‑vue) para consistência visual.
5. Facilidade de **deploy estático** (Nginx servindo build Vite) no mesmo servidor OCI.

## Decisão

Implementar, já no MVP, as seguintes funcionalidades exclusivamente no front‑end:

| Funcionalidade                 | Fonte de Dados Temporária            | Observações                           |
| ------------------------------ | ------------------------------------ | ------------------------------------- |
| **Quiz ENEM interativo**       | Fetch direto `enem.dev` ou JSON mock | Timer, navegação, estatísticas locais |
| **Cálculo de pontuação local** | Pinia store → `localStorage`         | Envio futuro ao `/api/sessions/`      |
| **Feedback IA (stub)**         | Axios POST a `/api/feedback/` mock   | Exibir explicação gerada offline      |
| **Exportar prova em PDF**      | `html2pdf.js` client‑side            | Versão servidor futuro com WeasyPrint |
| **Flashcards + SRS**           | Bibliotecas JS (DolphinSR/FSRS)      | Deck salvo no navegador               |
| **Landing animada**            | Vue `<transition>` + GSAP            | Demonstração de tokens de design      |

### Stack front‑end

- **Vue 3 + TypeScript + Vite**
- **Tailwind CSS** (tokens derivados do JSON NeoDash)
- **shadcn‑vue** para componentes prontos (botões, cards, inputs)
- **Pinia** para estado global (+persistência)
- **GSAP** para animações complexas
- **html2pdf.js** para exportar PDF

## Alternativas Consideradas

| Alternativa                                | Razão do Rejeite                             |
| ------------------------------------------ | -------------------------------------------- |
| Storybook para documentação de componentes | Excesso de overhead para equipe de 2 pessoas |
| UI Library Material/Ant Design             | Heavier bundle; menos integração Tailwind    |
| Gerar PDFs no servidor desde o início      | Aumenta complexidade de infraestrutura       |

## Consequências

- **Positivas**: Miguel pode iterar no UI sem bloqueio; demonstra valor cedo; tokens garantem consistência.
- **Negativas**: Dados locais podem divergir dos reais; será necessário migrar stores para chamadas de API depois; client‑side PDF tem limitações de tipografia.

---

_(Documento escrito em 28 Jul 2025)_
