const ClienteService = require('./cliente.service');
const ClienteRepository = require('./cliente.repository');
const AppError = require('../../utils/AppError');
const classificarClientes = require('../../utils/classificacaoClientes');

jest.mock('./cliente.repository');
jest.mock('../../utils/classificacaoClientes');
jest.mock('../../services/NotificacaoService');
jest.mock('../../models/Notificacao');

describe('ClienteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('findById', () => {
    it('[Success] Retorna o cliente se o ID existir no BD', async () => {
      const mockCliente = { id: 1, razao_social: 'Empresa Teste' };
      ClienteRepository.findById.mockResolvedValue(mockCliente);

      const result = await ClienteService.findById(1);

      expect(ClienteRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCliente);
    });

    it('[Validation] Dispara AppError 404 se o ID for inexistente', async () => {
      ClienteRepository.findById.mockResolvedValue(null);

      await expect(ClienteService.findById(99)).rejects.toThrow(AppError);
      await expect(ClienteService.findById(99)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('toggleStatus', () => {
    it('[Success] Inativa cliente "ativo" e seus contratos, desencadeando reclassificação', async () => {
      const mockClienteAtivo = { id: 2, status: 'ativo' };
      ClienteRepository.findById.mockResolvedValue(mockClienteAtivo);
      ClienteRepository.updateStatus.mockResolvedValue(true);
      ClienteRepository.inativarContratos.mockResolvedValue(true);
      classificarClientes.mockResolvedValue(true);

      const result = await ClienteService.toggleStatus(2);

      expect(ClienteRepository.updateStatus).toHaveBeenCalledWith(2, 'inativo');
      expect(ClienteRepository.inativarContratos).toHaveBeenCalledWith(2);
      expect(classificarClientes).toHaveBeenCalled();
      expect(result).toBe('Cliente e contratos inativados com sucesso!');
    });

    it('[Success] Ativa cliente "inativo" sem inativar contratos, reclassificando', async () => {
      const mockClienteInativo = { id: 3, status: 'inativo' };
      ClienteRepository.findById.mockResolvedValue(mockClienteInativo);
      ClienteRepository.updateStatus.mockResolvedValue(true);
      classificarClientes.mockResolvedValue(true);

      const result = await ClienteService.toggleStatus(3);

      expect(ClienteRepository.updateStatus).toHaveBeenCalledWith(3, 'ativo');
      expect(ClienteRepository.inativarContratos).not.toHaveBeenCalled();
      expect(classificarClientes).toHaveBeenCalled();
      expect(result).toBe('Cliente ativado com sucesso!');
    });

    it('[Validation] Lança 404 ao tentar alternar status de cliente inexistente', async () => {
      ClienteRepository.findById.mockResolvedValue(null);

      await expect(ClienteService.toggleStatus(99)).rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('[Success] Cria cliente normalmente', async () => {
      const payload = { razao_social: 'Nova' };
      const criado = { id: 1, ...payload };
      ClienteRepository.create.mockResolvedValue(criado);

      const result = await ClienteService.create(payload);

      expect(ClienteRepository.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(criado);
    });

    it('[Edge Case] Converte erros de BD com texto "inválido" em AppError(400)', async () => {
      const repoError = new Error('CNPJ inválido detectado!');
      ClienteRepository.create.mockRejectedValue(repoError);

      await expect(ClienteService.create({})).rejects.toThrow(AppError);
      await expect(ClienteService.create({})).rejects.toHaveProperty('statusCode', 400);
    });

    it('[Edge Case] Lança erro originário se não for um erro validável (Erro 500 simulado)', async () => {
      const repoError = new Error('Database connection failed');
      ClienteRepository.create.mockRejectedValue(repoError);

      await expect(ClienteService.create({})).rejects.toThrow('Database connection failed');
      // Não é um AppError convertido
      await expect(ClienteService.create({})).rejects.not.toHaveProperty('statusCode', 400);
    });
  });
});
