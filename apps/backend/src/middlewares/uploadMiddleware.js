const multer = require("multer");

const armazenamento = multer.memoryStorage(); // salva em memória para facilitar leitura com XLSX
const middlewareUpload = multer({ storage: armazenamento });

module.exports = middlewareUpload;
