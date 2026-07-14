const RelatorioService = require('./relatorio.service');
const RelatorioRepository = require('./relatorio.repository');

jest.mock('./relatorio.repository');

describe('RelatorioService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  // ==========================================
  // calculateNextVencimento — Engine de cálculo
  // ==========================================
  describe('calculateNextVencimento', () => {
    it('[Null] Retorna null se dataInicio é falsy', () => {
      expect(RelatorioService.calculateNextVencimento(null, '12')).toBeNull();
      expect(RelatorioService.calculateNextVencimento(undefined, '12')).toBeNull();
    });

    it('[Null] Retorna null se duração inválida', () => {
      expect(RelatorioService.calculateNextVencimento('2024-01-01', null)).toBeNull();
      expect(RelatorioService.calculateNextVencimento('2024-01-01', '0')).toBeNull();
      expect(RelatorioService.calculateNextVencimento('2024-01-01', 'abc')).toBeNull();
      expect(RelatorioService.calculateNextVencimento('2024-01-01', '-5')).toBeNull();
    });

    it('[Indeterminado] Retorna "Indeterminado" para duração 12000', () => {
      expect(RelatorioService.calculateNextVencimento('2024-01-01', '12000')).toBe('Indeterminado');
    });

    it('[Null] Retorna null se data inválida (NaN)', () => {
      expect(RelatorioService.calculateNextVencimento('not-a-date', '12')).toBeNull();
    });

    it('[Success] Calcula próximo vencimento no futuro', () => {
      // Uma data futura garante que não entra no loop de rollover
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10);
      const result = RelatorioService.calculateNextVencimento(futureDate.toISOString(), '12');
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(futureDate.getTime());
    });

    it('[Rollover] Avança data passada até ultrapassar hoje', () => {
      // Data bem no passado com duração curta: garante que o while rode
      const result = RelatorioService.calculateNextVencimento('2010-01-01', '6');
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThanOrEqual(Date.now() - 86400000); // >= ontem
    });
  });

  // ==========================================
  // getRelatorioGeral — Integracão com Repo
  // ==========================================
  describe('getRelatorioGeral', () => {
    it('[Success] Mapeia e enriquece resultados com vencimento_calculado', async () => {
      RelatorioRepository.getRelatorioGeral.mockResolvedValue([
        { id: 1, data_inicio: '2024-01-01', duracao: '12' },
        { id: 2, data_inicio: null, duracao: '12' },
        { id: 3, data_inicio: '2020-01-01', duracao: '12000' },
      ]);

      const res = await RelatorioService.getRelatorioGeral();

      expect(res).toHaveLength(3);
      // Item 1: data válida + duração válida → Date
      expect(res[0].vencimento_calculado).toBeInstanceOf(Date);
      // Item 2: data null → null
      expect(res[1].vencimento_calculado).toBeNull();
      // Item 3: duração 12000 → Indeterminado
      expect(res[2].vencimento_calculado).toBe('Indeterminado');
    });

    it('[Empty] Retorna array vazio se repository vazio', async () => {
      RelatorioRepository.getRelatorioGeral.mockResolvedValue([]);
      const res = await RelatorioService.getRelatorioGeral();
      expect(res).toEqual([]);
    });
  });
});
