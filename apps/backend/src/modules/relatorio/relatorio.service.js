const RelatorioRepository = require('./relatorio.repository');

class RelatorioService {
  async getRelatorioGeral() {
    const resultados = await RelatorioRepository.getRelatorioGeral();

    return resultados.map(item => {
      return {
        ...item,
        vencimento_calculado: this.calculateNextVencimento(item.data_inicio, item.duracao)
      };
    });
  }

  calculateNextVencimento(dataInicio, duracao) {
    if (!dataInicio) return null;
    const duracaoMeses = parseInt(duracao);
    if (!duracaoMeses || duracaoMeses <= 0) return null;
    if (duracaoMeses === 12000) return 'Indeterminado';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let data = new Date(dataInicio);
    if (isNaN(data.getTime())) return null;

    data.setMonth(data.getMonth() + duracaoMeses);

    if (data < hoje) {
      let safeCounter = 0;
      while (data < hoje && safeCounter < 1000) {
        data.setMonth(data.getMonth() + duracaoMeses);
        safeCounter++;
      }
    }
    return data;
  }
}

module.exports = new RelatorioService();
