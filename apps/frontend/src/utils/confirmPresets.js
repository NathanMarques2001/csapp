export const confirmPresets = {
    save: (entity = 'este registro', isCreate = false) => ({
        title: isCreate ? 'Confirmar cadastro' : 'Confirmar salvamento',
        message: isCreate
            ? `Deseja cadastrar ${entity}?`
            : `Deseja salvar as alterações em ${entity}?`,
        confirmLabel: isCreate ? 'Cadastrar' : 'Salvar',
        cancelLabel: 'Cancelar',
        variant: 'primary',
    }),

    discardChanges: () => ({
        title: 'Alterações não salvas',
        message: 'Existem alterações que ainda não foram salvas. Deseja sair sem salvar?',
        confirmLabel: 'Sair sem salvar',
        cancelLabel: 'Continuar editando',
        variant: 'danger',
    }),

    logout: () => ({
        title: 'Sair do sistema',
        message: 'Deseja encerrar sua sessão e sair do sistema?',
        confirmLabel: 'Sair',
        cancelLabel: 'Cancelar',
        variant: 'danger',
    }),

    toggleStatus: (entity, newStatus) => ({
        title: 'Alterar status',
        message: `Deseja alterar o status${entity ? ` de ${entity}` : ''} para "${newStatus}"?`,
        confirmLabel: 'Confirmar',
        cancelLabel: 'Cancelar',
        variant: 'warning',
    }),

    deactivate: (entity, consequence) => ({
        title: `Inativar ${entity}`,
        message: consequence,
        confirmLabel: 'Inativar',
        cancelLabel: 'Cancelar',
        variant: 'danger',
    }),

    delete: (entity) => ({
        title: 'Confirmar exclusão',
        message: `Tem certeza que deseja excluir ${entity}? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        variant: 'danger',
    }),

    deactivateGroup: (isActivating) => ({
        title: isActivating ? 'Ativar grupo econômico' : 'Inativar grupo econômico',
        message: isActivating
            ? 'Deseja ativar este grupo econômico?'
            : 'Deseja inativar este grupo econômico? Todos os clientes e contratos vinculados serão inativados.',
        confirmLabel: isActivating ? 'Ativar' : 'Inativar',
        cancelLabel: 'Cancelar',
        variant: isActivating ? 'warning' : 'danger',
    }),
};
