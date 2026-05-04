import { useState } from "react";
import "./style.css";

export default function PopUpFiltroClientes({
  onFilter,
  closeModal,
  classificacoes,
  vendedores,
  filtrosAtuais = {},
}) {
  const [classificacao, setClassificacao] = useState(filtrosAtuais.classificacao_cliente || "");
  const [vendedor, setVendedor] = useState(filtrosAtuais.nome_vendedor || "");
  const [status, setStatus] = useState(filtrosAtuais.status || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({
      classificacao_cliente: classificacao,
      nome_vendedor: vendedor,
      status,
    });
    closeModal();
  };

  return (
    <div id="filter-container">
      <form onSubmit={handleSubmit} className="filter-form">
        {/* Classificação */}
        <div className="form-group">
          <label>Classificação:</label>
          <select value={classificacao} onChange={(e) => setClassificacao(e.target.value)}>
            <option value="">Todas as Classificações</option>
            {Object.values(classificacoes).map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        {/* Vendedor */}
        <div className="form-group">
          <label>Vendedor:</label>
          <select value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
            <option value="">Todos os Vendedores</option>
            {Object.entries(vendedores).map(([id, nome]) => (
              <option key={id} value={id}>{nome}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="form-group">
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <button
          type="submit"
          id="filter-apply-button"
          className="filter-button"
        >
          Aplicar
        </button>
        <button
          type="button"
          onClick={closeModal}
          id="filter-close-button"
          className="filter-button"
        >
          Fechar
        </button>
      </form>
    </div>
  );
}
