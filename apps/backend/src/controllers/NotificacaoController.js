const Notificacao = require("../models/Notificacao");
const Usuario = require("../models/Usuario");
const Contrato = require("../models/Contrato");

module.exports = {
	// GET /notificacoes
	async listar(req, res) {
		try {
			const notificacoes = await Notificacao.findAll({
				include: [
					{
						model: Usuario,
						as: "usuarios",
						attributes: ["id", "nome", "email"],
					},
					{
						model: Contrato,
						as: "contratos",
						attributes: [
							"id",
							"descricao",
							"data_inicio",
							"duracao",
							"proximo_reajuste",
						],
					},
				],
				order: [["created_at", "DESC"]],
			});
			return res.json(notificacoes);
		} catch (error) {
			console.error("Erro ao listar notificações:", error);
			return res.status(500).json({ error: "Erro ao listar notificações" });
		}
	},

	async listarAtivas(req, res) {
				try {
			const notificacoes = await Notificacao.findAll({
				where: { confirmado_sn: false },
				include: [
					{
						model: Usuario,
						as: "usuarios",
						attributes: ["id", "nome", "email"],
					},
					{
						model: Contrato,
						as: "contratos",
						attributes: [
							"id",
							"descricao",
							"data_inicio",
							"duracao",
							"proximo_reajuste",
						],
					},
				],
				order: [["created_at", "DESC"]],
			});
			return res.json(notificacoes);
		} catch (error) {
			console.error("Erro ao listar notificações:", error);
			return res.status(500).json({ error: "Erro ao listar notificações" });
		}
	},

	// GET /notificacoes/usuario/:id_usuario
	async listarPorUsuario(req, res) {
		try {
			const { id_usuario } = req.params;

			if (!id_usuario) {
				return res.status(400).json({ error: "ID do usuário não informado" });
			}

			const notificacoes = await Notificacao.findAll({
				where: { id_usuario, confirmado_sn: false },
				include: [
					{
						model: Usuario,
						as: "usuarios",
						attributes: ["id", "nome", "email"],
					},
					{
						model: Contrato,
						as: "contratos",
						attributes: [
							"id",
							"descricao",
							"data_inicio",
							"duracao",
							"proximo_reajuste",
						],
					},
				],
				order: [["created_at", "DESC"]],
			});

			return res.json(notificacoes);
		} catch (error) {
			console.error("Erro ao listar notificações do usuário:", error);
			return res
				.status(500)
				.json({ error: "Erro ao listar notificações do usuário" });
		}
	},

	// POST /notificacoes
	async criar(req, res) {
		try {
			const { id_usuario, id_contrato, descricao, modulo } = req.body;

			if (!id_usuario || !descricao || !modulo) {
				return res
					.status(400)
					.json({ error: "Campos obrigatórios não preenchidos" });
			}

			const notificacao = await Notificacao.create({
				id_usuario,
				id_contrato,
				descricao,
				modulo,
			});

			return res.status(201).json(notificacao);
		} catch (error) {
			console.error("Erro ao criar notificação:", error);
			return res.status(500).json({ error: "Erro ao criar notificação" });
		}
	},

	// PUT /notificacoes/:id/confirmar
	async confirmar(req, res) {
		try {
			const { id } = req.params;
			const notif = await Notificacao.findByPk(id);

			if (!notif)
				return res.status(404).json({ error: "Notificação não encontrada" });

			notif.confirmado_sn = true;
			await notif.save();

			return res.json({
				message: "Notificação confirmada com sucesso",
				notificacao: notif,
			});
		} catch (error) {
			console.error("Erro ao confirmar notificação:", error);
			return res
				.status(500)
				.json({ error: "Erro ao confirmar notificação" });
		}
	},
};
