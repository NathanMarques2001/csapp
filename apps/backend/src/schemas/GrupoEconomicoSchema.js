const { z } = require('zod');

const storeGrupoEconomicoSchema = z.object({
  body: z.object({
    nome: z.string({ required_error: 'O nome do grupo econômico é obrigatório' }).min(1, 'O nome não pode estar vazio'),
  })
});

const updateGrupoEconomicoSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'O nome não pode estar vazio').optional(),
    status: z.enum(['ativo', 'inativo'], { invalid_type_error: 'O status deve ser ativo ou inativo' }).optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'O ID do grupo econômico é obrigatório' })
  })
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'O ID do grupo econômico é obrigatório' })
  })
});

module.exports = {
  storeGrupoEconomicoSchema,
  updateGrupoEconomicoSchema,
  idParamSchema
};
