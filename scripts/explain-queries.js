use("project_management");

// -----------------------------------------------------------
// 1) CONSULTA CON FILTROS (usa índice compuesto idx_board)
//    Requisito: consulta con filtros
// -----------------------------------------------------------
// Elegimos una columna cualquiera del primer proyecto para probar.
const anyColumn = db.columns.findOne();
print("\n--- 1) FILTROS: tareas por proyecto+columna ---");
printjson(
  db.tasks
    .find({ project_id: anyColumn.project_id, column_id: anyColumn._id })
    .sort({ order: 1 })
    .explain("executionStats").executionStats
);
// Esperado: winningPlan.stage = "IXSCAN" usando idx_board
//           totalKeysExamined ~ nReturned, totalDocsExamined ~ nReturned

// -----------------------------------------------------------
// 2) CONSULTA POR RANGO (usa idx_column o COLLSCAN según selectividad)
//    Requisito: búsqueda por rangos
// -----------------------------------------------------------
print("\n--- 2) RANGO: tareas con due_date entre marzo y junio 2026 ---");
printjson(
  db.tasks
    .find({
      due_date: {
        $gte: new Date("2026-03-01"),
        $lte: new Date("2026-06-30")
      }
    })
    .explain("executionStats").executionStats
);
// Esperado: COLLSCAN sobre 60 tareas — la BD es chica.
// Para justificar un índice adicional {due_date:1} se puede mostrar el plan
// y comparar cantidades de docs examinados.

// -----------------------------------------------------------
// 3) CONSULTA POR TEXTO (usa txt_title_desc)
//    Requisito: búsqueda por texto
// -----------------------------------------------------------
print("\n--- 3) TEXTO: tareas que mencionen 'API' ---");
printjson(
  db.tasks
    .find({ $text: { $search: "API" } })
    .explain("executionStats").executionStats
);
// Esperado: winningPlan.stage = "TEXT_MATCH" con inputStage "IXSCAN"
//           indexName = "txt_title_desc"

// -----------------------------------------------------------
// 4) COMPARACIÓN CON Y SIN ÍNDICE (opcional, más evidencia)
//    Sacar el índice compuesto, correr la misma consulta y ver COLLSCAN.
//    NOTA: solo si querés incluir esta captura en el informe.
// -----------------------------------------------------------
// db.tasks.dropIndex("idx_board");
// db.tasks.find({ project_id: anyColumn.project_id, column_id: anyColumn._id })
//   .explain("executionStats").executionStats;
// // recrear:
// db.tasks.createIndex(
//   { project_id: 1, column_id: 1, order: 1 },
//   { name: "idx_board" }
// );

// -----------------------------------------------------------
// 5) LISTAR ÍNDICES ACTUALES (para pantallazo)
// -----------------------------------------------------------
print("\n--- Índices en tasks ---");
printjson(db.tasks.getIndexes());
