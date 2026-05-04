const transportador = require('../config/transporteEmail');

exports.enviarEmail = async (para, assunto, texto, html) => {
  const remetentePadrao = `"CSApp" <${process.env.SMTP_USER || "csappprolinx@gmail.com"}>`;
  const copiaOculta = process.env.SMTP_CC || "conexao@prolinx.com.br";

  return transportador.sendMail({
    from: remetentePadrao,
    to: para,
    cc: copiaOculta,
    subject: assunto,
    text: texto,
    html: html
  });
};