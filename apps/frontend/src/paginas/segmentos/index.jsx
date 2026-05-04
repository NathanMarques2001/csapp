import { useEffect, useState } from "react";
import Api from "../../utils/api";
import editIcon from "../../assets/icons/icon-lapis.png";
import iconeInativar from "../../assets/icons/icon-inativar.png";
import iconeAtivar from "../../assets/icons/icon-ativar.png";
import Carregando from "../../componentes/carregando";
import { useNavigate } from "react-router-dom";
import Popup from "../../componentes/pop-up";

export default function Segmentos() {
  const api = new Api();
  const [segmentos, setSegmentos] = useState([]);
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
        const response = await api.get("/segmentos");
        setSegmentos(response.segmentos);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [atualizar]);

  const editarSegmento = (id) => navigate(`/edicao-segmento/${id}`);

  const alterarStatus = async () => {
    const { id } = configuracaoPopup;
    setConfiguracaoPopup((prev) => ({ ...prev, aberto: false }));
    setCarregando(true);
    try {
      const response = await api.get(`/segmentos/${id}`);
      const novoStatus =
        response.segmento.status === "ativo" ? "inativo" : "ativo";
      await api.put(`/segmentos/${id}`, { status: novoStatus });
      setAtualizar((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  const confirmarAlteracaoStatus = (id, status) => {
    const titulos = {
      ativo: "Inativar Segmento",
      inativo: "Ativar Segmento",
    };
    const mensagens = {
      ativo:
        "Tem certeza que deseja inativar este segmento? Após isso, não será possível criar clientes com o mesmo.",
      inativo:
        "Tem certeza que deseja ativar este segmento? Após isso, será possível criar clientes com o mesmo.",
    };
    setConfiguracaoPopup({
      aberto: true,
      titulo: titulos[status],
      mensagem: mensagens[status],
      id,
    });
  };

  const segmentosFiltrados = segmentos.filter(({ nome }) =>
    nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const totalSegmentos = segmentosFiltrados.length;

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
          Segmentos ({totalSegmentos})
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
          onClick={() => navigate("/cadastro-segmento")}
        >
          Adicionar segmento
        </button>
        {segmentos.length > 0 ? (
          <table className="gestao-section-tabela">
            <thead>
              <tr>
                <th className="gestao-section-titulo-tabela">Nome</th>
                <th className="gestao-section-titulo-tabela">Status</th>
                <th className="gestao-section-titulo-tabela">Ações</th>
              </tr>
            </thead>
            <tbody>
              {segmentosFiltrados.map(({ id, nome, status }) => (
                <tr key={id}>
                  <td className="gestao-section-conteudo-tabela">{nome}</td>
                  <td className="gestao-section-conteudo-tabela">{status}</td>
                  <td className="gestao-section-conteudo-tabela">
                    <div className="gestao-section-container-btn">
                      <button
                        className="gestao-section-editar-btn gestao-section-item-btn"
                        onClick={() => editarSegmento(id)}
                      >
                        <img src={editIcon} alt="Editar" />
                      </button>
                      <button
                        className={`${status === "ativo" ? "gestao-section-excluir-btn " : "gestao-section-editar-btn "} gestao-section-item-btn`}
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
            Ainda não foram cadastrados segmentos!
          </p>
        )}
      </div>
    </>
  );
}
