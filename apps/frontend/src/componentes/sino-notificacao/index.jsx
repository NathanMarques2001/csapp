import { useEffect, useState, useRef } from "react";
import { FaRegBell } from "react-icons/fa";
import { useCookies } from "react-cookie";
import Api from "../../utils/api";
import Popup from "../pop-up";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";

export default function SinoNotificacao({ }) {
    const [notificacoes, setNotificacoes] = useState([]);
    const [cookies] = useCookies(["jwtToken", "id", "tipo"]);
    const api = new Api();
    const [panelOpen, setPanelOpen] = useState(false);
    const [popupConcluir, setPopupConcluir] = useState(false);
    const [notifSelecionada, setNotifSelecionada] = useState(null);
    const navigate = useNavigate();
    const panelRef = useRef(null);

    async function carregarNotificacoes() {
        try {
            const url = `/notificacoes/usuario/${cookies.id}`;

            const response = await api.get(url);
            
            const pendentes = (response || []).filter((n) => !n.confirmado_sn);
            setNotificacoes(pendentes);
        } catch (err) {
            console.error("Erro ao carregar notificações", err);
            setNotificacoes([]);
        }
    }

    useEffect(() => {
        if (cookies.id) carregarNotificacoes();
    }, [cookies.id]);

    // Polling: atualiza notificações a cada 30s
    useEffect(() => {
        const idInterval = setInterval(() => {
            if (cookies.id) carregarNotificacoes();
        }, 30000);
        return () => clearInterval(idInterval);
    }, [cookies.id]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setPanelOpen(false);
            }
        }
        if (panelOpen) window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, [panelOpen]);

    // Fecha painel com ESC
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") setPanelOpen(false);
        }
        if (panelOpen) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [panelOpen]);

    async function confirmarNotificacao(id) {
        try {
            await api.put(`/notificacoes/${id}/confirmar`);
            toast.success("Notificação concluída com sucesso!", { position: "top-center", autoClose: 2000 });
            setPopupConcluir(false);
            setNotifSelecionada(null);
            setPanelOpen(false);
            await carregarNotificacoes();
        } catch (err) {
            console.error("Erro ao concluir notificação:", err);
            toast.error("Erro ao concluir notificação.", { position: "top-center" });
        }
    }

    return (
        <div id="sino-notificacao-root">
            {!panelOpen && (
                <button id="sino-notificacao-sino" onClick={() => setPanelOpen((s) => !s)}>
                    <FaRegBell color="#000000" size={28} />
                    {notificacoes.length > 0 && (
                        <span className="badge-notificacoes">{notificacoes.length}</span>
                    )}
                </button>
            )}

            {panelOpen && (
                <div id="sino-notificacao-panel" ref={panelRef}>
                    <div className="toast-notificacoes">
                        <div className="toast-header">
                            <h4>🔔 Notificações</h4>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <button className="toast-fechar" onClick={() => setPanelOpen(false)}>Fechar</button>
                            </div>
                        </div>

                        {notificacoes.length === 0 ? (
                            <div className="toast-empty">Nenhuma notificação pendente 😊</div>
                        ) : (
                            notificacoes.map((n) => (
                                <div key={n.id} className="toast-item">
                                    <p className="toast-desc">{n.descricao}</p>

                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            className="toast-link"
                                            onClick={() => {
                                                setPanelOpen(false);
                                                navigate(`/edicao-contrato/${n.id_contrato}`);
                                            }}
                                        >
                                            Ver contrato
                                        </button>

                                        <button
                                            className="toast-concluir"
                                            onClick={() => {
                                                setNotifSelecionada(n);
                                                setPopupConcluir(true);
                                            }}
                                        >
                                            Concluir
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {popupConcluir && notifSelecionada && (
                <Popup
                    title="Concluir Notificação"
                    message="Tem certeza que deseja concluir essa notificação? Essa ação é irreversível."
                    onConfirm={() => confirmarNotificacao(notifSelecionada.id)}
                    onCancel={() => setPopupConcluir(false)}
                />
            )}
        </div>
    );
}
