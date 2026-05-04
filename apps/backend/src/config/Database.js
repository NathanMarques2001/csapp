require("dotenv").config();

module.exports = {
  host: process.env.DB_HOST,
  dialect: "mysql",
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  timezone: "-03:00", // fuso fixo do servidor
  dialectOptions: {
    useUTC: false,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
};

