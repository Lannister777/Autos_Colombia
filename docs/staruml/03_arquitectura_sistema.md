# Entregable 3: Arquitectura del Sistema (STARUML)
## Parqueadero "Autos Colombia" - Iteración 1

---

### 1. Enfoque Arquitectónico

Para el sistema de información del parqueadero **Autos Colombia**, se seleccionó una **Arquitectura en Capas (Layered / N-Tier Architecture)** basada en principios de diseño limpio (*Clean Architecture*) y separación de responsabilidades (*Separation of Concerns*).

Este patrón arquitectónico garantiza:
- **Desacoplamiento:** Las vistas y componentes de usuario no interactúan directamente con la base de datos.
- **Mantenibilidad:** Las reglas de liquidación tarifaria y validación de mensualidades residen en una capa de servicios aislada.
- **Escalabilidad:** Permite migrar fácilmente de un motor local (SQLite) a motores cliente-servidor corporativos (PostgreSQL/MySQL) o incorporar lecturas automatizadas (cámaras LPR de reconocimiento de matrículas o talanqueras electrónicas).

---

### 2. Diagrama de Arquitectura del Sistema

```mermaid
flowchart TB
    subgraph CLIENTE["Capa de Presentación (Client Layer)"]
        UI_DASH["Tablero de Control / Dashboard"]
        UI_ENTRY["Módulo Entrada de Vehículos"]
        UI_EXIT["Módulo Salida y Cobro"]
        UI_CELLS["Visor de Celdas Interactivo"]
        UI_NOV["Módulo Registro de Novedades"]
    end

    subgraph API["Capa de Aplicación y Controladores (REST API)"]
        ROUTER["Enrutador Principal Express.js"]
        AUTH_MW["Middleware de Seguridad y Roles"]
        CTRL_ACCESO["Controlador de Accesos"]
        CTRL_CELDA["Controlador de Celdas"]
        CTRL_PAGO["Controlador de Pagos"]
        CTRL_NOV["Controlador de Novedades"]
    end

    subgraph DOMINIO["Capa de Negocio y Dominio (Domain & Services)"]
        SRV_ACCESO["Servicio de Registro de Entrada/Salida"]
        SRV_MENSUALIDAD["Servicio Validador de Mensualidades"]
        SRV_CELDA["Servicio de Asignación y Liberación"]
        SRV_TARIFA["Servicio Calculador de Cobros y Gracia"]
        SRV_NOVEDAD["Servicio de Auditoría de Novedades"]
        ENTIDADES["Entidades de Negocio (Vehículo, Celda, Pago, Novedad)"]
    end

    subgraph PERSISTENCIA["Capa de Infraestructura y Persistencia"]
        REPO_SQL["Capa de Acceso a Datos / Repositorios"]
        DB[(Base de Datos SQLite / SQL)]
        FS["Almacenamiento Local de Tickets y Logs"]
    end

    CLIENTE -->|"Peticiones HTTP / JSON"| API
    ROUTER --> AUTH_MW
    AUTH_MW --> CTRL_ACCESO & CTRL_CELDA & CTRL_PAGO & CTRL_NOV
    CTRL_ACCESO --> SRV_ACCESO & SRV_MENSUALIDAD
    CTRL_CELDA --> SRV_CELDA
    CTRL_PAGO --> SRV_TARIFA
    CTRL_NOV --> SRV_NOVEDAD
    SRV_ACCESO & SRV_MENSUALIDAD & SRV_CELDA & SRV_TARIFA & SRV_NOVEDAD --> ENTIDADES
    SRV_ACCESO & SRV_CELDA & SRV_TARIFA & SRV_NOVEDAD --> REPO_SQL
    REPO_SQL --> DB
    REPO_SQL --> FS
```

---

### 3. Diagrama de Despliegue de Hardware y Nodos Físicos

```mermaid
flowchart LR
    subgraph CASETA["Puesto de Control / Caseta de Entrada y Salida"]
        PC_OPERADOR["PC de Caseta / Tablet Táctil"]
        SCANNER["Lector de Código de Barras / QR"]
        PRINTER["Impresora Térmica POS (Tickets)"]
        BARRERA["Controlador de Barrera Vehicular (Opcional)"]
    end

    subgraph SERVIDOR["Nodo de Aplicación y Persistencia"]
        NODE_SERVER["Servidor Web & API (Node.js Express)"]
        DATABASE_NODE["Motor de Base de Datos SQLite/SQL"]
    end

    SCANNER -->|"Lectura Placa/Ticket"| PC_OPERADOR
    PC_OPERADOR -->|"Imprime Ticket Entrada/Salida"| PRINTER
    PC_OPERADOR -->|"Señal Apertura"| BARRERA
    PC_OPERADOR -->|"HTTP / REST TCP/IP"| NODE_SERVER
    NODE_SERVER -->|"Consultas SQL / Transacciones ACID"| DATABASE_NODE
```

---

### 4. Código Fuente PlantUML del Diagrama de Arquitectura

El siguiente código fuente PlantUML puede compilarse directamente en StarUML o herramientas UML compatibles:

```plantuml
@startuml Arquitectura_Autos_Colombia
!theme plain
skinparam componentStyle rectangle

package "Capa de Presentación (Web UI)" {
    [Dashboard Operativo] as UI_Dash
    [Módulo de Entrada] as UI_Entrada
    [Módulo de Salida] as UI_Salida
    [Gestión de Celdas] as UI_Celdas
    [Registro de Novedades] as UI_Novedades
}

package "Capa de Controladores y API (REST)" {
    [AccesoController] as C_Acceso
    [CeldaController] as C_Celda
    [PagoController] as C_Pago
    [NovedadController] as C_Novedad
}

package "Capa de Servicios de Negocio" {
    [AccesoService] as S_Acceso
    [MensualidadService] as S_Mensualidad
    [CeldaService] as S_Celda
    [TarifaService] as S_Tarifa
    [NovedadService] as S_Novedad
}

package "Capa de Dominio" {
    class Vehiculo
    class Celda
    class RegistroAcceso
    class Novedad
    class Tarifa
    class Pago
    class Mensualidad
}

package "Capa de Persistencia e Infraestructura" {
    [BaseDatosAdapter] as DB_Adapter
    database "SQLite / SQL Server" as DB
}

UI_Entrada --> C_Acceso
UI_Salida --> C_Acceso
UI_Salida --> C_Pago
UI_Celdas --> C_Celda
UI_Novedades --> C_Novedad

C_Acceso --> S_Acceso
C_Acceso --> S_Mensualidad
C_Celda --> S_Celda
C_Pago --> S_Tarifa
C_Novedad --> S_Novedad

S_Acceso ..> RegistroAcceso
S_Acceso ..> Vehiculo
S_Mensualidad ..> Mensualidad
S_Celda ..> Celda
S_Tarifa ..> Tarifa
S_Novedad ..> Novedad

S_Acceso --> DB_Adapter
S_Celda --> DB_Adapter
S_Tarifa --> DB_Adapter
S_Novedad --> DB_Adapter
DB_Adapter --> DB
@enduml
```
