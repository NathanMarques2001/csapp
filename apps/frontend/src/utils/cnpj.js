/**
 * Busca dados de um CNPJ na API pública do ReceitaWS.
 * @param {string} cnpj - O CNPJ apenas com números ou formatado.
 * @returns {Promise<Object>} Retorna os dados da empresa.
 */
export const fetchCnpjData = async (cnpj) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
        throw new Error("Por favor, informe um CNPJ válido com 14 dígitos.");
    }

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("CNPJ não encontrado.");
            }
            throw new Error(`Erro na API (${response.status})`);
        }
        
        const data = await response.json();

        return {
            nome: data.razao_social,
            fantasia: data.nome_fantasia || data.razao_social,
            tipo: data.descricao_identificador_matriz_filial === "MATRIZ" ? "MATRIZ" : "FILIAL"
        };
    } catch (error) {
        if (error.message.includes("CNPJ") || error.message.includes("Limite")) {
            throw error;
        }
        console.error("Erro no serviço de CNPJ:", error);
        throw new Error("Erro ao buscar CNPJ. A API pode estar indisponível ou bloqueada pelo navegador.");
    }
};
