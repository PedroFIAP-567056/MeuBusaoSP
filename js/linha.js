let linhasEncontradas = [];
let linhaAtual = null;
let paradasDaLinha = [];

async function buscarLinhas(termo) {
  const dados = await buscarNaApi('Linha/Buscar', { termosBusca: termo });

  if (dados.erro) {
    mensagem(dados.erro);
    return;
  }
  if (dados.length === 0) {
    mensagem('Nenhuma linha encontrada');
    return;
  }

  linhasEncontradas = dados;
  mostrarLinhas();
}

// sl 1 = vai do terminal principal (tp) pro secundário (ts), sl 2 = volta
function destino(linha) {
  return linha.sl === 1 ? linha.ts : linha.tp;
}

function mostrarLinhas() {
  marcadores.clearLayers();
  let html = '';

  for (let i = 0; i < linhasEncontradas.length; i++) {
    const linha = linhasEncontradas[i];
    html += `
      <button class="list-group-item list-group-item-action py-3" onclick="abrirLinha(${i})">
        <span class="badge letreiro">${linha.lt}-${linha.tl}</span> para <strong>${destino(linha)}</strong>
      </button>`;
  }

  resultados.innerHTML = html;
  mostrar('resultados');
}

async function abrirLinha(i) {
  const linha = linhasEncontradas[i];
  linhaAtual = linha.cl;

  document.getElementById('nome-linha').textContent = `${linha.lt}-${linha.tl} para ${destino(linha)}`;
  document.getElementById('info-linha').textContent = 'Carregando...';
  document.getElementById('paradas-linha').innerHTML = '';
  mostrar('detalhe-linha');

  // pontos por onde a linha passa
  paradasDaLinha = await buscarNaApi('Parada/BuscarParadasPorLinha', { codigoLinha: linhaAtual });
  if (paradasDaLinha.erro) paradasDaLinha = [];

  let html = '';
  for (const parada of paradasDaLinha) {
    html += `<li>${parada.np}</li>`;
  }
  document.getElementById('paradas-linha').innerHTML = html;

  carregarOnibus(true);
  clearInterval(timer);
  timer = setInterval(carregarOnibus, 30000);
}

async function carregarOnibus(primeiraVez) {
  const dados = await buscarNaApi('Posicao/Linha', { codigoLinha: linhaAtual });
  const info = document.getElementById('info-linha');

  if (dados.erro) {
    info.textContent = dados.erro;
    return;
  }

  marcadores.clearLayers();
  marcarParadas();

  for (const onibus of dados.vs) {
    marcarOnibus(onibus, 'Ônibus ' + onibus.p + (onibus.a ? '<br>Acessível' : ''));
  }

  info.textContent = `${dados.vs.length} ônibus circulando. Atualizado às ${dados.hr}`;

  if (primeiraVez === true) {
    if (paradasDaLinha.length > 0) {
      centralizar(paradasDaLinha.map(p => [p.py, p.px]));
    } else {
      centralizar(dados.vs.map(o => [o.py, o.px]));
    }
  }
}

// a API não manda os pontos na ordem do trajeto, então só marco cada um no mapa
function marcarParadas() {
  for (const parada of paradasDaLinha) {
    L.circleMarker([parada.py, parada.px], {
      radius: 4,
      color: '#1a73e8',
      weight: 2,
      fillColor: 'white',
      fillOpacity: 1
    }).bindTooltip(parada.np).addTo(marcadores);
  }
}
