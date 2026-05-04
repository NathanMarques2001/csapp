const Cliente = require('../models/Cliente');
const Contrato = require('../models/Contrato');
const classifyCustomers = require('../utils/classifyCustomers');

const EXCEPTION_LIST = [
  "38532573000175" // ITA ALIMENTOS
];

function validateCPF(cpf) {
  cpf = cpf.replaceAll(".", "").replace("-", "");

  if (cpf.length !== 11) {
    console.log("FORMATO DE CPF INVALIDO!");
    return false;
  }

  if (/^(\d)\1+$/.test(cpf)) {
    console.log("FORMATO DE CPF INVALIDO!");
    return false;
  }

  const cpfArray = cpf.split('').map(Number);

  function calcularDigito(cpfParcial, pesos) {
    const soma = cpfParcial.reduce((acc, digit, idx) => acc + digit * pesos[idx], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  const pesos1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

  const primeiroDigito = calcularDigito(cpfArray.slice(0, 9), pesos1);
  const segundoDigito = calcularDigito(cpfArray.slice(0, 9).concat(primeiroDigito), pesos2);

  return primeiroDigito === cpfArray[9] && segundoDigito === cpfArray[10];
}


function validateCNPJ(cnpj) {
  cnpj = cnpj.replaceAll(".", "").replaceAll("/", "").replace("-", "");

  if (cnpj.length !== 14) {
    console.log("FORMATO DE CNPJ INVALIDO!");
    return false;
  }

  if (/^(\d)\1+$/.test(cnpj)) {
    console.log("FORMATO DE CNPJ INVALIDO!");
    return false;
  }

  const cnpjArray = cnpj.split('').map(Number);

  function calcularDigito(cnpjParcial, pesos) {
    const soma = cnpjParcial.reduce((acc, digit, idx) => acc + digit * pesos[idx], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const primeiroDigito = calcularDigito(cnpjArray.slice(0, 12), pesos1);
  const segundoDigito = calcularDigito(cnpjArray.slice(0, 12).concat(primeiroDigito), pesos2);

  return primeiroDigito === cnpjArray[12] && segundoDigito === cnpjArray[13];
}


function validateCPFOrCNPJ(cpf_cnpj, res) {
  cpf_cnpj = cpf_cnpj.replaceAll(".", "").replaceAll("/", "").replace("-", "");

  if (!EXCEPTION_LIST.includes(cpf_cnpj)) {
    if (cpf_cnpj.length === 11) {
      if (!validateCPF(cpf_cnpj)) {
        return res.status(400).send({ message: 'CPF inválido!' });
      }
    } else if (cpf_cnpj.length === 14) {
      if (!validateCNPJ(cpf_cnpj)) {
        return res.status(400).send({ message: 'CNPJ inválido!' });
      }
    } else {
      return res.status(400).send({ message: 'CPF/CNPJ inválido!' });
    }
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
  async index(req, res) {

    try {
      const { id } = req.params;

      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).send({ message: 'Cliente não encontrado!' });
      }

      return res.status(200).send({ cliente });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Erro ao buscar o cliente.' });
    }
  },

  async indexVendedor(req, res) {
    try {
      const { id } = req.params;
      const clientes = await Cliente.findAll({ where: { id_usuario: id } });

      if (clientes.length == 0) {
        return res.status(404).send({ message: 'Nenhum cliente cadastrado!' });
      }

      return res.status(200).send({ clientes });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar os clientes.' });
    }
  },

  async indexAll(req, res) {
    try {
      const clientes = await Cliente.findAll({
        order: [['nome_fantasia', 'ASC']]
      });

      if (clientes.length == 0) {
        return res.status(404).send({ message: 'Nenhum cliente cadastrado!' });
      }

      return res.status(200).send({ clientes });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Erro ao buscar os clientes.' });
    }
  },

  async migrate(req, res) {
    try {
      const { antigo_vendedor, novo_vendedor } = req.body;
      await Cliente.update({ id_usuario: novo_vendedor }, { where: { id_usuario: antigo_vendedor } });
      return res.status(200).send({ message: 'Migração de clientes realizada com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao migrar os clientes.' });
    }
  },

  async inactiveOrActive(req, res) {
    try {
      const { id } = req.params;

      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).send({ message: 'Cliente não encontrado!' });
      }

      if (cliente.status === 'ativo') {
        await Cliente.update({ status: 'inativo' }, { where: { id: id } });
        await Contrato.update({ status: 'inativo' }, { where: { id_cliente: id } });
        await classifyCustomers();
      } else {
        await Cliente.update({ status: 'ativo' }, { where: { id: id } });
      }

      return res.status(200).send({ message: 'Cliente e contratos inativados com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao inativar o cliente.' });
    }
  },

  async store(req, res) {
    try {
      const { razao_social, nome_fantasia, cpf_cnpj, id_usuario, nps, id_segmento, gestor_contratos_nome, gestor_contratos_email, gestor_contratos_nascimento, gestor_contratos_telefone_1, gestor_contratos_telefone_2, gestor_chamados_nome, gestor_chamados_email, gestor_chamados_nascimento, gestor_chamados_telefone_1, gestor_chamados_telefone_2, gestor_financeiro_nome, gestor_financeiro_email, gestor_financeiro_nascimento, gestor_financeiro_telefone_1, gestor_financeiro_telefone_2 } = req.body;

      const validationError = validateCPFOrCNPJ(cpf_cnpj, res);
      if (validationError) return validationError;

      const containsLetters = /[a-zA-Z]/;

      if (isNaN(nps)) {
        return res.status(400).send({ message: 'O campo NPS deve conter apenas números.' });
      }

      const data_criacao = formatDate(new Date());
      const tipo = "c";

      const cliente = await Cliente.create({ razao_social, nome_fantasia, cpf_cnpj, id_usuario, nps, id_segmento, tipo, data_criacao, gestor_contratos_nome, gestor_contratos_email, gestor_contratos_nascimento, gestor_contratos_telefone_1, gestor_contratos_telefone_2, gestor_chamados_nome, gestor_chamados_email, gestor_chamados_nascimento, gestor_chamados_telefone_1, gestor_chamados_telefone_2, gestor_financeiro_nome, gestor_financeiro_email, gestor_financeiro_nascimento, gestor_financeiro_telefone_1, gestor_financeiro_telefone_2 });

      return res.status(201).send({
        message: 'Cliente criado com sucesso!',
        cliente
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao criar o cliente.' });
    }
  },

  async update(req, res) {
    try {
      const { razao_social, nome_fantasia, cpf_cnpj, id_usuario, nps, id_segmento, gestor_contratos_nome, gestor_contratos_email, gestor_contratos_nascimento, gestor_contratos_telefone_1, gestor_contratos_telefone_2, gestor_chamados_nome, gestor_chamados_email, gestor_chamados_nascimento, gestor_chamados_telefone_1, gestor_chamados_telefone_2, gestor_financeiro_nome, gestor_financeiro_email, gestor_financeiro_nascimento, gestor_financeiro_telefone_1, gestor_financeiro_telefone_2, status } = req.body;
      const { id } = req.params;

      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).send({ message: 'Cliente não encontrado!' });
      }

      // Chama a função para validar CPF ou CNPJ
      const validationError = validateCPFOrCNPJ(cpf_cnpj, res);
      if (validationError) return validationError;

      const containsLetters = /[a-zA-Z]/;

      if (isNaN(nps)) {
        return res.status(400).send({ message: 'O campo NPS deve conter apenas números.' });
      }

      // Continua com a atualização do cliente se o CPF/CNPJ for válido
      await Cliente.update({ razao_social, nome_fantasia, cpf_cnpj, id_usuario, nps, id_segmento, gestor_contratos_nome, gestor_contratos_email, gestor_contratos_nascimento, gestor_contratos_telefone_1, gestor_contratos_telefone_2, gestor_chamados_nome, gestor_chamados_email, gestor_chamados_nascimento, gestor_chamados_telefone_1, gestor_chamados_telefone_2, gestor_financeiro_nome, gestor_financeiro_email, gestor_financeiro_nascimento, gestor_financeiro_telefone_1, gestor_financeiro_telefone_2, status }, { where: { id: id } });

      return res.status(200).send({ message: 'Cliente atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao atualizar o cliente.' });
    }
  },

  // async delete(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const cliente = await Cliente.findByPk(id);

  //     if (!cliente) {
  //       return res.status(404).send({ message: 'Cliente não encontrado!' });
  //     }

  //     Cliente.destroy({ where: { id: id } });

  //     return res.status(200).send({ message: 'Cliente deletado com sucesso!' });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).send({ message: 'Ocorreu um erro ao deletar o cliente.' });
  //   }
  // }
}
