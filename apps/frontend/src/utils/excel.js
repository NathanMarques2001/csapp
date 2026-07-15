import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename) => {
    // Cria uma nova planilha a partir dos dados (array de objetos)
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Cria um novo livro de planilhas (workbook)
    const workbook = XLSX.utils.book_new();

    // Adiciona a planilha ao livro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");

    // Gera e salva o arquivo
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};
