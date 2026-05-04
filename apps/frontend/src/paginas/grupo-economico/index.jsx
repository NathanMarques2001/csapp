import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../componentes/navbar";
import Carregando from "../../componentes/carregando";
import botaoInativar from "../../assets/icons/icon-inativar.png";
import botaoAtivar from "../../assets/icons/icon-ativar.png";
import "./style.css";
import Api from "../../utils/api";
import imgGrupoEconomico from "../../assets/images/img-grupo-economico.png";
import { useCookies } from "react-cookie";
import Popup from "../../componentes/pop-up";

export default function GrupoEconomico() {
  const api = new Api();
  const navigate = useNavigate();
  const { id } = useParams();
  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [grupoEconomico, setGrupoEconomico] = useState({});
  const [loading, setLoading] = useState(false);
  const [popUpAction, setPopUpAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const [cookies] = useCookies(["tipo"]);
  const [isAdminOrDev, setIsAdminOrDev] = useState(false);

  useEffect(() => {
    if (cookies.tipo === "dev" || cookies.tipo === "admin") {
      setIsAdminOrDev(true);
    } else {
      setIsAdminOrDev(false);
    }
  }, [cookies.tipo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const grupoEconomicoData = await api.get(`/grupos-economicos/${id}`);
        setGrupoEconomico(grupoEconomicoData.grupoEconomico);

        const clienteData = await api.get(
          `/clientes/grupo-economico/${grupoEconomicoData.grupoEconomico.id}`
        );
        setClientes(clienteData.clientes);

        // Busca contratos de todos os clientes em paralelo
        const contratosPorCliente = await Promise.all(
          clienteData.clientes.map(async (cliente) => {
            const contratosData = await api.get(
              `/contratos/cliente/${cliente.id}`
            );
            return contratosData.contratos;
          })
        );

        const todosContratos = contratosPorCliente.flat();
        setContratos(todosContratos);

        console.log(contratosPorCliente);

        const produtosData = await api.get("/produtos");
        setProdutos(produtosData.produtos);

        const fabricantesData = await api.get("/fabricantes");
        setFabricantes(fabricantesData.fabricantes);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (clientes.length === 0) return;

    const qtdMatrizes = clientes.filter(
      (cliente) => cliente.tipo_unidade === "pai"
    ).length;

    if (qtdMatrizes === 0) {
      alert(
        "Erro: Este grupo econômico não possui nenhuma unidade pai. Algumas funcionalidades podem não funcionar corretamente por conta disso!"
      );
    } else if (qtdMatrizes > 1) {
      alert(
        "Erro: Este grupo econômico possui mais de uma unidade pai. Algumas funcionalidades podem não funcionar corretamente por conta disso!"
      );
    }
  }, [clientes]);

  const getProdutoNome = (produtoId) => {
    const produto = produtos.find((p) => p.id === produtoId);
    return produto ? produto.nome : "Desconhecido";
  };

  const getFabricanteNome = (produtoId) => {
    const produto = produtos.find((p) => p.id === produtoId);
    if (produto) {
      const fabricante = fabricantes.find(
        (f) => f.id === produto.id_fabricante
      );
      return fabricante ? fabricante.nome : "Desconhecido";
    }
    return "Desconhecido";
  };

  const editarContato = (id) => {
    navigate(`/edicao-contrato/${id}`);
  };

  const calculaValorImpostoMensal = (valor, indice) => valor;

  const calculaFaturamentoPorTipo = (tipo) => {
    const contratosFiltrados = contratos.filter(
      (contrato) =>
        contrato.status === "ativo" &&
        contrato.tipo_faturamento?.toLowerCase() === tipo
    );

    const total = contratosFiltrados.reduce((soma, contrato) => {
      const valor = parseFloat(contrato.valor_mensal || 0);
      return (
        soma + calculaValorImpostoMensal(valor, contrato.indice_reajuste || 0)
      );
    }, 0);

    return total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const ativarOuInativar = async (id) => {
    setLoading(true);
    try {
      await api.put(`/grupos-economicos/active-inactive/${id}`);
      setShowModal(false);
      navigate("/clientes");
    } catch (err) {
      console.error("Erro ao inativar grupo econômico:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelPopup = () => {
    setShowModal(false);
  };

  return (
    <>
      {loading && <Carregando />}
      {showModal && (
        <Popup
          message={message}
          onConfirm={popUpAction}
          onCancel={cancelPopup}
        />
      )}
      <div id="grupo-economico-display">
        <Navbar />

        <div id="grupo-economico-container">
          {/* Cabeçalho do grupo */}
          <header id="grupo-economico-cabecalho">
            <h1 id="grupo-economico-titulo-nome">
              Grupo Econômico – {grupoEconomico.nome}
            </h1>
            <button
              disabled={!isAdminOrDev}
              onClick={() => {
                grupoEconomico.status === "ativo"
                  ? setMessage(
                    "Tem certeza que deseja inativar esse grupo econômico? Todos os clientes e contratos serão inativados também."
                  )
                  : setMessage(
                    "Tem certeza que deseja ativar esse grupo econômico?"
                  );
                setPopUpAction(() => () => ativarOuInativar(grupoEconomico.id));
                setShowModal(true);
              }}
              id={
                grupoEconomico.status === "ativo"
                  ? "cliente-botao-inativar"
                  : "cliente-botao-ativar"
              }
              className={!isAdminOrDev ? "disabled" : ""}
            >
              {grupoEconomico.status === "ativo" ? (
                <img src={botaoInativar} alt="icone inativar" />
              ) : (
                <img src={botaoAtivar} alt="icone ativar" />
              )}
            </button>
          </header>

          <h2 id="grupo-economico-subtitulo-contratos">Contratos</h2>

          {/* === UMA TABELA POR CLIENTE === */}
          {clientes.map((cliente) => {
            const contratosCliente = contratos.filter(
              (ctr) => ctr.id_cliente === cliente.id
            );

            const contratosAtivos = contratosCliente.filter(
              (ctr) => ctr.status === "ativo"
            );

            const valorTotalMensalCliente = contratosAtivos
              .filter((ctr) => ctr.tipo_faturamento?.toLowerCase() === "mensal")
              .reduce(
                (total, ctr) =>
                  total +
                  calculaValorImpostoMensal(
                    parseFloat(ctr.valor_mensal),
                    ctr.indice_reajuste || 0
                  ),
                0
              );

            const valorTotalAnualCliente = contratosAtivos
              .filter((ctr) => ctr.tipo_faturamento?.toLowerCase() === "anual")
              .reduce(
                (total, ctr) =>
                  total +
                  calculaValorImpostoMensal(
                    parseFloat(ctr.valor_mensal),
                    ctr.indice_reajuste || 0
                  ),
                0
              );

            return (
              <section key={cliente.id} className="cliente-bloco">
                {/* Cabeçalho do cliente */}
                <div className="cliente-info">
                  <strong>
                    {cliente.tipo_unidade.toUpperCase()} –{" "}
                    {cliente.nome_fantasia}
                  </strong>{" "}
                  {/* POR ALGUM MOTIVO O CPF/CNPJ SOME QUANDO TIRA ESSE ESPAÇO. ENTAO NAO MEXA */}
                  {cliente.cpf_cnpj}
                  <div>
                    <span>
                      Faturamento mensal:{" "}
                      <b>
                        {valorTotalMensalCliente.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </b>
                    </span>
                    <br />
                    <span>
                      Faturamento anual:{" "}
                      <b>
                        {valorTotalAnualCliente.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </b>
                    </span>
                  </div>
                </div>

                {/* Tabela de contratos desse cliente */}
                <table className="tabela-contratos">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Solução</th>
                      <th>Contratação</th>
                      <th>Valor</th>
                      <th>Recorrência</th>
                      <th>Fabricante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contratosCliente.map((contrato) => (
                      <tr
                        key={contrato.id}
                        id="grupo-economico-detalhe-contrato"
                        className={
                          contrato.status !== "ativo" ? "inactive-contract" : ""
                        }
                        onClick={() => editarContato(contrato.id)}
                      >
                        <td>{contrato.status}</td>
                        <td>{getProdutoNome(contrato.id_produto)}</td>
                        <td>
                          {new Date(contrato.data_inicio).toLocaleDateString()}
                        </td>
                        <td>
                          {calculaValorImpostoMensal(
                            parseFloat(contrato.valor_mensal),
                            contrato.indice_reajuste
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td>
                          {contrato.duracao === 12000
                            ? "INDETERMINADO"
                            : `${contrato.duracao} MESES`}
                        </td>
                        <td>{getFabricanteNome(contrato.id_produto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}

          {/* Imagem decorativa e Total geral do grupo */}
          <div
            className="grupo-economico-contatos-container"
            id="grupo-economico-contatos-container-img"
          >
            <img src={imgGrupoEconomico} alt="" id="grupo-economico-img" />
            <div id="grupo-economico-faturamento-mensal">
              <div>
                Faturamento mensal total do grupo:{" "}
                <b>{calculaFaturamentoPorTipo("mensal")}</b>
              </div>
              <div>
                Faturamento anual total do grupo:{" "}
                <b>{calculaFaturamentoPorTipo("anual")}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
