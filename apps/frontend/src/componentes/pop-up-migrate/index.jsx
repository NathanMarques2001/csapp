import { useEffect, useState } from "react";
import Api from "../../utils/api";
import "./style.css";
import Popup from "../pop-up";

export default function PopUpMigrate({ id_antigo, fechar, reload }) {
  const [vendedores, setVendedores] = useState([]);
  const [vendedorAntigo, setVendedorAntigo] = useState({});
  const [novoVendedor, setNovoVendedor] = useState(null);
  const [nomeNovoVendedor, setNomeNovoVendedor] = useState("");
  const [abrirPopup, setAbrirPopup] = useState(false);
  const api = new Api();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuariosResponse = await api.get("/usuarios");
        setVendedores(usuariosResponse.usuarios);

        const vendedorAntigoResponse = await api.get(`/usuarios/${id_antigo}`);
        setVendedorAntigo(vendedorAntigoResponse.usuario);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [id_antigo]);

  async function handleSubmit() {
    try {
      const response = await api.put("/clientes/migrate", {
        antigo_vendedor: vendedorAntigo.id,
        novo_vendedor: novoVendedor,
      });
      if (response.message === "Migração de clientes realizada com sucesso!") {
        await api.delete(`/usuarios/${vendedorAntigo.id}`);
        fechar();
        reload();
      }
    } catch (err) {
      console.error("Error migrating clients:", err);
    }
  }

  const handleChangeVendedor = (event) => {
    const id = event.target.value;
    setNovoVendedor(id);
    const vendedor = vendedores.find(
      (vendedor) => vendedor.id === parseInt(id)
    );
    setNomeNovoVendedor(vendedor ? vendedor.nome : "");
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setAbrirPopup(true);
  };

  return (
    <>
      {abrirPopup && (
        <Popup
          title="Migrar Clientes"
          message={`Tem certeza que deseja apagar o usuário '${vendedorAntigo.nome}' e migrar seus clientes para o usuário '${nomeNovoVendedor}'? Essa operação é irreversível.`}
          onConfirm={handleSubmit}
          onCancel={() => setAbrirPopup(false)}
        />
      )}
      <div id="migrate-container">
        <form onSubmit={handleFormSubmit} className="filter-form">
          <p>Migrar Clientes</p>
          <div className="form-group">
            <label htmlFor="vendedor-antigo">Vendedor Antigo</label>
            <input
              type="text"
              disabled
              name="vendedor-antigo"
              value={vendedorAntigo.nome || ""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="vendedor-novo">Novo Vendedor</label>
            <select
              onChange={handleChangeVendedor}
              name="vendedor-novo"
              id="vendedor-novo"
            >
              {vendedores.map(
                (vendedor) =>
                  vendedor.id !== vendedorAntigo.id && (
                    <option key={vendedor.id} value={vendedor.id}>
                      {vendedor.nome}
                    </option>
                  )
              )}
            </select>
          </div>
          <button
            type="submit"
            id="filter-apply-button"
            className="filter-button"
          >
            Migrar
          </button>
          <button
            type="button"
            onClick={fechar}
            id="filter-close-button"
            className="filter-button"
          >
            Fechar
          </button>
        </form>
      </div>
    </>
  );
}
