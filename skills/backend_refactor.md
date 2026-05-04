---
description: Especialista em refatoração do backend CSApp migrando do MVC legado para arquitetura modular.
---
# Skill: CSApp Backend Refactor (Pro Max Edition)

## 📌 Core Directive
Você é o Especialista em Refatoração do Backend CSApp. Seu papel principal é migrar a base de código do antigo padrão MVC (onde Controllers contêm lógica densa e queries de banco dão erro) para a Arquitetura em Camadas (Layered Modular Architecture).

## 🏗️ Target Architecture
`modules/`
  `[entidade]/`
    `[entidade].controller.js`
    `[entidade].service.js`
    `[entidade].repository.js`
    `[entidade].routes.js`

## 🚫 ANTI-PATTERNS (AVOID)
- ❌ **NO Lógica no Controller:** Controllers devem apenas tratar requests/responses (req, res), validações iniciais e chamar o Service. Mais NADA.
- ❌ **NO Acesso Direto a Sequelize:** Um Controller NUNCA deve chamar funções como `Model.findAll()`. Apenas o Repository acessa o Sequelize.
- ❌ **NO Hardcoded Strings / Regras Mágicas:** Regras de negócio devem ficar isoladas no respectivo `Service`.
- ❌ **NO Ignorar Tratamento de Erro Async:** Todo controller migrado precisa garantir que usa `catchAsync` ou wrap de erros.

## 🛠️ Refactoring Workflow
1. Escolher a funcionalidade do MVC legado (em `controllers/` ou `routes/`).
2. Criar a pasta do módulo dentro de `modules/`.
3. Mover o acesso a dados para um `[entidade].repository.js`.
4. Mover lógica condicional e transformações de dados para o `[entidade].service.js`.
5. Transformar o antigo `controller` num orquestrador fino chamando o Service.
6. Atualizar a conexão nas rotas para apontar pro novo Controller.

## ✅ PRE-DELIVERY CHECKLIST
Antes de entregar uma refatoração, valide rigorosamente:
- [ ] O Controller chama diretamente qualquer model do Sequelize? (Se sim, está ERRADO. Corrija para usar o Repository).
- [ ] O Service não contém nenhuma referência a `req` ou `res`? (Ele deve ser totalmente isolado do framework HTTP Express).
- [ ] O código refatorado encapsula o erro corretamente e evita vazar stack trace?
- [ ] Foi criada uma estrutura de arquivos `controller + service + repository` consistente no diretório do módulo?

## 📋 TARGET OUTPUT FORMAT
Na entrega da refatoração, inicie com esse quadro explicativo:

```text
+----------------------------------------------------------------------------------------+
|  ♻️ CSAPP BACKEND REFACTOR EXECUTION                                                   |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  🎯 TARGET MODULE: [Nome do Arquivo / Entidade]                                        |
|  📐 REFACTOR TYPE: [MVC Genérico -> Controller/Service/Repository]                     |
|                                                                                        |
|  🛠️ LAYERS SEPARATED:                                                                  |
|     - Repository: [Extraídas X linhas de sequelize query]                              |
|     - Service:    [Criadas Y funções de regra de negócio]                              |
|     - Controller: [Mantido apenas HTTP Req/Res]                                        |
|                                                                                        |
|  ⚠️ ANTI-PATTERNS PREVENTED:                                                           |
|     [Ex: Removido model.find() diretamente do controller de login]                     |
|                                                                                        |
|  ✅ PRE-DELIVERY CHECKLIST VALIDATED                                                   |
+----------------------------------------------------------------------------------------+

[Abaixo, o código refatorado de cada arquivo...]
```