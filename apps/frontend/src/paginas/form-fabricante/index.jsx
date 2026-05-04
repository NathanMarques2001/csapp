import Navbar from "../../componentes/navbar";
import "./style.css";
import imgCadastroFabricante from "../../assets/images/img-cadastro-fornecedor.png";
import Api from "../../utils/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function FormFabricante({ mode = "cadastro" }) {
  const api = new Api();
  const [nomeFabricante, setNomeFabricante] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchFabricante = async () => {
      if (mode === "edicao" && id) {
        try {
          setLoading(true);
          const response = await api.get(`/fabricantes/${id}`);
          const fabricante = response.fabricante;
          setNomeFabricante(fabricante.nome);
        } catch (err) {
          console.error("Error fetching fabricante:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFabricante();
  }, [mode, id]);

  const handleSaveFabricante = (e) => {
    e.preventDefault();
    setPopupAction(() => confirmSaveFabricante);
    setShowPopup(true);
  };

  const confirmSaveFabricante = async () => {
    setShowPopup(false);
    const data = {
      nome: nomeFabricante,
    };

    try {
      setLoading(true);
      let req;
      if (mode === "cadastro") {
        req = await api.post("/fabricantes", data);
      } else if (mode === "edicao") {
        req = await api.put(`/fabricantes/${id}`, data);
      }
      if (
        req.message === "Fabricante criado com sucesso!" ||
        req.message === "Fabricante atualizado com sucesso!"
      ) {
        setNomeFabricante("");
        navigate("/gestao?aba=fabricantes");
      } else {
        alert("Erro ao salvar fabricante.");
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
            mode == "cadastro"
              ? "Adicionar Novo Fornecedor"
              : "Editar Fornecedor"
          }
          message={
            mode == "cadastro"
              ? "Você está prestes a adicionar um novo fornecedor. Deseja continuar?"
              : "Você está prestes a salvar as alterações feitas neste fornecedor. Deseja continuar?"
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
              ? "Cadastro de Fabricante"
              : "Edição de Fabricante"}
          </h2>
          <p id="cadastro-fabricante-descricao">
            Campos com "*" são obrigatórios.
          </p>
          <div id="cadastro-fabricante-form-container">
            <form id="cadastro-fabricante-form" onSubmit={handleSaveFabricante}>
              <div id="cadastro-fabricante-input-labels">
                <label htmlFor="nome">
                  <b>Nome *</b>
                </label>
                <input
                  type="text"
                  id="cadastro-fabricante-input"
                  className="cadastro-fabricante-input"
                  name="nome"
                  placeholder="Digite o nome do fabricante"
                  value={nomeFabricante}
                  onChange={(e) => setNomeFabricante(e.target.value)}
                  required
                />
              </div>
              <div className="cadastro-fabricante-container-btn">
                <button
                  id="cadastro-fabricante-btn-cancelar"
                  className="cadastro-fabricante-btn"
                  onClick={() => navigate("/gestao?aba=fabricantes")}
                >
                  Cancelar
                </button>
                <button
                  id="cadastro-fabricante-btn-cadastrar"
                  className="cadastro-fabricante-btn"
                >
                  {mode === "cadastro"
                    ? "Adicionar fabricante"
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
            <div id="cadastro-fabricante-container-img">
              <img
                src={imgCadastroFabricante}
                alt=""
                id="cadastro-fabricante-img"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
