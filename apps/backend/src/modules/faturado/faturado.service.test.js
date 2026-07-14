const FaturadoService = require('./faturado.service');
const FaturadoRepository = require('./faturado.repository');
const AppError = require('../../utils/AppError');

jest.mock('./faturado.repository');

describe('FaturadoService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('findById', () => {
    it('[Success] Retorna entidade por ID', async () => {
      FaturadoRepository.findById.mockResolvedValue({ id: 1 });
      const res = await FaturadoService.findById(1);
      expect(res.id).toBe(1);
    });

    it('[Validation] Dispara 404 se não encontrado', async () => {
      FaturadoRepository.findById.mockResolvedValue(null);
      await expect(FaturadoService.findById(99)).rejects.toThrow(AppError);
    });
  });

  describe('findAll', () => {
    it('[Success] Lista todas as instâncias', async () => {
      FaturadoRepository.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await FaturadoService.findAll();
      expect(res).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('[Success] Cria com sucesso', async () => {
      FaturadoRepository.create.mockResolvedValue({ id: 2, nome: 'Test' });
      const res = await FaturadoService.create({ nome: 'Test' });
      expect(res.id).toBe(2);
    });
  });

  describe('update', () => {
    it('[Success] Autoriza atualização após findById bem-sucedido', async () => {
      FaturadoRepository.findById.mockResolvedValue({ id: 1 });
      FaturadoRepository.update.mockResolvedValue(true);
      const res = await FaturadoService.update(1, { nome: 'New' });
      expect(res).toBe(true);
      expect(FaturadoRepository.update).toHaveBeenCalledWith(1, { nome: 'New' });
    });
  });
});
