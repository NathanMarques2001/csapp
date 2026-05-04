import * as XLSX from "xlsx";

export const baixarModelo = () => {
  const dados = [
    {
      cpf_cnpj: "00.000.000/0001-00",
      nome_produto: "Nome do Produto Exemplo",
      nome_faturado: "Nome de Quem Irá Realizar o Faturamento",
      dia_vencimento: "10",
      nome_indice: "IPCA",
      proximo_reajuste: "2025-07-15",
      status: "ativo",
      duracao: "12",
      valor_mensal: "1500.50",
      quantidade: "1",
      descricao: "Detalhes do contrato",
      data_inicio: "2024-07-15",
      tipo_faturamento: "mensal",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ModeloContratos");

  XLSX.writeFile(wb, "modelo_contratos.xlsx");
};
