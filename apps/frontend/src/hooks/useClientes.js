import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import Api from "../utils/api";

export function useClientes() {
    const api = new Api();
    const [cookies] = useCookies(["tipo", "id"]);
    const [carregando, setCarregando] = useState(false);

    const [clientesGrupos, setClientesGrupos] = useState([]);
    const [clientesSemGrupo, setClientesSemGrupo] = useState([]);
    const [contratos, setContratos] = useState([]);
    const [vendedores, setVendedores] = useState({});
    const [classificacoes, setClassificacoes] = useState([]);

    const [totais, setTotais] = useState({
        geral: 0,
        porCategoria: {}
    });

    const [filtros, setFiltros] = useState({ status: "ativo" });
    const [busca, setBusca] = useState("");

    const isAdminOuDev = cookies.tipo === "dev" || cookies.tipo === "admin";

    // Busca de dados
    useEffect(() => {
        async function buscarDados() {
            try {
                setCarregando(true);

                // Paralelizando chamadas independentes
                const [
                    gruposRes,
                    clientesRes,
                    vendedoresRes,
                    contratosRes,
                    classificacoesRes
                ] = await Promise.all([
                    api.get("/grupos-economicos"),
                    api.get("/clientes"),
                    api.get("/usuarios"),
                    api.get("/contratos"),
                    api.get("/classificacoes-clientes")
                ]);

                const grupos = gruposRes.grupoEconomico || [];
                const clientesData = clientesRes.clientes || [];

                // Mapa de Vendedores
                const mapaVendedores = (vendedoresRes.usuarios || []).reduce((acc, user) => {
                    acc[user.id] = user.nome;
                    return acc;
                }, {});
                setVendedores(mapaVendedores);

                setContratos(contratosRes.contratos || []);

                // Mapa de Classificações
                const mapaClassificacoes = (classificacoesRes.classificacoes || []).reduce((acc, cl) => {
                    acc[cl.id] = cl;
                    return acc;
                }, {});
                setClassificacoes(mapaClassificacoes);

                // Agrupamento
                const { agrupados, semGrupo } = agruparClientes(clientesData, grupos);
                setClientesGrupos(agrupados);
                setClientesSemGrupo(semGrupo);

            } catch (erro) {
                console.error("Erro ao buscar dados:", erro);
            } finally {
                setCarregando(false);
            }
        }

        buscarDados();
    }, [cookies.tipo, cookies.id]);

    // Cálculo de Totais (Efeito derivado dos dados)
    useEffect(() => {
        calcularTotais();
    }, [clientesGrupos, clientesSemGrupo, contratos, classificacoes]);

    // --- Lógica Auxiliar ---

    function agruparClientes(clientes, grupos) {
        const indiceGrupos = grupos.reduce((acc, grupo) => {
            acc[grupo.id] = { grupo, unidades: [] };
            return acc;
        }, {});

        const semGrupo = [];

        clientes.forEach((cliente) => {
            const grupoId = cliente.id_grupo_economico;
            if (grupoId && indiceGrupos[grupoId]) {
                indiceGrupos[grupoId].unidades.push(cliente);
            } else {
                semGrupo.push(cliente);
            }
        });

        return {
            agrupados: Object.values(indiceGrupos),
            semGrupo
        };
    }

    function calcularValorTotalContratos(clienteId) {
        const contratosCliente = contratos.filter(
            (c) => c.id_cliente === clienteId && c.status === "ativo"
        );

        return contratosCliente.reduce((soma, c) => {
            const valor = parseFloat(c.valor_mensal);
            // Mantendo lógica original de imposto (que retorna o valor direto)
            // Se houver lógica real de imposto no futuro, ajustar aqui.
            return soma + valor;
        }, 0);
    }

    function calcularTotais() {
        let totalGeral = 0;
        const totaisCat = {};

        if (Object.keys(classificacoes).length === 0) {
            setTotais({ geral: 0, porCategoria: {} });
            return;
        }

        // Unifica lógica de soma para grupos e clientes avulsos
        const processarCliente = (cliente, categoriaId) => {
            const nomeCategoria = classificacoes[categoriaId]?.nome || "Não Classificado";
            if (!totaisCat[nomeCategoria]) totaisCat[nomeCategoria] = 0;

            const valor = calcularValorTotalContratos(cliente.id);
            totaisCat[nomeCategoria] += valor;
            totalGeral += valor;
        };

        clientesGrupos.forEach(({ grupo, unidades }) => {
            // Grupos usam a classificação DO GRUPO para todas as unidades?
            // Pela lógica original: SIM.
            const catGrupo = grupo.id_classificacao_cliente;
            unidades.forEach(unidade => processarCliente(unidade, catGrupo));
        });

        clientesSemGrupo.forEach(cliente => {
            processarCliente(cliente, cliente.id_classificacao_cliente);
        });

        setTotais({ geral: totalGeral, porCategoria: totaisCat });
    }

    // --- Lógica de Filtro ---

    const aplicarFiltros = (item) => {
        // Se for grupo, verifica se ALGUMA unidade passa no filtro
        if (item.grupo && item.unidades) {
            // Lógica: Se o item é um grupo, queremos saber se ele deve ser exibido.
            // Ele deve ser exibido se tiver pelo menos uma unidade que passe nos filtros.
            // E quando exibido, devemos exibir apenas as unidades que passam? 
            // A lógica original filtrava o GRUPO todo baseado nas unidades.
            // E retornava o grupo com TODAS as unidades?
            // Original: `unidades.some(...)` -> Retorna o grupo inteiro se uma passar?
            // "filter returns the group object".
            // Mas na renderização, ele mapiava `grupo.unidades.map`.
            // A lógica original PARECIA manter todas as unidades se o grupo passasse.
            // VOU MANTER A LÓGICA DE FILTRAR O OBJETO PAI.

            return item.unidades.some((unidade) => verificarCriterios(unidade));
        }

        // Se for cliente avulso
        return verificarCriterios(item);
    };

    const verificarCriterios = (cliente) => {
        const { classificacao_cliente, nome_vendedor, status } = filtros;

        const passaClassificacao = !classificacao_cliente ||
            cliente.id_classificacao_cliente === parseInt(classificacao_cliente);

        const passaVendedor = !nome_vendedor ||
            cliente.id_usuario === parseInt(nome_vendedor);

        const passaStatus = !status || cliente.status === status;

        const passaBusca = !busca ||
            cliente.nome_fantasia.toLowerCase().includes(busca.toLowerCase());

        return passaClassificacao && passaVendedor && passaStatus && passaBusca;
    };

    // Dados para a Tabela (Flat List para paginação)
    // Mas espera, a paginação original mistura Grupos e Clientes na raiz.

    const clientesGruposFiltrados = clientesGrupos.filter(g => aplicarFiltros(g));
    const clientesSemGrupoFiltrados = clientesSemGrupo.filter(c => aplicarFiltros(c));

    return {
        carregando,
        filtros: {
            valores: filtros,
            setValores: setFiltros,
            busca,
            setBusca,
            limpar: () => setFiltros({ status: "ativo" })
        },
        dados: {
            clientesGrupos: clientesGruposFiltrados,
            clientesSemGrupo: clientesSemGrupoFiltrados,
            contratos,
            vendedores,
            classificacoes,
            totais
        },
        funcoes: {
            calcularValorTotalContratos,
            isAdminOuDev
        }
    };
}
