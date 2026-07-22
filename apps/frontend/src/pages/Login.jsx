import React, { useState } from 'react';
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Auth from "../utils/auth";

// Simplified UI Components for Login
const Button = ({ children, variant = 'primary', className = '', icon: Icon, isLoading, ...props }) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full shadow-sm";
    const variants = {
        primary: 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white focus:ring-teal-500 shadow-teal-500/30 hover:shadow-teal-500/50',
        outline: "bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-500 hover:border-slate-300",
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : Icon && <Icon className="w-5 h-5 mr-2" />}
            {children}
        </button>
    );
};

const Input = ({ label, icon: Icon, type = "text", ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const currentType = isPasswordField ? (showPassword ? "text" : "password") : type;

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
            <div className="relative group">
                {Icon && <Icon className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />}
                <input
                    type={currentType}
                    className={`flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all focus:bg-white ${Icon ? 'pl-11' : ''} ${isPasswordField ? 'pr-11' : ''}`}
                    {...props}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default function Login() {
    const auth = new Auth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [error, setError] = useState("");

    // Note: Assuming dev environment logic is desired as per legacy code
    const isDev = ["localhost", "127.0.0.1", "20.186.19.140", "stage.csapp.prolinx.com.br"].includes(window.location.hostname);
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
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500 blur-3xl mix-blend-multiply opacity-70"></div>
                    <div className="absolute top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500 blur-3xl mix-blend-multiply opacity-70"></div>
                    <div className="absolute -bottom-40 left-20 w-96 h-96 rounded-full bg-blue-500 blur-3xl mix-blend-multiply opacity-70"></div>
                </div>
                
                <div className="relative z-10 p-12 text-center flex flex-col items-center">
                    <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md mb-8 border border-white/20 shadow-2xl">
                        <img src="/logo.png" alt="CSApp Logo" className="h-24 w-auto object-contain filter drop-shadow-md" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight font-montserrat mb-4">CSApp</h1>
                    <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                        A plataforma completa para gestão e sucesso do seu cliente.
                    </p>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
                    <img src="/logo.png" alt="CSApp Logo" className="h-8 w-auto object-contain" />
                    <span className="font-bold text-slate-900 font-montserrat tracking-tight">CSApp</span>
                </div>
                
                <div className="w-full max-w-md space-y-10 mt-8 lg:mt-0">
                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo(a)</h2>
                        <p className="text-slate-500 text-base">Faça login na sua conta para continuar.</p>
                    </div>

                    <form onSubmit={fazerLogin} className="space-y-6">
                        {isDev && (
                            <>
                                <Input
                                    label="E-mail"
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

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" isLoading={carregando} className="mt-2">
                                    Entrar na Plataforma
                                </Button>

                                <div className="relative flex py-4 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">Ou continue com</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>
                            </>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 text-base font-medium"
                            onClick={() => window.location.href = "https://csapp.prolinx.com.br/api/usuarios/login-microsoft"}
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1H10V10H1V1Z" fill="#F25022" />
                                <path d="M11 1H20V10H11V1Z" fill="#7FBA00" />
                                <path d="M1 11H10V20H1V11Z" fill="#00A4EF" />
                                <path d="M11 11H20V20H11V11Z" fill="#FFB900" />
                            </svg>
                            Entrar com Microsoft
                        </Button>
                    </form>

                    <div className="pt-8">
                        <p className="text-center text-sm text-slate-400 font-medium">
                            &copy; {new Date().getFullYear()} Prolinx. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
