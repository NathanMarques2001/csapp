import Navbar from "../../componentes/navbar";
import "./style.css";
import imgCadastroCategoriaProduto from "../../assets/images/img-cadastro-categoria-produto.png";
import Api from "../../utils/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";

export default function FormCategoriaProduto({ mode = "cadastro" }) {
  const api = new Api();
  const [nomeCategoria, setNomeCategoria] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchCategoria = async () => {
      if (mode === "edicao" && id) {
        try {
          setLoading(true);
          const response = await api.get(`/categorias-produtos/${id}`);
          const categoria = response.categoria;
          setNomeCategoria(categoria.nome);
        } catch (err) {
          console.error("Erro ao buscar categoria:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategoria();
  }, [mode, id]);

  const handleAddCategoria = async (e) => {
    e.preventDefault();
    setPopupAction(() => confirmAddCategoria);
    setShowPopup(true);
  };

  const confirmAddCategoria = async () => {
    setShowPopup(false);
    const data = {
      nome: nomeCategoria,
    };

    try {
      setLoading(true);
      let req;
      if (mode === "cadastro") {
        req = await api.post("/categorias-produtos", data);
      } else if (mode === "edicao") {
        req = await api.put(`/categorias-produtos/${id}`, data);
      }

      if (
        req.message === "Categoria criada com sucesso!" ||
        req.message === "Categoria atualizada com sucesso!"
      ) {
        setNomeCategoria("");
        navigate("/gestao?aba=categorias-produtos");
      } else {
        alert("Erro ao salvar categoria.");
      }
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
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
            mode === "cadastro"
              ? "Adicionar Nova Categoria"
              : "Editar Categoria"
          }
          message={
            mode === "cadastro"
              ? "Você está prestes a adicionar uma nova categoria. Deseja continuar?"
              : "Você está prestes a salvar as alterações feitas nesta categoria. Deseja continuar?"
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
              ? "Cadastro de Categoria"
              : "Edição de Categoria"}
          </h2>
          <p id="cadastro-solucao-descricao">
            Campos com "*" são obrigatórios.
          </p>
          <div id="cadastro-solucao-form-container">
            <form id="cadastro-solucao-form" onSubmit={handleAddCategoria}>
              <div id="cadastro-solucao-input-labels">
                <label htmlFor="nome">
                  <b>Nome *</b>
                </label>
                <input
                  type="text"
                  id="cadastro-solucao-input"
                  name="nome"
                  value={nomeCategoria}
                  onChange={(e) => setNomeCategoria(e.target.value)}
                  required
                  placeholder="Digite o nome da categoria"
                  className="cadastro-solucao-input"
                />
              </div>
              <div className="cadastro-solucao-container-btn">
                <button
                  id="cadastro-solucao-btn-cancelar"
                  className="cadastro-solucao-btn"
                  onClick={() => navigate("/gestao?aba=categorias-produtos")}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  id="cadastro-solucao-btn-cadastrar"
                  className="cadastro-solucao-btn"
                >
                  {mode === "cadastro"
                    ? "Adicionar categoria"
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
            <div id="cadastro-solucao-container-img">
              <img
                src={imgCadastroCategoriaProduto}
                alt=""
                id="cadastro-solucao-img"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
