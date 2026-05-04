import "./style.css";
import imgExcluir from "../../assets/icons/icon-lixeira.png";
import { useEffect, useState } from "react";
import Popup from "../pop-up";
import Api from "../../utils/api";

export default function CardContato({
  titulo,
  contatos,
  abrirPopUp,
  permissao,
  renderizar,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [idContato, setIdContato] = useState(null);
  const [tituloContato, setTituloContato] = useState("");
  const api = new Api();

  useEffect(() => {
    if (titulo === "Contato Comercial") {
      setTituloContato("contatos-comerciais");
    } else if (titulo === "Contato Técnico") {
      setTituloContato("contatos-tecnicos");
    } else if (titulo === "Fatos Importantes") {
      setTituloContato("fatos-importantes");
    }
  }, [titulo]);

  const confirmarExclusao = async () => {
    try {
      await api.delete(`/${tituloContato}/${idContato}`);
      setModalAberto(false);
      renderizar();
    } catch (err) {
      console.error("Erro ao excluir contato:", err);
    }
  };

  const excluirContato = (id) => {
    setModalAberto(true);
    setIdContato(id);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  return (
    <>
      {modalAberto && (
        <Popup
          title="Excluir contato"
          message="Tem certeza que deseja excluir este contato?"
          onConfirm={() => {
            confirmarExclusao();
          }}
          onCancel={fecharModal}
        />
      )}
      <div className="card-cliente-contatos">
        <div className="card-cliente-contatos-titulo-btn">
          <p className="card-cliente-contatos-titulo">{titulo}</p>
          <button
            className={`card-cliente-contatos-btn ${permissao ? "disabled" : ""}`}
            onClick={(e) => abrirPopUp(e, titulo)}
            disabled={permissao}
          >
            +
          </button>
        </div>
        <div className="card-cliente-contatos-container-conteudos">
          {contatos.map((contato) => (
            <div className="card-cliente-conteudo-btn">
              <p
                onClick={(e) =>
                  abrirPopUp(e, titulo, contato.conteudo, contato.id)
                }
                className="card-cliente-contatos-conteudo"
                key={contato.id}
              >
                {contato.conteudo}
              </p>
              <button
                onClick={() => {
                  excluirContato(contato.id);
                }}
                className="gestao-section-excluir-btn gestao-section-item-btn card-cliente-btn"
                disabled={permissao}
              >
                <img src={imgExcluir} alt="" className="card-cliente-img-btn" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
