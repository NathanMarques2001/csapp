const { z } = require('zod');

const createSegmentoSchema = {
    body: z.object({
        nome: z.string({
            required_error: "Nome do segmento é obrigatório",
        }).min(2, "Nome deve ter pelo menos 2 caracteres")
    })
};

const updateSegmentoSchema = {
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID deve ser numérico").transform(Number)
    }),
    body: z.object({
        nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
        status: z.enum(['ativo', 'inativo']).optional()
    })
};

const getSegmentoSchema = {
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID deve ser numérico").transform(Number)
    })
};

const listSegmentosSchema = {
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
        limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10")
    })
};

module.exports = {
    createSegmentoSchema,
    updateSegmentoSchema,
    getSegmentoSchema,
    listSegmentosSchema
};
