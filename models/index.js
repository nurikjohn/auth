const Sequelize = require('sequelize');
const UserModel = require('./User');
const SessionsModel = require('./Sessions');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        protocol: 'postgres',
        define: {
            timestamps: false,
        },
        logging: false,
    }
);

const User = UserModel(sequelize, Sequelize);
const Sessions = SessionsModel(sequelize, Sequelize);

sequelize.sync().then(() => {
    console.log('db and tables have been created');
});

module.exports = { User, Sessions };
