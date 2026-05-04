import React, { useState } from 'react';
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, Lock, Mail } from 'lucide-react';
import Auth from "../utils/auth";

// Simplified UI Components for Login
const Button = ({ children, variant = 'primary', className = '', icon: Icon, isLoading, ...props }) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-10 w-full";
    const variants = {
        primary: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500',
        outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500",
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};

const Input = ({ label, icon: Icon, type = "text", ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />}
            <input
                type={type}
                className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${Icon ? 'pl-9' : ''}`}
                {...props}
            />
        </div>
    </div>
);

export default function Login() {
    const auth = new Auth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [error, setError] = useState("");

    // Note: Assuming dev environment logic is desired as per legacy code
    const isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const [, setCookie] = useCookies(["jwtToken", "nomeUsuario", "id", "tipo"]);
    const navigate = useNavigate();

    async function fazerLogin(evento) {
        evento.preventDefault();
        try {
            setCarregando(true);
            setError("");

            const agora = new Date();
            const expiraEm = new Date(agora);
            expiraEm.setHours(6, 0, 0, 0);

            if (agora > expiraEm) {
                expiraEm.setDate(expiraEm.getDate() + 1);
            }

            const tempoExpiracao = expiraEm.getTime() - agora.getTime();

            const resposta = await auth.login("/usuarios/login", {
                email: email,
                senha: senha,
            });

            if (resposta.token !== "") {
                const maxAgeSeconds = Math.floor(tempoExpiracao / 1000);
                setCookie("jwtToken", resposta.token, { maxAge: maxAgeSeconds });
                setCookie("nomeUsuario", resposta.usuario.nome, { maxAge: maxAgeSeconds });
                setCookie("id", resposta.usuario.id, { maxAge: maxAgeSeconds });
                setCookie("tipo", resposta.usuario.tipo, { maxAge: maxAgeSeconds });
                navigate("/dashboard"); // Redirect to dashboard instead of root contracts page
            }
        } catch (erro) {
            console.error(erro);
            setError("Falha no login. Verifique suas credenciais.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 px-8 py-8 text-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight font-montserrat">CSApp</h1>
                    <p className="text-slate-400 text-sm mt-2">Plataforma de Gestão Integrada</p>
                </div>

                {/* Form Body */}
                <div className="p-8 space-y-6">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-slate-900">Bem-vindo de volta!</h2>
                        <p className="text-slate-500 text-sm">Acesse sua conta para continuar.</p>
                    </div>

                    <form onSubmit={fazerLogin} className="space-y-4">
                        {isDev && (
                            <>
                                <Input
                                    label="Email"
                                    icon={Mail}
                                    placeholder="seu@email.com.br"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Senha"
                                    icon={Lock}
                                    type="password"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />

                                {error && <div className="text-rose-500 text-sm text-center font-medium bg-rose-50 p-2 rounded">{error}</div>}

                                <Button type="submit" isLoading={carregando}>
                                    Entrar
                                </Button>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-medium tracking-wider">Ou</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>
                            </>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            className="relative"
                            onClick={() => window.location.href = "https://csapp.prolinx.com.br/api/usuarios/login-microsoft"}
                        >
                            {/* Simulated Microsoft Logo if image fails */}
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1H10V10H1V1Z" fill="#F25022" />
                                <path d="M11 1H20V10H11V1Z" fill="#7FBA00" />
                                <path d="M1 11H10V20H1V11Z" fill="#00A4EF" />
                                <path d="M11 11H20V20H11V11Z" fill="#FFB900" />
                            </svg>
                            Entrar com Microsoft
                        </Button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        &copy; {new Date().getFullYear()} Prolinx. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
