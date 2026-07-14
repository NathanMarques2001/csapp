const FatosImportantesService = require('./fatos-importantes.service');
const FatosImportantesRepository = require('./fatos-importantes.repository');
const AppError = require('../../utils/AppError');

jest.mock('./fatos-importantes.repository');

describe('FatosImportantesService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('findById', () => {
    it('[Success] Retorna entidade por ID', async () => {
      FatosImportantesRepository.findById.mockResolvedValue({ id: 1 });
      const res = await FatosImportantesService.findById(1);
      expect(res.id).toBe(1);
    });

    it('[Validation] Dispara 404 se não encontrado', async () => {
      FatosImportantesRepository.findById.mockResolvedValue(null);
      await expect(FatosImportantesService.findById(99)).rejects.toThrow(AppError);
    });
  });

  describe('findAll', () => {
    it('[Success] Lista todas as instâncias', async () => {
      FatosImportantesRepository.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await FatosImportantesService.findAll();
      expect(res).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('[Success] Cria com sucesso', async () => {
      FatosImportantesRepository.create.mockResolvedValue({ id: 2, nome: 'Test' });
      const res = await FatosImportantesService.create({ id_cliente: 1, conteudo: 'Test' });
      expect(res.id).toBe(2);
    });
  });

  describe('update', () => {
    it('[Success] Autoriza atualização após findById bem-sucedido', async () => {
      FatosImportantesRepository.findById.mockResolvedValue({ id: 1 });
      FatosImportantesRepository.update.mockResolvedValue(true);
      const res = await FatosImportantesService.update(1, { conteudo: 'New' });
      expect(res).toBeTruthy();
      expect(FatosImportantesRepository.update).toHaveBeenCalledWith(1, { conteudo: 'New' });
    });
  });

  describe('findByClienteId', () => {
    it('[Success] Lista items de um cliente', async () => {
      FatosImportantesRepository.findByClienteId.mockResolvedValue({ fatos_importantes: [] });
      const res = await FatosImportantesService.findByClienteId(1);
      expect(res).toBeDefined();
    });
  });


  describe('delete', () => { it('[Success] Apaga item por id', async () => { FatosImportantesRepository.findById.mockResolvedValue({ id: 1 }); FatosImportantesRepository.delete.mockResolvedValue(true); const res = await FatosImportantesService.delete(1); expect(res).toBe(true); }); });
});
