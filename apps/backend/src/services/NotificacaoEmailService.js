const Email = require("./EmailService");
const Usuario = require("../models/Usuario");
const Cliente = require("../models/Cliente");
const Contrato = require("../models/Contrato");

// Função para escapar caracteres especiais em HTML
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function enviarEmailNotificacao({ id_usuario, id_contrato, descricao, modulo }) {
  if (!id_usuario) return;

  const usuario = await Usuario.findByPk(id_usuario);
  const contrato = await Contrato.findByPk(id_contrato);
  const cliente = await Cliente.findByPk(contrato.id_cliente);

  if (!usuario || !usuario.email) {
    console.log("[NOTIF_EMAIL] Usuário ou email não encontrado para id_usuario=", id_usuario);
    return;
  }

  const emailService = new Email();
  const subject = `Aviso de ${modulo === 'Contrato' ? 'Vencimento' : 'Reajuste'} Contratual - ${cliente.razao_social}`;
  const text = descricao;

  const linkContrato = `https://csapp.prolinx.com.br/edicao-contrato/${id_contrato}`;

  // Escapa HTML antes de aplicar destaque
  let highlightedDescricao = escapeHtml(descricao || "");

  try {
    const regex = /vence[^.]*\.?/ig;
    highlightedDescricao = highlightedDescricao.replace(regex, (match) => {
      return `<span style="color:#ff0000;font-weight:700;">${match}</span>`;
    });
  } catch (err) {
    highlightedDescricao = escapeHtml(descricao || "");
  }

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.5;">
        <p>${highlightedDescricao}</p>

        <div style="margin: 24px 0;">
          <a
            href="${linkContrato}"
            target="_blank"
            style="
              background-color: #2563eb;
              color: #ffffff;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              display: inline-block;
            "
          >
            Acessar contrato
          </a>
        </div>

        <p style="font-size: 12px; color: #777;">
          Este é um aviso automático enviado pelo sistema.
        </p>
    </div>
  `;

  try {
    await emailService.enviarEmail({
      to: usuario.email,
      subject,
      text,
      html
    });
    console.log(`[NOTIF_EMAIL] Enviado para ${usuario.email} sobre contrato ID ${id_contrato}`);
  } catch (err) {
    console.error("[NOTIF_EMAIL] Erro ao enviar email:", err);
    throw err;
  }
}

module.exports = { enviarEmailNotificacao };
