---
name: FichaDetail Tabs — posicionamento e índices
description: Mapeamento dos valores de tab em ficha-detail.component.ts apos Spec 016 T11 (Equipamentos = 5)
type: project
---

Após Spec 016 T11, os tabs em ficha-detail.component.ts (jogador) têm os seguintes valores:

| Value | Aba |
|-------|-----|
| 0 | Resumo |
| 1 | Atributos |
| 2 | Aptidoes |
| 3 | Vantagens |
| 4 | Anotacoes |
| 5 | Equipamentos (novo — T11) |
| 6 | Prospecção |
| 7 | Galeria |

**Why:** Aba Equipamentos inserida na posição 5. Prospecção e Galeria deslocadas +1.

**How to apply:** Ao adicionar ou referenciar abas por value (ex: `abaAtiva.set(3)`), considerar o novo layout. O `carregarDadosAba` switch trata apenas 1, 2, 3 — Equipamentos carrega no próprio `ngOnInit` do `FichaEquipamentosTabComponent`.

## Localização dos arquivos novos (T11)

- `src/app/core/models/ficha-item.model.ts` — modelos alinhados com backend real
- `src/app/core/services/api/ficha-item.service.ts` — HTTP service
- `src/app/features/jogador/stores/ficha-equipamentos.store.ts` — signal store (providedIn: component)
- `src/app/features/jogador/pages/ficha-detail/components/ficha-equipamentos-tab/` — componentes da aba

## Backend FichaItemResponse (real, simplificado)

O backend retorna `FichaItemResponse` FLAT (sem nested tipo/raridade/efeitos/requisitos):
- `raridadeId`, `raridadeNome`, `raridadeCor` — campos planos
- `pesoEfetivo` — calculado pelo backend (peso * quantidade ou outra lógica)
- SEM efeitos, SEM requisitos, SEM tipoConfig na resposta

A spec original descrevia um modelo mais rico que a implementação real do backend.
