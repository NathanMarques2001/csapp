const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

let authConfig = {};
try {
  if (fs.existsSync('/run/secrets/secret.json')) {
    authConfig = JSON.parse(fs.readFileSync('/run/secrets/secret.json', 'utf8'));
  } else if (fs.existsSync('/var/www/scrt/secret.json')) {
    authConfig = JSON.parse(fs.readFileSync('/var/www/scrt/secret.json', 'utf8'));
  }
} catch (e) {
  console.warn("Aviso: Falha ao ler secrets em auth.js", e.message);
}
if (!authConfig.secret) {
    authConfig.secret = process.env.SESSION_SECRET || 'secret_de_desenvolvimento_local';
}

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).send({ error: 'Nenhum token fornecido!' });

  const partes = authHeader.split(' ');

  if (!partes.length === 2)
    return res.status(401).send({ error: 'Erro no token!' });

  const [bearer, token] = partes;

  if (!/^Bearer$/i.test(bearer))
    return res.status(401).send({ error: 'Token mal formatado!' });

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) return res.status(401).send({ error: 'Token invalido!' });

    req.userId = decoded.id;

    return next();
  });
}
