import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../componentes/navbar";
import CardGestor from "../../componentes/card-gestor";
import CardContato from "../../componentes/card-contato";
import Carregando from "../../componentes/carregando";
import "./style.css";
import Api from "../../utils/api";
import botaoEditar from "../../assets/icons/icon-lapis.png";
import botaoInativar from "../../assets/icons/icon-inativar.png";
import botaoAtivar from "../../assets/icons/icon-ativar.png";
import imgCliente from "../../assets/images/img-cliente.png";
import PopupInformacoes from "../../componentes/pop-up-informacoes-adicionais";
import { useCookies } from "react-cookie";
import Popup from "../../componentes/pop-up";

export default function Cliente() {
  const api = new Api();
  const [showPopup, setShowPopup] = useState(false);
  const [cliente, setCliente] = useState({});
  const [contratos, setContratos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [cardID, setCardID] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const [contatoComercial, setContatoComercial] = useState([]);
  const [contatoTecnico, setContatoTecnico] = useState([]);
  const [fatosImportantes, setFatosImportantes] = useState([]);
  const [contatoAdicionado, setContatoAdicionado] = useState(0);
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

        const clienteData = await api.get(`/clientes/${id}`);
        setCliente(clienteData.cliente);

        const contratosData = await api.get(`/contratos/cliente/${id}`);
        setContratos(contratosData.contratos);

        const produtosData = await api.get("/produtos");
        setProdutos(produtosData.produtos);

        const fabricantesData = await api.get("/fabricantes");
        setFabricantes(fabricantesData.fabricantes);

        const contatosComerciaisData = await api.get(
          `/contatos-comerciais/${id}`
        );
        setContatoComercial(contatosComerciaisData.contatos_comerciais);

        const contatosTecnicosData = await api.get(`/contatos-tecnicos/${id}`);
        setContatoTecnico(contatosTecnicosData.contatos_tecnicos);

        const fatosImportantesData = await api.get(`/fatos-importantes/${id}`);
        setFatosImportantes(fatosImportantesData.fatos_importantes);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contatoAdicionado]);

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

  const editar = (id) => {
    navigate(`/edicao-cliente/${id}`);
  };

  const editarContato = (id) => {
    navigate(`/edicao-contrato/${id}`);
  };

  const ativarOuInativar = async (id) => {
    setLoading(true);
    try {
      await api.put(`/clientes/active-inactive/${id}`);
      setShowModal(false);
      navigate("/clientes");
    } catch (err) {
      console.error("Erro ao inativar cliente:", err);
    } finally {
      setLoading(false);
    }
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

  const abrirPopUp = async (e, titulo, conteudo = "", cardID = "") => {
    e.preventDefault();
    setTitulo(titulo);
    setConteudo(conteudo);
    setCardID(cardID);
    setShowPopup(true);
  };

  const confirmSubmit = async () => {
    setShowPopup(false);
    renderizar();
  };

  const cancelPopup = () => {
    setShowPopup(false);
    setShowModal(false);
  };

  const renderizar = () => {
    setContatoAdicionado(contatoAdicionado + 1);
  };

  return (
    <>
      {loading && <Carregando />}
      {showPopup && (
        <PopupInformacoes
          title={titulo}
          conteudo={conteudo}
          cardID={cardID}
          onConfirm={confirmSubmit}
          onCancel={cancelPopup}
        />
      )}
      {showModal && (
        <Popup
          message={message}
          onConfirm={popUpAction}
          onCancel={cancelPopup}
        />
      )}
      <div id="cliente-display">
        <Navbar />
        <div id="cliente-container">
          <div id="cliente-cabecalho">
            <div>
              <h1 id="cliente-titulo-nome">
                Cliente - {cliente.nome_fantasia}
              </h1>
              <p id="cliente-titulo-razao">
                {cliente.razao_social} - {cliente.cpf_cnpj}
              </p>
            </div>
            <div id="cliente-btn-div">
              <button
                onClick={() => editar(cliente.id)}
                id="cliente-botao-editar"
              >
                <img src={botaoEditar} alt="ícone editar" />
              </button>
              <button
                disabled={!isAdminOrDev}
                onClick={() => {
                  cliente.status === "ativo"
                    ? setMessage(
                      "Tem certeza que deseja inativar esse cliente? Todos os contratos serão inativados também."
                    )
                    : setMessage("Tem certeza que deseja ativar esse cliente?");
                  setPopUpAction(() => () => ativarOuInativar(cliente.id));
                  setShowModal(true);
                }}
                id={
                  cliente.status === "ativo"
                    ? "cliente-botao-inativar"
                    : "cliente-botao-ativar"
                }
                className={!isAdminOrDev ? "disabled" : ""}
              >
                {cliente.status === "ativo" ? (
                  <img src={botaoInativar} alt="icone inativar" />
                ) : (
                  <img src={botaoAtivar} alt="icone ativar" />
                )}
              </button>
            </div>
          </div>
          <h2 id="cliente-subtitulo-contratos">Contratos</h2>
          <table id="cliente-tabela">
            <thead>
              <tr>
                <th>Status</th>
                <th>Solução</th>
                <th>Contratação</th>
                <th>Valor</th>
                <th>Recorrência</th>
                <th>Faturamento</th>
                <th>Fabricante</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((contrato) => (
                <tr
                  key={contrato.id - 1}
                  className={`clickable-row ${contrato.status !== "ativo" ? "inactive-contract" : ""}`}
                  onClick={() => editarContato(contrato.id)}
                >
                  <td>{contrato.status}</td>
                  <td>{getProdutoNome(contrato.id_produto)}</td>
                  <td>{new Date(contrato.data_inicio).toLocaleDateString()}</td>
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
                    {contrato.duracao == 12000
                      ? "INDETERMINADO"
                      : `${contrato.duracao} MESES`}
                  </td>
                  <td className="cliente-tipo-faturamento">
                    {contrato.tipo_faturamento}
                  </td>
                  <td>{getFabricanteNome(contrato.id_produto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div id="cliente-faturamento-mensal">
            <div>
              Faturamento mensal: <b>{calculaFaturamentoPorTipo("mensal")}</b>
            </div>
            <div>
              Faturamento anual: <b>{calculaFaturamentoPorTipo("anual")}</b>
            </div>
          </div>

          <div id="cliente-card-container">
            <CardGestor
              titulo={"Gestor de Contratos"}
              nome={cliente.gestor_contratos_nome}
              email={cliente.gestor_contratos_email}
              telefone1={cliente.gestor_contratos_telefone_1}
              telefone2={cliente.gestor_contratos_telefone_2}
            />
            <CardGestor
              titulo={"Gestor de Chamados"}
              nome={cliente.gestor_chamados_nome}
              email={cliente.gestor_chamados_email}
              telefone1={cliente.gestor_chamados_telefone_1}
              telefone2={cliente.gestor_chamados_telefone_2}
            />
            <CardGestor
              titulo={"Gestor Financeiro"}
              nome={cliente.gestor_financeiro_nome}
              email={cliente.gestor_financeiro_email}
              telefone1={cliente.gestor_financeiro_telefone_1}
              telefone2={cliente.gestor_financeiro_telefone_2}
            />
          </div>
          <div className="cliente-contatos-container">
            <CardContato
              titulo={"Contato Comercial"}
              contatos={contatoComercial}
              abrirPopUp={abrirPopUp}
              permissao={!isAdminOrDev}
              renderizar={renderizar}
            />
            <CardContato
              titulo={"Contato Técnico"}
              contatos={contatoTecnico}
              abrirPopUp={abrirPopUp}
              permissao={!isAdminOrDev}
              renderizar={renderizar}
            />
          </div>
          <div
            className="cliente-contatos-container"
            id="cliente-contatos-container-img"
          >
            <CardContato
              titulo={"Fatos Importantes"}
              contatos={fatosImportantes}
              abrirPopUp={abrirPopUp}
              permissao={!isAdminOrDev}
              renderizar={renderizar}
            />
            <img src={imgCliente} alt="" id="cliente-img" />
          </div>
        </div>
      </div>
    </>
  );
}
