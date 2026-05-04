import "./style.css";
import { useEffect, useState } from "react";
import imgCadastroUsuarios from "../../assets/images/img-cadastro-usuario.png";
import Api from "../../utils/api"; // Assuming you have an API module
import { useParams, useNavigate } from "react-router-dom";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";
import Navbar from "../../componentes/navbar";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function FormUsuario({ mode = "cadastro" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = new Api();

  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    tipo: "",
    senha: "",
    confirmarSenha: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);

  // Define formData state to hold user data
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    tipo: "",
    senha: "",
  });

  useEffect(() => {
    if (mode === "edicao" && id) {
      fetchUsuario(id);
    }
  }, [mode, id]);

  useEffect(() => {
    // Update formData whenever usuario changes
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      senha: usuario.senha,
    });
  }, [usuario]);

  const fetchUsuario = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/usuarios/${id}`);
      setUsuario({
        ...response.usuario,
        senha: "",
        confirmarSenha: "",
      });
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prevUsuario) => ({
      ...prevUsuario,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usuario.senha !== usuario.confirmarSenha) {
      alert("As senhas não são iguais.");
      return;
    }

    // Trigger confirmation popup
    setPopupAction(() => confirmSaveUsuario);
    setShowPopup(true);
  };

  const confirmSaveUsuario = async () => {
    setShowPopup(false);

    try {
      setLoading(true);
      let req;
      if (mode === "cadastro") {
        req = await api.post("/usuarios", formData);
      } else if (mode === "edicao" && id) {
        req = await api.put(`/usuarios/${id}`, formData);
      }
      if (
        req.message === "Usuário criado com sucesso!" ||
        req.message === "Usuário atualizado com sucesso!"
      ) {
        setUsuario({
          nome: "",
          email: "",
          tipo: "",
          senha: "",
          confirmarSenha: "",
        });
        navigate("/gestao?aba=usuarios");
      } else {
        alert("Erro ao salvar usuário.");
      }
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
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
            mode == "cadastro" ? "Adicionar Novo Usuário" : "Editar Usuário"
          }
          message={
            mode == "cadastro"
              ? "Você está prestes a adicionar um novo usuário. Deseja continuar?"
              : "Você está prestes a salvar as alterações feitas neste usuário. Deseja continuar?"
          }
          onConfirm={popupAction}
          onCancel={cancelPopup}
        />
      )}
      <div className="global-display">
        <Navbar />
        <div className="global-container">
          <h2>
            {mode === "cadastro" ? "Cadastro de Usuário" : "Edição de Usuário"}
          </h2>
          <p id="cadastro-solucao-descricao">
            Campos com "*" são obrigatórios.
          </p>
          <div id="form-usuario-container">
            <form id="form-usuario-form" onSubmit={handleSubmit}>
              <label htmlFor="nome">
                Nome <span className="required">*</span>
              </label>
              <input
                type="text"
                name="nome"
                value={usuario.nome}
                onChange={handleChange}
                required
              />
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={usuario.email}
                onChange={handleChange}
                required
                disabled={mode == "edicao"}
              />
              <label htmlFor="tipo">
                Tipo de usuário <span className="required">*</span>
              </label>
              <select
                name="tipo"
                value={usuario.tipo}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="admin">Administrador</option>
                <option value="usuario">Usuário comum</option>
              </select>
              <label htmlFor="senha">
                Senha <span className="required">*</span>
              </label>
              <input
                type="password"
                name="senha"
                value={usuario.senha}
                onChange={handleChange}
                required
                disabled={mode == "edicao"}
              />
              <label htmlFor="confirmarSenha">
                Confirmar senha <span className="required">*</span>
              </label>
              <input
                type="password"
                name="confirmarSenha"
                value={usuario.confirmarSenha}
                onChange={handleChange}
                required
                disabled={mode == "edicao"}
              />
              <p>Usuário poderá redefinir sua senha pela tela de login.</p>
              <div id="form-usuario-div-btn">
                <button
                  className="form-usuario-btn"
                  id="form-usuario-btn-cancelar"
                  onClick={() => navigate("/gestao?aba=usuarios")}
                >
                  Cancelar
                </button>
                <button
                  className="form-usuario-btn global-btn-verde"
                  type="submit"
                >
                  {mode === "cadastro"
                    ? "Adicionar usuário"
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
            <div>
              <img id="form-usuario-img" src={imgCadastroUsuarios} alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
