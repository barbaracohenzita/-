---
layout: notes
title: Paperly — Notes
permalink: /notes/
nav: true
nav_order: 1
---

<div class="notes-app">
  <aside class="sidebar" aria-label="Notes navigation">
    <a class="brand" href="{{ '/notes/' | relative_url }}" aria-label="Paperly home"><span class="brand-mark">P</span><span>Paperly</span></a>
    <button class="new-note" id="newNote"><span aria-hidden="true">＋</span> New note</button>
    <nav class="note-nav">
      <button class="nav-item active" data-filter="all"><span class="nav-icon">▤</span>All notes <span class="count" id="allCount">0</span></button>
      <button class="nav-item" data-filter="pinned"><span class="nav-icon">◇</span>Pinned <span class="count" id="pinnedCount">0</span></button>
      <p class="nav-label">Collections</p>
      <button class="nav-item" data-filter="Personal"><span class="dot dot-coral"></span>Personal</button>
      <button class="nav-item" data-filter="Work"><span class="dot dot-blue"></span>Work</button>
      <button class="nav-item" data-filter="Ideas"><span class="dot dot-gold"></span>Ideas</button>
    </nav>
    <div class="sidebar-tip"><span>✦</span><div><strong>A little space for you</strong><p>Your notes stay right here, in your browser.</p></div></div>
    <div class="profile"><div class="avatar">AM</div><div><strong>Alex Morgan</strong><span>alex@example.com</span></div><button aria-label="Profile options">•••</button></div>
  </aside>

  <main class="main-content">
    <header class="topbar">
      <button class="mobile-menu" id="mobileMenu" aria-label="Open menu">☰</button>
      <div class="search-wrap"><span aria-hidden="true">⌕</span><input id="searchInput" type="search" placeholder="Search your notes..." aria-label="Search notes"><kbd>⌘ K</kbd></div>
      <button class="icon-button" id="themeButton" aria-label="Change appearance">☼</button>
    </header>
    <section class="content-wrap">
      <div class="welcome"><div><p class="eyebrow">MONDAY, AUGUST 31</p><h1>Good morning, Alex.</h1><p>Here's a quiet place for everything on your mind.</p></div><button class="compose-button" id="composeButton">＋ <span>Write a note</span></button></div>
      <div class="section-heading"><div><h2 id="sectionTitle">All notes</h2><span id="noteTotal">0 notes</span></div><div class="view-actions"><button class="active" id="gridView" aria-label="Grid view">⊞</button><button id="listView" aria-label="List view">☷</button></div></div>
      <div class="notes-grid" id="notesGrid"></div>
      <div class="empty-state" id="emptyState" hidden><span>✎</span><h3>No notes found</h3><p>Start with a thought, a list, or something worth remembering.</p><button id="emptyNew">Write your first note</button></div>
    </section>
  </main>
</div>

<div class="modal-backdrop" id="noteModal" hidden>
  <form class="note-modal" id="noteForm">
    <div class="modal-top"><select id="noteCategory" aria-label="Collection"><option>Personal</option><option>Work</option><option>Ideas</option></select><button type="button" id="closeModal" aria-label="Close editor">×</button></div>
    <input id="noteTitle" class="title-input" maxlength="80" placeholder="Note title" required>
    <textarea id="noteBody" placeholder="Start writing..." required></textarea>
    <div class="modal-footer"><span>Your note is saved in this browser.</span><div><button class="cancel-button" type="button" id="cancelModal">Cancel</button><button class="save-button" type="submit">Save note</button></div></div>
  </form>
</div>
