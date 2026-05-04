// /relatorios/index.jsx
import { useEffect, useState, useMemo } from "react";
import Navbar from "../../componentes/navbar";
import Carregando from "../../componentes/carregando";
import RelatorioClientes from "../../relatorios/clientes";
import RelatorioContratos from "../../relatorios/contratos";
import RelatorioProdutos from "../../relatorios/produtos";
import RelatorioAniversariantes from "../../relatorios/aniversariantes";
import RelatorioNotificacoes from "../../relatorios/notificacoes";
import RelatorioLogs from "../../relatorios/logs";
import RelatorioGeral from "../../relatorios/geral";
import RelatorioHistorico from "../../relatorios/historico";
import { useCookies } from "react-cookie";
import Api from "../../utils/api";
import { createMapById } from "../../utils/maps";
import "./style.css";

export default function Relatorios() {
  const [loading, setLoading] = useState(false);
  const [tabelaSelecionada, setTabelaSelecionada] = useState("");
  const [clientes, setClientes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [segmentos, setSegmentos] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [gruposEconomicos, setGruposEconomicos] = useState([]);
  const [classificacoesClientes, setClassificacoesClientes] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [cookies] = useCookies(["tipo", "id"]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const api = new Api();
        const [
          clientesRes,
          contratosRes,
          produtosRes,
          usuariosRes,
          segmentosRes,
          fabricantesRes,
          groposEconomicos,
          classificacoesClientes,
          notificacoesRes,
          logsRes,
        ] = await Promise.all([
          api.get("/clientes"),
          api.get(
            cookies.tipo === "admin" || cookies.tipo === "dev"
              ? "/contratos"
              : `/contratos/vendedor/${cookies.id}`
          ),
          api.get("/produtos"),
          api.get("/usuarios"),
          api.get("/segmentos"),
          api.get("/fabricantes"),
          api.get("/grupos-economicos"),
          api.get("/classificacoes-clientes"),
          api.get("/notificacoes"),
          api.get("/logs"),
        ]);
        setClientes(clientesRes.clientes || []);
        setContratos(contratosRes.contratos || []);
        setProdutos(produtosRes.produtos || []);
        setUsuarios(usuariosRes.usuarios || []);
        setSegmentos(segmentosRes.segmentos || []);
        setFabricantes(fabricantesRes.fabricantes || []);
        setGruposEconomicos(groposEconomicos.grupoEconomico || []);
        setClassificacoesClientes(classificacoesClientes.classificacoes || []);
        // backend retorna um array direto: res.json(notificacoes)
        setNotificacoes(notificacoesRes || []);
        setLogs(logsRes.logs || []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [cookies]);

  const usuariosMap = useMemo(() => createMapById(usuarios), [usuarios]);
  const segmentosMap = useMemo(() => createMapById(segmentos), [segmentos]);
  const fabricantesMap = useMemo(
    () => createMapById(fabricantes),
    [fabricantes]
  );
  const gruposEconomicosMap = useMemo(
    () => createMapById(gruposEconomicos),
    [gruposEconomicos]
  );
  const classificacoesClientesMap = useMemo(
    () => createMapById(classificacoesClientes),
    [classificacoesClientes]
  );

  return (
    <>
      {loading && <Carregando />}
      <div id="clientes-display">
        <Navbar />
        <div id="clientes-container">
          <h1 id="clientes-titulo">Relatórios</h1>
          <select
            id="select-tabela-relatorios"
            onChange={(e) => setTabelaSelecionada(e.target.value)}
          >
            <option value="">Selecione a fonte de dados</option>
            <option value="Clientes">Clientes</option>
            <option value="Contratos">Contratos</option>
            <option value="Produtos">Produtos</option>
            <option value="Aniversariantes">Aniversariantes</option>
            <option value="Notificacoes">Notificações</option>
            <option value="Logs">Logs</option>
            <option value="Geral">Relatório de Campanhas</option>
            <option value="Historico">Histórico (Snapshots)</option>
          </select>

          {tabelaSelecionada === "Clientes" && (
            <RelatorioClientes
              clientes={clientes}
              contratos={contratos}
              usuariosMap={usuariosMap}
              segmentosMap={segmentosMap}
              gruposEconomicosMap={gruposEconomicosMap}
              classificacoesClientesMap={classificacoesClientesMap}
            />
          )}
          {tabelaSelecionada === "Contratos" && (
            <RelatorioContratos
              contratos={contratos}
              produtos={produtos}
              clientes={clientes}
              usuariosMap={usuariosMap}
            />
          )}
          {tabelaSelecionada === "Produtos" && (
            <RelatorioProdutos
              produtos={produtos}
              fabricantesMap={fabricantesMap}
            />
          )}
          {tabelaSelecionada === "Aniversariantes" && (
            <RelatorioAniversariantes clientes={clientes} />
          )}
          {tabelaSelecionada === "Notificacoes" && (
            <RelatorioNotificacoes
              notificacoes={notificacoes}
              usuariosMap={usuariosMap}
              contratos={contratos}
              clientes={clientes}
              produtos={produtos}
            />
          )}
          {tabelaSelecionada === "Logs" && (
            <RelatorioLogs logs={logs} contratos={contratos} clientes={clientes} produtos={produtos} />
          )}
          {tabelaSelecionada === "Geral" && (
            <RelatorioGeral
              clientes={clientes}
              produtos={produtos}
              usuariosMap={usuariosMap}
            />
          )}
          {tabelaSelecionada === "Historico" && (
            <RelatorioHistorico
              usuariosMap={usuariosMap}
              clientes={clientes}
              contratos={contratos}
              produtos={produtos}
              segmentosMap={segmentosMap}
              gruposEconomicosMap={gruposEconomicosMap}
              classificacoesClientesMap={classificacoesClientesMap}
            />
          )}
        </div>
      </div>
    </>
  );
}
