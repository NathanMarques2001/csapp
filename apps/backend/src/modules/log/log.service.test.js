const LogService = require('./log.service');
const LogRepository = require('./log.repository');
const AppError = require('../../utils/AppError');

jest.mock('./log.repository');

describe('LogService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('findByContratoId', () => {
    it('[Error] Lança 404 se contrato não encontrado', async () => {
      LogRepository.findContratoWithLogs.mockResolvedValue(null);
      await expect(LogService.findByContratoId(999)).rejects.toThrow('Contrato não encontrado!');
    });

    it('[Error] Lança 404 se contrato sem logs', async () => {
      LogRepository.findContratoWithLogs.mockResolvedValue({ id: 1, logs: [] });
      await expect(LogService.findByContratoId(1)).rejects.toThrow('Nenhum log cadastrado!');
    });

    it('[Success] Retorna logs de um contrato', async () => {
      LogRepository.findContratoWithLogs.mockResolvedValue({ id: 1, logs: [{ id: 1, alteracao: 'teste' }] });
      const res = await LogService.findByContratoId(1);
      expect(res).toHaveLength(1);
      expect(res[0].alteracao).toBe('teste');
    });
  });

  describe('findAll', () => {
    it('[Error] Lança 404 se não há logs', async () => {
      LogRepository.findAll.mockResolvedValue([]);
      await expect(LogService.findAll()).rejects.toThrow('Nenhum log cadastrado!');
    });

    it('[Success] Retorna todos os logs', async () => {
      LogRepository.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await LogService.findAll();
      expect(res).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('[Error] Exige nome_usuario', async () => {
      await expect(LogService.create({ id_contrato: 1, alteracao: 'x' })).rejects.toThrow('Nome do usuário é obrigatório.');
    });

    it('[Success] Resolve nome_usuario via id_usuario quando necessário', async () => {
      LogRepository.findUsuarioNomeById.mockResolvedValue('Admin');
      LogRepository.create.mockResolvedValue({ id: 1, nome_usuario: 'Admin' });
      const res = await LogService.create({ id_usuario: 1, id_contrato: 1, alteracao: 'criou' });
      expect(res.nome_usuario).toBe('Admin');
      expect(LogRepository.findUsuarioNomeById).toHaveBeenCalledWith(1);
    });

    it('[Success] Cria log com nome_usuario direto', async () => {
      LogRepository.create.mockResolvedValue({ id: 2, nome_usuario: 'User' });
      const res = await LogService.create({ nome_usuario: 'User', id_contrato: 1, alteracao: 'alterou' });
      expect(res.id).toBe(2);
    });
  });
});
