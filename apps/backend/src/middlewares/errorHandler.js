const AppError = require('../utils/AppError');

// Dicionário global para traduzir os nomes técnicos das colunas do banco para nomes amigáveis
const mapCampos = {
  cpf_cnpj: 'CPF/CNPJ',
  razao_social: 'Razão Social',
  nome_fantasia: 'Nome Fantasia',
  email: 'E-mail',
  microsoft_oid: 'ID da Conta Microsoft',
  nome: 'Nome',
  codigo: 'Código',
  data_criacao: 'Data de Criação',
  senha: 'Senha',
  telefone: 'Telefone',
  status: 'Status',
  id_usuario: 'Usuário Responsável',
  id_segmento: 'Segmento'
};

const handleSequelizeUniqueConstraintError = (err) => {
  const campo = err.errors && err.errors[0] ? err.errors[0].path : 'campo';
  const valor = err.errors && err.errors[0] ? err.errors[0].value : '';
  
  const campoFormatado = mapCampos[campo] || campo; // Fallback para o nome real se não mapeado
  
  const message = valor 
    ? `O ${campoFormatado} '${valor}' já está em uso.`
    : `Já existe um registro cadastrado com este ${campoFormatado}.`;
    
  return new AppError(message, 400);
};

const handleSequelizeValidationError = (err) => {
  const errosMapeados = err.errors ? err.errors.map(el => {
    const campo = mapCampos[el.path] || el.path;
    
    // Se há uma mensagem customizada definida no Model e não for a mensagem em inglês padrão do Sequelize
    if (el.message && !el.message.startsWith('Validation') && !el.message.includes('cannot be null')) {
      return `${campo}: ${el.message}`;
    }
    
    // Traduz os tipos de validação automática do Sequelize
    switch (el.validatorKey) {
      case 'isEmail':
        return `O campo ${campo} precisa ter um formato de e-mail válido (ex: nome@email.com)`;
      case 'not_null':
      case 'is_null':
      case 'notEmpty':
        return `O campo ${campo} é obrigatório e não pode ficar vazio`;
      case 'len':
        return `O campo ${campo} não atende ao limite de caracteres exigido`;
      case 'isDate':
        return `O campo ${campo} deve conter uma data válida (ex: AAAA-MM-DD ou DD/MM/AAAA)`;
      case 'isInt':
      case 'isNumeric':
        return `O campo ${campo} deve conter apenas números`;
      case 'max':
        return `O campo ${campo} excede o valor numérico máximo permitido`;
      case 'min':
        return `O campo ${campo} é menor do que o valor numérico mínimo permitido`;
      case 'isBefore':
        return `O campo ${campo} deve ser anterior à data limite estipulada`;
      case 'isAfter':
        return `O campo ${campo} deve ser posterior à data limite estipulada`;
      case 'isIn':
        return `O campo ${campo} contém um valor que não é aceito pelas opções disponíveis`;
      default:
        return `O campo ${campo} está com um formato inválido`;
    }
  }) : [];

  const message = `Por favor, verifique os dados: ${errosMapeados.join(' | ')}.`;
  return new AppError(message, 400);
};

const handleSequelizeForeignKeyConstraintError = (err) => {
  return new AppError('Não é possível realizar esta ação porque o registro possui dependências no sistema.', 400);
};

const handleSequelizeDatabaseError = (err) => {
  if (err.parent) {
    if (err.parent.code === 'ER_DATA_TOO_LONG') {
      const match = err.parent.message.match(/column '(.+?)'/);
      const coluna = match ? match[1] : 'campo';
      
      const campoFormatado = mapCampos[coluna] || coluna;
      
      return new AppError(`O valor inserido no campo ${campoFormatado} excede o limite máximo de caracteres permitido pelo banco de dados.`, 400);
    }
    if (err.parent.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
      return new AppError('Um dos valores numéricos inseridos está muito grande ou fora do limite aceito pelo sistema.', 400);
    }
    if (err.parent.code === 'ER_TRUNCATED_WRONG_VALUE' || err.parent.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      const columnMatch = err.parent.message.match(/column '(.+?)'/);
      const typeMatch = err.parent.message.match(/Incorrect (.+?) value/);

      if (columnMatch && typeMatch) {
        const coluna = columnMatch[1];
        const tipoSQL = typeMatch[1].toLowerCase();
        const campoFormatado = mapCampos[coluna] || coluna;
        
        let formatoEsperado = 'válido';
        if (tipoSQL.includes('date') || tipoSQL.includes('datetime') || tipoSQL.includes('timestamp')) {
          formatoEsperado = 'de data (ex: AAAA-MM-DD)';
        } else if (tipoSQL.includes('int') || tipoSQL.includes('double') || tipoSQL.includes('decimal')) {
          formatoEsperado = 'numérico (apenas números)';
        } else if (tipoSQL.includes('time')) {
          formatoEsperado = 'de hora (ex: HH:MM)';
        }

        return new AppError(`Valor incorreto inserido em ${campoFormatado}. O formato precisa ser ${formatoEsperado}.`, 400);
      }

      return new AppError('O formato do valor informado está incorreto e não foi possível salvar.', 400);
    }
  }
  return err; // Caso contrário mantem como 500
};

module.exports = (err, req, res, next) => {
  let error = err;
  
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Mapeamento global de erros do Sequelize
  if (error.name === 'SequelizeUniqueConstraintError') {
    error = handleSequelizeUniqueConstraintError(error);
  } else if (error.name === 'SequelizeValidationError') {
    error = handleSequelizeValidationError(error);
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    error = handleSequelizeForeignKeyConstraintError(error);
  } else if (error.name === 'SequelizeDatabaseError') {
    error = handleSequelizeDatabaseError(error);
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  } else {
    // Produção
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      console.error('ERROR 💥', error);
      res.status(500).json({
        status: 'error',
        message: 'Ocorreu um erro interno. Por favor, tente novamente mais tarde.',
      });
    }
  }
};
