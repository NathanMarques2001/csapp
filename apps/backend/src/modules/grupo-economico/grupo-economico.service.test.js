const GrupoEconomicoService = require('./grupo-economico.service');
const GrupoEconomicoRepository = require('./grupo-economico.repository');
const classificarClientes = require('../../utils/classificacaoClientes');
const AppError = require('../../utils/AppError');

jest.mock('./grupo-economico.repository');
jest.mock('../../utils/classificacaoClientes');

describe('GrupoEconomicoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll e findById', () => {
    it('[Validation] Dispara 404 se findAll não encontrar grupos', async () => {
      GrupoEconomicoRepository.findAll.mockResolvedValue([]);
      await expect(GrupoEconomicoService.findAll()).rejects.toThrow(AppError);
    });

    it('[Validation] Dispara 404 se findById não encontrar o grupo', async () => {
      GrupoEconomicoRepository.findById.mockResolvedValue(null);
      await expect(GrupoEconomicoService.findById(99)).rejects.toThrow(AppError);
    });

    it('[Success] Retorna grupo quando achado no findById', async () => {
      GrupoEconomicoRepository.findById.mockResolvedValue({ id: 1, nome: 'G1' });
      const grupo = await GrupoEconomicoService.findById(1);
      expect(grupo.nome).toBe('G1');
    });
  });

  describe('toggleEInativarCascata', () => {
    it('[Success] Grupo Inativo -> Ativo', async () => {
      GrupoEconomicoRepository.findById.mockResolvedValue({ status: 'inativo' });

      await GrupoEconomicoService.toggleEInativarCascata(1);

      expect(GrupoEconomicoRepository.updateStatus).toHaveBeenCalledWith(1, 'ativo');
      expect(GrupoEconomicoRepository.findClientesByGrupoId).not.toHaveBeenCalled();
    });

    it('[Success] Grupo Ativo -> Cascata desativa Clientes Ativos e Contratos', async () => {
      GrupoEconomicoRepository.findById.mockResolvedValue({ status: 'ativo' });
      GrupoEconomicoRepository.findClientesByGrupoId.mockResolvedValue([
        { id: 10, status: 'ativo' },
        { id: 20, status: 'inativo' } // Não deve trigar cascata para inativos
      ]);

      await GrupoEconomicoService.toggleEInativarCascata(1);

      expect(GrupoEconomicoRepository.updateStatus).toHaveBeenCalledWith(1, 'inativo');
      expect(GrupoEconomicoRepository.inativarClienteEContratos).toHaveBeenCalledTimes(1); // Somente id 10
      expect(GrupoEconomicoRepository.inativarClienteEContratos).toHaveBeenCalledWith(10);
      expect(classificarClientes).toHaveBeenCalled();
    });

    it('[Validation] Dispara erro se tentar inativar grupo inexistente', async () => {
      GrupoEconomicoRepository.findById.mockResolvedValue(null);
      await expect(GrupoEconomicoService.toggleEInativarCascata(99)).rejects.toThrow(AppError);
    });
  });
});
