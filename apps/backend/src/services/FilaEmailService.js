const { enviarEmailNotificacao } = require("./NotificacaoEmailService");

// Simples fila em memória para envio de emails de notificação.
// Processamento em background com controle de concorrência.
const fila = [];
let ativos = 0;
const CONCORRENCIA = 2;

async function processador(tarefa) {
  try {
    await enviarEmailNotificacao(tarefa);
  } catch (err) {
    console.error("[FILA_EMAIL] Erro no envio de email (tarefa):", err);
  }
}

function processarFila() {
  if (ativos >= CONCORRENCIA) return;
  const tarefa = fila.shift();
  if (!tarefa) return;
  ativos += 1;
  // roda sem bloquear o loop principal
  setImmediate(async () => {
    try {
      await processador(tarefa);
    } finally {
      ativos -= 1;
      // continuar processando enquanto houver tarefas
      if (fila.length > 0) processarFila();
    }
  });
}

function enfileirarNotificacaoEmail(tarefa) {
  fila.push(tarefa);
  // dispara processamento
  processarFila();
}

module.exports = { enfileirarNotificacaoEmail };
