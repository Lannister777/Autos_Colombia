const userModel = require('../models/userModel');

const userController = {
  // POST /api/auth/login - Iniciar sesión (comparación simple de password_hash)
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y contraseña son obligatorios'
        });
      }

      const user = await userModel.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas. Usuario no encontrado.'
        });
      }

      // Comparación simple de contraseña (proyecto académico, sin bcrypt)
      if (user.password_hash !== password) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas. Contraseña incorrecta.'
        });
      }

      if (user.activo === 0) {
        return res.status(403).json({
          success: false,
          message: 'La cuenta está desactivada. Contacte al administrador.'
        });
      }

      // Token simple: codificar el id del usuario en base64
      const token = Buffer.from(`user_${user.id_usuario}_${Date.now()}`).toString('base64');

      return res.json({
        success: true,
        message: `Bienvenido, ${user.nombre_completo}`,
        data: {
          token,
          usuario: {
            id_usuario: user.id_usuario,
            nombre_completo: user.nombre_completo,
            username: user.username,
            rol: user.rol,
            activo: user.activo
          }
        }
      });
    } catch (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ success: false, message: 'Error interno del servidor al autenticar' });
    }
  },

  // GET /api/usuarios - Listar todos los usuarios con filtros
  async getAll(req, res) {
    try {
      const { rol, activo, q } = req.query;
      const filters = {
        rol: rol || undefined,
        activo: activo !== undefined ? activo : undefined,
        search: q || undefined
      };

      const users = await userModel.getAllUsers(filters);
      return res.json({ success: true, count: users.length, data: users });
    } catch (err) {
      console.error('Error al listar usuarios:', err);
      return res.status(500).json({ success: false, message: 'Error consultando usuarios' });
    }
  },

  // GET /api/usuarios/:id - Obtener usuario por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userModel.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      return res.json({ success: true, data: user });
    } catch (err) {
      console.error('Error al obtener usuario:', err);
      return res.status(500).json({ success: false, message: 'Error consultando usuario' });
    }
  },

  // POST /api/usuarios - Crear nuevo usuario
  async create(req, res) {
    try {
      const { nombre_completo, username, password, rol } = req.body;

      if (!nombre_completo || !username || !password || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Nombre completo, username, contraseña y rol son obligatorios'
        });
      }

      // Validar rol permitido
      if (!['ADMIN', 'OPERADOR'].includes(rol)) {
        return res.status(400).json({
          success: false,
          message: 'El rol debe ser ADMIN o OPERADOR'
        });
      }

      // Verificar username único
      const existing = await userModel.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `El username "${username}" ya está en uso por otro usuario`
        });
      }

      const newUser = await userModel.createUser({
        nombre_completo,
        username,
        password_hash: password, // Proyecto académico: se guarda directo
        rol
      });

      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: newUser
      });
    } catch (err) {
      console.error('Error al crear usuario:', err);
      return res.status(500).json({ success: false, message: 'Error interno al crear usuario' });
    }
  },

  // PUT /api/usuarios/:id - Actualizar información del usuario
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre_completo, username, rol } = req.body;

      const user = await userModel.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (!nombre_completo || !username || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Nombre completo, username y rol son obligatorios'
        });
      }

      // Verificar que el nuevo username no esté en uso por otro usuario
      const existing = await userModel.getUserByUsername(username);
      if (existing && existing.id_usuario !== parseInt(id, 10)) {
        return res.status(400).json({
          success: false,
          message: `El username "${username}" ya está en uso por otro usuario`
        });
      }

      const updated = await userModel.updateUser(id, { nombre_completo, username, rol });
      return res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: updated
      });
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      return res.status(500).json({ success: false, message: 'Error interno al actualizar usuario' });
    }
  },

  // PATCH /api/usuarios/:id/toggle-active - Alternar estado activo/inactivo
  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const user = await userModel.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      let updated;
      if (user.activo === 1) {
        updated = await userModel.deactivateUser(id);
      } else {
        updated = await userModel.activateUser(id);
      }

      return res.json({
        success: true,
        message: `Usuario ${updated.activo === 1 ? 'activado' : 'desactivado'} exitosamente`,
        data: updated
      });
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
      return res.status(500).json({ success: false, message: 'Error al cambiar estado del usuario' });
    }
  },

  // PATCH /api/usuarios/:id/password - Cambiar contraseña
  async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña es obligatoria y debe tener al menos 3 caracteres'
        });
      }

      const user = await userModel.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      await userModel.changePassword(id, newPassword.trim());
      return res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      return res.status(500).json({ success: false, message: 'Error interno al cambiar contraseña' });
    }
  }
};

module.exports = userController;
