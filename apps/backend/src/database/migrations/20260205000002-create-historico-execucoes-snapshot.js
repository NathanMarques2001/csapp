'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('historico_execucoes_snapshot', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            data_referencia: {
                type: Sequelize.DATEONLY,
                allowNull: false,
                unique: true
            },
            data_inicio_execucao: {
                type: Sequelize.DATE,
                allowNull: false
            },
            data_fim_execucao: {
                type: Sequelize.DATE
            },
            status: {
                type: Sequelize.ENUM('EM_EXECUCAO', 'SUCESSO', 'ERRO'),
                allowNull: false,
                defaultValue: 'EM_EXECUCAO'
            },
            quantidade_clientes: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            quantidade_contratos: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            mensagem_erro: {
                type: Sequelize.TEXT
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

        await queryInterface.addIndex('historico_execucoes_snapshot', ['data_referencia']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('historico_execucoes_snapshot');
    }
};
