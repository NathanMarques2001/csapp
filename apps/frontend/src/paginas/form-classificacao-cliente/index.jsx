import Navbar from "../../componentes/navbar";
import "./style.css";
import imgCadastroClassificacao from "../../assets/images/img-cadastro-classificacao.png";
import Api from "../../utils/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";

export default function FormClassificacaoClientes({ mode = "cadastro" }) {
  const api = new Api();
  const [nome, setNome] = useState("");
  const [tipoCategoria, setTipoCategoria] = useState("quantidade");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchClassificacao = async () => {
      if (mode === "edicao" && id) {
        try {
          setLoading(true);
          const response = await api.get(`/classificacoes-clientes/${id}`);
          const classificacao = response.classificacao;
          setNome(classificacao.nome);
          setTipoCategoria(classificacao.tipo_categoria);
          setQuantidade(classificacao.quantidade || "");
          setValor(classificacao.valor || "");
        } catch (err) {
          console.error("Erro ao buscar classificação:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchClassificacao();
  }, [mode, id]);

  const handleSaveClassificacao = (e) => {
    e.preventDefault();
    setPopupAction(() => confirmSaveClassificacao);
    setShowPopup(true);
  };

  const confirmSaveClassificacao = async () => {
    setShowPopup(false);

    const data = {
      nome,
      tipo_categoria: tipoCategoria,
      quantidade:
        tipoCategoria === "quantidade"
          ? quantidade !== ""
            ? parseInt(quantidade, 10)
            : null
          : null,
      valor:
        tipoCategoria === "valor"
          ? valor !== ""
            ? parseFloat(valor)
            : null
          : null,
    };

    try {
      setLoading(true);
      let req;
      if (mode === "cadastro") {
        req = await api.post("/classificacoes-clientes", data);
      } else if (mode === "edicao") {
        req = await api.put(`/classificacoes-clientes/${id}`, data);
      }
      console.log("Resposta da API:", req);

      // Ajuste a verificação conforme o formato real da resposta
      if (
        req?.message === "Classificação criada com sucesso!" ||
        req?.message === "Classificação atualizada com sucesso!"
      ) {
        navigate("/gestao?aba=classificacoes-clientes");
      } else {
        alert("Erro ao salvar classificação.");
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      console.error("Resposta de erro detalhada:", err?.response?.data);
      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Erro inesperado ao salvar a classificação."
      );
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
            mode === "cadastro"
              ? "Adicionar Nova Classificação"
              : "Editar Classificação"
          }
          message={
            mode === "cadastro"
              ? "Você está prestes a adicionar uma nova classificação. Deseja continuar?"
              : "Você está prestes a salvar as alterações feitas nesta classificação. Deseja continuar?"
          }
          onConfirm={popupAction}
          onCancel={cancelPopup}
        />
      )}
      <div className="global-display">
        <Navbar />
        <div className="global-container">
          <h2>
            {mode === "cadastro"
              ? "Cadastro de Classificação"
              : "Edição de Classificação"}
          </h2>
          <p id="cadastro-classificacoes-clientes-descricao">
            Campos com "*" são obrigatórios.
          </p>
          <div id="cadastro-classificacoes-clientes-form-container">
            <form
              id="cadastro-classificacoes-clientes-form"
              onSubmit={handleSaveClassificacao}
            >
              <div id="cadastro-classificacoes-clientes-input-labels">
                <label>Nome *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  id="cadastro-classificacoes-clientes-input"
                  className="cadastro-classificacoes-clientes-input"
                />

                <label>Tipo de Categoria *</label>
                <select
                  value={tipoCategoria}
                  id="cadastro-classificacoes-clientes-select"
                  className="cadastro-classificacoes-clientes-input"
                  onChange={(e) => setTipoCategoria(e.target.value)}
                  required
                >
                  <option value="quantidade">Quantidade</option>
                  <option value="valor">Valor</option>
                </select>

                {tipoCategoria === "quantidade" && (
                  <>
                    <label>Quantidade *</label>
                    <input
                      type="number"
                      value={quantidade}
                      id="cadastro-classificacoes-clientes-input"
                      className="cadastro-classificacoes-clientes-input"
                      onChange={(e) => setQuantidade(e.target.value)}
                      required
                    />
                  </>
                )}

                {tipoCategoria === "valor" && (
                  <>
                    <label>Valor mínimo *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valor}
                      id="cadastro-classificacoes-clientes-input"
                      className="cadastro-classificacoes-clientes-input"
                      onChange={(e) => setValor(e.target.value)}
                      required
                    />
                  </>
                )}
              </div>

              <div className="cadastro-classificacoes-clientes-container-btn">
                <button
                  id="cadastro-classificacoes-clientes-btn-cancelar"
                  className="cadastro-classificacoes-clientes-btn"
                  type="button"
                  onClick={() =>
                    navigate("/gestao?aba=classificacoes-clientes")
                  }
                >
                  Cancelar
                </button>
                <button
                  id="cadastro-classificacoes-clientes-btn-cadastrar"
                  className="cadastro-classificacoes-clientes-btn"
                  type="submit"
                >
                  {mode === "cadastro"
                    ? "Adicionar Classificação"
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
            <div id="cadastro-classificacoes-clientes-container-img">
              <img
                src={imgCadastroClassificacao}
                alt=""
                id="cadastro-classificacoes-clientes-img"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
