const SegmentoService = require('./segmento.service');
const SegmentoRepository = require('./segmento.repository');
const AppError = require('../../utils/AppError');

jest.mock('./segmento.repository');

describe('SegmentoService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('findById', () => {
    it('[Success] Retorna entidade por ID', async () => {
      SegmentoRepository.findById.mockResolvedValue({ id: 1 });
      const res = await SegmentoService.findById(1);
      expect(res.id).toBe(1);
    });

    it('[Validation] Dispara 404 se não encontrado', async () => {
      SegmentoRepository.findById.mockResolvedValue(null);
      await expect(SegmentoService.findById(99)).rejects.toThrow(AppError);
    });
  });

  describe('findAll', () => {
    it('[Success] Lista todas as instâncias', async () => {
      SegmentoRepository.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await SegmentoService.findAll();
      expect(res).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('[Success] Cria com sucesso', async () => {
      SegmentoRepository.create.mockResolvedValue({ id: 2, nome: 'Test' });
      const res = await SegmentoService.create({ nome: 'Test' });
      expect(res.id).toBe(2);
    });
  });

  describe('update', () => {
    it('[Success] Autoriza atualização após findById bem-sucedido', async () => {
      SegmentoRepository.findById.mockResolvedValue({ id: 1 });
      SegmentoRepository.update.mockResolvedValue(true);
      const res = await SegmentoService.update(1, { nome: 'New' });
      expect(res).toBe(true);
      expect(SegmentoRepository.update).toHaveBeenCalledWith(1, { nome: 'New' });
    });
  });
});
