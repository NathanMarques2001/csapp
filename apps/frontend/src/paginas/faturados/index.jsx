import { useEffect, useState } from "react";
import Api from "../../utils/api";
import editIcon from "../../assets/icons/icon-lapis.png";
import iconeInativar from "../../assets/icons/icon-inativar.png";
import iconeAtivar from "../../assets/icons/icon-ativar.png";
import Carregando from "../../componentes/carregando";
import Popup from "../../componentes/pop-up";
import { useNavigate } from "react-router-dom";

export default function Faturados() {
  const api = new Api();
  const [faturados, setFaturados] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
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
        const faturadosResponse = await api.get("/faturados");
        setFaturados(faturadosResponse.faturados);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  const editarFaturado = (id) => {
    navigate(`/edicao-faturado/${id}`);
  };

  const confirmarAlteracaoStatus = (id, status) => {
    const titulos = {
      ativo: "Inativar Faturista",
      inativo: "Ativar Faturista",
    };
    const mensagens = {
      ativo:
        "Tem certeza que deseja inativar este faturista? Após isso, ele não estará mais disponível.",
      inativo:
        "Tem certeza que deseja ativar este faturista? Após isso, ele estará disponível para uso.",
    };
    setConfiguracaoPopup({
      aberto: true,
      titulo: titulos[status],
      mensagem: mensagens[status],
      id,
    });
  };

  const alterarStatus = async () => {
    const { id } = configuracaoPopup;
    setConfiguracaoPopup((prev) => ({ ...prev, aberto: false }));
    setCarregando(true);
    try {
      const response = await api.get(`/faturados/${id}`);
      const novoStatus =
        response.faturado.status === "ativo" ? "inativo" : "ativo";
      await api.put(`/faturados/${id}`, { status: novoStatus });
      setFaturados((prev) =>
        prev.map((faturado) =>
          faturado.id === id ? { ...faturado, status: novoStatus } : faturado
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  const aoBuscar = (event) => {
    setTermoBusca(event.target.value);
  };

  const redirecionar = (url) => {
    navigate(url);
  };

  const faturadosFiltrados = faturados.filter((faturado) =>
    faturado.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const totalFaturados = faturadosFiltrados.length;

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
          Faturistas ({totalFaturados})
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
          onClick={() => redirecionar("/cadastro-faturado")}
        >
          Adicionar faturista
        </button>
        {faturados.length > 0 ? (
          <table className="gestao-section-tabela">
            <thead>
              <tr>
                <th className="gestao-section-titulo-tabela">Nome</th>
                <th className="gestao-section-titulo-tabela">Status</th>
                <th className="gestao-section-titulo-tabela">Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturadosFiltrados.map((faturado) => (
                <tr key={faturado.id}>
                  <td className="gestao-section-conteudo-tabela">
                    {faturado.nome}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    {faturado.status}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    <div className="gestao-section-container-btn">
                      <button
                        className="gestao-section-editar-btn gestao-section-item-btn"
                        onClick={() => editarFaturado(faturado.id)}
                      >
                        <img src={editIcon} alt="Editar" />
                      </button>
                      <button
                        className={`${faturado.status === "ativo" ? "gestao-section-excluir-btn" : "gestao-section-editar-btn"} gestao-section-item-btn`}
                        onClick={() =>
                          confirmarAlteracaoStatus(faturado.id, faturado.status)
                        }
                      >
                        <img
                          src={
                            faturado.status === "ativo"
                              ? iconeInativar
                              : iconeAtivar
                          }
                          alt={
                            faturado.status === "ativo" ? "Inativar" : "Ativar"
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
            Ainda não foram cadastrados faturistas!
          </p>
        )}
      </div>
    </>
  );
}
