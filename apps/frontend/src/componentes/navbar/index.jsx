import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./style.css";
import iconeContratos from "../../assets/icons/icon-contratos.png";
import iconeUsuarios from "../../assets/icons/icon-usuarios.png";
import iconeCentralGestao from "../../assets/icons/icon-central-gestao.png";
import iconeSair from "../../assets/icons/icon-sair.png";
import iconeRelatorios from "../../assets/icons/icon-relatorios.png";
import logo from "../../assets/images/logo.png";
import Popup from "../pop-up";
import SinoNotificacao from "../sino-notificacao";

export default function Navbar() {
  const [cookies, , removeCookie] = useCookies(["jwtToken", "nomeUsuario", "id", "tipo"]);
  const [adminOuDev, setAdminOuDev] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (cookies.tipo === "dev" || cookies.tipo === "admin") {
      setAdminOuDev(true);
    } else {
      setAdminOuDev(false);
    }
  }, [cookies.tipo]);

  function deslogar() {
    removeCookie("jwtToken", { path: "/" });
    removeCookie("nomeUsuario", { path: "/" });
    removeCookie("id", { path: "/" });
    removeCookie("tipo", { path: "/" });
    setMostrarPopup(false);

    const tenantId = "common";
    const retornoParaLogin = "https://csapp.prolinx.com.br/login";
    window.location.href = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${retornoParaLogin}`;
  }

  return (
    <>
      {mostrarPopup && (
        <Popup
          title="Deslogar"
          message="Tem certeza que deseja sair?"
          onConfirm={deslogar}
          onCancel={() => setMostrarPopup(false)}
        />
      )}

      {/* 🧩 Popup para concluir notificação */}


      <ToastContainer />

      <div id="navbar-preenchimento"></div>
      <nav id="navbar-container">
        <img src={logo} alt="logo prolinx" id="logo-img" />
        <div id="navbar-links-client">
          <div id="navbar-links">
            <Link to="/clientes" className="link">
              <img className="navbar-icon" src={iconeUsuarios} alt="ícone cliente" />
              <span className="navbar-span">Clientes</span>
            </Link>
            <Link to="/contratos" className="link">
              <img className="navbar-icon" src={iconeContratos} alt="ícone contrato" />
              <span className="navbar-span">Contratos</span>
            </Link>
            {adminOuDev && (
              <Link to="/gestao" className="link">
                <img className="navbar-icon" src={iconeCentralGestao} alt="ícone gestão" />
                <span className="navbar-span">Gestão</span>
              </Link>
            )}
            <Link to="/relatorios" className="link">
              <img className="navbar-icon" src={iconeRelatorios} alt="ícone relatórios" />
              <span className="navbar-span">Relatórios</span>
            </Link>
          </div>

          <div id="navbar-client">
            <span id="navbar-nomeUsuario" className="navbar-span">
              {cookies.nomeUsuario}
            </span>

            <SinoNotificacao />
          </div>
        </div>

        <button id="navbar-btn" onClick={() => setMostrarPopup(true)}>
          <img className="navbar-icon" src={iconeSair} alt="ícone sair" />
          <span className="navbar-span">Sair</span>
        </button>
      </nav>
    </>
  );
}
