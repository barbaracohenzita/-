---
layout: default
title: "Task Board"
permalink: /game/
nav: true
nav_order: 99
---

<link rel="stylesheet" href="{{ '/assets/css/task-board.css' | relative_url }}" />

<div class="task-board" id="taskBoard">
  <header class="task-board__header">
    <h1>Task Board</h1>
    <div class="task-board__controls">
      <button id="newTaskBtn" type="button" title="Shortcut: N">+ New Task</button>
      <button id="darkModeBtn" type="button">Toggle dark mode</button>
    </div>
  </header>

  <div class="task-board__toolbar">
    <input id="searchInput" type="text" placeholder="Search tasks, notes, tags..." />
    <div class="progress-wrap">
      <span id="progressLabel">0% complete</span>
      <div class="progress-track"><div id="progressFill" class="progress-fill"></div></div>
    </div>
  </div>

  <ul id="taskList" class="task-list" aria-label="Task list"></ul>
</div>

<div id="undoToast" class="undo-toast" role="status" aria-live="polite">
  <span>Task deleted.</span>
  <button id="undoDeleteBtn" type="button">Undo</button>
</div>

<script src="{{ '/assets/js/task-board.js' | relative_url }}"></script>
