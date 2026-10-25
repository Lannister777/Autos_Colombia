# Entregable 5: Modelado de Datos (MER, MR y Modelo Físico)
## Parqueadero "Autos Colombia" - Iteración 1

---

### 1. Modelo Entidad-Relación (MER - Conceptual)

El modelo conceptual captura las entidades del negocio, sus atributos esenciales y las relaciones con sus cardinalidades:

```mermaid
erDiagram
    USUARIO ||--o{ REGISTRO_ACCESO : "registra_entrada_salida"
    USUARIO ||--o{ NOVEDAD : "registra_novedad"
    USUARIO ||--o{ PAGO : "recibe_pago"
    
    CLIENTE ||--o{ VEHICULO : "posee"
    CLIENTE ||--o{ MENSUALIDAD : "suscribe"
    
    VEHICULO ||--o{ MENSUALIDAD : "ampara"
    VEHICULO ||--o{ REGISTRO_ACCESO : "realiza"
    VEHICULO ||--o{ NOVEDAD : "presenta"
    
    CELDA ||--o{ REGISTRO_ACCESO : "aloja"
    
    REGISTRO_ACCESO ||--o{ NOVEDAD : "reporta_en_visita"
    REGISTRO_ACCESO ||--o| PAGO : "liquida_salida"
    
    MENSUALIDAD ||--o{ PAGO : "genera_cobro"
    
    TARIFA ||--o{ REGISTRO_ACCESO : "aplica_costo"

    USUARIO {
        int id_usuario PK
        string nombre_completo
        string username
        string password_hash
        string rol "ADMIN | OPERADOR"
        string estado "ACTIVO | INACTIVO"
    }

    CLIENTE {
        int id_cliente PK
        string documento_identidad UK
        string tipo_documento "CC | CE | NIT"
        string nombre_completo
        string telefono
        string email
        string direccion
    }

    VEHICULO {
        int id_vehiculo PK
        string placa UK
        string tipo_vehiculo "AUTOMOVIL | MOTO | CAMIONETA | BICICLETA"
        string marca
        string linea_modelo
        string color
        int id_cliente FK "nullable para visitantes"
    }

    CELDA {
        int id_celda PK
        string codigo_celda UK "ej: A-01, M-03"
        string tipo_permitido "AUTOMOVIL | MOTO | CAMIONETA | BICICLETA"
        string estado "LIBRE | OCUPADA | MANTENIMIENTO"
        string sector "Piso 1, Bahía Central, etc."
    }

    MENSUALIDAD {
        int id_mensualidad PK
        int id_cliente FK
        int id_vehiculo FK
        date fecha_inicio
        date fecha_fin
        decimal valor_mensual
        string estado "ACTIVA | VENCIDA | CANCELADA"
        int id_celda_fija FK "nullable si celda rotativa"
    }

    REGISTRO_ACCESO {
        int id_registro PK
        string folio_ticket UK
        int id_vehiculo FK
        int id_celda FK
        datetime fecha_hora_entrada
        datetime fecha_hora_salida "nullable"
        string modalidad "OCASIONAL | MENSUALIDAD"
        decimal total_horas_minutos
        decimal valor_calculado
        string estado "EN_CURSO | FINALIZADO"
        int id_usuario_entrada FK
        int id_usuario_salida FK "nullable"
    }

    NOVEDAD {
        int id_novedad PK
        int id_registro FK "nullable"
        int id_vehiculo FK
        string momento "ENTRADA | ESTANCIA | SALIDA"
        string tipo_novedad "GOLPE | RAYON | ACCESORIO | PERTENENCIA | MECANICA"
        string descripcion
        string severidad "BAJA | MEDIA | ALTA"
        datetime fecha_hora
        int id_usuario FK
    }

    TARIFA {
        int id_tarifa PK
        string tipo_vehiculo UK
        decimal valor_hora_fraccion
        decimal valor_dia
        decimal valor_mensualidad
        decimal tiempo_gracia_minutos
        boolean activo
    }

    PAGO {
        int id_pago PK
        string numero_comprobante UK
        int id_registro FK "nullable si es pago de mensualidad"
        int id_mensualidad FK "nullable si es pago ocasional"
        decimal monto_pagado
        string metodo_pago "EFECTIVO | NEQUI | DAVIPLATA | TARJETA"
        datetime fecha_hora_pago
        string referencia_transaccion
        int id_usuario FK
    }
```

---

### 2. Modelo Relacional (MR - Esquema Normalizado 3FN)

El diseño relacional cumple rigurosamente con la **Tercera Forma Normal (3FN)**:
1. **1FN**: Todos los atributos son atómicos y no existen grupos repetitivos.
2. **2FN**: Todos los atributos no clave tienen dependencia funcional completa de la clave primaria.
3. **3FN**: No existen dependencias transitivas entre atributos no clave.

#### Esquema de Tablas y Claves

1. **`usuarios`**
   * **PK:** `id_usuario` (INT, AUTO_INCREMENT)
   * `nombre_completo` (VARCHAR(100), NOT NULL)
   * `username` (VARCHAR(50), UNIQUE, NOT NULL)
   * `password_hash` (VARCHAR(255), NOT NULL)
   * `rol` (VARCHAR(20), CHECK in ('ADMIN', 'OPERADOR'), NOT NULL)
   * `activo` (BOOLEAN, DEFAULT TRUE)
   * `fecha_creacion` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

2. **`clientes`**
   * **PK:** `id_cliente` (INT, AUTO_INCREMENT)
   * `documento` (VARCHAR(20), UNIQUE, NOT NULL)
   * `tipo_documento` (VARCHAR(10), DEFAULT 'CC')
   * `nombre_completo` (VARCHAR(120), NOT NULL)
   * `telefono` (VARCHAR(20), NOT NULL)
   * `email` (VARCHAR(100))
   * `direccion` (VARCHAR(150))
   * `fecha_registro` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

3. **`vehiculos`**
   * **PK:** `id_vehiculo` (INT, AUTO_INCREMENT)
   * `placa` (VARCHAR(10), UNIQUE, NOT NULL)
   * `tipo_vehiculo` (VARCHAR(20), CHECK in ('AUTOMOVIL', 'MOTO', 'CAMIONETA', 'BICICLETA'), NOT NULL)
   * `marca` (VARCHAR(50))
   * `modelo` (VARCHAR(50))
   * `color` (VARCHAR(30))
   * `id_cliente` (INT, NULL, **FK** -> `clientes(id_cliente)`)
   * `fecha_creacion` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

4. **`celdas`**
   * **PK:** `id_celda` (INT, AUTO_INCREMENT)
   * `codigo_celda` (VARCHAR(10), UNIQUE, NOT NULL)
   * `tipo_permitido` (VARCHAR(20), NOT NULL)
   * `estado` (VARCHAR(20), CHECK in ('LIBRE', 'OCUPADA', 'MANTENIMIENTO'), DEFAULT 'LIBRE')
   * `sector` (VARCHAR(50), NOT NULL)

5. **`tarifas`**
   * **PK:** `id_tarifa` (INT, AUTO_INCREMENT)
   * `tipo_vehiculo` (VARCHAR(20), UNIQUE, NOT NULL)
   * `valor_hora_fraccion` (DECIMAL(10,2), NOT NULL)
   * `valor_dia` (DECIMAL(10,2), NOT NULL)
   * `valor_mensualidad` (DECIMAL(10,2), NOT NULL)
   * `tiempo_gracia_minutos` (INT, DEFAULT 10)
   * `activo` (BOOLEAN, DEFAULT TRUE)

6. **`mensualidades`**
   * **PK:** `id_mensualidad` (INT, AUTO_INCREMENT)
   * `id_cliente` (INT, NOT NULL, **FK** -> `clientes(id_cliente)`)
   * `id_vehiculo` (INT, NOT NULL, **FK** -> `vehiculos(id_vehiculo)`)
   * `id_celda_asignada` (INT, NULL, **FK** -> `celdas(id_celda)`)
   * `fecha_inicio` (DATE, NOT NULL)
   * `fecha_fin` (DATE, NOT NULL)
   * `valor_mensual` (DECIMAL(10,2), NOT NULL)
   * `estado` (VARCHAR(20), CHECK in ('ACTIVA', 'VENCIDA', 'CANCELADA'), DEFAULT 'ACTIVA')

7. **`registros_acceso`**
   * **PK:** `id_registro` (INT, AUTO_INCREMENT)
   * `folio_ticket` (VARCHAR(30), UNIQUE, NOT NULL)
   * `id_vehiculo` (INT, NOT NULL, **FK** -> `vehiculos(id_vehiculo)`)
   * `id_celda` (INT, NOT NULL, **FK** -> `celdas(id_celda)`)
   * `fecha_hora_entrada` (DATETIME, NOT NULL)
   * `fecha_hora_salida` (DATETIME, NULL)
   * `modalidad` (VARCHAR(20), CHECK in ('OCASIONAL', 'MENSUALIDAD'), NOT NULL)
   * `minutos_estancia` (INT, DEFAULT 0)
   * `valor_total` (DECIMAL(10,2), DEFAULT 0.00)
   * `estado` (VARCHAR(20), CHECK in ('EN_CURSO', 'FINALIZADO'), DEFAULT 'EN_CURSO')
   * `id_usuario_entrada` (INT, NOT NULL, **FK** -> `usuarios(id_usuario)`)
   * `id_usuario_salida` (INT, NULL, **FK** -> `usuarios(id_usuario)`)

8. **`novedades`**
   * **PK:** `id_novedad` (INT, AUTO_INCREMENT)
   * `id_registro` (INT, NULL, **FK** -> `registros_acceso(id_registro)`)
   * `id_vehiculo` (INT, NOT NULL, **FK** -> `vehiculos(id_vehiculo)`)
   * `momento` (VARCHAR(20), CHECK in ('ENTRADA', 'ESTANCIA', 'SALIDA'), NOT NULL)
   * `tipo_novedad` (VARCHAR(30), NOT NULL)
   * `descripcion` (TEXT, NOT NULL)
   * `severidad` (VARCHAR(20), CHECK in ('BAJA', 'MEDIA', 'ALTA'), DEFAULT 'BAJA')
   * `fecha_hora` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
   * `id_usuario` (INT, NOT NULL, **FK** -> `usuarios(id_usuario)`)

9. **`pagos`**
   * **PK:** `id_pago` (INT, AUTO_INCREMENT)
   * `numero_comprobante` (VARCHAR(30), UNIQUE, NOT NULL)
   * `id_registro` (INT, NULL, **FK** -> `registros_acceso(id_registro)`)
   * `id_mensualidad` (INT, NULL, **FK** -> `mensualidades(id_mensualidad)`)
   * `monto_pagado` (DECIMAL(10,2), NOT NULL)
   * `metodo_pago` (VARCHAR(30), CHECK in ('EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TARJETA'), NOT NULL)
   * `referencia_transaccion` (VARCHAR(60), NULL)
   * `fecha_hora_pago` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
   * `id_usuario` (INT, NOT NULL, **FK** -> `usuarios(id_usuario)`)
