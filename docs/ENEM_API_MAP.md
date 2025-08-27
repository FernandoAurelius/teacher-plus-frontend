## Visão-geral

| Base URL | Versão | Auth | Limite oficial |
| --- | --- | --- | --- |
| `https://api.enem.dev` | `/v1` | Nenhuma – dados públicos | 1 request/segundo em rotas sem cache (janela 10 s) [docs.enem.d## Códigos de erro & tratamento

| HTTP | `error.code` | Quando ocorre | Ação recomendada |
| --- | --- | --- | --- |
| 400 | `bad_request` | query malformada | validar params |
| 404 | `not_found` | ano ou índice inexistente | mostrar "Não encontrado" |
| 422 | `unprocessable_entity` | tipos/valores inválidos | revisar payload |
| 429 | `rate_limit_exceeded` | > 1 req/s | back-off + retry |
| 500 | `internal_server_error` | falha interna | retry exponencial |

## Exemplos práticos de uso

### Carregar lista de provas disponíveis
```typescript
const response = await fetch('https://api.enem.dev/v1/exams');
const provas = await response.json();
// Usar para popular dropdown de seleção de ano
```

### Buscar questões de matemática do ENEM 2020
```typescript
const response = await fetch('https://api.enem.dev/v1/exams/2020/questions?limit=30&offset=0');
const data = await response.json();
const { metadata, questions } = data;
// metadata.hasMore indica se há mais páginas
```

### Obter questão específica em inglês
```typescript
const response = await fetch('https://api.enem.dev/v1/exams/2020/questions/42?language=ingles');
const questao = await response.json();
// questao.alternatives contém as opções A, B, C, D, E
// questao.correctAlternative contém a resposta correta
```

### Filtrar questões por disciplina (implementação local)
```typescript
// A API não suporta filtro por disciplina diretamente
// Filtrar no client após carregar as questões:
const questoesMatematica = questions.filter(q => q.discipline === 'matematica');
```

### Implementar paginação
```typescript
async function carregarProximaPagina(year: string, offset: number) {
  const response = await fetch(`https://api.enem.dev/v1/exams/${year}/questions?limit=20&offset=${offset}`);
  const data = await response.json();
  
  if (data.metadata.hasMore) {
    // Há mais páginas disponíveis
    return { questions: data.questions, nextOffset: offset + 20 };
  }
  
  return { questions: data.questions, nextOffset: null };
}
```://docs.enem.dev/rate-limits?utm_source=chatgpt.com) |

## Endpoints indispensáveis

### 1. Listar todas as provas

`GET /v1/exams` — retorna *array* de objetos **Prova**:

```json
[
  {
    "title": "ENEM 2020",
    "year": 2020,
    "disciplines": [
      {
        "label": "Ciências Humanas e suas Tecnologias",
        "value": "ciencias-humanas"
      },
      {
        "label": "Ciências da Natureza e suas Tecnologias",
        "value": "ciencias-natureza"
      },
      {
        "label": "Linguagens, Códigos e suas Tecnologias",
        "value": "linguagens"
      },
      {
        "label": "Matemática e suas Tecnologias",
        "value": "matematica"
      }
    ],
    "languages": [
      { "label": "Espanhol", "value": "espanhol" },
      { "label": "Inglês", "value": "ingles" }
    ]
  }
]
```

**Campos da resposta:**
- `title` (string, obrigatório): O título da prova (ex: "ENEM 2020")
- `year` (integer, obrigatório): O ano em que a prova foi aplicada (> 0)
- `disciplines` (array, obrigatório): As disciplinas da prova com `label` e `value`
- `languages` (array, obrigatório): Os idiomas da prova com `label` e `value`

[docs.enem.dev](https://docs.enem.dev/api-reference/provas/listar-provas)

### 2. Detalhar uma prova específica

`GET /v1/exams/{year}`

**Path Parameters:**
- `year` (string, obrigatório): O ano em que a prova foi aplicada (ex: "2020")

**Resposta:** Inclui metadados da prova **+** lista resumida de questões (index, disciplina, idioma):

```json
{
  "title": "ENEM 2020",
  "year": 2020,
  "disciplines": [
    {
      "label": "Ciências Humanas e suas Tecnologias",
      "value": "ciencias-humanas"
    }
    // ...
  ],
  "languages": [
    { "label": "Espanhol", "value": "espanhol" },
    { "label": "Inglês", "value": "ingles" }
  ],
  "questions": [
    // array de questões resumidas
  ]
}
```

[docs.enem.dev](https://docs.enem.dev/api-reference/provas/listar-prova)

### 3. Listar questões de um ano

`GET /v1/exams/{year}/questions`

**Path Parameters:**
- `year` (string, obrigatório): O ano em que a prova foi aplicada (ex: "2020")

**Query Parameters:**

| Param | Tipo | Default | Validação | Observação |
| --- | --- | --- | --- | --- |
| `limit` | integer | 10 | x > 0 | máx. questões por página |
| `offset` | integer | 0 | x >= 0 | número da primeira questão a ser retornada |
| `language` | string | — | — | `ingles`, `espanhol`, etc. |

**Resposta envelopada:**

```json
{
  "metadata": {
    "limit": 10,
    "offset": 0,
    "total": 180,
    "hasMore": true
  },
  "questions": [
    // array de questões detalhadas
  ]
}
```

[docs.enem.dev](https://docs.enem.dev/api-reference/quest%C3%B5es/listar-quest%C3%B5es)

### 4. Obter uma questão específica

`GET /v1/exams/{year}/questions/{index}`

**Path Parameters:**
- `year` (string, obrigatório): O ano em que a prova foi aplicada (ex: "2020")
- `index` (string, obrigatório): O número da questão na prova (ex: "42")

**Query Parameters:**
- `language` (string, opcional): O idioma desejado da questão (ex: "ingles")

**Retorna objeto QuestaoCompleta:**

```json
{
  "title": "Questão 1 - ENEM 2020",
  "index": 1,
  "discipline": "linguagens",
  "language": "ingles",
  "year": 2020,
  "context": "Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.",
  "files": [
    "https://enem.dev/2020/questions/1-ingles/6e1ca12e-9bc4-472b-8809-84e7e394714a.png"
  ],
  "correctAlternative": "A",
  "alternativesIntroduction": "Com base no texto, selecione a alternativa correta",
  "alternatives": [
    // array de alternativas
  ]
}
```

**Campos da resposta:**
- `title` (string, obrigatório): O título da questão
- `index` (integer, obrigatório): O número da questão na prova (> 0)
- `discipline` (string|null, obrigatório): A disciplina da questão
- `language` (string|null, obrigatório): O idioma da questão
- `year` (integer, obrigatório): O ano em que a prova foi aplicada (> 0)
- `context` (string|null, obrigatório): O contexto da questão, em Markdown
- `files` (array, obrigatório): URLs dos arquivos da questão
- `correctAlternative` (enum, obrigatório): A alternativa correta (A, B, C, D, E)
- `alternativesIntroduction` (string, obrigatório): Texto introdutório das alternativas
- `alternatives` (array, obrigatório): As alternativas da questão

[docs.enem.dev](https://docs.enem.dev/api-reference/quest%C3%B5es/listar-quest%C3%A3o)

## Estruturas de dados chave

### Prova
| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `title` | string | ✓ | O título da prova (ex: "ENEM 2020") |
| `year` | integer | ✓ | O ano em que a prova foi aplicada (> 0) |
| `disciplines` | array | ✓ | As disciplinas da prova |
| `languages` | array | ✓ | Os idiomas da prova |
| `questions` | array | ○ | Lista de questões (apenas em `/exams/{year}`) |

### Disciplina
| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `label` | string | ✓ | Nome completo da disciplina |
| `value` | string | ✓ | Código da disciplina |

**Valores possíveis:**
- `"ciencias-humanas"` → "Ciências Humanas e suas Tecnologias"
- `"ciencias-natureza"` → "Ciências da Natureza e suas Tecnologias"
- `"linguagens"` → "Linguagens, Códigos e suas Tecnologias"
- `"matematica"` → "Matemática e suas Tecnologias"

### Idioma
| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `label` | string | ✓ | Nome do idioma |
| `value` | string | ✓ | Código do idioma |

**Valores possíveis:**
- `"espanhol"` → "Espanhol"
- `"ingles"` → "Inglês"

### QuestaoCompleta
| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `title` | string | ✓ | Título da questão |
| `index` | integer | ✓ | Número da questão na prova (> 0) |
| `discipline` | string\|null | ✓ | Disciplina da questão |
| `language` | string\|null | ✓ | Idioma da questão |
| `year` | integer | ✓ | Ano da prova (> 0) |
| `context` | string\|null | ✓ | Contexto/enunciado em Markdown |
| `files` | string[] | ✓ | URLs dos arquivos da questão |
| `correctAlternative` | enum | ✓ | Alternativa correta (A, B, C, D, E) |
| `alternativesIntroduction` | string | ✓ | Texto introdutório das alternativas |
| `alternatives` | object[] | ✓ | Lista de alternativas |

### Metadata (Paginação)
| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `limit` | integer | ✓ | Número de itens por página |
| `offset` | integer | ✓ | Posição do primeiro item |
| `total` | integer | ✓ | Total de itens disponíveis |
| `hasMore` | boolean | ✓ | Indica se há mais páginas |

## Códigos de erro & tratamento

| HTTP | `error.code` | Quando ocorre | Ação recomendada |
| --- | --- | --- | --- |
| 400 | `bad_request` | query malformada | validar params |
| 404 | `not_found` | ano ou índice inexistente | mostrar “Não encontrado” |
| 422 | `unprocessable_entity` | tipos/valores inválidos | revisar payload |
| 429 | `rate_limit_exceeded` | > 1 req/s | back-off + retry |
| 500 | `internal_server_error` | falha interna | retry exponencial |

## Boas-práticas de consumo

### Rate Limiting
1. **Throttle client-side** para ≤ 1 req/s (Axios interceptor)
2. Implementar **back-off exponencial** para erro 429
3. **Cache in-memory** por sessão: resultados de `/exams` raramente mudam

### Paginação eficiente
4. Para `/questions`: usar `limit` entre 20-30 para otimizar latência
5. Implementar **scroll infinito** com base em `metadata.hasMore`
6. Persistir `offset` atual para permitir navegação entre páginas

### Performance de mídia
7. **Pré-carregar imagens** via `files[]` para evitar flicker na UI
8. Usar **lazy loading** para imagens de questões não visíveis
9. Implementar **cache de imagens** no browser/service worker

### Gestão de estado
10. **Persistir questões** no Pinia store para acesso offline
11. Salvar **progresso do usuário** (questões respondidas, tempo, etc.)
12. Implementar **sincronização** entre abas/dispositivos

### Geração de PDF
13. Converter imagens para **dataURL** antes de adicionar ao jsPDF
14. Renderizar questão completa: `context` + `files` + `alternatives`
15. Usar **alternativesIntroduction** como cabeçalho das opções
16. Incluir **metadados** (ano, disciplina, índice) no PDF

### Tratamento de dados
17. Validar **tipos de resposta** conforme especificação da API
18. Tratar campos **nullable** (`discipline`, `language`, `context`)
19. Implementar **fallbacks** para campos opcionais
20. Sanitizar **Markdown** em `context` antes de renderizar