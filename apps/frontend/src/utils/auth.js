import axios from "axios";

class Auth {
  // PRD
  static baseUrl = "https://csapp.prolinx.com.br/api";
  // DEV
  //static baseUrl = "http://localhost:8080/api";

  constructor() {
    this.auth = axios.create({
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async login(url, data) {
    try {
      const res = await this.auth.post(Auth.baseUrl + url, data);
      return res.data;
    } catch (err) {
      console.error("Axios POST error:", err);
      throw err;
    }
  }
}

export default Auth;
