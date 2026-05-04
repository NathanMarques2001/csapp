import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../componentes/navbar";
import Api from "../../utils/api";
import imgCadastroGrupoEconomico from "../../assets/images/img-cadastro-grupo-economico.png";
import "./style.css";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";

export default function FormGrupoEconomico({ mode = "cadastro" }) {
  const api = new Api();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);

  // Dados do form
  const [nome, setNome] = useState("");

  // Se for edição, preenche o form
  useEffect(() => {
    if (mode === "edicao" && id) {
      (async () => {
        try {
          setLoading(true);
          const res = await api.get(`/grupos-economicos/${id}`);
          const g = res.grupoEconomico;
          setNome(g.nome);
        } catch (err) {
          console.error("Erro ao buscar grupo econômico:", err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, id]);

  const handleCancel = (e) => {
    e.preventDefault();
    setPopupAction(() => confirmCancel);
    setShowPopup(true);
  };
  const confirmCancel = () => navigate("/gestao?aba=grupos-economicos");

  const handleSubmit = (e) => {
    e.preventDefault();
    setPopupAction(() => confirmSubmit);
    setShowPopup(true);
  };
  const confirmSubmit = async () => {
    setShowPopup(false);
    const payload = {
      nome,
    };
    try {
      setLoading(true);
      let resp;
      if (mode === "cadastro") {
        resp = await api.post("/grupos-economicos", payload);
      } else {
        resp = await api.put(`/grupos-economicos/${id}`, payload);
      }
      if (resp.message?.includes("sucesso")) {
        navigate("/gestao?aba=grupos-economicos");
      } else {
        alert("Erro ao salvar grupo econômico.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar grupo econômico.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Carregando />}
      {showPopup && (
        <Popup
          title={
            mode === "cadastro"
              ? "Adicionar Novo Grupo Econômico"
              : "Editar Grupo Econômico"
          }
          message={
            mode === "cadastro"
              ? "Você está prestes a adicionar um novo grupo econômico. Deseja continuar?"
              : "Você está prestes a salvar as alterações feitas neste grupo econômico. Deseja continuar?"
          }
          onConfirm={popupAction}
          onCancel={() => setShowPopup(false)}
        />
      )}
      <div className="global-display">
        <Navbar />
        <div className="global-container">
          <h2>
            {mode === "cadastro"
              ? "Cadastro de Grupo Econômico"
              : "Edição de Grupo Econômico"}
          </h2>
          <p id="cadastro-grupo-economico-descricao">
            Campos com "*" são obrigatórios.
          </p>
          <div id="cadastro-grupo-economico-form-container">
            <form id="cadastro-grupo-economico-form" onSubmit={handleSubmit}>
              {/* Nome */}
              <div className="form-group">
                <label htmlFor="nome">
                  Nome <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="cadastro-grupo-economico-container-btn">
                <button
                  type="button"
                  className="cadastro-grupo-economico-btn"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cadastro-grupo-economico-btn"
                  id="cadastro-grupo-economico-btn-cadastrar"
                >
                  {mode === "cadastro" ? "Adicionar" : "Salvar"} grupo econômico
                </button>
              </div>
            </form>

            <div id="cadastro-grupo-economico-container-img">
              <img
                src={imgCadastroGrupoEconomico}
                alt="Cadastro Grupo Econômico"
                id="cadastro-grupo-economico-img"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
