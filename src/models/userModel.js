const db = require('../config/database');

const userModel = {
  // Listar usuarios con filtros opcionales (rol, activo, búsqueda por nombre/username)
  async getAllUsers(filters = {}) {
    let sql = `
      SELECT id_usuario, nombre_completo, username, rol, activo, fecha_creacion
      FROM usuarios
      WHERE 1 = 1
    `;
    const params = [];

    if (filters.rol && filters.rol !== 'TODOS') {
      sql += ' AND rol = ?';
      params.push(filters.rol);
    }

    if (filters.activo !== undefined && filters.activo !== '' && filters.activo !== 'TODOS') {
      sql += ' AND activo = ?';
      params.push(parseInt(filters.activo, 10));
    }

    if (filters.search && filters.search.trim() !== '') {
      sql += ' AND (nombre_completo LIKE ? OR username LIKE ?)';
      const term = `%${filters.search.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY id_usuario ASC';
    return await db.query(sql, params);
  },

  // Obtener un usuario por su ID (sin password_hash)
  async getUserById(id) {
    return await db.getOne(
      'SELECT id_usuario, nombre_completo, username, rol, activo, fecha_creacion FROM usuarios WHERE id_usuario = ?',
      [id]
    );
  },

  // Obtener usuario por username incluyendo password_hash (para login)
  async getUserByUsername(username) {
    return await db.getOne(
      'SELECT * FROM usuarios WHERE username = ?',
      [username.trim().toLowerCase()]
    );
  },

  // Crear un nuevo usuario
  async createUser({ nombre_completo, username, password_hash, rol }) {
    const result = await db.execute(
      `INSERT INTO usuarios (nombre_completo, username, password_hash, rol, activo, fecha_creacion)
       VALUES (?, ?, ?, ?, 1, datetime('now', 'localtime'))`,
      [nombre_completo.trim(), username.trim().toLowerCase(), password_hash, rol]
    );
    return await this.getUserById(result.lastID);
  },

  // Actualizar datos del usuario (nombre, username, rol)
  async updateUser(id, { nombre_completo, username, rol }) {
    await db.execute(
      'UPDATE usuarios SET nombre_completo = ?, username = ?, rol = ? WHERE id_usuario = ?',
      [nombre_completo.trim(), username.trim().toLowerCase(), rol, id]
    );
    return await this.getUserById(id);
  },

  // Desactivar usuario (activo = 0)
  async deactivateUser(id) {
    await db.execute('UPDATE usuarios SET activo = 0 WHERE id_usuario = ?', [id]);
    return await this.getUserById(id);
  },

  // Activar usuario (activo = 1)
  async activateUser(id) {
    await db.execute('UPDATE usuarios SET activo = 1 WHERE id_usuario = ?', [id]);
    return await this.getUserById(id);
  },

  // Cambiar contraseña del usuario
  async changePassword(id, newPasswordHash) {
    return await db.execute(
      'UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?',
      [newPasswordHash, id]
    );
  },

  // Contar usuarios totales y por rol
  async countUsers() {
    const total = await db.getOne('SELECT COUNT(*) AS total FROM usuarios');
    const byRole = await db.query(`
      SELECT rol, COUNT(*) AS cantidad
      FROM usuarios
      GROUP BY rol
    `);
    const activos = await db.getOne('SELECT COUNT(*) AS activos FROM usuarios WHERE activo = 1');
    const inactivos = await db.getOne('SELECT COUNT(*) AS inactivos FROM usuarios WHERE activo = 0');

    return {
      total: total.total,
      activos: activos.activos,
      inactivos: inactivos.inactivos,
      porRol: byRole
    };
  }
};

module.exports = userModel;
