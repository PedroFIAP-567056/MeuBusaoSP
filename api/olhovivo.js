// Chama a API Olho Vivo pelo servidor, para o token não ficar no site
const URL_API = 'https://api.olhovivo.sptrans.com.br/v2.1';

module.exports = async function (req, res) {
  const { rota } = req.query;

  // rotas permitidas
  const rotas = ['Parada/Buscar', 'Previsao/Parada', 'Linha/Buscar', 'Posicao/Linha', 'Parada/BuscarParadasPorLinha'];
  const ehRotaPermitida = rotas.includes(rota);

  if (!ehRotaPermitida) {
    res.status(400).json({ erro: 'Rota inválida' });
    return;
  }

  try {
    // Login
    const login_url = `${URL_API}/Login/Autenticar?token=${process.env.API_KEY}`;
    const login = await fetch(login_url, { method: 'POST', body: '' });
    const logou = await login.json();

    if (!logou) {
      res.status(500).json({ erro: 'Não foi possível fazer login na API' });
      return;
    }

    // Consulta
    const parametros = new URLSearchParams(req.query);
    parametros.delete('rota');

    const headers = { Cookie: login.headers.get('set-cookie') };
    const url = `${URL_API}/${rota}?${parametros}`;
    const resposta = await fetch(url, { headers });

    if (!resposta.ok) {
      res.status(502).json({ erro: 'A API da SPTrans retornou erro ' + resposta.status });
      return;
    }

    const dados = await resposta.json();
    res.status(200).json(dados);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao acessar a API da SPTrans' });
  }
};