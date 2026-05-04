const jwt = require("jsonwebtoken");
const configAutenticacao = require("../config/auth");

module.exports = (req, res, next) => {
    const cabecalhoAuth = req.headers.authorization;

    if (!cabecalhoAuth)
        return res.status(401).send({ error: "Nenhum token fornecido!" });

    const partes = cabecalhoAuth.split(" ");

    if (!partes.length === 2)
        return res.status(401).send({ error: "Erro no token!" });

    const [esquema, token] = partes;

    if (!/^Bearer$/i.test(esquema))
        return res.status(401).send({ error: "Token mal formatado!" });

    jwt.verify(token, configAutenticacao.secret, (err, decoded) => {
        if (err) return res.status(401).send({ error: "Token invalido!" });

        req.idUsuario = decoded.id;

        return next();
    });
};
