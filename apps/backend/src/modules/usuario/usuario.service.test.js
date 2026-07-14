const UsuarioService = require('./usuario.service');
const UsuarioRepository = require('./usuario.repository');
const AutenticacaoService = require('../../services/AutenticacaoService');
const AppError = require('../../utils/AppError');

jest.mock('./usuario.repository');
jest.mock('../../services/AutenticacaoService');

describe('UsuarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it('[Success] Loga o usuário retornando token e dados', async () => {
      const mockResult = { usuario: { id: 1, email: 'test@test.com' }, token: 'abc' };
      AutenticacaoService.login.mockResolvedValue(mockResult);

      const result = await UsuarioService.login('test@test.com', '123');

      expect(AutenticacaoService.login).toHaveBeenCalledWith('test@test.com', '123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('findById', () => {
    it('[Success] Retorna o usuário dado um ID válido', async () => {
      const mockUsuario = { id: 10, nome: 'Nathan' };
      UsuarioRepository.findById.mockResolvedValue(mockUsuario);

      const result = await UsuarioService.findById(10);
      expect(result).toEqual(mockUsuario);
    });

    it('[Validation] Lança AppError 404 caso usuário não exista', async () => {
      UsuarioRepository.findById.mockResolvedValue(null);

      await expect(UsuarioService.findById(99)).rejects.toThrow(AppError);
      await expect(UsuarioService.findById(99)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('create', () => {
    it('[Success] Cria o usuário', async () => {
      const data = { email: 'novo@test.com' };
      UsuarioRepository.create.mockResolvedValue({ id: 1, ...data });

      const result = await UsuarioService.create(data);
      expect(result.id).toBe(1);
    });

    it('[Validation] Dispara 400 se e-mail explodir erro de constraint única', async () => {
      const error = new Error('Validation Error');
      error.name = 'SequelizeUniqueConstraintError';
      UsuarioRepository.create.mockRejectedValue(error);

      await expect(UsuarioService.create({ email: 'duplicate@test.com' })).rejects.toThrow(AppError);
      await expect(UsuarioService.create({ email: 'duplicate@test.com' })).rejects.toHaveProperty('statusCode', 400);
    });

    it('[Edge Case] Repassa erro interno (500) não tratado do Sequelize', async () => {
      const dbError = new Error('Database Down');
      UsuarioRepository.create.mockRejectedValue(dbError);

      await expect(UsuarioService.create({})).rejects.toThrow('Database Down');
    });
  });

  describe('delete', () => {
    it('[Success] Deleta usuário que existe', async () => {
      UsuarioRepository.findById.mockResolvedValue({ id: 1 });
      UsuarioRepository.delete.mockResolvedValue(true);

      const result = await UsuarioService.delete(1);
      expect(result).toBe(true);
      expect(UsuarioRepository.delete).toHaveBeenCalledWith(1);
    });

    it('[Validation] Impede deletar usuário fantasma lançando 404', async () => {
      UsuarioRepository.findById.mockResolvedValue(null);

      await expect(UsuarioService.delete(99)).rejects.toThrow(AppError);
      expect(UsuarioRepository.delete).not.toHaveBeenCalled();
    });
  });
});
