import { useEffect, useState } from "react";
import Api from "../../utils/api";
import editIcon from "../../assets/icons/icon-lapis.png";
import iconeInativar from "../../assets/icons/icon-inativar.png";
import iconeAtivar from "../../assets/icons/icon-ativar.png";
import Carregando from "../../componentes/carregando";
import { useNavigate } from "react-router-dom";
import Popup from "../../componentes/pop-up";

export default function Fabricantes() {
  const api = new Api();
  const [fabricantes, setFabricantes] = useState([]);
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
        const fabricantesResponse = await api.get("/fabricantes");
        setFabricantes(fabricantesResponse.fabricantes);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [atualizar]);

  const editarFabricante = (id) => {
    navigate(`/edicao-fabricante/${id}`);
  };

  const alterarStatus = async () => {
    const { id } = configuracaoPopup;
    setConfiguracaoPopup((prev) => ({ ...prev, aberto: false }));
    setCarregando(true);
    try {
      const response = await api.get(`/fabricantes/${id}`);
      const novoStatus =
        response.fabricante.status === "ativo" ? "inativo" : "ativo";
      await api.put(`/fabricantes/${id}`, { status: novoStatus });
      setAtualizar((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  const confirmarAlteracaoStatus = (id, status) => {
    const titulos = {
      ativo: "Inativar Fabricante",
      inativo: "Ativar Fabricante",
    };
    const mensagens = {
      ativo:
        "Tem certeza que deseja inativar este fabricante? Após isso, não será possível utilizar este fabricante em novos produtos.",
      inativo:
        "Tem certeza que deseja ativar este fabricante? Após isso, será possível utilizar este fabricante em novos produtos.",
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

  const fabricantesFiltrados = fabricantes.filter((fabricante) =>
    fabricante.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const totalFabricantes = fabricantesFiltrados.length;

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
          Fornecedores ({totalFabricantes})
        </h3>
        <input
          type="text"
          placeholder="Procure pelo nome"
          value={termoBusca}
          onChange={aoBuscar}
          className="gestao-section-input"
        />
        <button
          className="gestao-section-btn"
          onClick={() => redirecionar("/cadastro-fabricante")}
        >
          Adicionar fornecedor
        </button>
        {fabricantes.length > 0 ? (
          <table className="gestao-section-tabela">
            <thead>
              <tr>
                <th className="gestao-section-titulo-tabela">Nome</th>
                <th className="gestao-section-titulo-tabela">Status</th>
                <th className="gestao-section-titulo-tabela">Ações</th>
              </tr>
            </thead>
            <tbody>
              {fabricantesFiltrados.map(({ id, nome, status }) => (
                <tr key={id}>
                  <td className="gestao-section-conteudo-tabela">{nome}</td>
                  <td className="gestao-section-conteudo-tabela">{status}</td>
                  <td className="gestao-section-conteudo-tabela">
                    <div className="gestao-section-container-btn">
                      <button
                        className="gestao-section-editar-btn gestao-section-item-btn"
                        onClick={() => editarFabricante(id)}
                      >
                        <img src={editIcon} alt="Editar" />
                      </button>
                      <button
                        className={`${status === "ativo"
                          ? "gestao-section-excluir-btn"
                          : "gestao-section-editar-btn"
                          } gestao-section-item-btn`}
                        onClick={() => confirmarAlteracaoStatus(id, status)}
                      >
                        <img
                          src={status === "ativo" ? iconeInativar : iconeAtivar}
                          alt={status === "ativo" ? "Inativar" : "Ativar"}
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
            Ainda não foram cadastrados fornecedores!
          </p>
        )}
      </div>
    </>
  );
}
