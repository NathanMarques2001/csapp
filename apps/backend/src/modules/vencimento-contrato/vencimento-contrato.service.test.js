const VencimentoContratoService = require('./vencimento-contrato.service');
const VencimentoContratoRepository = require('./vencimento-contrato.repository');
const AppError = require('../../utils/AppError');

jest.mock('./vencimento-contrato.repository');

describe('VencimentoContratoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('[Success] Retorna todos', async () => {
      VencimentoContratoRepository.findAll.mockResolvedValue([]);
      const res = await VencimentoContratoService.findAll();
      expect(res).toEqual([]);
    });
  });

  describe('findToday', () => {
    it('[Success] Retorna vencimentos de hoje', async () => {
      VencimentoContratoRepository.findToday.mockResolvedValue([]);
      const res = await VencimentoContratoService.findToday();
      expect(res).toEqual([]);
    });
  });

  describe('getEmailData', () => {
    it('[Error] Lança erro se dados não servidos', async () => {
      VencimentoContratoRepository.getDadosEmail.mockResolvedValue(null);
      await expect(VencimentoContratoService.getEmailData(1)).rejects.toThrow(AppError);
    });

    it('[Success] Mapeia e retorna os detalhes', async () => {
      VencimentoContratoRepository.getDadosEmail.mockResolvedValue({
        usuario: { nome: 'U', email: 'E' },
        cliente: { nome_fantasia: 'F', cpf_cnpj: 'C' }
      });
      const res = await VencimentoContratoService.getEmailData(1);
      expect(res.usuario_nome).toBe('U');
      expect(res.cliente_cnpj).toBe('C');
    });
  });

  describe('create', () => {
    it('[Error] Rejeita se contrato nao encontrado', async () => {
      VencimentoContratoRepository.findContratoById.mockResolvedValue(null);
      await expect(VencimentoContratoService.create({ id_contrato: 1 })).rejects.toThrow('Contrato não encontrado');
    });

    it('[Success] Cria registro', async () => {
      VencimentoContratoRepository.findContratoById.mockResolvedValue(true);
      VencimentoContratoRepository.create.mockResolvedValue({ id: 2 });
      const res = await VencimentoContratoService.create({ id_contrato: 1 });
      expect(res.id).toBe(2);
    });
  });

  describe('update e delete', () => {
    it('[Error] update/delete se não encontrado', async () => {
      VencimentoContratoRepository.findById.mockResolvedValue(null);
      await expect(VencimentoContratoService.update(1, {})).rejects.toThrow(AppError);
      await expect(VencimentoContratoService.delete(1)).rejects.toThrow(AppError);
    });

    it('[Success] Deleta', async () => {
      VencimentoContratoRepository.findById.mockResolvedValue({ id: 1 });
      VencimentoContratoRepository.delete.mockResolvedValue(true);
      const res = await VencimentoContratoService.delete(1);
      expect(res).toBe(true);
    });
  });
});
