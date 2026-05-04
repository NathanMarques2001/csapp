import Api from "../../utils/api";
import "./style.css";

export default function PopUpImportaContratos({
  baixarModelo,
  setLoading,
  setMostrarModalImportacao,
}) {
  const api = new Api();

  return (
    <div id="background-pop-up-importa-contratos">
      <div id="container-pop-up-importa-contratos">
        <h1 id="titulo-pop-up-importa-contratos">Importar Contratos</h1>
        <p>
          Clique em "Baixar Modelo" para baixar um modelo de arquivo a ser
          importado.
        </p>
        <button
          onClick={baixarModelo}
          className="pop-up-importa-contratos-botao"
          id="contratos-botao-add"
        >
          Baixar Modelo
        </button>
        <p>
          Clique em "Selecionar Excel" para selecionar o arquivo a ser
          importado.
        </p>
        <form
          id="form-pop-up-importa-contratos"
          className="pop-up-importa-contratos-botao"
          onSubmit={async (e) => {
            e.preventDefault();
            const file = e.target.file.files[0];
            if (!file) return alert("Selecione um arquivo Excel");

            const formData = new FormData();
            formData.append("file", file);

            try {
              setLoading(true);
              const response = await api.post(
                "/contratos/importar-excel",
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );
              alert(response.message || "Importação realizada com sucesso!");
              window.location.reload();
            } catch (err) {
              console.error("Erro completo:", err);

              const status = err?.response?.status;
              const data = err?.response?.data;
              const fallback = err.message || "Erro desconhecido";

              const msg = [
                "Erro ao importar contratos:",
                `Status: ${status || "?"}`,
                `Mensagem: ${data?.message || fallback}`,
              ];

              // Mostra erros detalhados se tiver
              if (Array.isArray(data?.erros) && data.erros.length > 0) {
                msg.push("\nDetalhes:");
                data.erros.forEach((e) =>
                  msg.push(`- ${typeof e === "string" ? e : JSON.stringify(e)}`)
                );
              }

              alert(msg.join("\n"));
            } finally {
              setLoading(false);
              setMostrarModalImportacao(false);
            }
          }}
        >
          <label htmlFor="file-upload" id="pop-up-importa-contratos-label">
            Selecionar Excel
          </label>
          <input
            id="file-upload"
            type="file"
            name="file"
            accept=".xlsx"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files.length > 0) {
                e.target.form.requestSubmit();
              }
            }}
          />
        </form>
        <div id="pop-up-importa-contratos-linha" />
        <button
          onClick={() => setMostrarModalImportacao(false)}
          className="pop-up-importa-contratos-botao"
          id="popup-botao-cancelar"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
