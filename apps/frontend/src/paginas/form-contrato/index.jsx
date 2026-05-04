import "./style.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Api from "../../utils/api";
import Navbar from "../../componentes/navbar";
import imgCadastroContrato from "../../assets/images/img-cadastro-contrato.png";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";
import Formatadores from "../../utils/formatadores";
import { useCookies } from "react-cookie";
import { format, parseISO } from "date-fns";

// Função para formatar a data para o input
const formatDateForInput = (dateString) => {
  if (!dateString || dateString === "") return null;
  const date = parseISO(dateString);
  // Ajusta a data para o fuso horário local
  const adjustedDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60000
  );
  return format(adjustedDate, "yyyy-MM-dd");
};

export default function FormContrato({ mode = "cadastro" }) {
  const api = new Api();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const [faturados, setFaturados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [logs, setLogs] = useState([]);
  const [clienteInput, setClienteInput] = useState("");
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [selectedClienteCpfCnpj, setSelectedClienteCpfCnpj] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [status, setStatus] = useState("");

  // Campos do formulário
  const [faturadoPor, setFaturadoPor] = useState("");
  const [solucao, setSolucao] = useState("");
  const [duracao, setDuracao] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [reajuste, setReajuste] = useState("");
  const [proximoReajuste, setProximoReajuste] = useState(null);
  const [valorMensal, setValorMensal] = useState("");
  const [valorAnterior, setValorAnterior] = useState("");
  const [quantidade, setQuantidade] = useState(null);
  const [dataInicio, setDataInicio] = useState(null);
  const [email, setEmail] = useState("");
  const [descricao, setDescricao] = useState("");
  const [linkContrato, setLinkContrato] = useState("");
  const [tipoFaturamento, setTipoFaturamento] = useState("");
  const [isQuantidadeDisabled, setIsQuantidadeDisabled] = useState(true);
  const [renovacaoAutomatica, setRenovacaoAutomatica] = useState(false);
  const tiposFaturamento = ["mensal", "anual"];

  const [cookies] = useCookies(["tipo", "id"]);
  const [isAdminOrDev, setIsAdminOrDev] = useState(false);

  useEffect(() => {
    // Verifica o tipo de usuário e atualiza o estado
    if (cookies.tipo === "dev" || cookies.tipo === "admin") {
      setIsAdminOrDev(true);
    } else {
      setIsAdminOrDev(false);
    }
  }, [cookies.tipo]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get("/clientes");
        setClientes(response.clientes);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
      }
    };

    const fetchProdutos = async () => {
      try {
        const response = await api.get("/produtos");
        const produtosAtivos = response.produtos.filter(
          (produto) => produto.status !== "inativo"
        );
        setProdutos(produtosAtivos);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      }
    };

    const fetchFaturados = async () => {
      try {
        const response = await api.get("/faturados");
        const faturadosAtivos = response.faturados.filter(
          (faturado) => faturado.status !== "inativo"
        );
        setFaturados(faturadosAtivos);
      } catch (err) {
        console.error("Erro ao buscar faturado:", err);
      }
    };

    const fetchUsuarios = async () => {
      try {
        const response = await api.get("/usuarios");
        const usuariosMap = response.usuarios.reduce((map, u) => {
          map[u.id] = u.nome;
          return map;
        }, {});
        setUsuarios(usuariosMap);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    };

    fetchClientes();
    fetchProdutos();
    fetchFaturados();
    fetchUsuarios();
  }, [mode, id]);

  // Busca logs do contrato quando estamos em modo edição
  useEffect(() => {
    const fetchLogs = async () => {
      if (mode === "edicao" && id) {
        try {
          const response = await api.get(`/logs/${id}`);
          const logsData = response.logs || [];
          setLogs(logsData);
        } catch (err) {
          // Se a rota retornar 404 (nenhum log), apenas seta array vazio
          console.error("Erro ao buscar logs:", err);
          setLogs([]);
        }
      }
    };

    fetchLogs();
  }, [mode, id]);

  // CÓDIGO CORRIGIDO E AJUSTADO
  useEffect(() => {
    const removeAcentos = (str) => {
      if (!str) return "";
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // Se não há solução selecionada, desabilitamos e zeramos a quantidade.
    if (!solucao || produtos.length === 0) {
      setIsQuantidadeDisabled(true);
      // Só alteramos para null se o valor atual não for null, para evitar loops
      if (quantidade !== null) {
        setQuantidade(null);
      }
      return;
    }

    const produtoAtual = produtos.find((item) => item.id === Number(solucao));

    if (produtoAtual) {
      const nomeProdutoAtual = removeAcentos(
        produtoAtual.nome.trim().toLowerCase()
      );

      if (
        nomeProdutoAtual.includes("backup") ||
        nomeProdutoAtual.includes("antivirus")
      ) {
        setIsQuantidadeDisabled(false);
      } else {
        setIsQuantidadeDisabled(true);
        // Só alteramos para null se o valor atual não for null, para evitar loops
        if (quantidade !== null) {
          setQuantidade(null);
        }
      }
    } else {
      setIsQuantidadeDisabled(true);
      // Só alteramos para null se o valor atual não for null, para evitar loops
      if (quantidade !== null) {
        setQuantidade(null);
      }
    }
    // ADICIONAMOS 'quantidade' À LISTA DE DEPENDÊNCIAS
  }, [solucao, produtos, quantidade]);

  useEffect(() => {
    const fetchContrato = async () => {
      if (mode === "edicao" && id) {
        try {
          setLoading(true);
          const response = await api.get(`/contratos/${id}`);
          const contrato = response.contrato;
          const clienteResponse = await api.get(
            `/clientes/${contrato.id_cliente}`
          );
          const selectedCliente = clienteResponse.cliente;
          const faturado = await api.get(`/faturados/${contrato.id_faturado}`);
          const selectedFaturado = faturado.faturado;

          setSelectedClienteId(contrato.id_cliente);
          setClienteInput(
            selectedCliente
              ? `${selectedCliente.razao_social} - ${selectedCliente.nome_fantasia}`
              : ""
          );
          setSelectedClienteCpfCnpj(
            selectedCliente ? selectedCliente.cpf_cnpj : ""
          );
          setFaturadoPor(selectedFaturado ? selectedFaturado.id : "");

          setSolucao(contrato.id_produto);
          setVencimento(contrato.dia_vencimento);
          setReajuste(contrato.nome_indice);
          setProximoReajuste(formatDateForInput(contrato.proximo_reajuste));
          setDuracao(contrato.duracao);
          setValorMensal(contrato.valor_mensal);
          setValorAnterior(contrato.valor_antigo);
          setQuantidade(contrato.quantidade);
          setDataInicio(formatDateForInput(contrato.data_inicio));
          setEmail(contrato.email_envio);
          setDescricao(contrato.descricao);
          setLinkContrato(contrato.link_contrato || "");
          setStatus(contrato.status);
          setTipoFaturamento(contrato.tipo_faturamento);
          setRenovacaoAutomatica(contrato.renovacao_automatica || false);
          console.log(contrato);
        } catch (err) {
          console.error("Erro ao buscar contrato:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchContrato();
  }, [mode, id]);

  const handleClienteInputChange = (e) => {
    const input = e.target.value;
    setClienteInput(input);
    setSelectedClienteId(null);
    if (input === "") {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(
        (cliente) =>
          (cliente.razao_social &&
            cliente.razao_social.toLowerCase().includes(input.toLowerCase())) ||
          (cliente.nome_fantasia &&
            cliente.nome_fantasia
              .toLowerCase()
              .includes(input.toLowerCase())) ||
          cliente.cpf_cnpj.includes(input)
      );
      setFilteredClientes(filtered);
    }
  };

  const handleClienteInputFocus = () => {
    setFilteredClientes(clientes);
    setShowDropdown(true);
  };

  const handleClienteInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 100);
  };

  const handleClienteItemClick = (cliente) => {
    setClienteInput(`${cliente.razao_social} - ${cliente.nome_fantasia}`);
    setSelectedClienteId(cliente.id);
    setSelectedClienteCpfCnpj(cliente.cpf_cnpj);
    setShowDropdown(false);
  };

  const handleReajusteChange = async (e) => {
    const indice = e.target.value;
    setReajuste(indice);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClienteId) {
      alert("Por favor, selecione um cliente.");
      return;
    }

    setPopupAction(() => confirmSubmit);
    setShowPopup(true);
  };

  const confirmSubmit = async () => {
    setShowPopup(false);
    try {
      setLoading(true);
      const formData = {
        id_cliente: Number(selectedClienteId),
        id_produto: Number(solucao),
        id_faturado: Number(faturadoPor),
        dia_vencimento: Number(vencimento),
        nome_indice: reajuste,
        proximo_reajuste: Formatadores.formatarDataISO(proximoReajuste),
        status: "ativo",
        duracao: Number(duracao),
        valor_mensal: Number(valorMensal),
        quantidade: quantidade != null ? Number(quantidade) : quantidade,
        email_envio: email,
        descricao: descricao,
        link_contrato: linkContrato,
        data_inicio: Formatadores.formatarDataISO(dataInicio),
        tipo_faturamento: tipoFaturamento,
        renovacao_automatica: renovacaoAutomatica,
        id_usuario: cookies.id,
      };

      console.log(formData);

      let req;
      if (mode === "cadastro") {
        req = await api.post("/contratos", formData);
      } else if (mode === "edicao" && id) {
        req = await api.put(`/contratos/${id}`, formData);
      }

      if (
        req.message === "Contrato criado com sucesso!" ||
        req.message === "Contrato atualizado com sucesso!"
      ) {
        navigate("/contratos");
      } else {
        alert("Erro ao salvar contrato.");
      }
    } catch (error) {
      console.error("Erro ao enviar os dados do contrato:", error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelPopup = () => {
    setShowPopup(false);
  };

  const inativarContrato = async () => {
    try {
      setLoading(true);
      let req;
      if (status === "ativo") {
        req = await api.put(`/contratos/${id}`, { status: "inativo" });
      } else {
        req = await api.put(`/contratos/${id}`, { status: "ativo" });
      }
      if (req.message === "Contrato atualizado com sucesso!") {
        navigate("/contratos");
      } else {
        alert("Erro ao inativar contrato.");
      }
    } catch (error) {
      console.error("Erro ao inativar contrato:", error);
      alert("Erro ao inativar contrato.");
    } finally {
      setLoading(false);
    }
  };

  const options = [6, 12, 24, 36, 48, 60];

  const days = [];
  for (let i = 1; i <= 31; i++) {
    days.push(i);
  }

  return (
    <>
      {loading && <Carregando />}
      {showPopup && (
        <Popup
          message="Tem certeza que deseja continuar com esta ação?"
          onConfirm={popupAction}
          onCancel={cancelPopup}
        />
      )}
      <div className="global-display">
        <Navbar />
        <div className="global-container">
          <h2>
            {mode === "cadastro"
              ? "Cadastro de Contrato"
              : "Edição de Contrato"}
          </h2>
          <div id="div-cadastro-contrato-descricao-btn">
            <p id="cadastro-contrato-descricao">
              Campos com "*" são obrigatórios.
            </p>
            {mode !== "cadastro" && (
              <button
                id={`${status === "ativo" ? "btn-inativar-contrato" : "btn-ativar-contrato"}`}
                onClick={() => {
                  setPopupAction(() => inativarContrato);
                  setShowPopup(true);
                }}
              >
                {status === "ativo" ? "Inativar Contrato" : "Ativar Contrato"}
              </button>
            )}
          </div>
          <div id="form-contrato-container">
            <form id="form-contrato-form" onSubmit={handleSubmit}>
              <div id="form-contrato-cliente-cpf-cnpj-container">
                <div className="form-contrato-label-input-container dois-inputs">
                  <label htmlFor="cliente" className="label-form-contrato">
                    <b>
                      Cliente <span className="required">*</span>
                    </b>
                  </label>
                  <input
                    type="text"
                    name="cliente"
                    disabled={!isAdminOrDev}
                    value={clienteInput}
                    onChange={handleClienteInputChange}
                    onFocus={handleClienteInputFocus}
                    onBlur={handleClienteInputBlur}
                    autoComplete="off"
                    placeholder="Digite a razão social, nome fantasia ou CPF/CNPJ"
                    className="form-contrato-input form-contrato-input-padding-menor"
                  />
                  {showDropdown && filteredClientes.length > 0 && (
                    <ul className="dropdown-list">
                      {filteredClientes.map((cliente) => (
                        <li
                          key={cliente.id}
                          onMouseDown={() => handleClienteItemClick(cliente)}
                        >
                          {cliente.razao_social} - {cliente.nome_fantasia}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="form-contrato-label-input-container dois-inputs">
                  <label htmlFor="cpf-cnpj" className="label-form-contrato">
                    <b>CPF/CNPJ</b>
                  </label>
                  <input
                    type="text"
                    disabled
                    id="input-desabilitado"
                    className="form-contrato-input form-contrato-input-padding-menor"
                    value={selectedClienteCpfCnpj}
                  />
                </div>
              </div>
              <div className="form-contrato-cliente-tres-inputs-container">
                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="faturado" className="label-form-contrato">
                    <b>
                      Faturado por <span className="required">*</span>
                    </b>
                  </label>
                  <select
                    name="faturado"
                    className="form-contrato-input form-contrato-select"
                    value={faturadoPor}
                    disabled={!isAdminOrDev}
                    onChange={(e) => setFaturadoPor(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {faturados.map((faturado) => (
                      <option key={faturado.id} value={faturado.id}>
                        {faturado.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="solucao" className="label-form-contrato">
                    <b>
                      Solução ofertada <span className="required">*</span>
                    </b>
                  </label>
                  <select
                    name="solucao"
                    disabled={!isAdminOrDev}
                    className="form-contrato-input form-contrato-select"
                    value={solucao}
                    onChange={(e) => setSolucao(e.target.value)}
                  >
                    <option value="">Selecione uma solução</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="duracao" className="label-form-contrato">
                    <b>
                      Duração do contrato <span className="required">*</span>
                    </b>
                  </label>
                  <select
                    name="duracao"
                    disabled={!isAdminOrDev}
                    className="form-contrato-input form-contrato-select"
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {options.map((i) => (
                      <option key={i} value={i}>
                        {i} MESES
                      </option>
                    ))}
                    <option value={12000}>INDETERMINADO</option>
                  </select>
                </div>
              </div>
              <div className="form-contrato-cliente-tres-inputs-container">
                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="vencimento" className="label-form-contrato">
                    <b>
                      Dia vencimento <span className="required">*</span>
                    </b>
                  </label>
                  <select
                    name="vencimento"
                    disabled={!isAdminOrDev}
                    className="form-contrato-input form-contrato-select"
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {days.map((i) => (
                      <option key={i} value={i}>
                        DIA {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="reajuste" className="label-form-contrato">
                    <b>Índice reajuste</b>
                  </label>
                  <select
                    name="reajuste"
                    disabled={!isAdminOrDev}
                    value={reajuste}
                    onChange={handleReajusteChange}
                    className="form-contrato-input form-contrato-select"
                  >
                    <option value="">Selecione um índice</option>
                    <option value="igpm">IGPM</option>
                    <option value="ipca">IPCA</option>
                    <option value="ipc-fipe">IPC-FIPE</option>
                    <option value="inpc">INPC</option>
                  </select>
                </div>
                <div className="form-contrato-label-input-container tres-inputs">
                  <label
                    htmlFor="proximo-reajuste"
                    className="label-form-contrato"
                  >
                    <b>
                      Próximo reajuste <span className="required">*</span>
                    </b>
                  </label>
                  <input
                    type="date"
                    disabled={!isAdminOrDev}
                    name="proximo-reajuste"
                    className="form-contrato-input"
                    value={proximoReajuste}
                    onChange={(e) => setProximoReajuste(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-contrato-cliente-tres-inputs-container">
                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="valor-mensal" className="label-form-contrato">
                    <b>
                      Valor <span className="required">*</span>
                    </b>
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrDev}
                    name="valor-mensal"
                    className="form-contrato-input"
                    placeholder="Valor do contrato mensalmente"
                    value={valorMensal}
                    onChange={(e) => {
                      const valorFormatado = e.target.value.replace(",", ".");
                      setValorMensal(valorFormatado);
                    }}
                  />
                </div>
                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="quantidade" className="label-form-contrato">
                    <b>
                      Quantidade <span className="required">*</span>
                    </b>
                  </label>
                  <input
                    type="text"
                    disabled={!isAdminOrDev || isQuantidadeDisabled}
                    name="quantidade"
                    className="form-contrato-input"
                    placeholder="Quantidade da solução"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                  />
                </div>
                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="data-inicio" className="label-form-contrato">
                    <b>Data ínicio</b>
                  </label>
                  <input
                    type="date"
                    disabled={!isAdminOrDev}
                    name="data-inicio"
                    className="form-contrato-input"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-contrato-cliente-tres-inputs-container">
                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="">
                    <b>Valor anterior</b>
                  </label>
                  <input
                    type="text"
                    readOnly
                    name="valor-anterior"
                    className="form-contrato-input"
                    value={valorAnterior || ""}
                  />
                </div>

                <div className="form-contrato-label-input-container tres-inputs">
                  <label htmlFor="">
                    <b>
                      Tipo faturamento <span className="required">*</span>
                    </b>
                  </label>
                  <select
                    name="tipo-faturamento"
                    id="form-contrato-select-tipo-faturamento"
                    className="form-contrato-input form-contrato-select"
                    value={tipoFaturamento}
                    onChange={(e) => setTipoFaturamento(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    {tiposFaturamento.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-contrato-label-input-container tres-inputs">
                  <label
                    htmlFor="link-contrato"
                    className="label-form-contrato"
                  >
                    <b>Link do Contrato</b>
                  </label>
                  <input
                    type="text"
                    name="link-contrato"
                    disabled={!isAdminOrDev}
                    className="form-contrato-input"
                    placeholder="Insira o link do contrato no SharePoint"
                    value={linkContrato}
                    onChange={(e) => setLinkContrato(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-contrato-cliente-tres-inputs-container">

                <div className="form-contrato-label-input-container tres-inputs"></div>
                <div className="form-contrato-label-input-container tres-inputs"></div>
              </div>

              <div className="form-contrato-cliente-tres-inputs-container container-final">
                <div className="form-contrato-label-input-container dois-inputs">
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "4%" }}>
                    <input
                      type="checkbox"
                      name="renovacao-automatica"
                      id="renovacao-automatica"
                      checked={renovacaoAutomatica}
                      onChange={(e) => setRenovacaoAutomatica(e.target.checked)}
                      style={{ width: "20px", height: "20px", marginRight: "10px", cursor: "pointer" }}
                    />
                    <label htmlFor="renovacao-automatica" style={{ cursor: "pointer", marginBottom: 0, fontWeight: "bold" }}>
                      Renovação automática
                    </label>
                  </div>

                  <div>
                    <label htmlFor="descricao" className="label-form-contrato">
                      <b>Descrição breve</b>
                    </label>
                    <textarea
                      name="descricao"
                      disabled={!isAdminOrDev}
                      id="form-cliente-input-descricao"
                      className="form-contrato-input"
                      placeholder="Algo a mais que deveria ser descrito aqui..."
                      value={descricao}
                      rows={7}
                      onChange={(e) => setDescricao(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="form-contrato-label-input-container dois-inputs">
                  <label htmlFor="" className="label-form-contrato">
                    <b>Histórico</b>
                  </label>
                  <div id="form-contrato-logs-box">
                    {mode === "edicao" ? (
                      logs.length === 0 ? (
                        <p className="logs-empty">
                          Nenhum log cadastrado para este contrato.
                        </p>
                      ) : (
                        <ul className="logs-list">
                          {logs
                            .slice()
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                            )
                            .map((log) => (
                              <li key={log.id} className="log-item">
                                <div className="log-date">
                                  {Formatadores.formatarData(log.createdAt)}
                                </div>
                                <div className="log-user">
                                  {log.nome_usuario ||
                                    usuarios[log.id_usuario] ||
                                    `Usuário ${log.id_usuario ?? ""}`}
                                </div>
                                <div className="log-change">
                                  {log.alteracao
                                    .split(";")
                                    .filter((item) => item.trim() !== "")
                                    .map((item, index) => (
                                      <div key={index}>{item.trim()};</div>
                                    ))}
                                </div>
                              </li>
                            ))}
                        </ul>
                      )
                    ) : (
                      <div className="logs-placeholder" />
                    )}
                  </div>
                </div>
              </div>
              <div id="form-contrato-container-btn">
                <button
                  type="button"
                  className="form-cliente-btn-cancelar"
                  onClick={() => navigate("/contratos")}
                >
                  {!isAdminOrDev ? "Voltar" : "Cancelar"}
                </button>
                {!isAdminOrDev ? (
                  <></>
                ) : (
                  <button className="global-btn-verde form-cliente-btn-enviar">
                    {mode === "cadastro"
                      ? "Adicionar contrato"
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
