(() => {
  const STORAGE_KEY = "task-board-state-v1";
  const COLORS = ["#e76f51", "#2a9d8f", "#457b9d", "#9b5de5", "#f4a261"];

  const taskBoard = document.getElementById("taskBoard");
  const taskList = document.getElementById("taskList");
  const searchInput = document.getElementById("searchInput");
  const newTaskBtn = document.getElementById("newTaskBtn");
  const darkModeBtn = document.getElementById("darkModeBtn");
  const progressFill = document.getElementById("progressFill");
  const progressLabel = document.getElementById("progressLabel");
  const undoToast = document.getElementById("undoToast");
  const undoDeleteBtn = document.getElementById("undoDeleteBtn");

  let state = loadState();
  let selectedTaskId = null;
  let undoBuffer = null;
  let undoTimer = null;

  function uid() {
    return Math.random().toString(36).slice(2, 11);
  }

  function defaultTask(text = "New task") {
    return {
      id: uid(),
      text,
      completed: false,
      dueDate: "",
      notes: "",
      showNotes: false,
      tags: [],
      subtasks: [],
    };
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { darkMode: false, search: "", tasks: [defaultTask("Welcome! Click me to rename")] };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { darkMode: false, search: "", tasks: [] };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function traverseTasks(visitor) {
    state.tasks.forEach((task) => {
      visitor(task, null, false);
      task.subtasks.forEach((subtask) => visitor(subtask, task, true));
    });
  }

  function findTask(taskId) {
    for (const task of state.tasks) {
      if (task.id === taskId) return { item: task, parent: null, isSubtask: false };
      for (const sub of task.subtasks) {
        if (sub.id === taskId) return { item: sub, parent: task, isSubtask: true };
      }
    }
    return null;
  }

  function removeTask(taskId) {
    const topIndex = state.tasks.findIndex((t) => t.id === taskId);
    if (topIndex >= 0) return state.tasks.splice(topIndex, 1)[0];
    for (const task of state.tasks) {
      const subIndex = task.subtasks.findIndex((t) => t.id === taskId);
      if (subIndex >= 0) return task.subtasks.splice(subIndex, 1)[0];
    }
    return null;
  }

  function insertTask(item, parentId, beforeId = null) {
    const list = parentId ? findTask(parentId).item.subtasks : state.tasks;
    if (!beforeId) {
      list.push(item);
      return;
    }
    const idx = list.findIndex((it) => it.id === beforeId);
    if (idx === -1) list.push(item);
    else list.splice(idx, 0, item);
  }

  function isOverdue(item) {
    if (!item.dueDate || item.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(item.dueDate);
    return due < today;
  }

  function updateProgress() {
    let total = 0;
    let done = 0;
    traverseTasks((item) => {
      total += 1;
      if (item.completed) done += 1;
    });
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    progressFill.style.width = `${pct}%`;
    progressLabel.textContent = `${pct}% complete`;
  }

  function addTag(item, rawTag) {
    const tag = rawTag.trim();
    if (!tag) return;
    item.tags.push({ id: uid(), name: tag, color: COLORS[item.tags.length % COLORS.length] });
  }

  function showUndo(item, parentId, beforeId) {
    undoBuffer = { item, parentId, beforeId };
    undoToast.classList.add("show");
    clearTimeout(undoTimer);
    undoTimer = setTimeout(() => {
      undoBuffer = null;
      undoToast.classList.remove("show");
    }, 5000);
  }

  function startInlineEdit(labelEl, item) {
    const input = document.createElement("input");
    input.className = "inline-input";
    input.value = item.text;
    labelEl.replaceWith(input);
    input.focus();
    input.select();

    const commit = () => {
      item.text = input.value.trim() || "Untitled task";
      saveState();
      render();
    };

    input.addEventListener("blur", commit, { once: true });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") input.blur();
      if (event.key === "Escape") render();
    });
  }

  function renderTask(item, parent = null) {
    const li = document.createElement("li");
    li.className = `task-item ${item.completed ? "completed" : ""}`;
    li.dataset.id = item.id;
    li.draggable = true;
    if (selectedTaskId === item.id) li.classList.add("selected");

    li.innerHTML = `
      <div class="task-main">
        <input type="checkbox" ${item.completed ? "checked" : ""} aria-label="Toggle completion" />
        <span class="task-label">${item.text}</span>
        <button type="button" class="delete-btn">Delete</button>
      </div>
      <div class="task-meta">
        <label>Due <input type="date" class="due-input" value="${item.dueDate || ""}" /></label>
        <span class="due ${isOverdue(item) ? "overdue" : ""}">${isOverdue(item) ? "Overdue" : ""}</span>
        <div class="tags"></div>
      </div>
      <div class="task-tools">
        <button type="button" class="add-subtask-btn">+ Subtask</button>
        <button type="button" class="toggle-notes-btn">${item.showNotes ? "Hide notes" : "Notes"}</button>
        <input type="text" class="tag-input" placeholder="Add tag + Enter" />
      </div>
      <div class="notes-wrap" style="display:${item.showNotes ? "block" : "none"}">
        <textarea class="notes" placeholder="Task notes...">${item.notes || ""}</textarea>
      </div>
    `;

    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", () => {
      item.completed = checkbox.checked;
      saveState();
      render();
    });

    const label = li.querySelector(".task-label");
    label.addEventListener("click", () => startInlineEdit(label, item));

    li.querySelector(".delete-btn").addEventListener("click", () => {
      const parentId = parent ? parent.id : null;
      const list = parent ? parent.subtasks : state.tasks;
      const idx = list.findIndex((x) => x.id === item.id);
      const beforeId = list[idx + 1]?.id || null;
      const deleted = removeTask(item.id);
      saveState();
      showUndo(deleted, parentId, beforeId);
      render();
    });

    li.querySelector(".due-input").addEventListener("change", (event) => {
      item.dueDate = event.target.value;
      saveState();
      render();
    });

    li.querySelector(".add-subtask-btn").addEventListener("click", () => {
      item.subtasks.push(defaultTask("New subtask"));
      saveState();
      render();
    });

    li.querySelector(".toggle-notes-btn").addEventListener("click", () => {
      item.showNotes = !item.showNotes;
      saveState();
      render();
    });

    li.querySelector(".notes").addEventListener("input", (event) => {
      item.notes = event.target.value;
      saveState();
    });

    li.querySelector(".tag-input").addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      addTag(item, event.target.value);
      event.target.value = "";
      saveState();
      render();
    });

    const tagWrap = li.querySelector(".tags");
    item.tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.style.background = tag.color;
      chip.textContent = tag.name;
      tagWrap.appendChild(chip);
    });

    li.addEventListener("click", () => {
      selectedTaskId = item.id;
      render();
    });

    li.addEventListener("dragstart", (event) => {
      li.classList.add("dragging");
      event.dataTransfer.setData("text/plain", item.id);
    });
    li.addEventListener("dragend", () => li.classList.remove("dragging"));

    return li;
  }

  function setupDropZone(ul, parentId = null) {
    ul.addEventListener("dragover", (event) => {
      event.preventDefault();
      const target = event.target.closest(".task-item");
      if (!target || target.parentElement !== ul) return;
      const rect = target.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      ul.dataset.beforeId = before ? target.dataset.id : target.nextElementSibling?.dataset.id || "";
    });

    ul.addEventListener("drop", (event) => {
      event.preventDefault();
      const draggedId = event.dataTransfer.getData("text/plain");
      if (!draggedId) return;
      const found = findTask(draggedId);
      if (!found) return;
      const moved = removeTask(draggedId);
      const beforeId = ul.dataset.beforeId || null;
      insertTask(moved, parentId, beforeId);
      saveState();
      render();
    });
  }

  function render() {
    taskBoard.classList.toggle("dark", state.darkMode);
    searchInput.value = state.search || "";
    taskList.innerHTML = "";

    state.tasks.forEach((task) => {
      const haystack = `${task.text} ${task.notes} ${task.tags.map((t) => t.name).join(" ")}`.toLowerCase();
      const match = !state.search || haystack.includes(state.search.toLowerCase());
      if (!match) return;

      const li = renderTask(task);
      const subList = document.createElement("ul");
      subList.className = "subtask-list";
      task.subtasks.forEach((sub) => subList.appendChild(renderTask(sub, task)));
      setupDropZone(subList, task.id);
      li.appendChild(subList);
      taskList.appendChild(li);
    });

    setupDropZone(taskList);
    updateProgress();
  }

  newTaskBtn.addEventListener("click", () => {
    state.tasks.unshift(defaultTask());
    selectedTaskId = state.tasks[0].id;
    saveState();
    render();
  });

  darkModeBtn.addEventListener("click", () => {
    state.darkMode = !state.darkMode;
    saveState();
    render();
  });

  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    saveState();
    render();
  });

  undoDeleteBtn.addEventListener("click", () => {
    if (!undoBuffer) return;
    insertTask(undoBuffer.item, undoBuffer.parentId, undoBuffer.beforeId);
    undoBuffer = null;
    undoToast.classList.remove("show");
    saveState();
    render();
  });

  document.addEventListener("keydown", (event) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
    if (event.key.toLowerCase() === "n") {
      newTaskBtn.click();
    }

    const flat = [];
    traverseTasks((item) => flat.push(item));
    const selectedIndex = flat.findIndex((t) => t.id === selectedTaskId);

    if (event.key === "ArrowDown" && flat.length) {
      selectedTaskId = flat[Math.min(selectedIndex + 1, flat.length - 1)]?.id || flat[0].id;
      render();
    }
    if (event.key === "ArrowUp" && flat.length) {
      selectedTaskId = flat[Math.max(selectedIndex - 1, 0)]?.id || flat[0].id;
      render();
    }
    if (event.code === "Space" && selectedTaskId) {
      event.preventDefault();
      const selected = findTask(selectedTaskId)?.item;
      if (selected) {
        selected.completed = !selected.completed;
        saveState();
        render();
      }
    }
  });

  render();
})();
