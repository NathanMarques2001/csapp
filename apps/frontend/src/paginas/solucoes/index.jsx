import { useEffect, useState } from "react";
import Api from "../../utils/api";
import editIcon from "../../assets/icons/icon-lapis.png";
import iconeInativar from "../../assets/icons/icon-inativar.png";
import iconeAtivar from "../../assets/icons/icon-ativar.png";
import Carregando from "../../componentes/carregando";
import { useNavigate } from "react-router-dom";
import Popup from "../../componentes/pop-up";

export default function Solucoes() {
  const api = new Api();
  const [produtos, setProdutos] = useState([]);
  const [fabricantes, setFabricantes] = useState({});
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
    const buscarDados = async () => {
      try {
        setCarregando(true);
        const produtosResponse = await api.get("/produtos");
        setProdutos(produtosResponse.produtos);

        const fabricantesResponse = await api.get("/fabricantes");
        const fabricantesMap = fabricantesResponse.fabricantes.reduce(
          (map, fabricante) => {
            map[fabricante.id] = fabricante.nome;
            return map;
          },
          {}
        );
        setFabricantes(fabricantesMap);

        const categoriasResponse = await api.get("/categorias-produtos");
        const categoriasMap = categoriasResponse.categorias.reduce(
          (map, categoria) => {
            map[categoria.id] = categoria.nome;
            return map;
          },
          {}
        );
        setCategorias(categoriasMap);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [atualizar]);

  const editarSolucao = (id) => navigate(`/edicao-solucao/${id}`);

  const alterarStatus = async () => {
    const { id } = configuracaoPopup;
    setConfiguracaoPopup((prev) => ({ ...prev, aberto: false }));
    setCarregando(true);
    try {
      const response = await api.get(`/produtos/${id}`);
      const novoStatus =
        response.produto.status === "ativo" ? "inativo" : "ativo";
      await api.put(`/produtos/${id}`, { status: novoStatus });
      setAtualizar((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  const confirmarAlteracaoStatus = (id, status) => {
    const titulos = {
      ativo: "Inativar Solução",
      inativo: "Ativar Solução",
    };
    const mensagens = {
      ativo: "Tem certeza que deseja inativar esta solução?",
      inativo: "Tem certeza que deseja ativar esta solução?",
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

  const produtosFiltrados = produtos.filter((produto) => {
    const fornecedorNome = fabricantes[produto.id_fabricante] || "";
    return (
      produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      fornecedorNome.toLowerCase().includes(termoBusca.toLowerCase())
    );
  });

  const totalSolucoes = produtosFiltrados.length;

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
        <h3 className="gestao-section-subtitulo">Soluções ({totalSolucoes})</h3>
        <input
          type="text"
          placeholder="Procure pelo nome ou fornecedor"
          value={termoBusca}
          onChange={aoBuscar}
          className="gestao-section-input"
        />
        <button
          className="gestao-section-btn gestao-section-btn-verde"
          onClick={() => redirecionar("/cadastro-solucao")}
        >
          Adicionar solução
        </button>
        {produtos.length > 0 ? (
          <table className="gestao-section-tabela">
            <thead>
              <tr>
                <th className="gestao-section-titulo-tabela">Nome</th>
                <th className="gestao-section-titulo-tabela">Fornecedor</th>
                <th className="gestao-section-titulo-tabela">Status</th>
                <th className="gestao-section-titulo-tabela">Categoria</th>
                <th className="gestao-section-titulo-tabela">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((produto) => (
                <tr key={produto.id}>
                  <td className="gestao-section-conteudo-tabela">
                    {produto.nome}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    {fabricantes[produto.id_fabricante]}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    {produto.status}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    {categorias[produto.id_categoria_produto] || "-"}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    <div className="gestao-section-container-btn">
                      <button
                        className="gestao-section-editar-btn gestao-section-item-btn"
                        onClick={() => editarSolucao(produto.id)}
                      >
                        <img src={editIcon} alt="Editar" />
                      </button>
                      <button
                        className={`${produto.status === "ativo" ? "gestao-section-excluir-btn " : "gestao-section-editar-btn "} gestao-section-item-btn`}
                        onClick={() =>
                          confirmarAlteracaoStatus(produto.id, produto.status)
                        }
                      >
                        <img
                          src={
                            produto.status === "ativo"
                              ? iconeInativar
                              : iconeAtivar
                          }
                          alt={
                            produto.status === "ativo" ? "Inativar" : "Ativar"
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
            Ainda não foram cadastrados soluções!
          </p>
        )}
      </div>
    </>
  );
}
