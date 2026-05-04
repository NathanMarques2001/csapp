const { z } = require('zod');

const createProdutoSchema = {
    body: z.object({
        nome: z.string({
            required_error: "Nome do produto é obrigatório",
        }).min(2, "Nome deve ter pelo menos 2 caracteres"),
        id_fabricante: z.number({
            required_error: "ID do fabricante é obrigatório",
        }).int().positive("ID do fabricante deve ser um número positivo")
    })
};

const updateProdutoSchema = {
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID deve ser numérico").transform(Number)
    }),
    body: z.object({
        nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
        id_fabricante: z.number().int().positive("ID do fabricante deve ser um número positivo").optional(),
        status: z.enum(['ativo', 'inativo']).optional()
    })
};

const getProdutoSchema = {
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID deve ser numérico").transform(Number)
    })
};

const listProdutosSchema = {
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
        limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10")
    })
};

module.exports = {
    createProdutoSchema,
    updateProdutoSchema,
    getProdutoSchema,
    listProdutosSchema
};
