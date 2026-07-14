const ContatoComercialService = require('./contato-comercial.service');
const ContatoComercialRepository = require('./contato-comercial.repository');
const AppError = require('../../utils/AppError');

jest.mock('./contato-comercial.repository');

describe('ContatoComercialService', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('findById', () => {
    it('[Success] Retorna entidade por ID', async () => {
      ContatoComercialRepository.findById.mockResolvedValue({ id: 1 });
      const res = await ContatoComercialService.findById(1);
      expect(res.id).toBe(1);
    });

    it('[Validation] Dispara 404 se não encontrado', async () => {
      ContatoComercialRepository.findById.mockResolvedValue(null);
      await expect(ContatoComercialService.findById(99)).rejects.toThrow(AppError);
    });
  });

  describe('findAll', () => {
    it('[Success] Lista todas as instâncias', async () => {
      ContatoComercialRepository.findAll.mockResolvedValue([{ id: 1 }]);
      const res = await ContatoComercialService.findAll();
      expect(res).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('[Success] Cria com sucesso', async () => {
      ContatoComercialRepository.create.mockResolvedValue({ id: 2, nome: 'Test' });
      const res = await ContatoComercialService.create({ id_cliente: 1, conteudo: 'Test' });
      expect(res.id).toBe(2);
    });
  });

  describe('update', () => {
    it('[Success] Autoriza atualização após findById bem-sucedido', async () => {
      ContatoComercialRepository.findById.mockResolvedValue({ id: 1 });
      ContatoComercialRepository.update.mockResolvedValue(true);
      const res = await ContatoComercialService.update(1, { conteudo: 'New' });
      expect(res).toBeTruthy();
      expect(ContatoComercialRepository.update).toHaveBeenCalledWith(1, { conteudo: 'New' });
    });
  });

  describe('findByClienteId', () => { it('[Success] Lista items de um cliente', async () => { ContatoComercialRepository.findByClienteId.mockResolvedValue({ contatos_tecnicos: [], contatos_comerciais: [], fatos: [] }); const res = await ContatoComercialService.findByClienteId(1); expect(res).toBeDefined(); }); });


  describe('delete', () => { it('[Success] Apaga item por id', async () => { ContatoComercialRepository.findById.mockResolvedValue({ id: 1 }); ContatoComercialRepository.delete.mockResolvedValue(true); const res = await ContatoComercialService.delete(1); expect(res).toBe(true); }); });
});
