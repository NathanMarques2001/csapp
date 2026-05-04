import axios from "axios";

async function reajustaContratos() {
  try {
    console.log("Iniciando reajuste de contratos...");
    // DEV
    //await axios.get("http://localhost:8080/api/reajusta-contratos");
    // PRD
    await axios.get("https://csapp.prolinx.com.br/api/reajusta-contratos");
    console.log("Reajuste concluído.");
  } catch (err) {
    console.error(`Erro ao reajustar contratos: ${err.message}`);
  }
}

reajustaContratos().then(contratos => console.log(contratos));
