# NutriSnap Backend

## Configuração
1) `cp .env.example .env` e ajuste as variáveis.
2) Crie o banco: `mysql -u root -p < schema.sql`
3) `npm i`
4) `npm run dev`

Rotas:
- `POST /api/autenticacao/registrar` {nome, email, senha}
- `POST /api/autenticacao/entrar` {email, senha}
- `GET /api/refeicoes` (Bearer token)
- `POST /api/refeicoes` {itens, calorias_totais, timestamp}
- `DELETE /api/refeicoes/:id`
- `GET /api/metas`
- `POST /api/metas` {peso_atual, peso_meta, dias, calorias_diarias}
- `GET /api/treinos`
- `POST /api/treinos` {plano}
- `POST /api/analise` {dadosImagemBase64}