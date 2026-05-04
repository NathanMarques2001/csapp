'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('clientes', 'vp', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'usuarios', // name of the target table
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('clientes', 'vp');
    }
};
