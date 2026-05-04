import "./style.css";
import logo from "../../assets/images/logo.png";
import imgLogin from "../../assets/images/img-login.png";
import logoMicrosoft from "../../assets/icons/microsoft.png";
import Auth from "../../utils/auth";
import { useState } from "react";
import { useCookies } from "react-cookie";
import Carregando from "../../componentes/carregando";
import { useNavigate } from "react-router-dom";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function Login() {
  const auth = new Auth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const [, setCookie] = useCookies(["jwtToken", "nomeUsuario", "id", "tipo"]);
  const navigate = useNavigate();

  async function fazerLogin(evento) {
    try {
      setCarregando(true);
      evento.preventDefault();

      const agora = new Date();
      const expiraEm = new Date(agora);
      expiraEm.setHours(6, 0, 0, 0); // Define a expiração para as 6h da manhã

      if (agora > expiraEm) {
        expiraEm.setDate(expiraEm.getDate() + 1); // Se já passou das 6h, define para o próximo dia
      }

      const tempoExpiracao = expiraEm.getTime() - agora.getTime(); // Calcula o tempo restante em milissegundos

      const resposta = await auth.login("/usuarios/login", {
        email: email,
        senha: senha,
      });
      if (resposta.token !== "") {
        setCookie("jwtToken", resposta.token, {
          maxAge: tempoExpiracao / 1000,
        }); // Define o token com expiração calculada
        setCookie("nomeUsuario", resposta.usuario.nome, {
          maxAge: tempoExpiracao / 1000,
        }); // Define o nome do usuário
        setCookie("id", resposta.usuario.id, { maxAge: tempoExpiracao / 1000 });
        setCookie("tipo", resposta.usuario.tipo, {
          maxAge: tempoExpiracao / 1000,
        });
        navigate("/contratos");
      }
    } catch (erro) {
      console.log(erro);
    } finally {
      setCarregando(false);
    }
  }

  // const resetSenha = () => {
  //   navigate("/reset-senha");
  // };

  return (
    <>
      {carregando && <Carregando />}
      <div id="login-container">
        <div className="login-container">
          <img className="logo" src={logo} alt="logo" />
          <div className="lower-container">
            <div id="form-container">
              <h1>Bem Vindo(a)!</h1>
              <form id="form">
                {isDev && (
                  <>
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="login-input"
                      placeholder="Entre com o endereço de email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="senha" className="form-label">
                      Senha
                    </label>
                    <input
                      id="senha"
                      type="password"
                      className="login-input"
                      placeholder="Entre com sua senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />

                    <button
                      onClick={(e) => fazerLogin(e)}
                      className="login-button"
                      id="login-button"
                    >
                      Entrar
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                  (window.location.href =
                    "https://csapp.prolinx.com.br/api/usuarios/login-microsoft")
                  }
                  className="login-button"
                  id="login-microsoft-button"
                >
                  <img
                    src={logoMicrosoft}
                    alt="logo microsoft"
                    id="img-microsoft"
                  />
                  Entrar com Microsoft
                </button>

                {/* <button onClick={resetSenha} id="reset-senha">
                  Esqueci minha senha
                </button> */}
              </form>
            </div>

            <img className="imagem-login" src={imgLogin} alt="tela-login" />
          </div>
        </div>
      </div>
    </>
  );
}
