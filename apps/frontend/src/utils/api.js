import axios from "axios";
import cookie from "cookie";

class Api {
  // Configuração via variável de ambiente (Padrão CRA)
  static baseUrl = "https://csapp.prolinx.com.br/api";

  constructor() {
    this.api = axios.create({
      baseURL: Api.baseUrl,
      // headers: {
      //   "Content-Type": "application/json",
      // },
    });

    // Interceptor para adicionar o token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        const cookies = document.cookie;
        const parsedCookies = cookie.parse(cookies);
        const token = parsedCookies["jwtToken"];

        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async get(url) {
    const res = await this.api.get(url);
    return res.data;
  }

  async post(url, data) {
    const isFormData = data instanceof FormData;
    const res = await this.api.post(url, data, {
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
    return res.data;
  }

  async put(url, data) {
    const res = await this.api.put(url, data);
    return res.data;
  }

  async delete(url) {
    const res = await this.api.delete(url);
    return res.data;
  }
}

export default Api;
