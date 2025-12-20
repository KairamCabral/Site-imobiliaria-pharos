## Integração DWV – Referência Técnica Inicial

### Endpoints confirmados
- `GET /integration/properties/avaliable_fields`
  - Lista todos os campos que o tenant pode solicitar no parâmetro `fields`.
- `GET /integration/properties`
  - Listagem principal de imóveis/unidades. Suporta filtros como `state`, `city`, `types`, `property_condition`, `min_price`, `max_price`, `updated_at_start/end`, `status` (`active`, `inactive`, `auto_inactive`), paginação (`page`, `per_page`) e seleção de campos (`fields=[]`).
- `GET /integration/properties/{id}`
  - Detalhe completo do imóvel/unidade, respeitando o mesmo contrato de `fields`.
- `GET /integration/properties/types`
  - Catálogo de tipos de imóvel disponíveis para filtros.
- `GET /integration/properties/conditions`
  - Catálogo de condições (lançamento, usado, dação etc.).
- `GET /integration/properties/cities`
  - Lista cidades/bairros disponíveis.

> Todos os endpoints acima exigem autenticação via header `Authorization: Bearer <DWV_API_TOKEN>` e `Accept: application/json`.

### Campos principais (resumo do `avaliable_fields`)
| Grupo | Exemplos |
| --- | --- |
| Identificação | `id`, `code`, `slug`, `integration_status`, `published_at`, `updated_at` |
| Localização | `address`, `number`, `zipcode`, `neighborhood`, `city`, `state`, `latitude`, `longitude` |
| Tipologia | `main_type`, `types[]`, `purpose`, `usage`, `property_condition` |
| Características | `bedrooms`, `suites`, `bathrooms`, `half_bathrooms`, `parking_spaces`, `floor`, `unit_position`, `furnished` |
| Áreas | `total_area`, `private_area`, `land_area`, `common_area`, `ceiling_height` |
| Financeiro | `sale_price`, `rent_price`, `condo_fee`, `iptu`, `currency`, `payment_options[]`, `accepts_exchange`, `accepts_fgts` |
| Empreendimento | `development.name`, `construction_status`, `delivery_forecast`, `towers`, `units_total` |
| Conteúdo | `title`, `headline`, `description`, `highlights[]`, `differentials[]` |
| Mídias | `photos[]`, `videos[]`, `floorplans[]`, `virtual_tours[]`, `brochures[]` |
| Atendimento | `contact.name`, `contact.email`, `contact.phone`, `sales_office` |

### Estrutura detalhada do payload (`GET /integration/properties`)
- **Nível da propriedade**: `id`, `code`, `slug`, `integration_status`, `status`, `construction_stage`, `rent`, `deleted`, `address_display_type`, `purpose`, `usage`, `payment_options[]`, `last_updated_at`.
- **Bloco `address`**: `street_name`, `street_number`, `neighborhood`, `complement`, `zip_code`, `city`, `state`, `country`, `latitude`, `longitude`, além do `text_address`.
- **Bloco `unit`** (quando existir): `id`, `title`, `price`, `type`, `floor_plan.category`, `section.name`, `parking_spaces`, `dorms`, `suites`, `bathroom`, `private_area`, `util_area`, `total_area`, `payment_conditions[]`, `cover`, `additional_galleries[]`.
- **Bloco `building`**: `id`, `title`, `gallery[]`, `architectural_plans[]`, `video`, `videos[]`, `tour_360`, `description[]`, `address`, `text_address`, `incorporation`, `cover`, `features[]`, `delivery_date`.
- **Bloco `third_party_property`** (dações): `id`, `title`, `price`, `type`, `unit_info`, `dorms`, `suites`, `bathroom`, `parking_spaces`, `private_area`, `util_area`, `total_area`, `address`, `gallery[]`, `cover`, `features[]`, `payment_conditions[]`.
- **Construtora (`construction_company`)**: `title`, `site`, `whatsapp`, `instagram`, `email`, `business_contacts[]`, `additionals_contacts[]`, `logo`.
- **Campos adicionais**: `development`/`building` features (`features[].tags`), mídias (`photos[]`, `floorplans[]`, `virtual_tours[]`, `brochures[]`), diferenciais (`highlights[]`, `differentials[]`), e contatos (`contact.name`, `contact.email`, `contact.phone`, `sales_office`).

> Fonte: documentação pública DWV [`https://api.dwvapp.com.br/`](https://api.dwvapp.com.br/) (Redoc).  
> **Importante:** o host de produção correto para integração é `https://agencies.dwvapp.com.br`.

### Estratégia de autenticação e limites
- Header obrigatório:  
  `Authorization: Bearer ${DWV_API_TOKEN}`  
  `Accept: application/json`
- Sugestão de timeout inicial: `DWV_TIMEOUT_MS=15000` (pode ser ajustado conforme latência real).
- Rate limit informado pelo suporte: 100 req/min por token. Implementar retry exponencial (máx. 3 tentativas) e backoff em caso de `429`.

#### ✅ Autenticação Confirmada

**Token atual (PRODUÇÃO):**
```
4b3e322a7773c8b3498606ed5d086a613171c65d542acbacd41b41af51d1d59a
```

**Ambiente:**
- ✅ **Produção**: `https://agencies.dwvapp.com.br`
- ❌ Sandbox: `https://apisandbox.dwvapp.com.br` (não usar)

**Permissões:**
- ✅ Acesso a `/integration/properties`
- ✅ Retorna unidades integradas via "Clube Premium → Integração DWV"
- ✅ Sem etapas adicionais de ativação (token pronto para uso)

**Observação importante:**
- Host de produção correto: `agencies.dwvapp.com.br`
- Host `api.dwvapp.com.br` retorna 404 para os endpoints de integração.
- O token testado anteriormente (`259837089bb8b5d3284d7e377f73af72c309b77515ddc858de00fc08f2b66ba1`) era inválido. O token atual foi confirmado como válido para produção.

### Próximos passos
1. Implementar `DwvProvider` utilizando este contrato.
2. Mapear respostas DWV para o domínio (`Property`, `Lead`), aplicando normalizações de moeda, área e mídias.
3. Criar fallback inteligente que combina DWV + Vista para campos ausentes.

### Testes manuais
1. Configure o `.env.local`:
   ```
   NEXT_PUBLIC_LISTING_PROVIDER=dual
   DWV_BASE_URL=https://agencies.dwvapp.com.br
   DWV_API_TOKEN=<token disponibilizado pela DWV>
   ```
2. Suba o projeto (`npm run dev`) e execute `npm run test:properties` para validar `/api/properties?limit=5`.
3. Para validar somente o DWV, ajuste `NEXT_PUBLIC_LISTING_PROVIDER=dwv` e rode:
   ```
   curl -H "Authorization: Bearer $DWV_API_TOKEN" "https://agencies.dwvapp.com.br/integration/properties?limit=1"
   ```
4. Monitore os headers `x-cache-*` da rota `/api/properties` para garantir cache e fallback para o Vista quando o payload DWV estiver indisponível.

