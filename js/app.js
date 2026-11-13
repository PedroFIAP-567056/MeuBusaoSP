const mapa = L.map('mapa', { zoomControl: false }).setView([-23.55, -46.63], 13);
L.control.zoom({ position: 'bottomright' }).addTo(mapa);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Dados: SPTrans | © OpenStreetMap'
}).addTo(mapa);

const marcadores = L.layerGroup().addTo(mapa);
const campoBusca = document.getElementById('campo-busca');
const resultados = document.getElementById('resultados');

let modo = 'ponto';
let timer = null;

function mostrar(id) {
  document.getElementById('painel').classList.remove('d-none');
  document.getElementById('resultados').classList.add('d-none');
  document.getElementById('detalhe-ponto').classList.add('d-none');
  document.getElementById('detalhe-linha').classList.add('d-none');
  document.getElementById(id).classList.remove('d-none');
}

function mensagem(texto) {
  resultados.innerHTML = `<p class="p-3 mb-0 text-muted">${texto}</p>`;
  mostrar('resultados');
}

// deixa uma margem pra não ficar nada escondido atrás do painel
function centralizar(posicoes) {
  if (posicoes.length === 0) return;

  const celular = window.innerWidth < 768;
  mapa.fitBounds(posicoes, {
    paddingTopLeft: celular ? [20, 140] : [440, 20],
    paddingBottomRight: celular ? [20, window.innerHeight / 2] : [40, 40],
    maxZoom: 15
  });
}

// py = latitude, px = longitude
function marcarOnibus(onibus, texto) {
  L.circleMarker([onibus.py, onibus.px], {
    radius: 8,
    color: 'white',
    weight: 2,
    fillColor: '#d93025',
    fillOpacity: 1
  }).bindPopup(texto).addTo(marcadores);
}

function trocarModo(novoModo) {
  modo = novoModo;
  document.getElementById('chip-ponto').classList.toggle('ativo', modo === 'ponto');
  document.getElementById('chip-linha').classList.toggle('ativo', modo === 'linha');
  campoBusca.placeholder = modo === 'ponto' ? 'Buscar ponto de ônibus' : 'Buscar linha (ex: 8000)';
}

function voltar() {
  clearInterval(timer);
  if (modo === 'ponto') {
    mostrarPontos();
  } else {
    mostrarLinhas();
  }
}

document.getElementById('form-busca').addEventListener('submit', function (e) {
  e.preventDefault();
  clearInterval(timer);
  mensagem('Buscando...');

  if (modo === 'ponto') {
    buscarPontos(campoBusca.value);
  } else {
    buscarLinhas(campoBusca.value);
  }
});
