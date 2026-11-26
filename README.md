# Abaixo do Subzero

Uma régua competitiva bem-humorada para comparar o elo de um jogador com a conta `fr0sty#BR4`, identidade do Subzero.

O aplicativo combina:

- elo atual do League of Legends consultado automaticamente pelo Riot ID;
- elo atual do VALORANT selecionado pelo jogador;
- nível informado manualmente na Gamers Club;
- três barras individuais contra o fr0sty atual;
- média geral das porcentagens de LoL, VALORANT e Gamers Club;
- persistência exclusivamente local com `localStorage`.

## Rodar localmente

Gere o Worker e inicie a prévia local:

```bash
node scripts/build-worker.mjs
node scripts/preview-worker.mjs
```

Depois, acesse `http://localhost:4173`.

## Integração Riot

O backend consulta Account-V1, Summoner-V4 e League-V4. A chave deve ser configurada no servidor como o segredo `RIOT_API_KEY`; ela nunca é enviada ao navegador.

As referências do Subzero são:

- hoje: LoL Diamante I 75 LP, VALORANT Diamante 3 e GC nível 20;
- auge: LoL Mestre 217 LP, VALORANT Imortal 1 e GC nível 20.

## Aviso

Projeto independente, feito para brincadeira. Não é afiliado à Riot Games ou à Gamers Club.
