const ProdutoService = require('./produto.service');
const ProdutoRepository = require('./produto.repository');
const AppError = require('../../utils/AppError');

jest.mock('./produto.repository');

describe('ProdutoService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('findById', () => {
    it('[Success] Retorna entidade por ID', async () => {
      ProdutoRepository.findById.mockResolvedValue({ id: 1 });
      const res = await ProdutoService.findById(1);
      expect(res.id).toBe(1);
    });

    it('[Validation] Dispara 404 se não encontrado', async () => {
      ProdutoRepository.findById.mockResolvedValue(null);
      await expect(ProdutoService.findById(99)).rejects.toThrow(AppError);
    });
  });

  describe('findAll', () => {
    it('[Success] Lista todas as instâncias', async () => {
      ProdutoRepository.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await ProdutoService.findAll();
      expect(res).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('[Success] Cria com sucesso', async () => {
      ProdutoRepository.create.mockResolvedValue({ id: 2, nome: 'Test' });
      const res = await ProdutoService.create({ nome: 'Test' });
      expect(res.id).toBe(2);
    });
  });

  describe('update', () => {
    it('[Success] Autoriza atualização após findById bem-sucedido', async () => {
      ProdutoRepository.findById.mockResolvedValue({ id: 1 });
      ProdutoRepository.update.mockResolvedValue(true);
      const res = await ProdutoService.update(1, { nome: 'New' });
      expect(res).toBe(true);
      expect(ProdutoRepository.update).toHaveBeenCalledWith(1, { nome: 'New' });
    });
  });
});
