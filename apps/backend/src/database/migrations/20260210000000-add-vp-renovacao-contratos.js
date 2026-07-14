'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('contratos', 'vp', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.addColumn('contratos', 'renovacao_automatica', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('contratos', 'vp');
        await queryInterface.removeColumn('contratos', 'renovacao_automatica');
    }
};
