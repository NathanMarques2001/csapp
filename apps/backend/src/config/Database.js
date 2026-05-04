const fs = require('fs');
require('dotenv').config();

let dbSecrets = {};
try {
  if (fs.existsSync('/run/secrets/db.json')) {
    dbSecrets = JSON.parse(fs.readFileSync('/run/secrets/db.json', 'utf8'));
  }
} catch (e) {
  console.warn("Aviso: Falha ao ler /run/secrets/db.json, usando process.env", e.message);
}

module.exports = {
  host: dbSecrets.DB_HOST || process.env.DB_HOST || '127.0.0.1',
  dialect: "mysql",
  username: dbSecrets.DB_USER || process.env.DB_USER || 'root',
  password: dbSecrets.DB_PASS || process.env.DB_PASS || 'root',
  database: dbSecrets.DB_NAME || process.env.DB_NAME || 'csapp_db',
  timezone: '-03:00',
  dialectOptions: {
    useUTC: false,
    timezone: 'America/Sao_Paulo',
  },
  define: {
    timestamps: true,
    underscored: true,
  },
};
