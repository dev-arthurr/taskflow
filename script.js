// ===== Dados e Estado =====

// Tarefas de exemplo para demonstração
const sampleTasks = [
  { id: 1, name: "Estudar JavaScript", category: "Estudo", priority: "Alta", deadline: "2026-06-05", done: false },
  { id: 2, name: "Ir ao médico", category: "Saúde", priority: "Alta", deadline: "2026-06-04", done: false },
  { id: 3, name: "Ler livro de finanças", category: "Finanças", priority: "Média", deadline: "2026-06-20", done: false },
  { id: 4, name: "Organizar escritório", category: "Trabalho", priority: "Baixa", deadline: "2026-06-30", done: false },
  { id: 5, name: "Correr no parque", category: "Pessoal", priority: "Média", deadline: "2026-06-10", done: true },
  { id: 6, name: "Pagar conta de luz", category: "Finanças", priority: "Alta", deadline: "2026-06-06", done: false },
  { id: 7, name: "Comprar presente", category: "Pessoal", priority: "Baixa", deadline: "2026-06-25", done: true },
  { id: 8, name: "Revisar relatório", category: "Trabalho", priority: "Alta", deadline: "2026-06-03", done: false },
];

// Carrega tarefas do localStorage ou usa exemplos
function loadTasks() {
  const stored = localStorage.getItem("taskflow-tasks");
  if (stored) return JSON.parse(stored);
  return sampleTasks;
}

let tasks = loadTasks();
let nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

// Salva no localStorage
function saveTasks() {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

// ===== Navegação por Abas =====

const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
    refresh();
  });
});

// ===== Funções Auxiliares =====

// Data de hoje no formato YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// Verifica se tarefa está atrasada
function isOverdue(task) {
  return !task.done && task.deadline && task.deadline < todayStr();
}

// Classe CSS do badge de prioridade
function priorityBadgeClass(p) {
  return p === "Alta" ? "badge-high" : p === "Média" ? "badge-medium" : "badge-low";
}

// Formata data para exibição
function formatDate(d) {
  if (!d) return "";
  const parts = d.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ===== Atualização do Dashboard =====

function updateDashboard() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pending = tasks.filter(t => !t.done).length;
  const overdue = tasks.filter(t => isOverdue(t)).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  // Cards de estatísticas
  document.getElementById("stat-progress").textContent = progress + "%";
  document.getElementById("stat-pending").textContent = pending;
  document.getElementById("stat-done").textContent = done;
  document.getElementById("stat-overdue").textContent = overdue;

  // Gráfico de barras — conta tarefas por prioridade
  const highCount = tasks.filter(t => t.priority === "Alta").length;
  const medCount = tasks.filter(t => t.priority === "Média").length;
  const lowCount = tasks.filter(t => t.priority === "Baixa").length;
  const maxCount = Math.max(highCount, medCount, lowCount, 1);

  document.getElementById("bar-high").style.width = (highCount / maxCount * 100) + "%";
  document.getElementById("bar-medium").style.width = (medCount / maxCount * 100) + "%";
  document.getElementById("bar-low").style.width = (lowCount / maxCount * 100) + "%";
  document.getElementById("bar-high-val").textContent = highCount;
  document.getElementById("bar-medium-val").textContent = medCount;
  document.getElementById("bar-low-val").textContent = lowCount;

  // 5 tarefas mais recentes
  const recentEl = document.getElementById("recent-list");
  const recent = [...tasks].reverse().slice(0, 5);

  if (recent.length === 0) {
    recentEl.innerHTML = '<div class="empty-state">Nenhuma tarefa cadastrada</div>';
    return;
  }

  recentEl.innerHTML = recent.map(t => `
    <div class="recent-item">
      <span class="recent-name">${t.name}</span>
      <div class="recent-meta">
        <span class="badge ${t.done ? 'badge-concluida' : 'badge-pendente'}">${t.done ? 'Concluída' : 'Pendente'}</span>
        <span class="badge ${priorityBadgeClass(t.priority)}">${t.priority}</span>
        ${isOverdue(t) ? '<span class="badge badge-atrasada">Atrasada</span>' : ''}
      </div>
    </div>
  `).join("");
}

// ===== Lista de Tarefas =====

function getFilteredTasks() {
  const search = document.getElementById("filter-search").value.toLowerCase().trim();
  const priority = document.getElementById("filter-priority").value;
  const status = document.getElementById("filter-status").value;

  return tasks.filter(t => {
    if (search && !t.name.toLowerCase().includes(search)) return false;
    if (priority && t.priority !== priority) return false;
    if (status === "pendente" && t.done) return false;
    if (status === "concluída" && !t.done) return false;
    return true;
  });
}

function renderTaskList() {
  const listEl = document.getElementById("task-list");
  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="empty-state">Nenhuma tarefa encontrada</div>';
    return;
  }

  listEl.innerHTML = filtered.map(t => `
    <div class="task-item ${t.done ? 'done' : ''}" data-id="${t.id}">
      <div class="task-check ${t.done ? 'checked' : ''}" data-action="toggle" data-id="${t.id}">${t.done ? '&#10003;' : ''}</div>
      <div class="task-info">
        <div class="task-name">${t.name}</div>
        <div class="task-details">
          <span class="task-category">${t.category}</span>
          ${t.deadline ? `<span class="task-deadline">${formatDate(t.deadline)}</span>` : ''}
        </div>
      </div>
      <div class="task-badges">
        <span class="badge ${priorityBadgeClass(t.priority)}">${t.priority}</span>
        ${isOverdue(t) ? '<span class="badge badge-atrasada">Atrasada</span>' : ''}
        <button class="btn-delete" data-action="delete" data-id="${t.id}">&times;</button>
      </div>
    </div>
  `).join("");
}

// ===== Eventos na Lista de Tarefas =====

document.getElementById("task-list").addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  const id = Number(e.target.dataset.id);
  if (!action) return;

  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (action === "toggle") {
    task.done = !task.done;
    saveTasks();
    refresh();
  } else if (action === "delete") {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    refresh();
  }
});

// ===== Formulário — Adicionar Tarefa =====

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("form-error");

  const name = document.getElementById("inp-name").value.trim();
  const category = document.getElementById("inp-category").value;
  const priority = document.getElementById("inp-priority").value;
  const deadline = document.getElementById("inp-deadline").value;

  // Validação: nome obrigatório
  if (!name) {
    errorEl.textContent = "O nome da tarefa é obrigatório.";
    return;
  }

  errorEl.textContent = "";

  tasks.push({
    id: nextId++,
    name,
    category,
    priority,
    deadline: deadline || "",
    done: false,
  });

  saveTasks();
  refresh();

  // Limpa o formulário
  document.getElementById("inp-name").value = "";
  document.getElementById("inp-deadline").value = "";
});

// ===== Filtros =====

document.getElementById("filter-search").addEventListener("input", renderTaskList);
document.getElementById("filter-priority").addEventListener("change", renderTaskList);
document.getElementById("filter-status").addEventListener("change", renderTaskList);

// ===== Refresh Geral =====

function refresh() {
  updateDashboard();
  renderTaskList();
}

// Inicializa a aplicação
refresh();
