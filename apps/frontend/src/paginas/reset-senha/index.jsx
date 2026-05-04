import { useState, useEffect } from "react";
import "./style.css";
import Email from "../../utils/email";
import Api from "../../utils/api";
import MailResetSenha from "../../mail/reset-senha";
import Carregando from "../../componentes/carregando";
import imgResetSenha from "../../assets/images/img-reset-senha.png";
import { useNavigate } from "react-router-dom";

export default function ResetSenha() {
  const emailService = new Email();
  const api = new Api();
  const [email, setEmail] = useState("");
  const [hash, setHash] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParam = urlParams.get("hash");
    if (hashParam) {
      setHash(hashParam);
    }
  }, []);

  // Função para criar o delay de 1,5 segundos
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Função auxiliar para converter para Base64 (suporta UTF-8)
  const encodeBase64 = (str) => {
    return btoa(unescape(encodeURIComponent(str)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (hash) {
        if (password !== confirmPassword) {
          alert("As senhas não coincidem.");
          setLoading(false);
          return;
        }

        const res = await api.post("/reset-senha/reset", {
          hash: hash,
          senha: password,
        });
        await delay(1500);
        alert(res.message || "Senha redefinida com sucesso!");
        navigate("/");
      } else {
        const res = await api.post("/reset-senha", { email: email });

        if (!res || !res.resetSenha || !res.resetSenha.hash) {
          throw new Error("Erro ao recuperar a hash de redefinição");
        }

        const hash = res.resetSenha.hash;
        const mailReset = MailResetSenha(hash);

        // Codificando o HTML antes de enviar
        const htmlEncoded = encodeBase64(mailReset["reset-senha"].html);

        const emailData = {
          to: email,
          subject: mailReset["reset-senha"].subject,
          text: mailReset["reset-senha"].text,
          html: htmlEncoded,
        };

        console.log(emailData);

        await delay(1500);

        await emailService.sendEmail(emailData);
        alert("E-mail enviado com sucesso!");
        setEmail("");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert(`Erro ao processar a requisição: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Carregando />}
      <div id="reset-senha-container">
        <div className="reset-senha-container">
          <img
            className="img-reset-senha"
            src={imgResetSenha}
            alt="imagem reset senha"
          />
          {hash ? (
            <div id="reset-senha-form-container">
              <h2>Redefinir sua senha</h2>
              <form id="reset-senha-form" onSubmit={handleSubmit}>
                <label htmlFor="password">Nova Senha</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="confirm-password">Confirmar Senha</label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button className="reset-senha-btn" type="submit">
                  Redefinir Senha
                </button>
              </form>
            </div>
          ) : (
            <div id="reset-senha-form-container">
              <h2>Esqueceu sua senha?</h2>
              <p>Informe seu e-mail para redefinir sua senha.</p>
              <form id="reset-senha-form" onSubmit={handleSubmit}>
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="reset-senha-btn" type="submit">
                  Enviar
                </button>
                <button
                  className="reset-senha-btn"
                  id="reset-senha-btn-voltar"
                  type="button"
                  onClick={() => navigate("/")}
                >
                  Voltar
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
