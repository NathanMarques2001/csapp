import { useEffect, useState } from "react";
import Api from "../../utils/api";
import Carregando from "../../componentes/carregando";
import editIcon from "../../assets/icons/icon-lapis.png";
import iconeExcluir from "../../assets/icons/icon-lixeira.png";
import { useNavigate } from "react-router-dom";
import formataTipoUsuario from "../../utils/formataTipoUsuario";
import PopUpMigrate from "../../componentes/pop-up-migrate";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function Usuarios() {
  const api = new Api();
  const [resposta, setResposta] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [idAntigo, setIdAntigo] = useState(null);
  const [reload, setReload] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setCarregando(true);
        const dados = await api.get("/usuarios");
        setResposta(dados);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, [reload]);

  const aoBuscar = (event) => {
    setTermoBusca(event.target.value);
  };

  const editarUsuario = async (id) => {
    try {
      setCarregando(true);
      const dadosUsuario = await api.get(`/usuarios/${id}`);
      if (dadosUsuario) {
        navigate(`/edicao-usuario/${id}`, { state: { userData: dadosUsuario } });
      } else {
        console.error(`Usuário com id ${id} não encontrado.`);
      }
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
    } finally {
      setCarregando(false);
    }
  };

  const excluirUsuario = (id) => {
    setModalAberto(true);
    setIdAntigo(id);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const usuariosFiltrados =
    resposta && resposta.usuarios
      ? resposta.usuarios.filter((usuario) =>
        usuario.nome.toLowerCase().includes(termoBusca.toLowerCase())
      )
      : [];

  const totalUsuarios = usuariosFiltrados.length;

  return (
    <>
      {carregando && <Carregando />}
      {modalAberto && (
        <PopUpMigrate
          id_antigo={idAntigo}
          fechar={fecharModal}
          reload={() => setReload((prev) => prev + 1)}
        />
      )}
      <div>
        <h3 className="gestao-section-subtitulo">Usuários ({totalUsuarios})</h3>
        <input
          type="text"
          placeholder="Procure pelo seu nome"
          value={termoBusca}
          onChange={aoBuscar}
          className="gestao-section-input"
        />
        {/* <button
          onClick={handleAddUser}
          className="gestao-section-btn gestao-section-btn-verde"
        >
          Adicionar Usuário
        </button> */}
        {resposta && resposta.usuarios ? (
          <table className="gestao-section-tabela">
            <thead>
              <tr>
                <th className="gestao-section-titulo-tabela">Nome</th>
                <th className="gestao-section-titulo-tabela">Função</th>
                <th className="gestao-section-titulo-tabela">Email</th>
                <th className="gestao-section-titulo-tabela">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="gestao-section-conteudo-tabela">
                    {usuario.nome}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    {formataTipoUsuario(usuario.tipo)}
                  </td>
                  <td className="gestao-section-conteudo-tabela">
                    {usuario.email}
                  </td>
                  <td className="gestao-section-conteudo-tabela gestao-section-container-btn">
                    <button
                      className="gestao-section-editar-btn gestao-section-item-btn"
                      onClick={() => editarUsuario(usuario.id)}
                      disabled={usuario.tipo == "Dev"}
                    >
                      <img src={editIcon} alt="" />
                    </button>
                    <button
                      className="gestao-section-excluir-btn gestao-section-item-btn"
                      onClick={() => excluirUsuario(usuario.id)}
                      disabled={usuario.tipo == "Dev"}
                    >
                      <img src={iconeExcluir} alt="" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="gestao-section-sem-registros">
            Ainda não foram cadastrados usuários!
          </p>
        )}
      </div>
    </>
  );
}
