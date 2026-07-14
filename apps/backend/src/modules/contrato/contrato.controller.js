const ContratoService = require('./contrato.service');
const catchAsync = require('../../utils/catchAsync');

class ContratoController {
  index = catchAsync(async (req, res) => {
    const { id } = req.params;
    const contrato = await ContratoService.findById(id);
    return res.status(200).send({ contrato });
  });

  indexClient = catchAsync(async (req, res) => {
    const { id } = req.params;
    const contratos = await ContratoService.findByClienteId(id);
    return res.status(200).send({ contratos });
  });

  indexVendedor = catchAsync(async (req, res) => {
    const { id } = req.params;
    const contratos = await ContratoService.findByUsuarioId(id);
    if (!contratos || contratos.length === 0) {
      return res.status(404).send({ message: 'Nenhum contrato cadastrado!' });
    }
    return res.status(200).send({ contratos });
  });

  indexAll = catchAsync(async (req, res) => {
    const contratos = await ContratoService.findAll();
    return res.status(200).send({ contratos });
  });

  store = catchAsync(async (req, res) => {
    const { contrato, aviso } = await ContratoService.create(req.body);
    let message = 'Contrato criado com sucesso!';
    if (aviso) message += ` (Aviso: ${aviso})`;
    
    return res.status(201).send({ message, contrato });
  });

  update = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ContratoService.update(id, req.body);
    
    let message = result.message;
    if (result.aviso) message += ` (Aviso: ${result.aviso})`;
    
    return res.status(200).send({ message, alteracoes: result.alteracoes });
  });

  importarContratosExcel = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).send({ message: 'Arquivo não enviado.' });
    }

    const resultado = await ContratoService.processarExcel(req.file.buffer);

    const statusFinal = resultado.erros.length > 0 ? 422 : 200;
    let mensagemFinal = `${resultado.sucessos.length} linha(s) processada(s) com sucesso.`;

    if (resultado.erros.length > 0) mensagemFinal += ` ${resultado.erros.length} linha(s) com erros.`;
    if (resultado.avisos.length > 0) mensagemFinal += ` ${resultado.avisos.length} linha(s) com avisos.`;

    return res.status(statusFinal).send({
      message: mensagemFinal,
      summary: {
        sucesso: resultado.sucessos.length,
        falhas: resultado.erros.length,
        avisos: resultado.avisos.length,
      },
      erros: resultado.erros,
      avisos: resultado.avisos,
    });
  });
}

module.exports = new ContratoController();
