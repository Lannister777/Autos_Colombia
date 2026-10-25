# Entregable 8: Diagrama de Paquetes (STARUML)
## Parqueadero "Autos Colombia" - Iteración 1

---

### 1. Organización Modular de Paquetes

La descomposición en paquetes del sistema **Autos Colombia** sigue el estándar de diseño por capas y componentes modulares, agrupados bajo el espacio de nombres corporativo:

```
com.autoscolombia/
├── presentation/         (Capa de Interfaz de Usuario y Controladores Web)
│   ├── controllers/
│   ├── dtos/
│   └── views/
├── service/              (Capa de Aplicación y Lógica de Negocio)
│   ├── interfaces/
│   └── implementations/
├── domain/               (Capa de Negocio Puro y Entidades)
│   ├── entities/
│   ├── enums/
│   └── exceptions/
└── infrastructure/       (Capa de Persistencia, Conectores y Hardware)
    ├── database/
    ├── repositories/
    └── hardware_adapters/
```

---

### 2. Diagrama de Paquetes UML

```mermaid
flowchart TD
    subgraph PRESENTATION["com.autoscolombia.presentation"]
        CTRL["controllers\n(AccesoCtrl, CeldaCtrl, PagoCtrl, NovedadCtrl)"]
        DTO["dtos\n(EntradaDTO, SalidaDTO, LiquidacionDTO)"]
        VIEW["views / web\n(HTML5, Tailwind, JS Engine)"]
    end

    subgraph SERVICE["com.autoscolombia.service"]
        SRV_ACC["AccesoService"]
        SRV_CEL["CeldaService"]
        SRV_TAR["TarifaService"]
        SRV_MEN["MensualidadService"]
        SRV_NOV["NovedadService"]
        SRV_PAG["PagoService"]
    end

    subgraph DOMAIN["com.autoscolombia.domain"]
        ENT["entities\n(Vehiculo, Celda, Registro, Novedad, Pago)"]
        ENUMS["enums\n(TipoVehiculo, EstadoCelda, MetodoPago)"]
        EXC["exceptions\n(CupoLlenoException, PlacaInvalidaException)"]
    end

    subgraph INFRA["com.autoscolombia.infrastructure"]
        REPO["repositories\n(SQLiteAccesoRepo, SQLiteCeldaRepo, etc.)"]
        DB_CONN["database\n(SQLiteConnectionPool, SchemaMigrator)"]
        HARDWARE["hardware_adapters\n(ThermalTicketPrinter, ScannerAdapter)"]
    end

    PRESENTATION -->|"<<use>>"| SERVICE
    PRESENTATION -->|"<<use>>"| DTO
    SERVICE -->|"<<import>>"| DOMAIN
    SERVICE -->|"<<use>>"| REPO
    INFRA -->|"<<implements>>"| DOMAIN
    REPO --> DB_CONN
    SERVICE --> HARDWARE
```

---

### 3. Matriz de Dependencias y Reglas de Arquitectura

1. **Dirección Unidireccional:** Las dependencias van de las capas superiores a las inferiores (`Presentation` -> `Service` -> `Domain` & `Infrastructure`). No existen dependencias circulares.
2. **Independencia del Dominio:** El paquete `domain` no tiene dependencias de bibliotecas de base de datos ni de frameworks web, permitiendo que las reglas de negocio sean portables y testables de forma aislada.
3. **Inversión de Dependencias (DIP):** Los servicios de la aplicación interactúan con contratos e interfaces de repositorios que la infraestructura implementa.

---

### 4. Código Fuente PlantUML del Diagrama de Paquetes

```plantuml
@startuml Diagrama_Paquetes_Autos_Colombia
skinparam packageStyle folder
skinparam roundcorner 8

package "com.autoscolombia.presentation" as PKG_Pres {
    package "controllers" {
        [AccesoController]
        [CeldaController]
        [PagoController]
        [NovedadController]
    }
    package "dtos" {
        [EntradaRequestDTO]
        [SalidaResponseDTO]
        [LiquidacionDTO]
    }
    package "views_ui" {
        [WebSPA]
    }
}

package "com.autoscolombia.service" as PKG_Srv {
    [AccesoService]
    [CeldaService]
    [TarifaService]
    [MensualidadService]
    [NovedadService]
    [PagoService]
}

package "com.autoscolombia.domain" as PKG_Dom {
    package "entities" {
        [Vehiculo]
        [Celda]
        [RegistroAcceso]
        [Novedad]
        [Tarifa]
        [Pago]
    }
    package "enums" {
        [TipoVehiculo]
        [EstadoCelda]
        [MetodoPago]
    }
    package "exceptions" {
        [CupoLlenoException]
        [VehiculoYaDentroException]
    }
}

package "com.autoscolombia.infrastructure" as PKG_Infra {
    package "repositories" {
        [VehiculoRepository]
        [CeldaRepository]
        [RegistroRepository]
        [NovedadRepository]
    }
    package "database" {
        [SQLiteConnectionPool]
    }
    package "hardware" {
        [ThermalTicketPrinter]
    }
}

PKG_Pres ..> PKG_Srv : <<use>>
PKG_Pres ..> dtos : <<use>>
PKG_Srv ..> PKG_Dom : <<use>>
PKG_Srv ..> repositories : <<use>>
PKG_Srv ..> hardware : <<use>>
repositories ..> database : <<use>>
repositories ..> PKG_Dom : <<map_to>>

@enduml
```
