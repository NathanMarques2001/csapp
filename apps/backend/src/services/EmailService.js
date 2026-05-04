const axios = require("axios");

class Email {
  // PRD
  static baseUrl = "https://csapp.prolinx.com.br/email";
  // DEV
  // static baseUrl = "http://localhost:9090/email";
  constructor() {
    this.email = axios.create({
      headers: {
        "Content-Type": "application/json"
      },
    });
  }

  async enviarEmail(data) {
    try {
      const res = await this.email.post(Email.baseUrl + "/send", data);
      return res.data;
    } catch (err) {
      throw err || "Erro ao enviar email";
    }
  }
}

module.exports = Email;
