// Script para construir el archivo oficial StarUML .mdj con todos los modelos y diagramas de las Iteraciones 1 y 2
const fs = require('fs');
const path = require('path');

function generateStarUMLProject() {
  const projectId = "AAAAAAGG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const project = {
    "_type": "Project",
    "_id": projectId,
    "name": "AutosColombia_Software_StarUML_Iteraciones_1_y_2",
    "ownedElements": []
  };

  // 1. MODELO DE ARQUITECTURA
  const archModelId = "AAAAARCH" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const archDiagramId = "AAAAARCHDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const archModel = {
    "_type": "UMLModel",
    "_id": archModelId,
    "_parent": { "$ref": projectId },
    "name": "Arquitectura del Sistema (Tier Architecture)",
    "ownedElements": [
      {
        "_type": "UMLPackageDiagram",
        "_id": archDiagramId,
        "_parent": { "$ref": archModelId },
        "name": "Diagrama de Arquitectura en Capas",
        "ownedViews": []
      }
    ]
  };

  // 2. MODELO DE CASOS DE USO - ITERACIÓN 1
  const uc1ModelId = "AAAAAUC1" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const uc1DiagramId = "AAAAAUC1DIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const uc1Model = {
    "_type": "UMLModel",
    "_id": uc1ModelId,
    "_parent": { "$ref": projectId },
    "name": "Casos de Uso - Iteración 1 (Entrada y Salida de Vehículos)",
    "ownedElements": [
      {
        "_type": "UMLUseCaseDiagram",
        "_id": uc1DiagramId,
        "_parent": { "$ref": uc1ModelId },
        "name": "Diagrama Casos de Uso - Entrada y Salida",
        "ownedViews": []
      }
    ]
  };

  const useCasesIt1 = [
    "CU01 - Registrar Entrada de Vehículo",
    "CU02 - Validar Suscripción de Mensualidad",
    "CU03 - Asignar Celda Disponible",
    "CU04 - Registrar Novedades e Inspección Física",
    "CU05 - Emitir Ticket de Entrada",
    "CU06 - Registrar Salida de Vehículo",
    "CU07 - Calcular Duración y Tarifa",
    "CU08 - Liberar Celda de Parqueo",
    "CU09 - Gestionar Pago y Recibo",
    "CU10 - Monitorear Tablero de Celdas en Tiempo Real"
  ];
  useCasesIt1.forEach(name => {
    uc1Model.ownedElements.push({
      "_type": "UMLUseCase",
      "_id": "UC1_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": uc1ModelId },
      "name": name
    });
  });

  // 3. MODELO DE CASOS DE USO - ITERACIÓN 2
  const uc2ModelId = "AAAAAUC2" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const uc2DiagramId = "AAAAAUC2DIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const uc2Model = {
    "_type": "UMLModel",
    "_id": uc2ModelId,
    "_parent": { "$ref": projectId },
    "name": "Casos de Uso - Iteración 2 (Gestión de Usuarios y Celdas)",
    "ownedElements": [
      {
        "_type": "UMLUseCaseDiagram",
        "_id": uc2DiagramId,
        "_parent": { "$ref": uc2ModelId },
        "name": "Diagrama Casos de Uso - Usuarios y Celdas",
        "ownedViews": []
      }
    ]
  };

  const useCasesIt2 = [
    "CU-IT2-01: Iniciar Sesión / Autenticar Usuario",
    "CU-IT2-02: Registrar Nuevo Usuario Operador",
    "CU-IT2-03: Editar Información y Rol de Usuario",
    "CU-IT2-04: Activar o Desactivar Usuario",
    "CU-IT2-05: Cambiar Contraseña de Cuenta",
    "CU-IT2-06: Consultar y Filtrar Listado de Usuarios",
    "CU-IT2-07: Registrar Nueva Celda de Parqueo",
    "CU-IT2-08: Modificar Configuración de Celda",
    "CU-IT2-09: Cambiar Estado a Mantenimiento",
    "CU-IT2-10: Habilitar Celda desde Mantenimiento",
    "CU-IT2-11: Eliminar Celda sin Historial",
    "CU-IT2-12: Generar Reporte de Capacidad y Ocupación"
  ];
  useCasesIt2.forEach(name => {
    uc2Model.ownedElements.push({
      "_type": "UMLUseCase",
      "_id": "UC2_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": uc2ModelId },
      "name": name
    });
  });

  // Actores Globales
  const actors = ["Operador de Caseta", "Administrador del Sistema", "Cliente Abonado"];
  actors.forEach(name => {
    const actorObj = {
      "_type": "UMLActor",
      "_id": "ACT_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": uc2ModelId },
      "name": name
    };
    uc1Model.ownedElements.push(actorObj);
    uc2Model.ownedElements.push(actorObj);
  });

  // 4. MODELO DE CLASES (DOMINIO COMPLETO)
  const classModelId = "AAAAACLASS" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const classDiagramId = "AAAAACLASSDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const classModel = {
    "_type": "UMLModel",
    "_id": classModelId,
    "_parent": { "$ref": projectId },
    "name": "Modelo de Clases del Dominio",
    "ownedElements": [
      {
        "_type": "UMLClassDiagram",
        "_id": classDiagramId,
        "_parent": { "$ref": classModelId },
        "name": "Diagrama de Clases - Autos Colombia",
        "ownedViews": []
      }
    ]
  };

  function createUMLClass(parentRef, name, attributes = [], operations = []) {
    const classId = "CLS_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      "_type": "UMLClass",
      "_id": classId,
      "_parent": parentRef,
      "name": name,
      "attributes": attributes.map(a => ({
        "_type": "UMLAttribute",
        "_id": "ATTR_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        "name": a.name,
        "visibility": a.vis || "private",
        "type": a.type || "String"
      })),
      "operations": operations.map(o => ({
        "_type": "UMLOperation",
        "_id": "OP_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        "name": o.name,
        "visibility": o.vis || "public",
        "parameters": (o.params || []).map(p => ({
          "_type": "UMLParameter",
          "_id": "PARAM_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          "name": p.name,
          "type": p.type
        }))
      }))
    };
  }

  const classesData = [
    {
      name: "Usuario",
      attributes: [
        { name: "idUsuario", type: "Integer" },
        { name: "nombreCompleto", type: "String" },
        { name: "username", type: "String" },
        { name: "passwordHash", type: "String" },
        { name: "rol", type: "RolUsuario (ADMIN | OPERADOR)" },
        { name: "activo", type: "Boolean" },
        { name: "fechaCreacion", type: "DateTime" }
      ],
      operations: [
        { name: "autenticar", params: [{ name: "password", type: "String" }] },
        { name: "cambiarEstado", params: [{ name: "nuevoActivo", type: "Boolean" }] },
        { name: "actualizarPassword", params: [{ name: "nuevaClave", type: "String" }] },
        { name: "tienePermisoAdmin" }
      ]
    },
    {
      name: "Celda",
      attributes: [
        { name: "idCelda", type: "Integer" },
        { name: "codigoCelda", type: "String" },
        { name: "tipoPermitido", type: "TipoVehiculo" },
        { name: "estado", type: "EstadoCelda (LIBRE | OCUPADA | MANTENIMIENTO)" },
        { name: "sector", type: "String" }
      ],
      operations: [
        { name: "asignarVehiculo" },
        { name: "liberarCelda" },
        { name: "ponerEnMantenimiento" },
        { name: "habilitarDisponible" },
        { name: "esEliminable" }
      ]
    },
    {
      name: "Vehiculo",
      attributes: [
        { name: "idVehiculo", type: "Integer" },
        { name: "placa", type: "String" },
        { name: "tipoVehiculo", type: "TipoVehiculo" },
        { name: "marca", type: "String" },
        { name: "lineaModelo", type: "String" },
        { name: "color", type: "String" }
      ],
      operations: [
        { name: "validarPlaca" },
        { name: "esAbonadoMensual" }
      ]
    },
    {
      name: "RegistroAcceso",
      attributes: [
        { name: "idRegistro", type: "Integer" },
        { name: "folioTicket", type: "String" },
        { name: "fechaHoraEntrada", type: "DateTime" },
        { name: "fechaHoraSalida", type: "DateTime" },
        { name: "modalidad", type: "ModalidadAcceso (OCASIONAL | MENSUALIDAD)" },
        { name: "minutosEstancia", type: "Integer" },
        { name: "valorTotal", type: "Decimal" },
        { name: "estado", type: "EstadoAcceso (EN_CURSO | FINALIZADO)" }
      ],
      operations: [
        { name: "calcularMinutosEstancia" },
        { name: "liquidarSalida", params: [{ name: "tarifa", type: "Tarifa" }] },
        { name: "generarTicket" }
      ]
    },
    {
      name: "Novedad",
      attributes: [
        { name: "idNovedad", type: "Integer" },
        { name: "momento", type: "MomentoRegistro (ENTRADA | ESTANCIA | SALIDA)" },
        { name: "tipoNovedad", type: "String" },
        { name: "descripcion", type: "String" },
        { name: "severidad", type: "NivelSeveridad (BAJA | MEDIA | ALTA)" },
        { name: "fechaHora", type: "DateTime" }
      ],
      operations: [
        { name: "registrarObservacion" }
      ]
    },
    {
      name: "Tarifa",
      attributes: [
        { name: "idTarifa", type: "Integer" },
        { name: "tipoVehiculo", type: "TipoVehiculo" },
        { name: "valorHoraFraccion", type: "Decimal" },
        { name: "valorDia", type: "Decimal" },
        { name: "valorMensualidad", type: "Decimal" },
        { name: "tiempoGraciaMinutos", type: "Integer" }
      ],
      operations: [
        { name: "calcularCobro", params: [{ name: "minutos", type: "Integer" }] }
      ]
    },
    {
      name: "Pago",
      attributes: [
        { name: "idPago", type: "Integer" },
        { name: "numeroComprobante", type: "String" },
        { name: "montoPagado", type: "Decimal" },
        { name: "metodoPago", type: "MetodoPago (EFECTIVO | NEQUI | DAVIPLATA | TARJETA)" },
        { name: "fechaHoraPago", type: "DateTime" }
      ],
      operations: [
        { name: "procesarPago" },
        { name: "generarRecibo" }
      ]
    }
  ];

  classesData.forEach(c => {
    classModel.ownedElements.push(createUMLClass({ "$ref": classModelId }, c.name, c.attributes, c.operations));
  });

  // 5. MODELO DE DIAGRAMAS DE SECUENCIA (ITERACIONES 1 Y 2)
  const seqModelId = "AAAAASEQ" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const seqDiagramId = "AAAAASEQDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const seqModel = {
    "_type": "UMLModel",
    "_id": seqModelId,
    "_parent": { "$ref": projectId },
    "name": "Diagramas de Secuencia (Iteraciones 1 y 2)",
    "ownedElements": [
      {
        "_type": "UMLSequenceDiagram",
        "_id": seqDiagramId,
        "_parent": { "$ref": seqModelId },
        "name": "Interacciones Dinámicas - Caseta, Accesos, Usuarios y Celdas",
        "ownedViews": []
      }
    ]
  };

  // 6. MODELO DE DIAGRAMA DE COMPONENTES (ITERACIONES 1 Y 2)
  const compModelId = "AAAAACOMP" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const compDiagramId = "AAAAACOMPDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const compModel = {
    "_type": "UMLModel",
    "_id": compModelId,
    "_parent": { "$ref": projectId },
    "name": "Diagrama de Componentes (Iteraciones 1 y 2)",
    "ownedElements": [
      {
        "_type": "UMLComponentDiagram",
        "_id": compDiagramId,
        "_parent": { "$ref": compModelId },
        "name": "Arquitectura de Componentes del Sistema",
        "ownedViews": []
      }
    ]
  };

  // 7. MODELO DE PAQUETES
  const pkgModelId = "AAAAAPKG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const pkgDiagramId = "AAAAAPKGDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const pkgModel = {
    "_type": "UMLModel",
    "_id": pkgModelId,
    "_parent": { "$ref": projectId },
    "name": "Diagrama de Paquetes del Sistema",
    "ownedElements": [
      {
        "_type": "UMLPackageDiagram",
        "_id": pkgDiagramId,
        "_parent": { "$ref": pkgModelId },
        "name": "Estructura de Paquetes Modulares",
        "ownedViews": []
      }
    ]
  };

  // Ensamblar proyecto
  project.ownedElements = [archModel, uc1Model, uc2Model, classModel, seqModel, compModel, pkgModel];

  return project;
}

const starUmlProject = generateStarUMLProject();
const outputPath = path.join(__dirname, 'docs', 'staruml', 'autos_colombia_model.mdj');
fs.writeFileSync(outputPath, JSON.stringify(starUmlProject, null, 2), 'utf-8');
console.log('Archivo StarUML .mdj generado exitosamente con Iteraciones 1 y 2 en:', outputPath);
