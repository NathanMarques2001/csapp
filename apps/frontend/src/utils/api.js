import axios from "axios";

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    
    const hostname = window.location.hostname;
    if (hostname === 'csapp.prolinx.com.br') return 'https://csapp.prolinx.com.br/api';
    if (hostname === '20.186.19.140' || hostname === 'stage.csapp.prolinx.com.br') return `http://${hostname}/api`;
    
    return 'http://localhost:8080/api'; // Local dev
};

class Api {
    // Configuração dinâmica com base na URL acessada
    static baseUrl = getBaseUrl();

    constructor() {
        this.api = axios.create({
            baseURL: Api.baseUrl,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Interceptor para adicionar o token de autenticação
        this.api.interceptors.request.use(
            (config) => {
                const token = this.getCookie("jwtToken");
                if (token) {
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    async get(endpoint) {
        const res = await this.api.get(endpoint);
        return res.data;
    }

    async post(endpoint, data) {
        const res = await this.api.post(endpoint, data);
        return res.data;
    }

    async put(endpoint, data) {
        const res = await this.api.put(endpoint, data);
        return res.data;
    }

    async delete(endpoint) {
        const res = await this.api.delete(endpoint);
        return res.data;
    }
}

export default Api;
