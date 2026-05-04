import { useEffect, useState } from "react";
import Api from "../../utils/api";
import editIcon from "../../assets/icons/icon-lapis.png";
import iconeInativar from "../../assets/icons/icon-inativar.png";
import iconeAtivar from "../../assets/icons/icon-ativar.png";
import Carregando from "../../componentes/carregando";
import { useNavigate } from "react-router-dom";
import Popup from "../../componentes/pop-up";

export default function ClassificacoesClientes() {
  const api = new Api();
  const [classificacoes, setClassificacoes] = useState([]);
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
        const response = await api.get("/classificacoes-clientes");
        setClassificacoes(response.classificacoes);
      } catch (err) {
        console.error("Erro ao buscar classificações:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [atualizar]);

  const editarClassificacao = (id) => navigate(`/edicao-classificacao/${id}`);

  const alterarStatus = async () => {
    const { id } = configuracaoPopup;
    setConfiguracaoPopup((prev) => ({ ...prev, aberto: false }));
    setCarregando(true);
    try {
      const response = await api.get(`/classificacoes-clientes/${id}`);
      const novoStatus =
        response.classificacao.status === "ativo" ? "inativo" : "ativo";
      await api.put(`/classificacoes-clientes/${id}`, { status: novoStatus });
      setAtualizar((prev) => prev + 1);
    } catch (e) {
      console.error("Erro ao alterar status:", e);
    } finally {
      setCarregando(false);
    }
  };

  const confirmarAlteracaoStatus = (id, status) => {
    const titulos = {
      ativo: "Inativar Classificação",
      inativo: "Ativar Classificação",
    };
    const mensagens = {
      ativo:
        "Tem certeza que deseja inativar esta classificação? Clientes e grupos deixarão de ser vinculados automaticamente.",
      inativo:
        "Tem certeza que deseja ativar esta classificação? Ela voltará a ser usada na lógica de classificação automática.",
    };
    setConfiguracaoPopup({
      aberto: true,
      titulo: titulos[status],
      mensagem: mensagens[status],
      id,
    });
  };

  const classificacoesFiltradas = classificacoes.filter(({ nome }) =>
    nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const totalClassificacoes = classificacoesFiltradas.length;

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
          Classificações ({totalClassificacoes})
        </h3>
        <input
          type="text"
          placeholder="Procure pelo nome"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="gestao-section-input"
        />
        <button
          className="gestao-section-btn gestao-section-btn-verde"
          onClick={() => navigate("/cadastro-classificacao")}
        >
          Adicionar classificação
        </button>
        {classificacoes.length > 0 ? (
          <table className="gestao-section-tabela">
            <thead>
              <tr>
                <th className="gestao-section-titulo-tabela">Nome</th>
                <th className="gestao-section-titulo-tabela">Categoria</th>
                <th className="gestao-section-titulo-tabela">Qtd/Valor</th>
                <th className="gestao-section-titulo-tabela">Ações</th>
              </tr>
            </thead>
            <tbody>
              {classificacoesFiltradas.map(
                ({ id, nome, status, tipo_categoria, quantidade, valor }) => (
                  <tr key={id}>
                    <td className="gestao-section-conteudo-tabela">{nome}</td>
                    <td className="gestao-section-conteudo-tabela">
                      {tipo_categoria === "quantidade" ? "Quantidade" : "Valor"}
                    </td>
                    <td className="gestao-section-conteudo-tabela">
                      {tipo_categoria === "quantidade"
                        ? quantidade
                        : `R$ ${valor}`}
                    </td>
                    <td className="gestao-section-conteudo-tabela">
                      <div className="gestao-section-container-btn">
                        <button
                          className="gestao-section-editar-btn gestao-section-item-btn"
                          onClick={() => editarClassificacao(id)}
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
                            src={
                              status === "ativo" ? iconeInativar : iconeAtivar
                            }
                            alt={status === "ativo" ? "Inativar" : "Ativar"}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        ) : (
          <p className="gestao-section-sem-registros">
            Ainda não foram cadastradas classificações!
          </p>
        )}
      </div>
    </>
  );
}
