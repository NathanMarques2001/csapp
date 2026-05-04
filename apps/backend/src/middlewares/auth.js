const jwt = require('jsonwebtoken');

const authConfig = require('/var/www/scrt/secret.json');

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
