'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('historico_contratos', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            data_referencia: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            id_contrato_original: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            id_cliente: {
                type: Sequelize.INTEGER
            },
            id_produto: {
                type: Sequelize.INTEGER
            },
            id_faturado: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.ENUM('ativo', 'inativo')
            },
            valor_mensal: {
                type: Sequelize.DECIMAL(10, 2)
            },
            quantidade: {
                type: Sequelize.INTEGER
            },
            data_inicio: {
                type: Sequelize.DATE
            },
            data_vencimento_calculada: {
                type: Sequelize.DATEONLY
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('historico_contratos', ['data_referencia']);
        await queryInterface.addIndex('historico_contratos', ['id_contrato_original']);
        await queryInterface.addIndex('historico_contratos', ['id_cliente']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('historico_contratos');
    }
};
