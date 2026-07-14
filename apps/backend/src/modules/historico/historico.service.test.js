const HistoricoService = require('./historico.service');
const HistoricoRepository = require('./historico.repository');
const AppError = require('../../utils/AppError');

jest.mock('./historico.repository');

describe('HistoricoService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  // ==========================================
  // SNAPSHOT DIÁRIO — Engine Transacional
  // ==========================================
  describe('gerarSnapshotDiario', () => {
    const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

    beforeEach(() => {
      HistoricoRepository.getSequelize.mockReturnValue({
        transaction: jest.fn().mockResolvedValue(mockTransaction),
      });
    });

    it('[Skip] Não executa se snapshot já rodou com SUCESSO hoje', async () => {
      HistoricoRepository.findExecucaoByData.mockResolvedValue({ id: 1, status: 'SUCESSO' });

      await HistoricoService.gerarSnapshotDiario();

      // Não deve nem tentar criar transação
      expect(HistoricoRepository.getSequelize().transaction).not.toHaveBeenCalled();
    });

    it('[Success] Executa snapshot completo — cria execução, arquiva clientes/contratos, commit', async () => {
      // 1ª chamada (verificação SUCESSO) → null
      // 2ª chamada (verificação existência) → null (cria nova execução)
      HistoricoRepository.findExecucaoByData
        .mockResolvedValueOnce(null)   // Nenhum SUCESSO prévio
        .mockResolvedValueOnce(null);  // Nenhuma execução existente

      const mockExecucao = { id: 1 };
      HistoricoRepository.createExecucao.mockResolvedValue(mockExecucao);
      HistoricoRepository.clearSnapshotData.mockResolvedValue();

      HistoricoRepository.findAllClientes.mockResolvedValue([
        { id: 1, razao_social: 'Empresa A', nome_fantasia: 'A', cpf_cnpj: '00000000001', id_usuario: 1, nps: '8', id_segmento: 1, status: 'A', id_classificacao_cliente: 1, data_criacao: '2024-01-01' },
        { id: 2, razao_social: 'Empresa B', nome_fantasia: 'B', cpf_cnpj: '00000000002', id_usuario: 2, nps: '', id_segmento: 2, status: 'A', id_classificacao_cliente: 2, data_criacao: '2024-02-01' },
      ]);
      HistoricoRepository.bulkCreateHistoricoClientes.mockResolvedValue();

      HistoricoRepository.findAllContratos.mockResolvedValue([
        { id: 10, id_cliente: 1, id_produto: 1, id_faturado: 1, status: 'A', valor_mensal: 100, quantidade: 5, data_inicio: '2024-01-01' },
      ]);
      HistoricoRepository.bulkCreateHistoricoContratos.mockResolvedValue();

      HistoricoRepository.updateExecucao.mockResolvedValue();

      await HistoricoService.gerarSnapshotDiario();

      // Verifica fluxo completo
      expect(HistoricoRepository.createExecucao).toHaveBeenCalledWith(expect.objectContaining({ status: 'EM_EXECUCAO' }));
      expect(HistoricoRepository.clearSnapshotData).toHaveBeenCalled();
      expect(HistoricoRepository.bulkCreateHistoricoClientes).toHaveBeenCalled();
      expect(HistoricoRepository.bulkCreateHistoricoContratos).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();

      // Verifica que a execução foi marcada como SUCESSO
      expect(HistoricoRepository.updateExecucao).toHaveBeenCalledWith(
        mockExecucao,
        expect.objectContaining({ status: 'SUCESSO', quantidade_clientes: 2, quantidade_contratos: 1 })
      );
    });

    it('[Success] Reusa execução existente (EM_EXECUCAO anterior) ao invés de criar nova', async () => {
      HistoricoRepository.findExecucaoByData
        .mockResolvedValueOnce(null)                // Nenhum SUCESSO prévio
        .mockResolvedValueOnce({ id: 99 });         // Já existe execução pendente

      HistoricoRepository.updateExecucao.mockResolvedValue();
      HistoricoRepository.clearSnapshotData.mockResolvedValue();
      HistoricoRepository.findAllClientes.mockResolvedValue([]);
      HistoricoRepository.findAllContratos.mockResolvedValue([]);

      await HistoricoService.gerarSnapshotDiario();

      // Deve ter chamado updateExecucao com EM_EXECUCAO (reuso)
      expect(HistoricoRepository.createExecucao).not.toHaveBeenCalled();
      expect(HistoricoRepository.updateExecucao).toHaveBeenCalledWith(
        { id: 99 },
        expect.objectContaining({ status: 'EM_EXECUCAO' })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('[Error] Faz rollback e marca ERRO se falha durante snapshot', async () => {
      HistoricoRepository.findExecucaoByData
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const mockExecucao = { id: 1 };
      HistoricoRepository.createExecucao.mockResolvedValue(mockExecucao);
      HistoricoRepository.clearSnapshotData.mockResolvedValue();
      HistoricoRepository.findAllClientes.mockRejectedValue(new Error('DB Connection Lost'));
      HistoricoRepository.updateExecucao.mockResolvedValue();

      await HistoricoService.gerarSnapshotDiario();

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
      expect(HistoricoRepository.updateExecucao).toHaveBeenCalledWith(
        mockExecucao,
        expect.objectContaining({ status: 'ERRO', mensagem_erro: 'DB Connection Lost' })
      );
    });

    it('[Graceful] Retorna silenciosamente se falha ao iniciar execução', async () => {
      HistoricoRepository.findExecucaoByData
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error('Cannot write'));

      // Não deve explodir — retorna silenciosamente
      await expect(HistoricoService.gerarSnapshotDiario()).resolves.toBeUndefined();
    });

    it('[Business] Converte nps vazio para null nos snapshots', async () => {
      HistoricoRepository.findExecucaoByData
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      HistoricoRepository.createExecucao.mockResolvedValue({ id: 1 });
      HistoricoRepository.clearSnapshotData.mockResolvedValue();

      HistoricoRepository.findAllClientes.mockResolvedValue([
        { id: 1, razao_social: 'X', nome_fantasia: 'X', cpf_cnpj: '1', id_usuario: 1, nps: '', id_segmento: 1, status: 'A', id_classificacao_cliente: 1, data_criacao: '2024-01-01' },
      ]);
      HistoricoRepository.bulkCreateHistoricoClientes.mockResolvedValue();
      HistoricoRepository.findAllContratos.mockResolvedValue([]);
      HistoricoRepository.bulkCreateHistoricoContratos.mockResolvedValue();
      HistoricoRepository.updateExecucao.mockResolvedValue();

      await HistoricoService.gerarSnapshotDiario();

      const bulkCall = HistoricoRepository.bulkCreateHistoricoClientes.mock.calls[0][0];
      expect(bulkCall[0].nps).toBeNull();
    });
  });

  // ==========================================
  // CONSULTAS DE HISTÓRICO
  // ==========================================
  describe('buscarHistoricoClientes', () => {
    it('[Error] Exige dataInicio e dataFim', async () => {
      await expect(HistoricoService.buscarHistoricoClientes(null, '2024-12-31')).rejects.toThrow(AppError);
      await expect(HistoricoService.buscarHistoricoClientes('2024-01-01', null)).rejects.toThrow(AppError);
    });

    it('[Success] Retorna histórico de clientes no range', async () => {
      HistoricoRepository.buscarHistoricoClientes.mockResolvedValue([{ id: 1 }]);
      const res = await HistoricoService.buscarHistoricoClientes('2024-01-01', '2024-12-31');
      expect(res).toHaveLength(1);
    });
  });

  describe('buscarHistoricoContratos', () => {
    it('[Error] Exige dataInicio e dataFim', async () => {
      await expect(HistoricoService.buscarHistoricoContratos(null, '2024-12-31')).rejects.toThrow(AppError);
    });

    it('[Success] Retorna histórico de contratos no range', async () => {
      HistoricoRepository.buscarHistoricoContratos.mockResolvedValue([{ id: 1 }]);
      const res = await HistoricoService.buscarHistoricoContratos('2024-01-01', '2024-12-31');
      expect(res).toHaveLength(1);
    });
  });
});
