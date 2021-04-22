module.exports = (sequelize, DataTypes) =>
    sequelize.define(
        'Sessions',
        {
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            token_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            logged_out: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            logged_in_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.fn('now'),
            },
            logged_out_at: {
                type: DataTypes.DATE,
            },
            ip: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            device: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            indexes: [{ fields: ['user_id', 'token_id'], unique: true }],
        }
    );
