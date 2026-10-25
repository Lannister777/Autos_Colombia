# Parqueadero "Autos Colombia" - Sistema de Gestión de Operaciones
## Iteración 1: Gestión de Entrada y Salida de Vehículos

Sistema de información integral desarrollado para el parqueadero **"Autos Colombia"**, enfocado en la gestión operativa de accesos vehiculares, asignación dinámica de celdas, detección de suscripciones de mensualidad, inspección física de novedades y liquidación automática de pagos.

---

## 🚀 Características Principales (Iteración 1)

* **Control de Entradas en Tiempo Real:** Captura de placas con autoformato, validación instantánea contra clientes abonados con mensualidad activa, asignación de celda disponible y generación de tiquete con número de folio único.
* **Inspección Física y Bitácora de Novedades:** Registro fotográfico/descriptivo de daños previos (rayones, golpes, abolladuras) al ingresar o salir para deslinde legal de responsabilidades.
* **Liquidación y Cobro Inteligente:** Cálculo exacto de minutos y horas de estancia, aplicación de tiempos de gracia reglamentarios, cobro por fracción según tipo de vehículo (Carro, Moto, Camioneta, Bici) o exoneración ($0 COP) si ampara mensualidad vigente.
* **Plano Interactivo de Celdas:** Monitoreo visual con estados en vivo (Libre en Verde, Ocupada en Rojo con placa y tiempo transcurrido).
* **Arquitectura Limpia y Modular:** Backend en Node.js + Express, persistencia relacional en SQLite con integridad referencial activa, y frontend SPA reactivo con Tailwind CSS.
* **Entregables de Ingeniería de Software:** Modelado completo en StarUML (.mdj), diagramas de Arquitectura, Casos de Uso, Clases y Paquetes, y Esquemas de Base de Datos (MER, MR y DDL físico).

---

## 📂 Estructura del Proyecto

```text
Autos_Colombia/
├── docs/                                 # Documentación técnica formal
│   ├── Autos_Colombia_Documento_Metodologico.pdf # Documento final compilado en PDF
│   ├── 01_requerimientos_y_historias_usuario.md  # RF, RNF e Historias INVEST/Gherkin
│   ├── database/                         # Modelado de datos
│   │   ├── mer_mr_documentation.md       # Diagrama MER conceptual y MR 3FN
│   │   └── schema.sql                    # Script físico DDL e inserción de semillas
│   ├── staruml/                          # Modelos StarUML y PlantUML
│   │   ├── autos_colombia_model.mdj      # Archivo nativo de StarUML con los 4 diagramas
│   │   ├── arquitectura.puml             # Diagrama de arquitectura en capas
│   │   ├── casos_de_uso.puml             # Diagrama de casos de uso e includes/extends
│   │   ├── diagrama_clases.puml          # Diagrama de clases del dominio
│   │   └── diagrama_paquetes.puml        # Diagrama de paquetes modulares
│   └── figma/                            # Guía de diseño UI/UX y Wireframes
│       └── 04_mockups_figma_guide.md     # Tokens, layout y pantallas de usuario
├── src/                                  # Código fuente de la aplicación
│   ├── config/database.js                # Conexión SQLite y migración automática
│   ├── controllers/                      # Controladores REST API
│   ├── models/                           # Capa de acceso a datos y lógica de negocio
│   ├── routes/apiRoutes.js               # Enrutamiento de endpoints
│   ├── public/                           # Frontend Web SPA (HTML5, Tailwind, JS)
│   └── server.js                         # Servidor principal Express
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Instalación y Puesta en Marcha Local

### Prerrequisitos
* Node.js v18+ (probado exitosamente en Node.js v24)
* Git instalado

### Pasos de Ejecución
1. **Clonar o situarse en el repositorio:**
   ```bash
   cd c:\Users\Usuario\Downloads\U\Autos_Colombia
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de la aplicación:**
   ```bash
   npm start
   ```

4. **Acceder a la interfaz web:**
   Abra su navegador en: [http://localhost:3000](http://localhost:3000)

---

## 📦 Instrucciones para Publicar en GitHub

Para subir este proyecto a su cuenta personal de GitHub, ejecute en su terminal:

```bash
# 1. Inicializar git si no está inicializado
git init
git add .
git commit -m "feat: entrega completa iteración 1 parqueadero Autos Colombia"

# 2. Crear repositorio en GitHub (desde la web github.com -> New Repository -> 'Autos_Colombia')

# 3. Vincular repositorio remoto y subir cambios
git branch -M main
git remote add origin https://github.com/SU_USUARIO/Autos_Colombia.git
git push -u origin main
```

---

## 📑 Endpoints de la API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/celdas` | Listado completo de celdas con estado y ocupante |
| `GET` | `/api/celdas/estadisticas` | Contadores de capacidad, libres, ocupadas y porcentajes |
| `GET` | `/api/celdas/disponibles/:tipo` | Celdas libres para una tipología específica |
| `GET` | `/api/accesos/verificar/:placa` | Valida si un vehículo está dentro o si tiene mensualidad |
| `POST` | `/api/accesos/entrada` | Registra entrada de vehículo, asigna celda y emite tiquete |
| `GET` | `/api/accesos/calcular-salida` | Previsualiza liquidación de cobro por tiempo o mensualidad |
| `POST` | `/api/accesos/salida` | Registra salida, liquida valor, libera celda y emite comprobante |
| `GET` | `/api/accesos/activos` | Lista vehículos actualmente estacionados |
| `POST` | `/api/novedades` | Registra un daño o novedad física sobre un vehículo |
| `GET` | `/api/novedades/recientes` | Consulta bitácora cronológica de novedades |
| `GET` | `/api/tarifas` | Consulta tarifario oficial por hora, día y mensualidad |

---

## 👥 Datos del Proyecto
* **Proyecto:** Sistema de Parqueadero por Mensualidad "Autos Colombia"
* **Alcance:** Iteración 1 - Gestión de Entrada y Salida de Vehículos
* **Licencia:** MIT
