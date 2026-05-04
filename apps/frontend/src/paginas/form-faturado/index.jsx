import Navbar from "../../componentes/navbar";
import "./style.css";
import imgCadastroFaturado from "../../assets/images/img-cadastro-faturado.png";
import Api from "../../utils/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function FormFaturado({ mode = "cadastro" }) {
  const api = new Api();
  const [nomeFaturado, setNomeFaturado] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchFaturado = async () => {
      if (mode === "edicao" && id) {
        try {
          setLoading(true);
          const response = await api.get(`/faturados/${id}`);
          const faturado = response.faturado;
          setNomeFaturado(faturado.nome);
        } catch (err) {
          console.error("Error fetching faturado:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFaturado();
  }, [mode, id]);

  const handleSaveFaturado = (e) => {
    e.preventDefault();
    setPopupAction(() => confirmSaveFaturado);
    setShowPopup(true);
  };

  const confirmSaveFaturado = async () => {
    setShowPopup(false);
    const data = {
      nome: nomeFaturado,
    };

    try {
      setLoading(true);
      let req;
      if (mode === "cadastro") {
        req = await api.post("/faturados", data);
      } else if (mode === "edicao") {
        req = await api.put(`/faturados/${id}`, data);
      }
      if (
        req.message === "Faturado criado com sucesso!" ||
        req.message === "Faturado atualizado com sucesso!"
      ) {
        setNomeFaturado("");
        navigate("/gestao?aba=faturados");
      } else {
        alert("Erro ao salvar faturado.");
      }
    } catch (err) {
      console.error("Error saving data:", err);
      alert(err);
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
            mode == "cadastro" ? "Adicionar Novo Faturista" : "Editar Faturista"
          }
          message={
            mode == "cadastro"
              ? "Você está prestes a adicionar um novo faturista. Deseja continuar?"
              : "Você está prestes a salvar as alterações feitas neste faturista. Deseja continuar?"
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
              ? "Cadastro de Faturista"
              : "Edição de Faturista"}
          </h2>
          <p id="cadastro-faturado-descricao">
            Campos com "*" são obrigatórios.
          </p>
          <div id="cadastro-faturado-form-container">
            <form id="cadastro-faturado-form" onSubmit={handleSaveFaturado}>
              <div id="cadastro-faturado-input-labels">
                <label htmlFor="nome">
                  <b>Nome *</b>
                </label>
                <input
                  type="text"
                  id="cadastro-faturado-input"
                  className="cadastro-faturado-input"
                  name="nome"
                  placeholder="Digite o nome do faturista"
                  value={nomeFaturado}
                  onChange={(e) => setNomeFaturado(e.target.value)}
                  required
                />
              </div>
              <div className="cadastro-faturado-container-btn">
                <button
                  id="cadastro-faturado-btn-cancelar"
                  className="cadastro-faturado-btn"
                  onClick={() => navigate("/gestao?aba=faturados")}
                >
                  Cancelar
                </button>
                <button
                  id="cadastro-faturado-btn-cadastrar"
                  className="cadastro-faturado-btn"
                >
                  {mode === "cadastro"
                    ? "Adicionar faturista"
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
            <div id="cadastro-faturado-container-img">
              <img
                src={imgCadastroFaturado}
                alt=""
                id="cadastro-faturado-img"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
