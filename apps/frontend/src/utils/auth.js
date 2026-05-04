import axios from "axios";

class Auth {
    // Configuração via variável de ambiente (Padrão Vite)
    static baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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
