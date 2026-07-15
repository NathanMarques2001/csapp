import { useState, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { Download, Calendar } from 'lucide-react';
import Button from '../ui/Button';

const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const BirthdayReport = ({ clients }) => {
    const hoje = new Date();
    const [mesSelecionado, setMesSelecionado] = useState(String(hoje.getMonth() + 1));

    const extrairDiaMes = (dataStr) => {
        if (!dataStr) return null;
        const partes = dataStr.split("-");
        if (partes.length < 3) return null;
        const mes = partes[1];
        const dia = partes[2].slice(0, 2);
        if (!/^[0-9]{2}$/.test(dia) || !/^[0-9]{2}$/.test(mes)) return null;
        return { dia, mes };
    };

    const aniversariantes = useMemo(() => {
        if (!clients || clients.length === 0) return [];
        const linhas = [];
        
        clients.forEach((c) => {
            const clienteNome = c.nome_fantasia || c.razao_social || "—";
            const cpfCnpj = c.cpf_cnpj || "";

            const campos = [
                {
                    dataCampo: c.gestor_contratos_nascimento,
                    nome: c.gestor_contratos_nome,
                    cargo: "Gestor Contratos",
                },
                {
                    dataCampo: c.gestor_chamados_nascimento,
                    nome: c.gestor_chamados_nome,
                    cargo: "Gestor Chamados",
                },
                {
                    dataCampo: c.gestor_financeiro_nascimento,
                    nome: c.gestor_financeiro_nome,
                    cargo: "Gestor Financeiro",
                },
            ];

            campos.forEach((item) => {
                const dm = extrairDiaMes(item.dataCampo);
                if (!dm) return;
                if (String(Number(dm.mes)) === String(Number(mesSelecionado))) {
                    linhas.push({
                        Cliente: clienteNome,
                        "CPF/CNPJ": cpfCnpj,
                        Pessoa: item.nome || "—",
                        Cargo: item.cargo,
                        "Data Aniversário": `${dm.dia}/${dm.mes}`,
                    });
                }
            });
        });

        const unicos = [];
        const vistos = new Set();
        
        linhas.forEach((r) => {
            const clienteKey = (r["Cliente"] || "").toString().trim();
            const cpfKey = (r["CPF/CNPJ"] || "").toString().replace(/\s+/g, "").trim();
            const pessoaKey = (r["Pessoa"] || "").toString().trim();
            const dataKey = (r["Data Aniversário"] || "").toString().trim();
            const key = `${clienteKey}|${cpfKey}|${pessoaKey}|${dataKey}`;
            
            if (!vistos.has(key)) {
                vistos.add(key);
                unicos.push({
                    Cliente: clienteKey,
                    "CPF/CNPJ": cpfKey,
                    Pessoa: pessoaKey,
                    Cargo: r["Cargo"],
                    "Data Aniversário": dataKey,
                });
            }
        });

        unicos.sort((a, b) => {
            const da = Number(a["Data Aniversário"].split("/")[0]);
            const db = Number(b["Data Aniversário"].split("/")[0]);
            return da - db;
        });
        
        return unicos;
    }, [clients, mesSelecionado]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg border border-slate-200 gap-4">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <label className="text-sm font-medium text-slate-700">Mês do Aniversário:</label>
                    <select
                        value={mesSelecionado}
                        onChange={(e) => setMesSelecionado(e.target.value)}
                        className="text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3"
                    >
                        {meses.map((m, i) => (
                            <option key={i} value={String(i + 1)}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <CSVLink 
                        data={aniversariantes} 
                        filename={`relatorio_aniversariantes_${meses[Number(mesSelecionado) - 1]}.csv`} 
                        className="btn-export"
                    >
                        <Button variant="primary" icon={Download}>Exportar CSV</Button>
                    </CSVLink>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">CPF/CNPJ</th>
                                <th className="px-6 py-3">Pessoa</th>
                                <th className="px-6 py-3">Cargo</th>
                                <th className="px-6 py-3 text-right">Data Aniversário</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {aniversariantes.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{item.Cliente}</td>
                                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{item["CPF/CNPJ"] || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500">{item.Pessoa}</td>
                                    <td className="px-6 py-3 text-slate-500">{item.Cargo}</td>
                                    <td className="px-6 py-3 text-right font-medium text-slate-700">{item["Data Aniversário"]}</td>
                                </tr>
                            ))}
                            {aniversariantes.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Nenhum aniversariante encontrado para {meses[Number(mesSelecionado) - 1]}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                    Mostrando {aniversariantes.length} registro(s)
                </div>
            </div>
        </div>
    );
};

export default BirthdayReport;
