use("project_management");

// ---------- USERS (20) --------------------------------------
const userNames = [
  "Maria Rodriguez", "Carlos Jimenez", "Ana Vargas", "Luis Solano", "Fernanda Castro",
  "Diego Mora", "Paola Rojas", "Andres Chacon", "Valeria Nunez", "Kevin Araya",
  "Gabriela Fallas", "Josue Salas", "Camila Brenes", "Esteban Quiros", "Natalia Cordero",
  "Ricardo Villalobos", "Melissa Segura", "Jorge Alfaro", "Daniela Barrantes", "Mauricio Urena"
];

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, ".");
}

const usersDocs = userNames.map((name, i) => ({
  name: name,
  email: slugify(name) + "@company.com",
  password_hash: "$2b$10$sampleHashNotReal" + i,
  role: i < 3 ? "admin" : "member",
  created_at: new Date(2026, 0, (i % 27) + 1)
}));

const resUsers = db.users.insertMany(usersDocs);
const userIds = Object.values(resUsers.insertedIds);

const projectNames = [
  "Rediseño Sitio Corporativo", "App Móvil de Ventas", "Migración a la Nube",
  "Sistema de Facturación", "Portal de Clientes", "Automatización de RRHH",
  "Plataforma de E-learning", "App de Delivery", "Sistema de Inventario",
  "Chatbot de Soporte", "Dashboard de Analítica", "Rediseño de Marca",
  "Integración de Pagos", "App de Reservas", "CRM Interno",
  "Sistema de Tiquetes", "Portal de Proveedores", "App de Gastos",
  "Plataforma de Encuestas", "Sistema de Videollamadas"
];

const projectsDocs = projectNames.map((name, i) => {
  const owner = userIds[i % 3];
  const membersSet = new Set();
  for (let m = 1; m <= 4; m++) {
    membersSet.add(String(userIds[(i + m) % userIds.length]));
  }
  return {
    name: name,
    description: `Proyecto interno: ${name}`,
    owner_id: owner,
    members: [...membersSet].map(id => new ObjectId(id)),
    start_date: new Date(2026, i % 12, 1),
    due_date: new Date(2026, (i % 12 + 2) % 12, 28),
    status: i % 5 === 0 ? "finished" : (i % 4 === 0 ? "paused" : "active")
  };
});

const resProjects = db.projects.insertMany(projectsDocs);
const projectIds = Object.values(resProjects.insertedIds);

const columnNames = ["Por hacer", "En progreso", "En revisión", "Terminado"];
const columnColors = ["#94A3B8", "#3B82F6", "#F59E0B", "#22C55E"];

let columnsDocs = [];
projectIds.forEach((projectId) => {
  columnNames.forEach((name, order) => {
    columnsDocs.push({
      name: name,
      order: NumberInt(order),
      project_id: projectId,
      color: columnColors[order]
    });
  });
});

const resColumns = db.columns.insertMany(columnsDocs);
const columnIds = Object.values(resColumns.insertedIds);

const columnsByProject = {};
columnsDocs.forEach((col, i) => {
  const key = String(col.project_id);
  if (!columnsByProject[key]) columnsByProject[key] = [];
  columnsByProject[key].push(columnIds[i]);
});

const taskTitles = [
  "Diseñar mockup en Figma", "Configurar entorno de desarrollo", "Crear modelo de base de datos",
  "Implementar autenticación", "Construir REST API", "Conectar frontend con backend",
  "Escribir pruebas unitarias", "Corregir bug de sesión", "Optimizar consultas",
  "Documentar endpoints", "Revisar accesibilidad", "Desplegar a producción",
  "Configurar CI/CD", "Diseñar landing page", "Integrar pasarela de pagos",
  "Generar reportes PDF", "Configurar notificaciones push", "Migrar datos legacy",
  "Ajustar diseño responsive", "Preparar demo para el cliente"
];

const priorities = ["low", "medium", "high"];

let tasksDocs = [];
projectIds.forEach((projectId, pi) => {
  const cols = columnsByProject[String(projectId)];
  for (let t = 0; t < 3; t++) {
    const titleIndex = (pi * 3 + t) % taskTitles.length;
    const columnIndex = t % cols.length;
    tasksDocs.push({
      title: taskTitles[titleIndex],
      description: `Tarea relacionada con: ${taskTitles[titleIndex]}`,
      project_id: projectId,
      column_id: cols[columnIndex],
      assignee_id: userIds[(pi + t) % userIds.length],
      priority: priorities[(pi + t) % priorities.length],
      order: NumberInt(t),
      created_at: new Date(2026, pi % 12, (t % 27) + 1),
      due_date: new Date(2026, pi % 12, (t % 27) + 10)
    });
  }
});

const resTasks = db.tasks.insertMany(tasksDocs);
const taskIds = Object.values(resTasks.insertedIds);

const commentTexts = [
  "Avancé con esto, necesita revisión.",
  "Tengo una duda, ¿podemos verla en la próxima reunión?",
  "Listo, favor revisar el pull request.",
  "Necesito un día más para terminar.",
  "Encontré un problema con los datos de prueba.",
  "Buen trabajo, aprobado.",
  "Esta parte aún necesita documentación.",
  "Ya se desplegó al entorno de pruebas."
];

let commentsDocs = [];
taskIds.forEach((taskId, i) => {
  commentsDocs.push({
    task_id: taskId,
    user_id: userIds[i % userIds.length],
    text: commentTexts[i % commentTexts.length],
    created_at: new Date(2026, i % 12, (i % 27) + 1)
  });
});

db.comments.insertMany(commentsDocs);