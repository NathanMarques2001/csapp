import Navbar from "../../componentes/navbar";
import "./style.css";
import imgCadastroSegmento from "../../assets/images/img-cadastro-segmento.png";
import Api from "../../utils/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function FormSegmento({ mode = "cadastro" }) {
  const api = new Api();
  const [nomeSegmento, setNomeSegmento] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchSegmento = async () => {
      if (mode === "edicao" && id) {
        try {
          setLoading(true);
          const response = await api.get(`/segmentos/${id}`);
          const segmento = response.segmento;
          setNomeSegmento(segmento.nome);
        } catch (err) {
          console.error("Error fetching segmentos:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSegmento();
  }, [mode, id]);

  const handleSaveSegmento = (e) => {
    e.preventDefault();
    setPopupAction(() => confirmSaveSegmento);
    setShowPopup(true);
  };

  const confirmSaveSegmento = async () => {
    setShowPopup(false);
    const data = {
      nome: nomeSegmento,
    };

    try {
      setLoading(true);
      let req;
      if (mode === "cadastro") {
        req = await api.post("/segmentos", data);
      } else if (mode === "edicao") {
        req = await api.put(`/segmentos/${id}`, data);
      }
      if (
        req.message === "Segmento criado com sucesso!" ||
        req.message === "Segmento atualizado com sucesso!"
      ) {
        setNomeSegmento("");
        navigate("/gestao?aba=segmentos");
      } else {
        alert("Erro ao salvar segmento.");
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
            mode == "cadastro" ? "Adicionar Novo Segmento" : "Editar Segmento"
          }
          message={
            mode == "cadastro"
              ? "Você está prestes a adicionar um novo segmento. Deseja continuar?"
              : "Você está prestes a salvar as alterações feitas neste segmento. Deseja continuar?"
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
              ? "Cadastro de Segmento"
              : "Edição de Segmento"}
          </h2>
          <p id="cadastro-segmento-descricao">
            Campos com "*" são obrigatórios.
          </p>
          <div id="cadastro-segmento-form-container">
            <form id="cadastro-segmento-form" onSubmit={handleSaveSegmento}>
              <div id="cadastro-segmento-input-labels">
                <label htmlFor="nome">
                  <b>Nome *</b>
                </label>
                <input
                  type="text"
                  id="cadastro-segmento-input"
                  className="cadastro-segmento-input"
                  name="nome"
                  placeholder="Digite o nome do segmento"
                  value={nomeSegmento}
                  onChange={(e) => setNomeSegmento(e.target.value)}
                  required
                />
              </div>
              <div className="cadastro-segmento-container-btn">
                <button
                  id="cadastro-segmento-btn-cancelar"
                  className="cadastro-segmento-btn"
                  onClick={() => navigate("/gestao?aba=segmentos")}
                >
                  Cancelar
                </button>
                <button
                  id="cadastro-segmento-btn-cadastrar"
                  className="cadastro-segmento-btn"
                >
                  {mode === "cadastro"
                    ? "Adicionar segmento"
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
            <div id="cadastro-segmento-container-img">
              <img
                src={imgCadastroSegmento}
                alt=""
                id="cadastro-segmento-img"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
