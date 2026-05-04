const servicoEmail = require('../services/ServicoEmail.js');

exports.enviarEmail = async (requisicao, resposta) => {
  try {
    // Mapeando dados de entrada (API Contract) para variáveis internas em Português
    const { to: destinatario, subject: assunto, text: texto, html: conteudoHtml } = requisicao.body;

    console.log(`[Email] Iniciando envio para: ${destinatario}`);

    // Garante que conteudoHtml seja string
    const corpoHtml = (conteudoHtml && typeof conteudoHtml === 'string') ? conteudoHtml : '';

    await servicoEmail.enviarEmail(destinatario, assunto, texto, corpoHtml);

    console.log("[Email] Enviado com sucesso.");
    return resposta.status(200).json({ message: 'E-mail enviado com sucesso!' });
  } catch (erro) {
    console.error("[Email] Erro ao enviar:", erro);
    return resposta.status(500).json({
      message: 'Erro ao enviar e-mail',
      erro: erro.message || erro
    });
  }
};
