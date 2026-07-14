const Cliente = require("../models/Cliente");
const Contrato = require("../models/Contrato");
const classificarClientes = require("../utils/classificacaoClientes");
const { Op } = require("sequelize");

class ClienteService {
    async findById(id) {
        return await Cliente.findByPk(id);
    }

    async findByGrupoEconomico(id) {
        return await Cliente.findAll({ where: { id_grupo_economico: id } });
    }

    async findAll() {
        return await Cliente.findAll({ order: [["nome_fantasia", "ASC"]] });
    }

    async create(data) {
        return await Cliente.create(data);
    }

    async migrate(antigo_vendedor, novo_vendedor) {
        return await Cliente.update(
            { id_usuario: novo_vendedor },
            { where: { id_usuario: antigo_vendedor } }
        );
    }

    async toggleStatus(id) {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) throw new Error("Cliente não encontrado!");

        if (cliente.status === "ativo") {
            await Cliente.update({ status: "inativo" }, { where: { id } });
            await Contrato.update({ status: "inativo" }, { where: { id_cliente: id } });
            await classificarClientes();
            return "Cliente e contratos inativados com sucesso!";
        } else {
            await Cliente.update({ status: "ativo" }, { where: { id } });
            await classificarClientes();
            return "Cliente ativado com sucesso!";
        }
    }

    async update(id, data) {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) throw new Error("Cliente não encontrado!");

        await Cliente.update(data, { where: { id } });
        await classificarClientes();
        return await Cliente.findByPk(id);
    }

    async findGestoresComNascimento() {
        return await Cliente.findAll({
            where: {
                [Op.or]: [
                    { gestor_chamados_nascimento: { [Op.ne]: null } },
                    { gestor_contratos_nascimento: { [Op.ne]: null } },
                    { gestor_financeiro_nascimento: { [Op.ne]: null } },
                ],
            },
            order: [["nome_fantasia", "ASC"]],
        });
    }
}

module.exports = new ClienteService();
