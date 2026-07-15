const request = require('supertest');
const express = require('express');

// Configuração do app isolado para os testes
const app = express();
app.use(express.json());

// Mock dos Middlewares e Repositórios antes de importar as rotas
jest.mock('../middlewares/auth', () => (req, res, next) => next());
jest.mock('../repositories/GrupoEconomicoRepository');
jest.mock('../repositories/ClienteRepository');
jest.mock('../repositories/ContratoRepository');
jest.mock('../utils/classificacaoClientes', () => jest.fn());

const GrupoEconomicoRepository = require('../repositories/GrupoEconomicoRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const ContratoRepository = require('../repositories/ContratoRepository');
const classificarClientes = require('../utils/classificacaoClientes');

const gruposEconomicosRoutes = require('../routes/GruposEconomicosRoutes');
const globalErrorHandler = require('../middlewares/errorHandler');

app.use('/api/grupos-economicos', gruposEconomicosRoutes);
app.use(globalErrorHandler);

describe('GrupoEconomico API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/grupos-economicos', () => {
    it('Deve criar um grupo econômico com sucesso (Happy Path)', async () => {
      GrupoEconomicoRepository.create.mockResolvedValue({ id: 1, nome: 'Grupo Teste', status: 'ativo' });

      const response = await request(app)
        .post('/api/grupos-economicos')
        .send({ nome: 'Grupo Teste' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Grupo econômico criado com sucesso!');
      expect(response.body.grupoEconomico).toHaveProperty('id', 1);
      
      expect(GrupoEconomicoRepository.create).toHaveBeenCalledWith({ nome: 'Grupo Teste', status: 'ativo' });
    });

    it('Deve falhar na validação do Zod se o nome for vazio', async () => {
      const response = await request(app)
        .post('/api/grupos-economicos')
        .send({ nome: '' });

      if (response.status !== 400) console.log("RESPONSE BODY:", response.body);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('O nome não pode estar vazio');
      
      // Garante que o Service e o Repository não foram chamados devido à falha de validação
      expect(GrupoEconomicoRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/grupos-economicos', () => {
    it('Deve retornar todos os grupos econômicos (Happy Path)', async () => {
      const mockData = [{ id: 1, nome: 'Grupo A' }, { id: 2, nome: 'Grupo B' }];
      GrupoEconomicoRepository.findAll.mockResolvedValue(mockData);

      const response = await request(app).get('/api/grupos-economicos');

      expect(response.status).toBe(200);
      expect(response.body.grupoEconomico).toEqual(mockData);
    });

    it('Deve tratar erro interno do servidor (500) sem vazar stack trace', async () => {
      // Força um erro genérico na chamada do repositório
      GrupoEconomicoRepository.findAll.mockRejectedValue(new Error('Erro inesperado no banco de dados'));

      // Modificando a variável de ambiente para simular produção e evitar vazamento do stack trace
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app).get('/api/grupos-economicos');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Ocorreu um erro interno. Por favor, tente novamente mais tarde.'
      });
      // Garante que o stack trace não existe na resposta
      expect(response.body.stack).toBeUndefined();

      // Restaura o ambiente
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('PUT /api/grupos-economicos/active-inactive/:id', () => {
    it('Deve inativar o grupo, seus clientes e contratos em cascata (Happy Path)', async () => {
      // Mock para buscar o grupo como ativo
      GrupoEconomicoRepository.findById.mockResolvedValue({ id: 1, status: 'ativo' });
      // Mock para buscar um cliente atrelado a ele
      ClienteRepository.findByGrupoEconomicoId.mockResolvedValue([{ id: 10, status: 'ativo' }]);
      
      GrupoEconomicoRepository.update.mockResolvedValue([1]);
      ClienteRepository.updateStatus.mockResolvedValue([1]);
      ContratoRepository.updateStatusByClienteId.mockResolvedValue([1]);

      const response = await request(app).put('/api/grupos-economicos/active-inactive/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Status alterado com sucesso!');
      
      // Verifica se a inativação ocorreu nos 3 níveis
      expect(GrupoEconomicoRepository.update).toHaveBeenCalledWith("1", { status: 'inativo' });
      expect(ClienteRepository.updateStatus).toHaveBeenCalledWith(10, 'inativo');
      expect(ContratoRepository.updateStatusByClienteId).toHaveBeenCalledWith(10, 'inativo');
      
      // Verifica se a reclassificação de clientes foi acionada
      expect(classificarClientes).toHaveBeenCalled();
    });
  });
});
