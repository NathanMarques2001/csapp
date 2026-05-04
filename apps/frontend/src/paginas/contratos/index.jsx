import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../componentes/navbar";
import Carregando from "../../componentes/carregando";
import PopUpFiltro from "../../componentes/pop-up-filtro";
import Api from "../../utils/api";
import "./style.css";
import { useCookies } from "react-cookie";
import { baixarModelo } from "../../utils/modeloExcelContratos";
import PopUpImportaContratos from "../../componentes/pop-up-importa-contrato";
import Formatadores from "../../utils/formatadores";

export default function Contratos() {
  const api = new Api();
  const [cookies] = useCookies(["tipo", "id"]);
  const [adminOuDev, setAdminOuDev] = useState(false);
  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtros, setFiltros] = useState({ status: "ativo" });
  const [carregando, setCarregando] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarModalImportacao, setMostrarModalImportacao] = useState(false);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 50;
  const navigate = useNavigate();

  useEffect(() => {
    const buscarDados = async () => {
      setCarregando(true);
      try {
        console.log(cookies);
        if (cookies.tipo === "dev" || cookies.tipo === "admin") {
          setAdminOuDev(true);
        } else {
          setAdminOuDev(false);
        }

        const contratosResponse = await api.get("/contratos");
        const contratosMap = contratosResponse.contratos.reduce(
          (map, contrato) => {
            map[contrato.id] = contrato;
            return map;
          },
          {}
        );
        setContratos(Object.values(contratosMap));

        const clientesResponse = await api.get("/clientes");
        const clientesMap = clientesResponse.clientes.reduce((map, cliente) => {
          map[cliente.id] = cliente;
          return map;
        }, {});
        setClientes(clientesMap);

        const vendedoresResponse = await api.get("/usuarios");
        const vendedoresMap = vendedoresResponse.usuarios.reduce(
          (map, vendedor) => {
            map[vendedor.id] = vendedor;
            return map;
          },
          {}
        );
        setVendedores(vendedoresMap);

        const produtosResponse = await api.get("/produtos");
        const produtosMap = produtosResponse.produtos.reduce((map, produto) => {
          map[produto.id] = produto;
          return map;
        }, {});
        setProdutos(produtosMap);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [cookies.tipo, cookies.id]);

  const detalhesContrato = (id) => {
    navigate(`/edicao-contrato/${id}`);
  };

  const adicionarContrato = () => {
    navigate("/cadastro-contrato");
  };

  const filtrarContratos = (e) => {
    setFiltro(e.target.value);
  };

  const aplicarFiltroPopUp = (novosFiltros) => {
    setFiltros(novosFiltros);
    setMostrarFiltros(false);
  };

  const limparFiltros = () => {
    setFiltros({ status: "ativo" });
  };

  // FIX: Wrapped in useMemo to prevent infinite loop.
  const contratosFiltrados = useMemo(() => {
    return contratos.filter((contrato) => {
      const cliente = clientes[contrato.id_cliente];
      const produto = produtos[contrato.id_produto];
      const clienteNome = cliente?.nome_fantasia || "";
      const clienteRazao = cliente?.razao_social || "";
      const produtoNome = produto?.nome || "";

      const condicoesFiltro = [
        filtros.id_cliente
          ? contrato.id_cliente.toString().includes(filtros.id_cliente)
          : true,
        filtros.id_produto
          ? contrato.id_produto.toString().includes(filtros.id_produto)
          : true,
        filtros.status ? contrato.status === filtros.status : true,
        filtros.duracao
          ? contrato.duracao.toString().includes(filtros.duracao)
          : true,
        filtros.valor_mensal
          ? contrato.valor_mensal.toString().includes(filtros.valor_mensal)
          : true,
        filtros.razao_social
          ? clienteRazao
            .toLowerCase()
            .includes(filtros.razao_social.toLowerCase())
          : true,
        filtros.nome_fantasia
          ? clienteNome
            .toLowerCase()
            .includes(filtros.nome_fantasia.toLowerCase())
          : true,
        filtros.nome_produto
          ? produtoNome.toLowerCase().includes(filtros.nome_produto.toLowerCase())
          : true,
        clienteNome.toLowerCase().includes(filtro.toLowerCase()),
      ];

      return condicoesFiltro.every((condition) => condition);
    });
  }, [contratos, clientes, produtos, filtros, filtro]);

  const totalPaginas = Math.max(1, Math.ceil(contratosFiltrados.length / ITENS_POR_PAGINA));
  const paginaExibida = Math.min(Math.max(1, paginaAtual), totalPaginas);
  const contratosPaginados = contratosFiltrados.slice(
    (paginaExibida - 1) * ITENS_POR_PAGINA,
    paginaExibida * ITENS_POR_PAGINA
  );

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro, filtros]);

  const calculaValorImpostoMensal = (valor, indice) => valor;

  // FIX: Derived state instead of useState + useEffect
  const totalGeral = contratosFiltrados.reduce((acc, contrato) => {
    const valorContrato = calculaValorImpostoMensal(
      parseFloat(contrato.valor_mensal),
      contrato.indice_reajuste
    );
    return acc + valorContrato;
  }, 0);

  const totalPorFaturamento = contratosFiltrados.reduce(
    (acc, contrato) => {
      const valorContrato = calculaValorImpostoMensal(
        parseFloat(contrato.valor_mensal),
        contrato.indice_reajuste
      );
      const tipo = contrato.tipo_faturamento || "Não especificado";

      if (!acc[tipo]) {
        acc[tipo] = 0;
      }
      acc[tipo] += valorContrato;
      return acc;
    },
    {}
  );

  return (
    <>
      {carregando && <Carregando />}
      <div id="contratos-display">
        <Navbar />
        <div id="contratos-container">
          <h1 id="contratos-titulo">Contratos</h1>
          <input
            type="text"
            placeholder="Procure pelo cliente"
            id="contratos-input"
            value={filtro}
            onChange={filtrarContratos}
          />
          <button
            onClick={adicionarContrato}
            disabled={!adminOuDev}
            className={`contratos-botao ${!adminOuDev ? "disabled" : ""}`}
            id="contratos-botao-add"
          >
            Adicionar Contrato
          </button>
          <button
            onClick={() => setMostrarFiltros(true)}
            className="contratos-botao"
            id="contratos-botao-filtro"
          >
            Filtrar
          </button>
          <button
            onClick={() => setMostrarModalImportacao(true)}
            className="contratos-botao"
            id="contratos-botao-importar"
          >
            Importar Contratos
          </button>

          {mostrarModalImportacao && (
            <PopUpImportaContratos
              baixarModelo={baixarModelo}
              setLoading={setCarregando}
              setMostrarModalImportacao={setMostrarModalImportacao}
            />
          )}

          {mostrarFiltros && (
            <div className="filter-popup">
              <PopUpFiltro
                onFilter={aplicarFiltroPopUp}
                closeModal={() => setMostrarFiltros(false)}
                clientes={clientes}
                produtos={produtos}
              />
            </div>
          )}
          {Object.keys(filtros).length > 0 && (
            <div className="active-filters">
              <p>
                <b>Filtros Ativos:</b>
              </p>
              <p id="active-filters-container">
                {Object.entries(filtros).map(
                  ([key, value]) =>
                    value && (
                      <span className="active-filters-current" key={key}>
                        {`${key.replace(/_/g, " ")}: ${value}`}
                      </span>
                    )
                )}
              </p>
              <button
                onClick={limparFiltros}
                className="contratos-botao"
                id="contratos-botao-limpar-filtros"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {contratosFiltrados.length > 0 ? (
            <table id="contratos-tabela">
              <thead>
                <tr>
                  <th className="contratos-titulo-tabela">Cliente</th>
                  <th className="contratos-titulo-tabela">CPF/CNPJ</th>
                  <th className="contratos-titulo-tabela">Solução</th>
                  <th className="contratos-titulo-tabela">Valor Contrato</th>
                  <th className="contratos-titulo-tabela">Faturamento</th>
                  <th className="contratos-titulo-tabela">Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {contratosPaginados.map((contrato) => {
                  const cliente = clientes[contrato.id_cliente];
                  const produto = produtos[contrato.id_produto];
                  const vendedor = vendedores[cliente?.id_usuario];

                  return (
                    <tr
                      key={contrato.id}
                      onClick={() => detalhesContrato(contrato.id)}
                      className="clickable-row"
                    >
                      <td className="contratos-conteudo-tabela">
                        {cliente?.nome_fantasia || "-"}
                      </td>
                      <td className="contratos-conteudo-tabela">
                        {cliente?.cpf_cnpj || "-"}
                      </td>
                      <td className="contratos-conteudo-tabela">
                        {produto?.nome || "-"}
                      </td>
                      <td className="contratos-conteudo-tabela">
                        {Formatadores.formatarMoeda(
                          calculaValorImpostoMensal(
                            parseFloat(contrato.valor_mensal),
                            contrato.indice_reajuste
                          )
                        )}
                      </td>
                      <td className="contratos-conteudo-tabela contratos-tipo-faturamento">
                        {contrato?.tipo_faturamento || "-"}
                      </td>
                      <td className="contratos-conteudo-tabela">
                        {vendedor?.nome || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                      <button
                        onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                        disabled={paginaExibida === 1}
                        className="contratos-botao"
                      >
                        Anterior
                      </button>
                      <span style={{ color: '#fff' }}>
                        Página {paginaExibida} de {totalPaginas}
                      </span>
                      <button
                        onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                        disabled={paginaExibida >= totalPaginas}
                        className="contratos-botao"
                      >
                        Próxima
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="contratos-total-geral-linha">
                  <td className="contratos-total-label" colSpan={3}>
                    TOTAL:
                  </td>
                  <td className="contratos-total-valor">
                    {totalGeral.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  {/* Células vazias para Faturamento e Vendedor */}
                  <td colSpan={2}></td>
                </tr>

                {/* Mapeia e exibe os totais para cada tipo de faturamento */}
                {Object.entries(totalPorFaturamento)
                  .sort(([tipoA], [tipoB]) => tipoA.localeCompare(tipoB)) // Ordena por nome
                  .map(([tipo, total]) => (
                    <tr key={tipo} className="contratos-total-categoria-linha">
                      <td className="contratos-total-label" colSpan={3}>
                        Total {tipo}:
                      </td>
                      <td className="contratos-total-valor">
                        {total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  ))}
              </tfoot>
            </table>
          ) : (
            <p id="contratos-sem-contratos">
              Ainda não foram cadastrados contratos!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
