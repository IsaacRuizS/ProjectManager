use("project_management");

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password_hash", "role", "created_at"],
      properties: {
        name: { bsonType: "string", minLength: 1 },
        email: {
          bsonType: "string",
          pattern: "^.+@.+\\..+$",
          description: "Correo electrónico válido"
        },
        password_hash: { bsonType: "string" },
        role: { enum: ["admin", "member"] },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("projects", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "owner_id", "members", "start_date", "due_date", "status"],
      properties: {
        name: { bsonType: "string", minLength: 1 },
        description: { bsonType: "string" },
        owner_id: { bsonType: "objectId" },
        members: {
          bsonType: "array",
          items: { bsonType: "objectId" }
        },
        start_date: { bsonType: "date" },
        due_date: { bsonType: "date" },
        status: { enum: ["active", "paused", "finished"] }
      }
    }
  }
});

db.createCollection("columns", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "order", "project_id"],
      properties: {
        name: { bsonType: "string", minLength: 1 },
        order: { bsonType: "int", minimum: 0 },
        project_id: { bsonType: "objectId" },
        color: { bsonType: "string" }
      }
    }
  }
});

db.createCollection("tasks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "title",
        "project_id",
        "column_id",
        "assignee_id",
        "priority",
        "order",
        "created_at"
      ],
      properties: {
        title: { bsonType: "string", minLength: 1 },
        description: { bsonType: "string" },
        project_id: { bsonType: "objectId" },
        column_id: { bsonType: "objectId" },
        assignee_id: { bsonType: "objectId" },
        priority: { enum: ["low", "medium", "high"] },
        order: { bsonType: "int", minimum: 0 },
        created_at: { bsonType: "date" },
        due_date: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["task_id", "user_id", "text", "created_at"],
      properties: {
        task_id: { bsonType: "objectId" },
        user_id: { bsonType: "objectId" },
        text: { bsonType: "string", minLength: 1 },
        created_at: { bsonType: "date" }
      }
    }
  }
});


// Índice SIMPLE: acelera la consulta de tareas por columna del tablero.
db.tasks.createIndex({ column_id: 1 }, { name: "idx_column" });

// Índice COMPUESTO: acelera el render del tablero Kanban
db.tasks.createIndex(
  { project_id: 1, column_id: 1, order: 1 },
  { name: "idx_board" }
);

// Índice de TEXTO: soporta búsqueda por texto en título y descripción de tareas
db.tasks.createIndex(
  { title: "text", description: "text" },
  { name: "txt_title_desc", default_language: "spanish" }
);