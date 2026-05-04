import * as XLSX from "xlsx";

export default class Excel {
  constructor(nomeRelatorio) {
    this.nomeRelatorio = nomeRelatorio;
  }

  exportToExcel(data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Excel limits: sheet name max 31 chars and cannot contain \ / ? * [ ] :
  const rawName = this.nomeRelatorio || "Relatorio";
  let sheetName = rawName.replace(/[\\\/\?\*\[\]\:]/g, "");
  if (sheetName.length > 31) sheetName = sheetName.slice(0, 31);
  if (!sheetName) sheetName = "Sheet1";

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // make a safe filename (remove problematic chars)
  let fileName = rawName.replace(/[\\\/\?\*\[\]\:]/g, "").trim();
  if (!fileName) fileName = "relatorio";
  // replace multiple spaces with single dash for nicer filenames
  fileName = fileName.replace(/\s+/g, " ");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
}
