import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

class Formatadores {
  constructor() {
    this.opcoesData = {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    this.local = "pt-BR";
  }

  // Equivalente ao antigo DateJS.formatDate
  formatarData(data) {
    if (!data) return "-";
    const novaData = new Date(data);
    return novaData.toLocaleDateString(this.local, this.opcoesData);
  }

  // Equivalente ao antigo formatDate.js (ISO para YYYY-MM-DD)
  formatarDataISO(inputDate) {
    if (!inputDate) return "";
    // Se já for objeto Date, formata direto
    if (inputDate instanceof Date) {
      return format(inputDate, "yyyy-MM-dd");
    }
    const date = parseISO(inputDate);
    return format(date, "yyyy-MM-dd");
  }

  formatarMoeda(valor) {
    if (valor === undefined || valor === null) return "R$ 0,00";
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
}

export default new Formatadores();
