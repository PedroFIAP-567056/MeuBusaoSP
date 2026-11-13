async function buscarNaApi(rota, parametros) {
  parametros.rota = rota;
  try {
    const resposta = await fetch('/api/olhovivo?' + new URLSearchParams(parametros));
    return await resposta.json();
  } catch (erro) {
    return { erro: 'Não foi possível buscar os dados. Tente novamente.' };
  }
}

// Minutos entre dois horários "HH:MM"
function minutosAte(horarioAtual, horarioChegada) {
  const [hAtual, mAtual] = horarioAtual.split(':');
  const [hChegada, mChegada] = horarioChegada.split(':');

  const totalMinutosChegada = (hChegada * 60) + Number(mChegada);
  const totalMinutosAtual = (hAtual * 60) + Number(mAtual);

  let minutos = totalMinutosChegada - totalMinutosAtual;

  // passou da meia-noite (se a diferença passar de 12h negativas)
  if (minutos < -720) minutos += 1440;

  return minutos;
}
