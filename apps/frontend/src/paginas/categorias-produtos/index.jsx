import { useEffect, useState } from "react";
import Api from "../../utils/api";
import editIcon from "../../assets/icons/icon-lapis.png";
import iconeInativar from "../../assets/icons/icon-inativar.png";
import iconeAtivar from "../../assets/icons/icon-ativar.png";
import Carregando from "../../componentes/carregando";
import { useNavigate } from "react-router-dom";
import Popup from "../../componentes/pop-up";

export default function CategoriasProdutos() {
  const api = new Api();
  const [categorias, setCategorias] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [atualizar, setAtualizar] = useState(0);
  const [configuracaoPopup, setConfiguracaoPopup] = useState({
    aberto: false,
    titulo: "",
    mensagem: "",
    id: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const buscarCategorias = async () => {
      try {
        setCarregando(true);
        const response = await api.get("/categorias-produtos");
        setCategorias(response.categorias);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarCategorias();
  }, [atualizar]);

  const editarCategoria = (id) => navigate(`/edicao-categoria-produto/${id}`);

  const alterarStatus = async () => {
    const { id } = configuracaoPopup;
    setConfiguracaoPopup((prev) => ({ ...prev, aberto: false }));
    setCarregando(true);
    try {
      const response = await api.get(`/categorias-produtos/${id}`);
      const novoStatus =
        response.categoria.status === "ativo" ? "inativo" : "ativo";
      await api.put(`/categorias-produtos/${id}`, { status: novoStatus });
      setAtualizar((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  const confirmarAlteracaoStatus = (id, status) => {
    const titulos = {
      ativo: "Inativar Categoria",
      inativo: "Ativar Categoria",
    };
    const mensagens = {
      ativo: "Tem certeza que deseja inativar esta categoria?",
      inativo: "Tem certeza que deseja ativar esta categoria?",
    };
    setConfiguracaoPopup({
      aberto: true,
      titulo: titulos[status],
      mensagem: mensagens[status],
      id,
    });
  };

  const aoBuscar = (event) => {
    setTermoBusca(event.target.value);
  };

  const redirecionar = (url) => {
    navigate(url);
  };

  const categoriasFiltradas = categorias.filter((categoria) =>
    categoria.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <>
      {carregando && <Carregando />}
      {configuracaoPopup.aberto && (
        <Popup
          title={configuracaoPopup.titulo}
          message={configuracaoPopup.mensagem}
          onConfirm={alterarStatus}
          onCancel={() => setConfiguracaoPopup((prev) => ({ ...prev, aberto: false }))}
        />
      )}
      <div>
        <h3 className="gestao-section-subtitulo">
          Categorias de Soluções ({categoriasFiltradas.length})
        </h3>
        <input
          type="text"
          placeholder="Procure pelo nome da categoria"
          value={termoBusca}
          onChange={aoBuscar}
          className="gestao-section-input"
        />
        <button
          className="gestao-section-btn gestao-section-btn-verde"
          onClick={() => redirecionar("/cadastro-categoria-produto")}
        >
          Adicionar categoria
        </button>
        {categoriasFiltradas.length > 0 ? (
          <table className="gestao-section-tabela">
            <thead>
              <tr>
                <th className="gestao-section-titulo-tabela">Nome</th>
                <th className="gestao-section-titulo-tabela">Status</th>
                <th className="gestao-section-titulo-tabela">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.map((categoria) => (
                <tr key={categoria.id}>
                  <td className="gestao-section-conteudo-tabela">
                    {categoria.nome}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    {categoria.status}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    <div className="gestao-section-container-btn">
                      <button
                        className="gestao-section-editar-btn gestao-section-item-btn"
                        onClick={() => editarCategoria(categoria.id)}
                      >
                        <img src={editIcon} alt="Editar" />
                      </button>
                      <button
                        className={`${categoria.status === "ativo"
                          ? "gestao-section-excluir-btn "
                          : "gestao-section-editar-btn "
                          } gestao-section-item-btn`}
                        onClick={() =>
                          confirmarAlteracaoStatus(categoria.id, categoria.status)
                        }
                      >
                        <img
                          src={
                            categoria.status === "ativo"
                              ? iconeInativar
                              : iconeAtivar
                          }
                          alt={
                            categoria.status === "ativo" ? "Inativar" : "Ativar"
                          }
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="gestao-section-sem-registros">
            Ainda não foram cadastradas categorias!
          </p>
        )}
      </div>
    </>
  );
}
