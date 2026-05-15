import axios from "axios";

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    
    const hostname = window.location.hostname;
    if (hostname === 'csapp.prolinx.com.br') return 'https://csapp.prolinx.com.br/api';
    if (hostname === '20.186.19.140' || hostname === 'stage.csapp.prolinx.com.br') return `http://${hostname}/api`;
    
    return 'http://localhost:8080/api'; // Local dev
};

class Auth {
    // Configuração dinâmica com base na URL acessada
    static baseUrl = getBaseUrl();

    constructor() {
        this.auth = axios.create({
            baseURL: Auth.baseUrl,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    async login(url, data) {
        try {
            const res = await this.auth.post(url, data);
            return res.data;
        } catch (err) {
            console.error("Login error:", err);
            throw err;
        }
    }
}

export default Auth;
