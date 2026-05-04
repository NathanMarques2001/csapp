import Navbar from "../../componentes/navbar";
import "./style.css";
import imgCadastroSolucao from "../../assets/images/img-cadastro-solucao.png";
import Api from "../../utils/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function FormSolucao({ mode = "cadastro" }) {
  const api = new Api();
  const [fabricantes, setFabricantes] = useState([]);
  const [selectedFabricante, setSelectedFabricante] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchFabricantes = async () => {
      try {
        setLoading(true);
        const data = await api.get("/fabricantes");
        const fabricantesAitovs = data.fabricantes.filter(
          (fab) => fab.status !== "inativo"
        );
        setFabricantes(fabricantesAitovs);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProduto = async () => {
      if (mode === "edicao" && id) {
        try {
          setLoading(true);
          const response = await api.get(`/produtos/${id}`);
          const produto = response.produto;
          setNomeProduto(produto.nome);
          setSelectedFabricante(produto.id_fabricante);
          setSelectedCategoria(produto.id_categoria_produto);
        } catch (err) {
          console.error("Error fetching product:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchCategorias = async () => {
      try {
        const data = await api.get("/categorias-produtos");
        const categoriasAtivas = data.categorias.filter(
          (cat) => cat.status !== "inativo"
        );
        setCategorias(categoriasAtivas);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      }
    };

    fetchFabricantes();
    fetchProduto();
    fetchCategorias();
  }, [mode, id]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (selectedFabricante === "s/ fabricante") {
      alert("Favor cadastrar um fabricante.");
      return;
    }
    setPopupAction(() => confirmAddProduct);
    setShowPopup(true);
  };

  const confirmAddProduct = async () => {
    setShowPopup(false);
    const data = {
      nome: nomeProduto,
      id_fabricante: selectedFabricante,
      id_categoria_produto: selectedCategoria,
    };
    try {
      setLoading(true);
      let req;
      if (mode === "cadastro") {
        req = await api.post("/produtos", data);
      } else if (mode === "edicao") {
        req = await api.put(`/produtos/${id}`, data);
      }
      if (
        req.message === "Produto criado com sucesso!" ||
        req.message === "Produto atualizado com sucesso!"
      ) {
        setNomeProduto("");
        setSelectedFabricante("");
        navigate("/gestao?aba=solucoes");
      } else {
        alert("Erro ao cadastrar solução.");
      }
    } catch (err) {
      console.error("Error posting data:", err);
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFabricanteChange = (e) => {
    setSelectedFabricante(e.target.value);
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
            mode == "cadastro" ? "Adicionar Nova Solução" : "Editar Solução"
          }
          message={
            mode == "cadastro"
              ? "Você está prestes a adicionar uma nova solução. Deseja continuar?"
              : "Você está prestes a salvar as alterações feitas nesta solução. Deseja continuar?"
          }
          onConfirm={popupAction}
          onCancel={cancelPopup}
        />
      )}
      <div className="global-display">
        <Navbar />
        <div className="global-container">
          <h2>
            {mode === "cadastro" ? "Cadastro de Solução" : "Edição de Solução"}
          </h2>
          <p id="cadastro-solucao-descricao">
            Campos com "*" são obrigatórios.
          </p>
          <div id="cadastro-solucao-form-container">
            <form id="cadastro-solucao-form" onSubmit={handleAddProduct}>
              <div id="cadastro-solucao-input-labels">
                <label htmlFor="nome">
                  <b>Nome *</b>
                </label>
                <input
                  type="text"
                  id="cadastro-solucao-input"
                  name="nome"
                  value={nomeProduto}
                  onChange={(e) => setNomeProduto(e.target.value)}
                  required
                  placeholder="Digite o nome da solução"
                  className="cadastro-solucao-input"
                />
                <label htmlFor="fabricante">
                  <b>Fornecedor *</b>
                </label>
                <select
                  name="fabricante"
                  id="cadastro-solucao-select"
                  value={selectedFabricante}
                  onChange={handleFabricanteChange}
                  required
                  className="cadastro-solucao-input"
                >
                  <option value="s/ fabricante"></option>
                  {fabricantes.length > 0 &&
                    fabricantes.map((fabricante) => (
                      <option key={fabricante.id} value={fabricante.id}>
                        {fabricante.nome}
                      </option>
                    ))}
                </select>
                <label htmlFor="categoria">
                  <b>Categoria *</b>
                </label>
                <select
                  name="categoria"
                  id="cadastro-solucao-select"
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  required
                  className="cadastro-solucao-input"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.length > 0 &&
                    categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                </select>
              </div>
              <div className="cadastro-solucao-container-btn">
                <button
                  id="cadastro-solucao-btn-cancelar"
                  className="cadastro-solucao-btn"
                  onClick={() => navigate("/gestao?aba=solucoes")}
                >
                  Cancelar
                </button>
                <button
                  id="cadastro-solucao-btn-cadastrar"
                  className="cadastro-solucao-btn"
                >
                  {mode === "cadastro"
                    ? "Adicionar solução"
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
            <div id="cadastro-solucao-container-img">
              <img src={imgCadastroSolucao} alt="" id="cadastro-solucao-img" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
