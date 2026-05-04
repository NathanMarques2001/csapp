function MailResetSenha(hash) {
  const resetLink = `https://csapp.prolinx.com.br/reset-senha?hash=${hash}`;
  const emailContent = {
    "reset-senha": {
      subject: "Redefinição de Senha",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinição de Senha</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
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
                .btn {
                    display: inline-block;
                    background: #d9534f;
                    color: #ffffff;
                    padding: 12px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 18px;
                    margin-top: 20px;
                }
                .btn:hover {
                    background: #c9302c;
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
                <h2>🚨 Ação Necessária: Redefinição de Senha</h2>
                <p>Olá,</p>
                <p>Detectamos uma solicitação de alteração de senha para sua conta. Para garantir sua segurança, clique no botão abaixo e redefina sua senha agora mesmo:</p>
                <a href="${resetLink}" class="btn">Redefinir Senha</a>
                <p>Se você não solicitou essa alteração, recomendamos verificar sua conta e entrar em contato conosco.</p>
                <p class="footer">Envio Automático CSApp</p>
            </div>
        </body>
        </html>
      `,
      text: `Olá, detectamos uma solicitação de alteração de senha para sua conta. Para garantir sua segurança, acesse o link para redefinir sua senha: ${resetLink}`,
    },
  };
  return emailContent;
}

export default MailResetSenha;
