const Contrato = require('../models/Contrato');
const Cliente = require('../models/Cliente');

function valueWithTax(value, tax) {
  return value + ((value * tax) / 100);
}

async function classifyCustomers() {
  try {
    console.log('[classifyCustomers] Iniciando classificação...');
    const clientes = await Cliente.findAll();
    const clientesPorFaturamento = [];

    for (const cliente of clientes) {
      const contratos = await Contrato.findAll({
        where: { id_cliente: cliente.id, status: 'ativo' }
      });

      const faturamentoTotal = contratos.reduce((total, contrato) => {
        const valorMensal = parseFloat(contrato.valor_mensal);
        const indiceReajuste = parseFloat(contrato.indice_reajuste);

        if (isNaN(valorMensal) || isNaN(indiceReajuste)) {
          console.warn(`[classifyCustomers] Contrato inválido para cliente ${cliente.id}: valores NaN`);
          return total;
        }

        return total + valueWithTax(valorMensal, indiceReajuste);
      }, 0);

      clientesPorFaturamento.push({ cliente, faturamentoTotal });
    }

    clientesPorFaturamento.sort((a, b) => b.faturamentoTotal - a.faturamentoTotal);

    for (let i = 0; i < clientesPorFaturamento.length; i++) {
      const { cliente, faturamentoTotal } = clientesPorFaturamento[i];
      let tipo;

      if (i < 30) tipo = 'top 30';
      else if (faturamentoTotal >= 3000) tipo = 'a';
      else if (faturamentoTotal >= 1000) tipo = 'b';
      else tipo = 'c';

      await Cliente.update({ tipo }, { where: { id: cliente.id } });
      console.log(`[classifyCustomers] Cliente ${cliente.id} classificado como "${tipo}" (faturamento: ${faturamentoTotal})`);
    }

    console.log('[classifyCustomers] Classificação finalizada.');
  } catch (error) {
    console.error('[classifyCustomers] Erro ao classificar os clientes:', error);
  }
}

module.exports = classifyCustomers;
