const Usuario = require("../models/Usuario.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");

class AuthService {
    async login(email, senha) {
        if (!email || !senha) {
            throw new Error("E-mail e senha são obrigatórios.");
        }

        const usuario = await Usuario.findOne({ where: { email: email } });
        if (!usuario) {
            throw new Error("E-mail ou senha incorretos!");
        }

        if (usuario.microsoft_oid && !usuario.senha) {
            throw new Error('Esta conta deve ser acessada através do botão "Entrar com Microsoft".');
        }

        if (!usuario.senha) {
            throw new Error("E-mail ou senha incorretos!");
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            throw new Error("E-mail ou senha incorretos!");
        }

        // Login sucesso
        await Usuario.update({ logado: true }, { where: { id: usuario.id } });
        usuario.senha = undefined; // não retornar senha

        const token = this.gerarToken({
            id: usuario.id,
            nome: usuario.nome,
            tipo: usuario.tipo
        });

        return { usuario, token };
    }

    gerarToken({ id, nome, tipo }) {
        const payload = {
            id,
            nome,
            tipo,
            amr: ["mfa"],
        };
        return jwt.sign(payload, authConfig.secret, { expiresIn: "1d" });
    }
}

module.exports = new AuthService();
