const ContatoTecnicoService = require('./contato-tecnico.service');
const ContatoTecnicoRepository = require('./contato-tecnico.repository');
const AppError = require('../../utils/AppError');

jest.mock('./contato-tecnico.repository');

describe('ContatoTecnicoService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('findById', () => {
    it('[Success] Retorna entidade por ID', async () => {
      ContatoTecnicoRepository.findById.mockResolvedValue({ id: 1 });
      const res = await ContatoTecnicoService.findById(1);
      expect(res.id).toBe(1);
    });

    it('[Validation] Dispara 404 se não encontrado', async () => {
      ContatoTecnicoRepository.findById.mockResolvedValue(null);
      await expect(ContatoTecnicoService.findById(99)).rejects.toThrow(AppError);
    });
  });

  describe('findAll', () => {
    it('[Success] Lista todas as instâncias', async () => {
      ContatoTecnicoRepository.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await ContatoTecnicoService.findAll();
      expect(res).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('[Success] Cria com sucesso', async () => {
      ContatoTecnicoRepository.create.mockResolvedValue({ id: 2, nome: 'Test' });
      const res = await ContatoTecnicoService.create({ id_cliente: 1, conteudo: 'Test' });
      expect(res.id).toBe(2);
    });
  });

  describe('update', () => {
    it('[Success] Autoriza atualização após findById bem-sucedido', async () => {
      ContatoTecnicoRepository.findById.mockResolvedValue({ id: 1 });
      ContatoTecnicoRepository.update.mockResolvedValue(true);
      const res = await ContatoTecnicoService.update(1, { conteudo: 'New' });
      expect(res).toBeTruthy();
      expect(ContatoTecnicoRepository.update).toHaveBeenCalledWith(1, { conteudo: 'New' });
    });
  });

  describe('findByClienteId', () => { it('[Success] Lista items de um cliente', async () => { ContatoTecnicoRepository.findByClienteId.mockResolvedValue({ contatos_tecnicos: [], contatos_comerciais: [], fatos: [] }); const res = await ContatoTecnicoService.findByClienteId(1); expect(res).toBeDefined(); }); });


  describe('delete', () => { it('[Success] Apaga item por id', async () => { ContatoTecnicoRepository.findById.mockResolvedValue({ id: 1 }); ContatoTecnicoRepository.delete.mockResolvedValue(true); const res = await ContatoTecnicoService.delete(1); expect(res).toBe(true); }); });
});
