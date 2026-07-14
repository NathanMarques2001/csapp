const ClassificacaoClienteService = require('./classificacao-cliente.service');
const ClassificacaoClienteRepository = require('./classificacao-cliente.repository');
const classificarClientes = require('../../utils/classificacaoClientes');
const AppError = require('../../utils/AppError');

jest.mock('./classificacao-cliente.repository');
jest.mock('../../utils/classificacaoClientes');

describe('ClassificacaoClienteService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('findAll', () => {
    it('[Success] Lista todas as instâncias validando duas queries', async () => {
      ClassificacaoClienteRepository.findAllQuantidade.mockResolvedValue([{ id: 1 }]);
      ClassificacaoClienteRepository.findAllValor.mockResolvedValue([{ id: 2 }]);
      const res = await ClassificacaoClienteService.findAll();
      expect(res).toHaveLength(2);
    });

    it('[Validation] 404 se não achar nenhuma classificação', async () => {
      ClassificacaoClienteRepository.findAllQuantidade.mockResolvedValue([]);
      ClassificacaoClienteRepository.findAllValor.mockResolvedValue([]);
      await expect(ClassificacaoClienteService.findAll()).rejects.toThrow(AppError);
    });
  });

  describe('create e update', () => {
    it('[Success] Cria com sucesso chamando classificarClientes()', async () => {
      ClassificacaoClienteRepository.findQuantidade.mockResolvedValue(null);
      ClassificacaoClienteRepository.create.mockResolvedValue({ id: 2, valor: 10 });
      classificarClientes.mockResolvedValue(true);
      
      const res = await ClassificacaoClienteService.create({ valor: 10, tipo_categoria: 'quantidade' });
      expect(res.id).toBe(2);
      expect(classificarClientes).toHaveBeenCalled();
    });

    it('[Validation] Update proibi tipo_categoria quantidade se já houver outro', async () => {
      ClassificacaoClienteRepository.findById.mockResolvedValue({ id: 1, tipo_categoria: 'valor' });
      ClassificacaoClienteRepository.findQuantidade.mockResolvedValue({ id: 99 });
      
      await expect(ClassificacaoClienteService.update(1, { tipo_categoria: 'quantidade' })).rejects.toThrow(AppError);
    });
  });
});
