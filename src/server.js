const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');

// Cargar e inicializar base de datos
require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Enrutador de API REST
app.use('/api', apiRoutes);

// Fallback para la aplicación SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚗 Sistema Parqueadero Autos Colombia corriendo exitosamente`);
  console.log(`📍 URL Local: http://localhost:${PORT}`);
  console.log(`⏱️ Hora del sistema: ${new Date().toLocaleString('es-CO')}`);
  console.log('================================================================');
});
