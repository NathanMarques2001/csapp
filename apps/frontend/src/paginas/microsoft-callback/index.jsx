import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";

import Carregando from "../../componentes/carregando"; // Reutilizando seu componente de loading
import "./style.css"; // Vamos criar um CSS simples para ele

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para acessar a URL atual
  const [cookies, setCookie] = useCookies(["jwtToken", "nomeUsuario", "id", "tipo"]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processToken = () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) throw new Error("Token não encontrado.");

        const decodedToken = jwtDecode(token);
        const { id, nome, tipo } = decodedToken;

        // Configuração de expiração
        const expireAt = new Date();
        expireAt.setHours(expireAt.getHours() + 8);
        const options = { path: "/", expires: expireAt };

        // 1. Define os cookies
        setCookie("jwtToken", token, options);
        setCookie("nomeUsuario", nome, options);
        setCookie("id", id, options);
        setCookie("tipo", tipo, options);

        // 2. CORREÇÃO: Pequeno delay para garantir que o navegador persista o cookie
        // e o React propague o estado antes de mudar a rota.
        setTimeout(() => {
          // Opcional: Verificação de segurança dupla
          // if (document.cookie.includes("jwtToken")) { ... }
          navigate("/contratos", { replace: true });
        }, 100);

      } catch (err) {
        console.error("Erro no callback:", err.message);
        setError(err.message);
        setTimeout(() => navigate("/login", { replace: true }), 4000);
      }
    };

    processToken();
  }, [location]);

  // Se houver um erro, exibe a mensagem de erro.
  if (error) {
    return (
      <div className="callback-container">
        <div className="callback-box">
          <h2>Erro na Autenticação</h2>
          <p className="callback-error-message">{error}</p>
          <p>Você será redirecionado para a página de login.</p>
        </div>
      </div>
    );
  }

  // Enquanto processa, exibe o seu componente de Loading
  return <Carregando />;
}
