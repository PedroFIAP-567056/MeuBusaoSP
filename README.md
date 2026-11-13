# Meu Busão SP

Trabalho da Global Solution 2026.2 de Application Development (FIAP).

App web que usa a API Olho Vivo da SPTrans para ajudar quem anda de ônibus em São Paulo.

## Funcionalidades

**Pontos**
- Busca um ponto de ônibus pelo nome ou endereço
- Mostra as linhas que vão passar e em quantos minutos cada ônibus chega
- Atualiza sozinho a cada 30 segundos
- Mostra no mapa o ponto e os ônibus que estão vindo
- Permite salvar pontos favoritos
- Filtro para mostrar só ônibus acessíveis

**Linhas**
- Busca uma linha pelo número ou nome
- Mostra no mapa onde estão os ônibus daquela linha agora
- Mostra no mapa e numa lista os pontos por onde a linha passa
- Atualiza sozinho a cada 30 segundos

## Arquivos

- `index.html`: página do app
- `css/style.css`: estilos
- `js/api.js`: função que busca os dados e cálculo dos minutos
- `js/app.js`: mapa, busca e painel
- `js/ponto.js`: pontos de ônibus, previsão de chegada e favoritos
- `js/linha.js`: linhas e posição dos ônibus
- `api/olhovivo.js`: função que roda no Vercel e acessa a API da SPTrans
- `servidor-local.js`: servidor para testar no computador

## Por que tem a pasta api

A API Olho Vivo não aceita ser chamada direto pelo navegador de outro site (CORS) e precisa
de um token que não pode ficar público no GitHub, nem exposto na chamada do front.

Por isso o site chama `/api/olhovivo`, que roda no servidor do Vercel. Essa função faz o login
na SPTrans com o token guardado na variável de ambiente `API_KEY`, busca os dados e devolve
para o site.

## Como rodar

Primeiro, gere um token na [área de desenvolvedores da SPTrans](https://www.sptrans.com.br/desenvolvedores/).

**No computador** (precisa do Node.js): crie um arquivo `.env` com `API_KEY=seu_token` e rode

```
node --env-file=.env servidor-local.js
```

Depois abra http://localhost:3000.

## Tecnologias

HTML, CSS, JavaScript, Bootstrap, Leaflet e a API Olho Vivo.

Dados fornecidos pela SPTrans.

Integrantes: ver `participantes.txt`.
