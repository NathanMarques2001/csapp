CSApp Frontend Guidelines & Roadmap
Este documento serve como a fonte da verdade para a identidade visual, padrões de desenvolvimento e o roteiro futuro do projeto CSApp Frontend.

1. Identidade Visual (Design System)
Nossa interface foi projetada para ser limpa, profissional e focada na produtividade, utilizando uma estética moderna e minimalista.

Cores Principais (Tailwind CSS)
Utilizamos a paleta padrão do Tailwind, com foco em cores semânticas:

Neutros/Superfícies: Slate (50-900). Usado para fundos, bordas e textos.
bg-slate-50: Fundo da aplicação.
bg-white: Fundo de cartões e painéis.
text-slate-900: Títulos e dados principais.
text-slate-500: Texto secundário e legendas.
Primária (Ação/Destaque): Teal (Esmeralda/Ciano escuro).
bg-teal-600: Botões principais, estados ativos.
text-teal-700: Links, ícones de destaque.
Secundária (Elegância/Dados): Indigo & Violet.
Usado em gráficos, badges de categoria e elementos de IA.
Feedback:
Red: Erro, Perigo (ex: "Inativar Cliente").
Amber: Atenção, Pendente.
Emerald: Sucesso, Ativo.
Tipografia
Família: Sans-serif padrão do sistema (Inter, Roboto, Segoe UI) para máxima legibilidade e performance.
Hierarquia:
H1 (Páginas): text-2xl font-bold text-slate-900.
H2 (Seções): text-lg/xl font-bold text-slate-800.
Corpo: text-sm é o padrão para tabelas e formulários.
Componentes Core (src/components/ui)
Construímos uma biblioteca interna de componentes reutilizáveis para garantir consistência:

Card: Container padrão com bg-white, rounded-lg, shadow-sm, border border-slate-200.
Button:
default: Fundo Teal, texto branco.
outline: Borda Slate, fundo transparente.
ghost: Fundo transparente, hover cinza claro (para ações secundárias em tabelas).
Badge: Pílulas arredondadas para status (px-2 py-1 text-xs rounded-full).
Input/Select: Estilizados com focus:ring-2 focus:ring-teal-500.
Ícones
Biblioteca: lucide-react.
Estilo: Linha (Stroke), tamanho padrão w-5 h-5.
2. Padrões de Desenvolvimento
Desenvolvemos com foco em Modularidade, Paridade de Negócio e Performance.

Arquitetura de Pastas
src/
├── components/
│   ├── ui/           # Componentes genéricos (Botões, Cards, Inputs)
│   ├── contracts/    # Componentes específicos de Contratos
│   ├── reports/      # Componentes de Relatórios
│   ├── settings/     # Componentes de Configuração
│   └── ...
├── layouts/          # Estruturas de página (Sidebar, Header)
├── pages/            # Páginas/Rotas principais
├── utils/            # Funções auxiliares, formatadores e API Mock
└── App.jsx           # Roteamento e estrutura principal
Princípios de Código
Hooks Padrão: Uso extensivo de useState, useEffect e useMemo para gerenciar estado e performance.
API Centralizada: Todas as chamadas de dados passam por 
src/utils/api.js
. Atualmente é um Mock, mas preparado para ser substituído por chamadas axios reais.
Simplicidade nos Props: Componentes recebem apenas o necessário. Dados complexos são processados antes de serem passados (ex: 
Reports.jsx
 busca dados e passa para filhos).
Paridade com Legado: A lógica de negócio (cálculos, filtros) deve espelhar fielmente o sistema antigo (fontend-antigo), mas a UI deve seguir o novo Design System.