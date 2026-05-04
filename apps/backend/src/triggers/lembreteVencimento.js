import axios from "axios";
import Email from "../services/email.js";

function MailAvisoVencimento(clienteNome, clienteCNPJ, vencimento, vendedorNome) {
  const subject = `🚨 O contrato do cliente ${clienteNome} vence em breve!`;
  const text = `Olá, ${vendedorNome},\n\nO contrato do seu cliente ${clienteNome} (CNPJ: ${clienteCNPJ}) vence em ${vencimento}.\n\nEntre em contato com ele para verificar a renovação e garantir a continuidade do serviço.\n\nAtenção para não perder o prazo!\n\n(Envio Automático CSApp)`;
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aviso de Vencimento de Contrato</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f8f8;
            text-align: center;
            padding: 20px;
        }
        .container {
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            margin: auto;
        }
        h2 {
            color: #d9534f;
        }
        p {
            color: #333;
            font-size: 16px;
        }
        .highlight {
            font-weight: bold;
            color: #d9534f;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>🚨 O contrato do cliente vence em breve!</h2>
        <p>Olá, <span class="highlight">${vendedorNome}</span>,</p>
        <p>O contrato do seu cliente <span class="highlight">${clienteNome}</span> (<strong>CNPJ:</strong> ${clienteCNPJ}) vence em <span class="highlight">${vencimento}</span>.</p>
        <p>Entre em contato com ele para verificar a renovação e garantir a continuidade do serviço.</p>
        <p class="highlight">Atenção para não perder o prazo!</p>
        <p class="footer">Envio Automático CSApp</p>
    </div>
</body>
</html>`;

  return { subject, text, html };
}

function formatDateToDDMMYYYY(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

async function lembreteVencimento() {
  try {
    //const url = "http://localhost:8080";
    const url = "https://csapp.prolinx.com.br";
    const response = await axios.get(`${url}/api/vencimento-contratos/hoje`);

    const vencimentos = response.data.vencimentos;

    if (vencimentos && vencimentos.length > 0) {
      const emailService = new Email();

      for (const contratoVencimento of vencimentos) {
        const responseVencimento = await axios.get(`${url}/api/vencimento-contratos/email/${contratoVencimento.id_contrato}`);

        const { cliente_nome: clienteNome, cliente_cnpj: clienteCNPJ, usuario_nome: vendedorNome, usuario_email: vendedorEmail } = responseVencimento.data;

        const formattedVencimento = formatDateToDDMMYYYY(new Date(contratoVencimento.data_vencimento));

        const mailAviso = MailAvisoVencimento(clienteNome, clienteCNPJ, formattedVencimento, vendedorNome);

        const emailData = {
          to: vendedorEmail,
          subject: mailAviso.subject,
          text: mailAviso.text,
          html: mailAviso.html,
        };

        await emailService.sendEmail(emailData);
        console.log(`E-mail enviado para ${vendedorEmail} sobre o contrato de ${clienteNome}.`);
      }
    } else {
      console.log("Nenhum contrato vencendo hoje.");
    }
  } catch (err) {
    console.error("Erro ao verificar vencimento de contratos:", err);
  }
}

lembreteVencimento();
