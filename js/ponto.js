let pontosEncontrados = [];
let pontoAtual = null;
let previsao = null;

async function buscarPontos(termo) {
  const dados = await buscarNaApi('Parada/Buscar', { termosBusca: termo });

  if (dados.erro) {
    mensagem(dados.erro);
    return;
  }
  if (dados.length === 0) {
    mensagem('Nenhum ponto encontrado');
    return;
  }

  pontosEncontrados = dados.slice(0, 20);
  mostrarPontos();
}

function mostrarPontos() {
  if (pontosEncontrados.length === 0) {
    mensagem('Busque um ponto de ônibus');
    return;
  }

  marcadores.clearLayers();
  let html = '';

  for (let i = 0; i < pontosEncontrados.length; i++) {
    const ponto = pontosEncontrados[i];

    L.marker([ponto.py, ponto.px]).bindTooltip(ponto.np).addTo(marcadores).on('click', function () {
      abrirPonto(ponto);
    });

    html += `
      <button class="list-group-item list-group-item-action py-3" onclick="abrirPonto(pontosEncontrados[${i}])">
        <strong>${ponto.np}</strong><br>
        <small class="text-muted">${ponto.ed}</small>
      </button>`;
  }

  resultados.innerHTML = html;
  mostrar('resultados');
  centralizar(pontosEncontrados.map(p => [p.py, p.px]));
}

function abrirPonto(ponto) {
  pontoAtual = ponto;
  document.getElementById('nome-ponto').textContent = ponto.np;
  document.getElementById('lista-previsao').innerHTML = '<li class="list-group-item">Carregando...</li>';
  atualizarBotaoSalvar();
  mostrar('detalhe-ponto');
  centralizar([[ponto.py, ponto.px]]);

  carregarPrevisao();
  clearInterval(timer);
  timer = setInterval(carregarPrevisao, 30000);
}

async function carregarPrevisao() {
  const dados = await buscarNaApi('Previsao/Parada', { codigoParada: pontoAtual.cp });

  if (dados.erro) {
    document.getElementById('lista-previsao').innerHTML = `<li class="list-group-item text-danger">${dados.erro}</li>`;
    return;
  }

  previsao = dados;
  mostrarPrevisao();
}

function mostrarPrevisao() {
  const soAcessiveis = document.getElementById('so-acessiveis').checked;
  document.getElementById('hora-ponto').textContent = previsao.hr;

  marcadores.clearLayers();
  L.marker([pontoAtual.py, pontoAtual.px]).addTo(marcadores);

  let html = '';

  // quando não tem ônibus previsto o "p" vem null
  if (previsao.p) {
    // O(L + V), sendo L = linhas no ponto e V = total de ônibus previstos
    for (const linha of previsao.p.l) {
      let onibus = linha.vs;
      if (soAcessiveis) {
        onibus = onibus.filter(o => o.a);
      }
      if (onibus.length === 0) continue;

      let tempos = '';
      for (const o of onibus.slice(0, 3)) { 
        const minutos = minutosAte(previsao.hr, o.t);
        tempos += `<div class="text-end ms-3"><span class="tempo">${minutos <= 0 ? 'Chegando' : minutos + ' min'}</span>`;
        if (o.a) tempos += '<br><span class="badge text-bg-light">Acessível</span>';
        tempos += '</div>';

        marcarOnibus(o, `${linha.c}<br>Chega às ${o.t}`);
      }

      // lt0 = destino da linha
      html += `
        <li class="list-group-item d-flex justify-content-between align-items-center py-3">
          <div>
            <span class="badge letreiro">${linha.c}</span>
            <div class="small mt-1">para ${linha.lt0}</div>
          </div>
          <div class="d-flex">${tempos}</div>
        </li>`;
    }
  }

  if (html === '') {
    html = '<li class="list-group-item text-muted">Nenhum ônibus previsto agora</li>';
  }
  document.getElementById('lista-previsao').innerHTML = html;
}

// favoritos (ficam salvos no localStorage)

function lerFavoritos() {
  return JSON.parse(localStorage.getItem('favoritos')) || [];
}

function ehFavorito() {
  return lerFavoritos().some(f => f.cp === pontoAtual.cp);
}

function atualizarBotaoSalvar() {
  document.getElementById('botao-favorito').textContent = ehFavorito() ? 'Salvo' : 'Salvar';
}

function salvarFavorito() {
  let favoritos = lerFavoritos();

  if (ehFavorito()) {
    favoritos = favoritos.filter(f => f.cp !== pontoAtual.cp);
  } else {
    favoritos.push(pontoAtual);
  }

  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  atualizarBotaoSalvar();
  mostrarFavoritos();
}

function mostrarFavoritos() {
  const favoritos = lerFavoritos();
  let html = '';

  for (let i = 0; i < favoritos.length; i++) {
    html += `<button class="chip" onclick="abrirFavorito(${i})">★ ${favoritos[i].np}</button>`;
  }
  document.getElementById('favoritos').innerHTML = html;
}

function abrirFavorito(i) {
  trocarModo('ponto');
  abrirPonto(lerFavoritos()[i]);
}

mostrarFavoritos();
