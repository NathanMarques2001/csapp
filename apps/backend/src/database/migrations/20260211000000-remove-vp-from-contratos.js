'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('contratos', 'vp');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('contratos', 'vp', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    }
};
