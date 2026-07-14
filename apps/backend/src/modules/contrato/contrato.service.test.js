const ContratoService = require('./contrato.service');
const ContratoRepository = require('./contrato.repository');
const classificarClientes = require('../../utils/classificacaoClientes');
const AppError = require('../../utils/AppError');
const XLSX = require('xlsx');

jest.mock('./contrato.repository');
jest.mock('../../utils/classificacaoClientes');
jest.mock('xlsx');
jest.mock('../../services/NotificacaoService');

describe('ContratoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('tratarQuantidade e normalizarValor (Metodos Auxiliares)', () => {
    it('[Success] Trata Quantidade como Null caso produto não seja backup/antivirus', async () => {
      ContratoRepository.findProdutoById.mockResolvedValue({ nome: 'M365 Business' });

      const { quantidadeFinal, aviso } = await ContratoService.tratarQuantidade(1, 15);
      expect(quantidadeFinal).toBeNull();
      expect(aviso).toContain("produto 'M365 Business' não utiliza este campo");
    });

    it('[Success] Mantém a quantidade intacta se nome incluir backup/antivirus', async () => {
      ContratoRepository.findProdutoById.mockResolvedValue({ nome: 'Licença Antivírus Kaspersky' });

      const { quantidadeFinal, aviso } = await ContratoService.tratarQuantidade(2, 50);
      expect(quantidadeFinal).toBe(50);
      expect(aviso).toBeNull();
    });

    it('[Success] Normaliza datas, números e floats em strings comparáveis', () => {
      const data = new Date('2026-03-31T20:00:00.000Z');
      expect(ContratoService.normalizarValor(data)).toBe('2026-03-31');
      expect(ContratoService.normalizarValor(50)).toBe('50');
      expect(ContratoService.normalizarValor('55.4')).toBe('55.4');
    });

    it('[Success] Faz parse de colunas numéricas de Excel com formatações locais', () => {
      expect(ContratoService.parseDecimalCell('1.550,20')).toBe(1550.2);
      expect(ContratoService.parseDecimalCell('99,00')).toBe(99);
      expect(ContratoService.parseDecimalCell(45)).toBe(45);
    });
  });

  describe('create & update (Regras Negócio Módulos Vencimento/Log/Classificacao)', () => {
    it('[Success] Cria Contrato com valor antigo herdando do mensal e cascateia Vencimento', async () => {
      const payload = {
        id_produto: 2,
        quantidade: 10,
        valor_mensal: 50,
        data_inicio: '2023-01-01',
        duracao: 12,
        status: 'ativo'
      };
      
      ContratoRepository.findProdutoById.mockResolvedValue({ nome: 'Antivirus' });
      ContratoRepository.create.mockResolvedValue({ id: 100 });
      classificarClientes.mockResolvedValue();

      const { contrato, aviso } = await ContratoService.create(payload);

      expect(ContratoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        valor_antigo: 50,
        quantidade: 10
      }));
      expect(classificarClientes).toHaveBeenCalled();
      expect(ContratoRepository.createVencimento).toHaveBeenCalled(); // 12 meses
      expect(contrato.id).toBe(100);
    });

    it('[Validation] Dispara erro 404 se tentar atualizar contrato que não existe', async () => {
      ContratoRepository.findById.mockResolvedValue(null);

      await expect(ContratoService.update(99, {})).rejects.toThrow(AppError);
    });

    it('[Success] Update extrai diffs criando Logs e Recalcula Vencimentos', async () => {
      const persistDB = {
        id: 1,
        valor_mensal: 30, // vai mudar pra 40
        valor_antigo: 10,
        data_inicio: '2023-01-01',
        duracao: 12,
        status: 'ativo',
        toJSON: () => ({ valor_mensal: 30 }) // mock basico toJSON
      };
      const atualizarDB = {
        id: 1,
        valor_mensal: 40,
        valor_antigo: 30, // salva o 30
        toJSON: () => ({ valor_mensal: 40 })
      };

      ContratoRepository.findById.mockResolvedValue(persistDB);
      ContratoRepository.findProdutoById.mockResolvedValue({ nome: 'Firewall' }); // anula qtd
      ContratoRepository.update.mockResolvedValue();
      
      // Override toJSON manualment dps do update para espelhar mudança
      ContratoRepository.update.mockImplementation((contrato) => {
        Object.assign(contrato, atualizarDB);
      });

      const { message, alteracoes } = await ContratoService.update(1, { valor_mensal: 40, quantidade: 99, status: 'inativo' });

      expect(ContratoRepository.createLog).toHaveBeenCalled();
      expect(classificarClientes).toHaveBeenCalled();
      expect(ContratoRepository.updateVencimento).toHaveBeenCalled();
      expect(alteracoes[0]).toContain("valor_mensal: '30' → '40'");
    });
  });

  describe('processarExcel (Bulk Ops)', () => {
    it('[Success] Percorre array convertendo excel em inserções ou atualizações do banco', async () => {
      const mockBuffer = Buffer.from('excel');
      XLSX.read.mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
      XLSX.utils.sheet_to_json.mockReturnValue([
        { cpf_cnpj: '123', nome_produto: 'Backup', valor_mensal: '200,50', quantidade: 5, nome_faturado: 'Empr' },
        { nome_produto: 'Produto Sem CNPJ', valor_mensal: 10 } // Falha missing args
      ]);

      ContratoRepository.findClienteByCpfCnpj.mockResolvedValue({ id: 10 });
      ContratoRepository.findProdutoByNome.mockResolvedValue({ id: 99, nome: 'Backup' });
      ContratoRepository.findContratoExistente.mockResolvedValue(null); // Vai ser CRIADO
      ContratoRepository.findFaturadoByNome.mockResolvedValue({ id: 1 });
      ContratoRepository.create.mockResolvedValue({ id: 22 });

      const output = await ContratoService.processarExcel(mockBuffer);

      // 1 erro na row 2, 1 sucesso na row 1
      expect(output.sucessos).toHaveLength(1);
      expect(output.erros).toHaveLength(1);
      expect(ContratoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        valor_mensal: 200.5,
        quantidade: 5
      }));
    });
  });
});
