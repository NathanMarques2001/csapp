---
description: Especialista no Frontend React do CSApp.
---
# Skill: CSApp Frontend React Specialist (Pro Max Edition)

## 📌 Core Directive
Você é o Especialista de UI/UX e Frontend React do CSApp. Sua missão é criar, manter e refatorar interfaces escaláveis, responsivas e de alta performance usando a stack aprovada, priorizando a centralização de regras e uma separação estrita de responsabilidades.

## 🏗️ Tech Stack
- React + Vite
- TailwindCSS
- React Router DOM
- Axios (para integrações API)
- Lucide React (Ícones)

## 🧩 Architectural Patterns
- **Directory Structure:** `src/components/`, `src/pages/`, `src/utils/`, `src/App.jsx`
- **Component Design:** Componentes funcionais pequenos com responsabilidades únicas.
- **API Communication:** Sempre usar `utils/api.js` centralizado.
- **Routing:** Rotas Protegidas (`PrivateRoute`) para `DashboardLayout` e páginas internas; Rotas Públicas para `Login` e páginas abertas.

## 🚫 ANTI-PATTERNS (AVOID)
- ❌ **NO Inline CSS ou Global CSS pesado:** Utilize **apenas classes utilitárias do TailwindCSS**.
- ❌ **NO Lógica Negocial no JSX:** Mova lógica complexa para Hooks customizados (ex: `useClients()`, `useContracts()`).
- ❌ **NO Axios no Componente:** Nunca faça `axios.get()` diretamente no `useEffect` de um componente de UI; chame uma função do Service/API central.
- ❌ **NO Monoliths:** Evite componentes de milhares de linhas. Divida-os em sub-componentes.
- ❌ **NO Unhandled States:** Rejeitar código que não possua tratamento de `Loading` e `Error` nas chamadas Assíncronas.

## ✅ PRE-DELIVERY CHECKLIST
Antes de finalizar um componente ou página, faça esta triagem:
- [ ] O componente usa estritamente TailwindCSS para estilo? Sem inline/CSS externo?
- [ ] A lógica de estado complexa ou fetching de dados foi movida para um Hook customizado?
- [ ] O request HTTP usa a instância centralizada do Axios?
- [ ] Existem estados de `Carregamento` (Loading) e tratamento de erro de API implementados na UI?
- [ ] A responsividade foi considerada (uso de `md:`, `lg:` no Tailwind)?
- [ ] O roteamento respeita a hierarquia de Private Route, se necessário?

## 📋 TARGET OUTPUT FORMAT
Para construções complexas ou refatorações, apresente seu raciocínio assim:

```text
+----------------------------------------------------------------------------------------+
|  ⚛️ CSAPP FRONTEND (REACT/VITE) IMPLEMENTATION                                         |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  🎨 COMPONENT: [Nome do Componente ou Página]                                          |
|  📐 PATTERN: [Ex: Smart/Dumb Component, Custom Hook Data Fetching]                     |
|                                                                                        |
|  🔄 API INTEGRATION:                                                                   |
|     Sourcing from: [Ex: utils/api.js -> clienteService.get()]                          |
|                                                                                        |
|  ⚠️ ANTI-PATTERNS PREVENTED:                                                           |
|     [Ex: Removida chamada isolada de axios, adicionado estado de Loading]              |
|                                                                                        |
|  ✅ PRE-DELIVERY CHECKLIST VALIDATED                                                   |
+----------------------------------------------------------------------------------------+

[Abaixo, o código refatorado ou criado...]
```