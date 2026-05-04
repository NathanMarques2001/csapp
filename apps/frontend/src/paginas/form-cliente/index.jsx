import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../componentes/navbar";
import Api from "../../utils/api";
import Formatadores from "../../utils/formatadores";
import imgCadastroCliente from "../../assets/images/img-cadastro-cliente.png";
import "./style.css";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";
import { useCookies } from "react-cookie";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function FormCliente({ mode }) {
  const api = new Api();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const [gruposEconomicos, setGruposEconomicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [segmentos, setSegmentos] = useState([]);

  const [cliente, setCliente] = useState({
    razao_social: "",
    nome_fantasia: "",
    cpf_cnpj: "",
    id_usuario: "",
    vp: "",
    id_segmento: "",
    id_grupo_economico: "",
    tipo_unidade: "",
    nps: "",
    gestor_contratos_nome: "",
    gestor_contratos_email: "",
    gestor_contratos_nascimento: null,
    gestor_contratos_telefone_1: "",
    gestor_contratos_telefone_2: "",
    gestor_chamados_nome: "",
    gestor_chamados_email: "",
    gestor_chamados_nascimento: null,
    gestor_chamados_telefone_1: "",
    gestor_chamados_telefone_2: "",
    gestor_financeiro_nome: "",
    gestor_financeiro_email: "",
    gestor_financeiro_nascimento: null,
    gestor_financeiro_telefone_1: "",
    gestor_financeiro_telefone_2: "",
  });

  const [cookies] = useCookies(["tipo"]);
  const [isAdminOrDev, setIsAdminOrDev] = useState(false);

  // permissões por tipo (novo requisito)
  const userTipo = cookies.tipo;

  const vendedorAllowed = new Set([
    "gestor_contratos_nome",
    "gestor_contratos_email",
    "gestor_contratos_nascimento",
    "gestor_contratos_telefone_1",
    "gestor_contratos_telefone_2",
    "gestor_financeiro_nome",
    "gestor_financeiro_email",
    "gestor_financeiro_nascimento",
    "gestor_financeiro_telefone_1",
    "gestor_financeiro_telefone_2",
    "gestor_chamados_nome",
    "gestor_chamados_email",
    "gestor_chamados_nascimento",
    "gestor_chamados_telefone_1",
    "gestor_chamados_telefone_2",
  ]);

  const canEdit = (fieldName) => {
    if (!userTipo) return false;
    if (userTipo === "dev" || userTipo === "admin") return true;
    if (userTipo === "usuario") return vendedorAllowed.has(fieldName);
    return false;
  };

  const canSubmit = userTipo === "dev" || userTipo === "admin" || userTipo === "usuario";

  useEffect(() => {
    // Verifica o tipo de usuário e atualiza o estado
    if (cookies.tipo === "dev" || cookies.tipo === "admin") {
      setIsAdminOrDev(true);
    } else {
      setIsAdminOrDev(false);
    }
  }, [cookies.tipo]);

  useEffect(() => {
    if (mode === "edicao" && id) {
      const fetchCliente = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/clientes/${id}`);

          /*
          const formatDate = (dateString) => {
            if (
              !dateString ||
              dateString === "" ||
              dateString === "Invalid date"
            )
              return null;
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return null; // Verifica se é uma data válida
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };
          */

          const clienteData = response.cliente;
          clienteData.gestor_contratos_nascimento = Formatadores.formatarDataISO(
            clienteData.gestor_contratos_nascimento
          );
          clienteData.gestor_chamados_nascimento = Formatadores.formatarDataISO(
            clienteData.gestor_chamados_nascimento
          );
          clienteData.gestor_financeiro_nascimento = Formatadores.formatarDataISO(
            clienteData.gestor_financeiro_nascimento
          );

          setCliente(clienteData);
        } catch (error) {
          console.error("Error fetching client data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCliente();
    }
  }, [mode, id]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get("/usuarios");
        setUsuarios(response.usuarios);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchSegmentos = async () => {
      try {
        const response = await api.get("/segmentos");
        const segmentosAtivos = response.segmentos.filter(
          (segmento) => segmento.status !== "inativo"
        );
        setSegmentos(segmentosAtivos);
      } catch (error) {
        console.error("Erro ao buscar os segmentos: " + error);
      }
    };

    fetchUsuarios();
    fetchSegmentos();
  }, []);

  useEffect(() => {
    const fetchGruposEconomicos = async () => {
      try {
        const response = await api.get("/grupos-economicos");
        const gruposEconomicosAtivos = response.grupoEconomico.filter(
          (grupoEconomico) => grupoEconomico.status !== "inativo"
        );
        setGruposEconomicos(gruposEconomicosAtivos);
      } catch (error) {
        console.error("Erro ao buscar os segmentos: " + error);
      }
    };

    fetchGruposEconomicos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente((prevCliente) => ({
      ...prevCliente,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPopupAction(() => confirmSubmit);
    setShowPopup(true);
  };

  const confirmSubmit = async () => {
    setShowPopup(false);
    try {
      setLoading(true);

      const clienteEnviar = {
        ...cliente,
        id_grupo_economico:
          cliente.id_grupo_economico === "" ||
            cliente.id_grupo_economico === null
            ? null
            : Number(cliente.id_grupo_economico),
        vp: cliente.vp === "" || cliente.vp === null ? null : Number(cliente.vp),
        tipo_unidade: cliente.tipo_unidade === "" ? null : cliente.tipo_unidade,
      };

      if (mode === "cadastro") {
        await api.post("/clientes", clienteEnviar);
        navigate("/clientes");
      } else if (mode === "edicao" && id) {
        await api.put(`/clientes/${id}`, clienteEnviar);
        navigate(`/clientes/${cliente.id}`);
      }
    } catch (error) {
      console.error("Error submitting client data:", error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelPopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      {loading && <Carregando />}
      {showPopup && (
        <Popup
          title={
            mode == "cadastro" ? "Adicionar Novo Cliente" : "Editar Cliente"
          }
          message={
            mode == "cadastro"
              ? "Você está prestes a adicionar um novo Cliente. Deseja continuar?"
              : "Você está prestes a salvar as alterações feitas neste Cliente. Deseja continuar?"
          }
          onConfirm={popupAction}
          onCancel={cancelPopup}
        />
      )}
      <div className="global-display">
        <Navbar />
        <div className="global-container">
          <h2>
            {mode === "cadastro" ? "Cadastro de Cliente" : "Edição de Cliente"}
          </h2>
          <p id="cadastro-solucao-descricao">
            Campos com "*" são obrigatórios.
          </p>
          <div id="cadastro-solucao-form-container">
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-cliente-container">
                <div id="form-cliente-container-1">
                  <div className="form-group">
                    <label htmlFor="razao_social">
                      Razão Social <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="razao_social"
                      name="razao_social"
                      required
                      disabled={!canEdit("razao_social")}
                      placeholder="Digite a razão social"
                      value={cliente.razao_social}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nome_fantasia">
                      Nome Fantasia <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="nome_fantasia"
                      name="nome_fantasia"
                      required
                      disabled={!canEdit("nome_fantasia")}
                      placeholder="Digite o nome fantasia"
                      value={cliente.nome_fantasia}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cpf_cnpj">
                      CPF/CNPJ <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="cpf_cnpj"
                      name="cpf_cnpj"
                      required
                      disabled={!canEdit("cpf_cnpj")}
                      placeholder="Digite o CPF ou CNPJ"
                      value={cliente.cpf_cnpj}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="id_usuario">
                      Relacionamento <span className="required">*</span>
                    </label>
                    <select
                      required
                      id="id_usuario"
                      disabled={!canEdit("id_usuario")}
                      name="id_usuario"
                      value={cliente.id_usuario}
                      onChange={handleChange}
                    >
                      <option value="">Selecione...</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="vp">VP</label>
                    <select
                      id="vp"
                      disabled={!canEdit("id_usuario")}
                      name="vp"
                      value={cliente.vp || ""}
                      onChange={handleChange}
                    >
                      <option value="">Selecione...</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="id_segmento">
                      Segmento <span className="required">*</span>
                    </label>
                    <select
                      required
                      id="id_segmento"
                      disabled={!canEdit("id_segmento")}
                      name="id_segmento"
                      value={cliente.id_segmento}
                      onChange={handleChange}
                    >
                      <option value="">Selecione...</option>
                      {segmentos.map((segmento) => (
                        <option key={segmento.id} value={segmento.id}>
                          {segmento.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="id_grupo_economico">Grupo Econômico</label>
                    <select
                      id="id_grupo_economico"
                      disabled={!canEdit("id_grupo_economico")}
                      name="id_grupo_economico"
                      value={cliente.id_grupo_economico}
                      onChange={handleChange}
                    >
                      <option value="">Selecione...</option>
                      {gruposEconomicos.map((grupoEconomico) => (
                        <option
                          key={grupoEconomico.id}
                          value={grupoEconomico.id}
                        >
                          {grupoEconomico.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="tipo_unidade">Tipo da Unidade</label>
                    <select
                      id="tipo_unidade"
                      disabled={!canEdit("tipo_unidade")}
                      name="tipo_unidade"
                      value={cliente.tipo_unidade}
                      onChange={handleChange}
                    >
                      <option value="">Selecione...</option>
                      {["pai", "filha"].map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="nps">NPS</label>
                    <input
                      type="text"
                      id="nps"
                      name="nps"
                      disabled={!canEdit("nps")}
                      placeholder="Digite o NPS do cliente"
                      value={cliente.nps}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div id="cadastro-cliente-img-div">
                  <img
                    id="cadastro-cliente-img"
                    src={imgCadastroCliente}
                    alt=""
                  />
                </div>
              </div>
              <div className="form-cliente-container form-cliente-container-border">
                <div id="form-cliente-container-2">
                  <h2>Gestor de Contrato</h2>
                  <div className="form-group">
                    <label htmlFor="gestor_contratos_nome">
                      Nome <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="gestor_contratos_nome"
                      name="gestor_contratos_nome"
                      required
                      disabled={!canEdit("gestor_contratos_nome")}
                      placeholder="Digite o nome completo"
                      value={cliente.gestor_contratos_nome}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gestor_contratos_email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="gestor_contratos_email"
                      name="gestor_contratos_email"
                      required
                      disabled={!canEdit("gestor_contratos_email")}
                      placeholder="Digite seu endereço de email"
                      value={cliente.gestor_contratos_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="date-container">
                    <div className="form-group form-group-3">
                      <label htmlFor="gestor_contratos_nascimento">
                        Aniversário
                      </label>
                      <input
                        type="date"
                        id="gestor_contratos_nascimento"
                        name="gestor_contratos_nascimento"
                        disabled={!canEdit("gestor_contratos_nascimento")}
                        value={cliente.gestor_contratos_nascimento}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group form-group-3">
                      <label htmlFor="gestor_contratos_telefone_1">
                        Telefone 1 <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="gestor_contratos_telefone_1"
                        name="gestor_contratos_telefone_1"
                        placeholder="Primeiro contato"
                        disabled={!canEdit("gestor_contratos_telefone_1")}
                        value={cliente.gestor_contratos_telefone_1}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group form-group-3">
                      <label htmlFor="gestor_contratos_telefone_2">
                        Telefone 2
                      </label>
                      <input
                        type="text"
                        id="gestor_contratos_telefone_2"
                        name="gestor_contratos_telefone_2"
                        placeholder="Segundo contato"
                        disabled={!canEdit("gestor_contratos_telefone_2")}
                        value={cliente.gestor_contratos_telefone_2}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div id="form-cliente-container-2">
                  <h2>Gestor de Chamados</h2>
                  <div className="form-group">
                    <label htmlFor="gestor_chamados_nome">Nome</label>
                    <input
                      type="text"
                      id="gestor_chamados_nome"
                      name="gestor_chamados_nome"
                      placeholder="Digite o nome completo"
                      disabled={!canEdit("gestor_chamados_nome")}
                      value={cliente.gestor_chamados_nome}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gestor_chamados_email">Email</label>
                    <input
                      type="email"
                      id="gestor_chamados_email"
                      name="gestor_chamados_email"
                      placeholder="Digite seu endereço de email"
                      disabled={!canEdit("gestor_chamados_email")}
                      value={cliente.gestor_chamados_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="date-container">
                    <div className="form-group form-group-3">
                      <label htmlFor="gestor_chamados_nascimento">
                        Aniversário
                      </label>
                      <input
                        type="date"
                        id="gestor_chamados_nascimento"
                        name="gestor_chamados_nascimento"
                        disabled={!canEdit("gestor_chamados_nascimento")}
                        value={cliente.gestor_chamados_nascimento}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group form-group-3">
                      <label htmlFor="gestor_chamados_telefone_1">
                        Telefone 1
                      </label>
                      <input
                        type="text"
                        id="gestor_chamados_telefone_1"
                        name="gestor_chamados_telefone_1"
                        placeholder="Primeiro contato"
                        disabled={!canEdit("gestor_chamados_telefone_1")}
                        value={cliente.gestor_chamados_telefone_1}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group form-group-3">
                      <label htmlFor="gestor_chamados_telefone_2">
                        Telefone 2
                      </label>
                      <input
                        type="text"
                        id="gestor_chamados_telefone_2"
                        name="gestor_chamados_telefone_2"
                        placeholder="Segundo contato"
                        disabled={!canEdit("gestor_chamados_telefone_2")}
                        value={cliente.gestor_chamados_telefone_2}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-cliente-container">
                <div id="form-cliente-container-2">
                  <h2>Gestor Financeiro</h2>
                  <div className="form-group">
                    <label htmlFor="gestor_financeiro_nome">Nome</label>
                    <input
                      type="text"
                      id="gestor_financeiro_nome"
                      name="gestor_financeiro_nome"
                      placeholder="Digite o nome completo"
                      disabled={!canEdit("gestor_financeiro_nome")}
                      value={cliente.gestor_financeiro_nome}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gestor_financeiro_email">Email</label>
                    <input
                      type="email"
                      id="gestor_financeiro_email"
                      name="gestor_financeiro_email"
                      placeholder="Digite seu endereço de email"
                      disabled={!canEdit("gestor_financeiro_email")}
                      value={cliente.gestor_financeiro_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="date-container">
                    <div className="form-group form-group-3">
                      <label htmlFor="gestor_financeiro_nascimento">
                        Aniversário
                      </label>
                      <input
                        type="date"
                        id="gestor_financeiro_nascimento"
                        name="gestor_financeiro_nascimento"
                        disabled={!canEdit("gestor_financeiro_nascimento")}
                        value={cliente.gestor_financeiro_nascimento}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group form-group-3">
                      <label htmlFor="gestor_financeiro_telefone_1">
                        Telefone 1
                      </label>
                      <input
                        type="text"
                        id="gestor_financeiro_telefone_1"
                        name="gestor_financeiro_telefone_1"
                        placeholder="Primeiro contato"
                        disabled={!canEdit("gestor_financeiro_telefone_1")}
                        value={cliente.gestor_financeiro_telefone_1}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group form-group-3">
                      <label htmlFor="gestor_financeiro_telefone_2">
                        Telefone 2
                      </label>
                      <input
                        type="text"
                        id="gestor_financeiro_telefone_2"
                        name="gestor_financeiro_telefone_2"
                        placeholder="Segundo contato"
                        disabled={!canEdit("gestor_financeiro_telefone_2")}
                        value={cliente.gestor_financeiro_telefone_2}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  className="form-cliente-btn-cancelar"
                  onClick={() => navigate("/clientes")}
                >
                  {!isAdminOrDev ? "Voltar" : "Cancelar"}
                </button>
                {!canSubmit ? (
                  <></>
                ) : (
                  <button
                    type="submit"
                    className="global-btn-verde form-cliente-btn-enviar"
                  >
                    {mode === "cadastro"
                      ? "Adicionar cliente"
                      : "Salvar alterações"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
