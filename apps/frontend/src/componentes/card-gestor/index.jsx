// Estilos, funcoes, classes, imagens e etc
import "./style.css";
import iconeGestor from "../../assets/icons/icon-gestor.png";
import iconeEmail from "../../assets/icons/icon-email.png";
import iconeTelefone from "../../assets/icons/icon-telefone.png";
import iconeTelefoneAdicional from "../../assets/icons/icon-telefone-adicional.png";

export default function CardGestor({
  titulo,
  nome,
  email,
  telefone1,
  telefone2,
}) {
  return (
    <div className="cliente-card-gestor">
      <p className="cliente-card-gestor-titulo">{titulo}</p>
      <div className="card-cliente-gestor-container-conteudos">
        <p className="card-cliente-gestor-informacoes-gestor">
          <img
            className="card-cliente-gestor-icone"
            src={iconeGestor}
            alt={`Ícone nome ${titulo}`}
          />
          {nome}
        </p>
        <p className="card-cliente-gestor-informacoes-gestor">
          <img
            className="card-cliente-gestor-icone"
            src={iconeEmail}
            alt={`Ícone email ${titulo}`}
          />
          {email}
        </p>
        <p className="card-cliente-gestor-informacoes-gestor">
          <img
            className="card-cliente-gestor-icone"
            src={iconeTelefone}
            alt={`Ícone telefone um ${titulo}`}
          />
          {telefone1}
        </p>
        <p className="card-cliente-gestor-informacoes-gestor">
          <img
            className="card-cliente-gestor-icone"
            src={iconeTelefoneAdicional}
            alt={`Ícone telefone dois ${titulo}`}
          />
          {telefone2}
        </p>
      </div>
    </div>
  );
}
