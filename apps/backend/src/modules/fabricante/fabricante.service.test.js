const FabricanteService = require('./fabricante.service');
const FabricanteRepository = require('./fabricante.repository');
const AppError = require('../../utils/AppError');

jest.mock('./fabricante.repository');

describe('FabricanteService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('findById', () => {
    it('[Success] Retorna entidade por ID', async () => {
      FabricanteRepository.findById.mockResolvedValue({ id: 1 });
      const res = await FabricanteService.findById(1);
      expect(res.id).toBe(1);
    });

    it('[Validation] Dispara 404 se não encontrado', async () => {
      FabricanteRepository.findById.mockResolvedValue(null);
      await expect(FabricanteService.findById(99)).rejects.toThrow(AppError);
    });
  });

  describe('findAll', () => {
    it('[Success] Lista todas as instâncias', async () => {
      FabricanteRepository.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await FabricanteService.findAll();
      expect(res).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('[Success] Cria com sucesso', async () => {
      FabricanteRepository.create.mockResolvedValue({ id: 2, nome: 'Test' });
      const res = await FabricanteService.create({ nome: 'Test' });
      expect(res.id).toBe(2);
    });
  });

  describe('update', () => {
    it('[Success] Autoriza atualização após findById bem-sucedido', async () => {
      FabricanteRepository.findById.mockResolvedValue({ id: 1 });
      FabricanteRepository.update.mockResolvedValue(true);
      const res = await FabricanteService.update(1, { nome: 'New' });
      expect(res).toBe(true);
      expect(FabricanteRepository.update).toHaveBeenCalledWith(1, { nome: 'New' });
    });
  });
});
