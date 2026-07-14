const {
  atualizarNotificacoesAtivasDoContrato,
  atualizarNotificacoesAtivasDoCliente,
  validarNotificacoesAtivas,
} = require("./NotificacaoService");
const Notificacao = require("../models/Notificacao");
const Contrato = require("../models/Contrato");
const Cliente = require("../models/Cliente");
const Produto = require("../models/Produto");

jest.mock("../models/Notificacao");
jest.mock("../models/Contrato");
jest.mock("../models/Cliente");
jest.mock("../models/Produto");

describe("NotificacaoService - Novas Funções de Sincronização", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("atualizarNotificacoesAtivasDoContrato", () => {
    it("deve retornar se nenhuma notificação ativa for encontrada", async () => {
      Notificacao.findAll.mockResolvedValue([]);
      await atualizarNotificacoesAtivasDoContrato(1);
      expect(Contrato.findByPk).not.toHaveBeenCalled();
    });

    it("deve atualizar notificações de Contrato e Reajuste com novos dados", async () => {
      const mockNotifContrato = {
        id: 101,
        modulo: "Contrato",
        descricao: "Velha descrição",
        id_usuario: 5,
        save: jest.fn().mockResolvedValue(true),
      };
      const mockNotifReajuste = {
        id: 102,
        modulo: "Reajuste",
        descricao: "Velha descrição",
        id_usuario: 5,
        save: jest.fn().mockResolvedValue(true),
      };

      Notificacao.findAll.mockResolvedValue([mockNotifContrato, mockNotifReajuste]);

      const mockContrato = {
        id: 1,
        data_inicio: "2025-01-01",
        duracao: 12,
        proximo_reajuste: "2026-01-01",
        clientes: {
          id_usuario: 9,
          razao_social: "Cliente Teste LTDA",
        },
        produtos: {
          nome: "Produto Teste",
        },
      };

      Contrato.findByPk.mockResolvedValue(mockContrato);

      await atualizarNotificacoesAtivasDoContrato(1);

      expect(Contrato.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(mockNotifContrato.id_usuario).toBe(9);
      expect(mockNotifContrato.descricao).toContain("Cliente Teste LTDA");
      expect(mockNotifContrato.descricao).toContain("Produto Teste");
      expect(mockNotifContrato.save).toHaveBeenCalled();

      expect(mockNotifReajuste.id_usuario).toBe(9);
      expect(mockNotifReajuste.descricao).toContain("Cliente Teste LTDA");
      expect(mockNotifReajuste.descricao).toContain("Produto Teste");
      expect(mockNotifReajuste.save).toHaveBeenCalled();
    });

    it("deve confirmar notificações se a duração do contrato for 12000 (Indeterminado)", async () => {
      const mockNotif = { id: 101, modulo: "Contrato" };
      Notificacao.findAll.mockResolvedValue([mockNotif]);

      const mockContrato = {
        id: 1,
        duracao: 12000,
      };
      Contrato.findByPk.mockResolvedValue(mockContrato);
      Notificacao.update.mockResolvedValue([1]);

      await atualizarNotificacoesAtivasDoContrato(1);

      expect(Notificacao.update).toHaveBeenCalledWith(
        { confirmado_sn: true },
        { where: { id_contrato: 1, modulo: "Contrato", confirmado_sn: false } }
      );
    });
  });

  describe("atualizarNotificacoesAtivasDoCliente", () => {
    it("deve atualizar notificações para todos os contratos do cliente", async () => {
      const mockContratos = [{ id: 1 }, { id: 2 }];
      Contrato.findAll.mockResolvedValue(mockContratos);
      Notificacao.findAll.mockResolvedValue([]);

      await atualizarNotificacoesAtivasDoCliente(10);

      expect(Contrato.findAll).toHaveBeenCalledWith({ where: { id_cliente: 10 } });
    });
  });

  describe("validarNotificacoesAtivas", () => {
    it("deve retornar se não houver notificações ativas no sistema", async () => {
      Notificacao.findAll.mockResolvedValue([]);
      await validarNotificacoesAtivas();
      expect(Contrato.findByPk).not.toHaveBeenCalled();
    });

    it("deve auditar e atualizar notificações ativas e confirmar notificações órfãs", async () => {
      const activeNotifications = [
        { id_contrato: 1 },
        { id_contrato: 2 }, // contrato deletado/inexistente
      ];
      Notificacao.findAll.mockResolvedValue(activeNotifications);

      Contrato.findByPk.mockImplementation(async (id) => {
        if (id === 1) return { id: 1 };
        return null; // inexistente
      });

      Notificacao.update.mockResolvedValue([1]);

      await validarNotificacoesAtivas();

      // Para o contrato inexistente 2, deve ter atualizado confirmado_sn para true
      expect(Notificacao.update).toHaveBeenCalledWith(
        { confirmado_sn: true },
        { where: { id_contrato: 2, confirmado_sn: false } }
      );
    });
  });
});
