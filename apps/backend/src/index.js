const fs = require('fs');
require('dotenv').config();

let sessionSecret = process.env.SESSION_SECRET || 'secret_de_desenvolvimento_local';
try {
  if (fs.existsSync('/run/secrets/secret.json')) {
    const parsed = JSON.parse(fs.readFileSync('/run/secrets/secret.json', 'utf8'));
    if (parsed.secret) sessionSecret = parsed.secret;
    if (parsed.SESSION_SECRET) sessionSecret = parsed.SESSION_SECRET;
  }
} catch (e) {
  console.warn("Aviso: Falha ao ler /run/secrets/secret.json", e.message);
}

require('./database');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./config/passportConfig.js');
const cors = require('cors');
const globalErrorHandler = require('./common/exceptions/GlobalErrorHandlerMiddleware.js');
const usuarioRoutes = require('./routes/UsuariosRoutes.js');
const produtoRoutes = require('./modules/produtos/produto.routes.js');
const logsRoutes = require('./routes/LogsRoutes.js');
const fatosImportantesRoutes = require('./routes/FatosImportantesRoutes.js');
const fabricantesRoutes = require('./modules/fabricantes/fabricante.routes.js');
const contratosRoutes = require('./routes/ContratosRoutes.js');
const contatosTecnicosRoutes = require('./routes/ContatosTecnicosRoutes.js');
const contatosComerciaisRoutes = require('./routes/ContatosComerciaisRoutes.js');
const clienteRoutes = require('./routes/ClientesRoutes.js');
const segmentosRoutes = require('./modules/segmentos/segmento.routes.js');
const faturadosRoutes = require('./routes/FaturadosRoutes.js');
const reajustaContratosRoutes = require('./routes/ReajustaContratosRoutes.js');
const resetSenhaRoutes = require('./routes/ResetSenhaRoutes.js');
const vencimentoContratos = require('./routes/VencimentoContratosRoute.js');

const port = 8080;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.set('trust proxy', 1);

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/fatos-importantes', fatosImportantesRoutes);
app.use('/api/fabricantes', fabricantesRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/contatos-tecnicos', contatosTecnicosRoutes);
app.use('/api/contatos-comerciais', contatosComerciaisRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/segmentos', segmentosRoutes);
app.use('/api/faturados', faturadosRoutes);
app.use('/api/reajusta-contratos', reajustaContratosRoutes);
app.use('/api/reset-senha', resetSenhaRoutes);
app.use('/api/vencimento-contratos', vencimentoContratos);

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
