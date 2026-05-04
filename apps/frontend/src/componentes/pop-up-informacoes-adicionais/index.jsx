import { useState } from "react";
import "./style.css";
import Api from "../../utils/api";
import Carregando from "../carregando";
import { useParams } from "react-router-dom";

export default function PopupInformacoes({
  title,
  conteudo,
  cardID,
  onConfirm,
  onCancel,
}) {
  const [descricao, setDescricao] = useState(conteudo || "");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const api = new Api();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!cardID) {
        // Verifica se cardID é nulo ou vazio para criar um novo registro
        if (title === "Contato Comercial") {
          await api.post("/contatos-comerciais", {
            id_cliente: id,
            conteudo: descricao,
          });
        } else if (title === "Contato Técnico") {
          await api.post("/contatos-tecnicos", {
            id_cliente: id,
            conteudo: descricao,
          });
        } else if (title === "Fatos Importantes") {
          await api.post("/fatos-importantes", {
            id_cliente: id,
            conteudo: descricao,
          });
        }
      } else {
        // Caso contrário, atualiza o registro existente
        if (title === "Contato Comercial") {
          await api.put(`/contatos-comerciais/${cardID}`, {
            id_cliente: id,
            conteudo: descricao,
          });
        } else if (title === "Contato Técnico") {
          await api.put(`/contatos-tecnicos/${cardID}`, {
            id_cliente: id,
            conteudo: descricao,
          });
        } else if (title === "Fatos Importantes") {
          await api.put(`/fatos-importantes/${cardID}`, {
            id_cliente: id,
            conteudo: descricao,
          });
        }
      }
    } catch (e) {
      console.error("Error submitting contact data:", e);
      alert("Erro ao salvar contato.");
    } finally {
      setLoading(false);
      onConfirm();
    }
  };

  return (
    <>
      {loading && <Carregando />}
      <div className="popup-container">
        <div className="popup">
          <p id="popup-titulo">{title}</p>
          <div className="pop-up-container-label-textarea">
            <label htmlFor="descricao">
              <b>
                Descrição breve <span className="required">*</span>
              </b>
            </label>
            <textarea
              name="descricao"
              id="pop-up-descricao"
              placeholder="Detalhe o contato aqui..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            ></textarea>
          </div>
          <div className="popup-botoes">
            <button
              className="popup-botao"
              id="popup-botao-cancelar"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              className="popup-botao"
              id="popup-botao-confirmar"
              onClick={handleSubmit}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
