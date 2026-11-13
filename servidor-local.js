// Servidor só para testar no computador: node --env-file=.env servidor-local.js
const http = require('http');
const fs = require('fs');
const olhovivo = require('./api/olhovivo.js');

const tipos = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript' };

const BASE_URL = 'http://localhost'
const PORT = 3000

http.createServer(function (req, res) {
  const url = new URL(req.url, BASE_URL);

  if (url.pathname === '/api/olhovivo') {
    req.query = Object.fromEntries(url.searchParams);
    res.status = function (codigo) {
      res.statusCode = codigo;
      return res;
    };
    res.json = function (dados) {
      res.end(JSON.stringify(dados));
    };
    olhovivo(req, res);
    return;
  }

  const arquivo = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  fs.readFile(arquivo, function (erro, conteudo) {
    if (erro) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader('Content-Type', tipos[arquivo.split('.').pop()]);
    res.end(conteudo);
  });
}).listen(PORT);

console.log(`Ouvindo: ${BASE_URL}:${PORT}`);
