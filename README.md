# Abaixo do Subzero

Uma régua competitiva bem-humorada para comparar o elo de um jogador com o seu auge e com o seu nível atual.

O protótipo combina:

- elo atual e maior elo no League of Legends;
- elo atual e maior elo no VALORANT;
- nível informado manualmente na Gamers Club;
- duas barras de proximidade: contra você no auge e contra você hoje;
- persistência exclusivamente local com `localStorage`.

## Rodar localmente

O site é estático. Abra `dist/index.html` diretamente ou sirva a pasta:

```bash
python3 -m http.server 4173 --directory dist
```

Depois, acesse `http://localhost:4173`.

## Estado das integrações

Esta primeira versão usa seleção manual de elos para demonstrar a experiência completa sem chaves ou servidor. A integração oficial com a Riot deverá ser feita em uma próxima etapa, por meio de um backend que preserve a chave da API. O nível da Gamers Club permanece manual.

## Aviso

Projeto independente, feito para brincadeira. Não é afiliado à Riot Games ou à Gamers Club.
