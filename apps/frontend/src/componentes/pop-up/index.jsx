import "./style.css";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function Popup({ title, message, onConfirm, onCancel }) {
  return (
    <div className="popup-container">
      <div className="popup">
        <p id="popup-titulo">{title}</p>
        <p id="popup-mensagem">{message}</p>
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
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
