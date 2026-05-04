const axios = require("axios");

async function deletaTokensExpirados() {
  try {
    console.log("Iniciando deleção de tokens expirados...");
    // DEV
    //await axios.delete("http://localhost:8080/api/reset-senha/remove-expired-tokens");
    // PRD
    await axios.delete("https://csapp.prolinx.com.br/api/reset-senha/remove-expired-tokens");
    console.log("Deleção concluída.");
  } catch (err) {
    console.error(`Erro ao deletar tokens expirados: ${err.message}`);
  }
}

deletaTokensExpirados().then(tokens => console.log(tokens));