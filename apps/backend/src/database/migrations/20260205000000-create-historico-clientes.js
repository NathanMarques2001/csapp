'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('historico_clientes', {
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
            id_cliente_original: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            razao_social: {
                type: Sequelize.STRING
            },
            nome_fantasia: {
                type: Sequelize.STRING
            },
            cpf_cnpj: {
                type: Sequelize.STRING
            },
            id_usuario: {
                type: Sequelize.INTEGER
            },
            nps: {
                type: Sequelize.INTEGER
            },
            id_segmento: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.ENUM('ativo', 'inativo')
            },
            id_classificacao_cliente: {
                type: Sequelize.INTEGER
            },
            data_criacao: {
                type: Sequelize.DATE
            },
            valor_total_contratos: {
                type: Sequelize.DECIMAL(10, 2)
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

        await queryInterface.addIndex('historico_clientes', ['data_referencia']);
        await queryInterface.addIndex('historico_clientes', ['id_cliente_original']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('historico_clientes');
    }
};
