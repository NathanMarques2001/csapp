'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Adiciona constraint UNIQUE em historico_clientes (data_referencia + id_cliente_original)
        // Para garantir que não haja dois registros do mesmo cliente na mesma data.
        // Mas o snapshot é global. Se já existe snapshot do dia, não deveria ter nenhum registro.
        // O pedido foi "proteção adicional no banco (ex: índice único em data_referencia)".
        // Mas historico_clientes tem MUITOS registros com a mesma data_referencia (um por cliente).
        // Então o UNIQUE deve ser composto: data_referencia + id_cliente_original.

        await queryInterface.addIndex('historico_clientes', ['data_referencia', 'id_cliente_original'], {
            unique: true,
            name: 'unique_historico_cliente_dia'
        });

        await queryInterface.addIndex('historico_contratos', ['data_referencia', 'id_contrato_original'], {
            unique: true,
            name: 'unique_historico_contrato_dia'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('historico_clientes', 'unique_historico_cliente_dia');
        await queryInterface.removeIndex('historico_contratos', 'unique_historico_contrato_dia');
    }
};
