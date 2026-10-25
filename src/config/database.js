const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'autos_colombia.db');
const schemaPath = path.join(__dirname, '..', '..', 'docs', 'database', 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos SQLite:', err.message);
  } else {
    console.log('Conectado exitosamente a la base de datos SQLite:', dbPath);
    initDatabase();
  }
});

function initDatabase() {
  db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) console.error('Error activando claves foráneas:', err.message);
  });

  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    // Dividir sentencias para ejecución secuencial
    db.exec(schemaSql, (err) => {
      if (err) {
        console.error('Error inicializando el esquema de base de datos:', err.message);
      } else {
        console.log('Esquema de base de datos verificado y listo.');
      }
    });
  }
}

// Helpers promisificados para queries
db.query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

module.exports = db;
