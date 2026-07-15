import { useState, useEffect, useCallback } from 'react';
import Api from '../utils/api';

export const useCarregarGrupoEconomico = (id) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [group, setGroup] = useState(null);
    const [clients, setClients] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [products, setProducts] = useState({});
    const [manufacturers, setManufacturers] = useState({});
    const [classifications, setClassifications] = useState({});

    const [contatosComerciais, setContatosComerciais] = useState([]);
    const [contatosTecnicos, setContatosTecnicos] = useState([]);
    const [fatosImportantes, setFatosImportantes] = useState([]);

    const fetchData = useCallback(async () => {
        if (!id) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const api = new Api();
            
            const [
                groupRes, 
                clientsRes, 
                contractsRes, 
                productsRes, 
                manufacturersRes, 
                classificationsRes
            ] = await Promise.all([
                api.get(`/grupos-economicos/${id}`),
                api.get(`/clientes/grupo-economico/${id}`),
                api.get('/contratos'),
                api.get('/produtos'),
                api.get('/fabricantes'),
                api.get('/classificacoes-clientes'),
            ]);

            const groupClients = clientsRes.clientes || [];
            const clientIds = new Set(groupClients.map(c => c.id));
            const groupContracts = (contractsRes.contratos || []).filter(c => clientIds.has(c.id_cliente));

            setGroup(groupRes.grupoEconomico);
            setClients(groupClients);
            setContracts(groupContracts);

            const prodMap = (productsRes.produtos || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
            setProducts(prodMap);

            const manufMap = (manufacturersRes.fabricantes || []).reduce((acc, m) => ({ ...acc, [m.id]: m.nome }), {});
            setManufacturers(manufMap);

            const classMap = (classificationsRes.classificacoes || []).reduce((acc, c) => ({ ...acc, [c.id]: c.nome }), {});
            setClassifications(classMap);

            // Buscar histórico de todas as unidades
            const comerciaisPromises = groupClients.map(c => 
                api.get(`/contatos-comerciais/${c.id}`)
                   .then(res => (res.contatos_comerciais || []).map(item => ({ ...item, cliente_nome: c.nome_fantasia })))
                   .catch(() => [])
            );
            const tecnicosPromises = groupClients.map(c => 
                api.get(`/contatos-tecnicos/${c.id}`)
                   .then(res => (res.contatos_tecnicos || []).map(item => ({ ...item, cliente_nome: c.nome_fantasia })))
                   .catch(() => [])
            );
            const fatosPromises = groupClients.map(c => 
                api.get(`/fatos-importantes/${c.id}`)
                   .then(res => (res.fatos_importantes || []).map(item => ({ ...item, cliente_nome: c.nome_fantasia })))
                   .catch(() => [])
            );

            const comerciaisResults = await Promise.all(comerciaisPromises);
            const tecnicosResults = await Promise.all(tecnicosPromises);
            const fatosResults = await Promise.all(fatosPromises);

            setContatosComerciais(comerciaisResults.flat());
            setContatosTecnicos(tecnicosResults.flat());
            setFatosImportantes(fatosResults.flat());
            
        } catch (e) {
            console.error('Erro ao carregar os dados do Grupo Econômico:', e);
            setError('Falha na comunicação com o servidor ao carregar este grupo. Verifique sua conexão e tente novamente.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data: {
            group,
            clients,
            contracts,
            products,
            manufacturers,
            classifications,
            contatosComerciais,
            contatosTecnicos,
            fatosImportantes
        },
        loading,
        error,
        refetch: fetchData
    };
};

export default useCarregarGrupoEconomico;
