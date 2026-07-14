const NotificacaoService = require('./notificacao.service');
const NotificacaoRepository = require('./notificacao.repository');
const AppError = require('../../utils/AppError');

jest.mock('./notificacao.repository');

describe('NotificacaoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listar e listarAtivas', () => {
    it('[Success] Lista todas', async () => {
      NotificacaoRepository.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await NotificacaoService.listar();
      expect(res.length).toBe(1);
    });

    it('[Success] Lista ativas', async () => {
      NotificacaoRepository.findAtivas.mockResolvedValue([{ id: 2 }]);
      const res = await NotificacaoService.listarAtivas();
      expect(res.length).toBe(1);
    });
  });

  describe('listarPorUsuario', () => {
    it('[Error] OBRIGA id de usuario', async () => {
      await expect(NotificacaoService.listarPorUsuario()).rejects.toThrow(AppError);
    });

    it('[Success] Lista notificacoes push por user ID', async () => {
      NotificacaoRepository.findByUsuario.mockResolvedValue([]);
      const res = await NotificacaoService.listarPorUsuario(1);
      expect(res).toEqual([]);
    });
  });

  describe('criar', () => {
    it('[Error] Exige dados padrao', async () => {
      await expect(NotificacaoService.criar({ id_usuario: null })).rejects.toThrow(AppError);
    });

    it('[Success] Cria notificação', async () => {
      NotificacaoRepository.create.mockResolvedValue({ id: 1 });
      const res = await NotificacaoService.criar({ id_usuario: 1, descricao: 'Teste', modulo: 'Teste' });
      expect(res.id).toBe(1);
    });
  });

  describe('confirmar', () => {
    it('[Error] Rejeita notificação fantasma', async () => {
      NotificacaoRepository.findById.mockResolvedValue(null);
      await expect(NotificacaoService.confirmar(1)).rejects.toThrow('Notificação não encontrada');
    });

    it('[Success] Confirma notificação', async () => {
      NotificacaoRepository.findById.mockResolvedValue({ id: 1 });
      NotificacaoRepository.confirmar.mockResolvedValue(true);
      const res = await NotificacaoService.confirmar(1);
      expect(res).toBe(true);
    });
  });
});
