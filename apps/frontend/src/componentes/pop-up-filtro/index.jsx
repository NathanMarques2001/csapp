import { useState } from "react";
import "./style.css";

export default function PopUpFiltro({
  onFilter,
  closeModal,
  clientes,
  produtos,
}) {
  const [filters, setFilters] = useState({
    razao_social: "",
    nome_fantasia: "",
    status: "",
    nome_produto: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <div id="filter-container">
      <form onSubmit={handleSubmit} className="filter-form">
        <div className="form-group">
          <label>Razão Social:</label>
          <select
            name="razao_social"
            value={filters.razao_social}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            {Object.values(clientes).map((cliente) => (
              <option key={cliente.id} value={cliente.razao_social}>
                {cliente.razao_social}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Nome Fantasia:</label>
          <select
            name="nome_fantasia"
            value={filters.nome_fantasia}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            {Object.values(clientes).map((cliente) => (
              <option key={cliente.id} value={cliente.nome_fantasia}>
                {cliente.nome_fantasia}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Status:</label>
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">Selecione</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nome Produto:</label>
          <select
            name="nome_produto"
            value={filters.nome_produto}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            {Object.values(produtos).map((produto) => (
              <option key={produto.id} value={produto.nome}>
                {produto.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          id="filter-apply-button"
          className="filter-button"
        >
          Filtrar
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
