export const parseDate = (dateStr) => {
    if (!dateStr) return null;
    let data = new Date(dateStr);
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
            data = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
            data = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    }
    return isNaN(data.getTime()) ? null : data;
};

export const calcularProximoVencimento = (dataInicio, duracao) => {
    if (!dataInicio) return null;
    const duracaoMeses = parseInt(duracao);
    if (!duracaoMeses || duracaoMeses <= 0) return null;
    if (duracaoMeses === 12000) return null;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let data = parseDate(dataInicio);
    if (!data) return null;

    data.setMonth(data.getMonth() + duracaoMeses);

    if (data < hoje) {
        let safeCounter = 0;
        while (data < hoje && safeCounter < 1000) {
            data.setMonth(data.getMonth() + duracaoMeses);
            safeCounter++;
        }
    }

    return data;
};

export const getDaysUntil = (date) => {
    if (!date) return null;
    const target = date instanceof Date ? date : new Date(date);
    if (isNaN(target.getTime())) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - hoje) / (1000 * 60 * 60 * 24));
};

export const computeMRR = (contratos) =>
    (contratos || [])
        .filter(c => c.status === 'ativo')
        .reduce((acc, c) => {
            const value = Number(c.valor_mensal || 0);
            return acc + (c.tipo_faturamento === 'mensal' ? value : value / 12);
        }, 0);

export const computeARR = (contratos) =>
    (contratos || [])
        .filter(c => c.status === 'ativo')
        .reduce((acc, c) => {
            const value = Number(c.valor_mensal || 0);
            return acc + (c.tipo_faturamento === 'mensal' ? value * 12 : value);
        }, 0);

export const getTop30ClassificationIds = (classifications = []) => {
    const ids = classifications
        .filter(c => {
            const nome = (c.nome || '').toLowerCase();
            return (nome.includes('top') && nome.includes('30')) || c.quantidade === 30;
        })
        .map(c => c.id);

    if (ids.length > 0) return ids;

    const byQuantity = classifications
        .filter(c => c.quantidade != null)
        .sort((a, b) => a.quantidade - b.quantidade);

    return byQuantity[0] ? [byQuantity[0].id] : [];
};

export const countTop30Clients = (clientes = [], classifications = []) => {
    const top30Ids = getTop30ClassificationIds(classifications);
    if (top30Ids.length === 0) return 0;
    return clientes.filter(
        c => c.status === 'ativo' && top30Ids.includes(c.id_classificacao_cliente)
    ).length;
};

export const getUpcomingRenewals = (contratos = [], withinDays = 90) =>
    contratos
        .filter(c => c.status === 'ativo')
        .map(c => ({
            ...c,
            vencimento: calcularProximoVencimento(c.data_inicio, c.duracao),
        }))
        .filter(c => c.vencimento instanceof Date)
        .filter(c => {
            const days = getDaysUntil(c.vencimento);
            return days !== null && days >= 0 && days <= withinDays;
        })
        .sort((a, b) => a.vencimento - b.vencimento);

export const getUpcomingReadjustments = (contratos = [], withinDays = 60) =>
    contratos
        .filter(c => c.status === 'ativo')
        .map(c => ({ ...c, parsedReajuste: parseDate(c.proximo_reajuste) }))
        .filter(c => c.parsedReajuste)
        .filter(c => {
            const days = getDaysUntil(c.parsedReajuste);
            return days !== null && days >= 0 && days <= withinDays;
        })
        .sort((a, b) => a.parsedReajuste - b.parsedReajuste);

export const countCriticalAlerts = (contratos = []) => {
    const renewals = getUpcomingRenewals(contratos, 30).length;
    const readjustments = getUpcomingReadjustments(contratos, 30).length;
    return renewals + readjustments;
};

export const getContractCreatedAt = (contrato) =>
    contrato?.createdAt || contrato?.created_at || null;

export const getRecentContracts = (contratos = [], limit = 5) =>
    [...contratos]
        .sort((a, b) => {
            const dateA = getContractCreatedAt(a);
            const dateB = getContractCreatedAt(b);
            if (dateA && dateB) return new Date(dateB) - new Date(dateA);
            if (dateB) return 1;
            if (dateA) return -1;
            return (b.id || 0) - (a.id || 0);
        })
        .slice(0, limit);

export const getRevenueByProduct = (contratos = [], products = []) => {
    const productMap = products.reduce((acc, p) => ({ ...acc, [p.id]: p.nome }), {});
    const totals = {};

    contratos
        .filter(c => c.status === 'ativo')
        .forEach(c => {
            const value = Number(c.valor_mensal || 0);
            const mrr = c.tipo_faturamento === 'mensal' ? value : value / 12;
            totals[c.id_produto] = (totals[c.id_produto] || 0) + mrr;
        });

    return Object.entries(totals)
        .map(([id, mrr]) => ({
            id: Number(id),
            nome: productMap[id] || `Produto #${id}`,
            mrr,
        }))
        .sort((a, b) => b.mrr - a.mrr)
        .slice(0, 5);
};

export const getClientsByClassification = (clientes = [], classifications = []) => {
    const classMap = classifications.reduce((acc, c) => ({ ...acc, [c.id]: c.nome }), {});
    const counts = {};

    clientes
        .filter(c => c.status === 'ativo')
        .forEach(c => {
            const key = c.id_classificacao_cliente || 'sem';
            counts[key] = (counts[key] || 0) + 1;
        });

    return Object.entries(counts)
        .map(([id, count]) => ({
            id,
            nome: id === 'sem' ? 'Sem classificação' : (classMap[id] || `Classe #${id}`),
            count,
        }))
        .sort((a, b) => b.count - a.count);
};

export const urgencyLabel = (days) => {
    if (days <= 7) return { text: 'Crítico', className: 'bg-red-100 text-red-700' };
    if (days <= 30) return { text: 'Urgente', className: 'bg-amber-100 text-amber-700' };
    return { text: 'Atenção', className: 'bg-slate-100 text-slate-600' };
};
