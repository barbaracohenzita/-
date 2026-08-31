(() => {
  const seedNotes = [
    {
      id: 1,
      title: "Slow mornings, better days",
      body: "Leave the phone in the other room. Make coffee, open the window, and give the day a little room to begin.",
      category: "Personal",
      pinned: true,
      date: "Today, 8:42 AM",
    },
    {
      id: 2,
      title: "Website refresh",
      body: "Keep the palette warm and natural. Simplify the homepage, improve the type scale, and let the work breathe.",
      category: "Work",
      pinned: true,
      date: "Yesterday",
    },
    {
      id: 3,
      title: "A pocket guide to Lisbon",
      body: "Small tiled streets, strong coffee, the old bookshop near Chiado, and sunset from Miradouro da Senhora.",
      category: "Ideas",
      pinned: false,
      date: "Aug 28",
    },
    {
      id: 4,
      title: "Things worth remembering",
      body: "Call Mum on Sunday. Buy flowers for no reason. Take the long way home when the evening is soft.",
      category: "Personal",
      pinned: false,
      date: "Aug 26",
    },
    {
      id: 5,
      title: "Quarterly planning",
      body: "Focus on fewer, more meaningful projects. Protect deep work mornings and keep Friday afternoons open for review.",
      category: "Work",
      pinned: false,
      date: "Aug 24",
    },
    {
      id: 6,
      title: "Reading list",
      body: "The Creative Act · Braiding Sweetgrass · The Book of Delights · On Keeping a Notebook.",
      category: "Ideas",
      pinned: false,
      date: "Aug 20",
    },
  ];
  const storageKey = "paperly-notes";
  let notes;
  try {
    notes = JSON.parse(localStorage.getItem(storageKey)) || seedNotes;
  } catch (_) {
    notes = seedNotes;
  }
  let activeFilter = "all";
  let editingId = null;
  const $ = (id) => document.getElementById(id);
  const colors = { Personal: "#cf7b64", Work: "#698896", Ideas: "#bc9145" };
  const escapeHtml = (value) =>
    String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const save = () => localStorage.setItem(storageKey, JSON.stringify(notes));

  function render() {
    const query = $("searchInput").value.trim().toLowerCase();
    const visible = notes
      .filter((note) => {
        const matchesFilter = activeFilter === "all" || (activeFilter === "pinned" ? note.pinned : note.category === activeFilter);
        return matchesFilter && `${note.title} ${note.body} ${note.category}`.toLowerCase().includes(query);
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
    $("notesGrid").innerHTML = visible
      .map(
        (note) => `<article class="note-card" data-id="${note.id}" style="--accent:${colors[note.category]}">
      <div class="card-top"><span class="tag">${escapeHtml(note.category)}</span><button class="pin ${note.pinned ? "active" : ""}" data-pin="${
        note.id
      }" aria-label="${note.pinned ? "Unpin" : "Pin"} note">${note.pinned ? "◆" : "◇"}</button></div>
      <h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.body)}</p>
      <div class="card-footer"><span>${escapeHtml(note.date)}</span><button class="delete-note" data-delete="${
        note.id
      }" aria-label="Delete note">Delete</button></div></article>`
      )
      .join("");
    $("emptyState").hidden = visible.length > 0;
    $("notesGrid").hidden = visible.length === 0;
    $("noteTotal").textContent = `${visible.length} ${visible.length === 1 ? "note" : "notes"}`;
    $("allCount").textContent = notes.length;
    $("pinnedCount").textContent = notes.filter((note) => note.pinned).length;
  }

  function openEditor(note) {
    editingId = note?.id || null;
    $("noteTitle").value = note?.title || "";
    $("noteBody").value = note?.body || "";
    $("noteCategory").value = note?.category || "Personal";
    $("noteModal").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("noteTitle").focus(), 30);
  }
  function closeEditor() {
    $("noteModal").hidden = true;
    document.body.style.overflow = "";
    editingId = null;
  }

  ["newNote", "composeButton", "emptyNew"].forEach((id) => $(id).addEventListener("click", () => openEditor()));
  ["closeModal", "cancelModal"].forEach((id) => $(id).addEventListener("click", closeEditor));
  $("noteModal").addEventListener("click", (event) => {
    if (event.target === $("noteModal")) closeEditor();
  });
  $("noteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const values = { title: $("noteTitle").value.trim(), body: $("noteBody").value.trim(), category: $("noteCategory").value };
    if (editingId) notes = notes.map((note) => (note.id === editingId ? { ...note, ...values, date: "Just now" } : note));
    else notes.unshift({ id: Date.now(), ...values, pinned: false, date: "Just now" });
    save();
    closeEditor();
    render();
  });
  $("notesGrid").addEventListener("click", (event) => {
    const pin = event.target.closest("[data-pin]");
    const del = event.target.closest("[data-delete]");
    if (pin) {
      event.stopPropagation();
      const id = Number(pin.dataset.pin);
      notes = notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n));
      save();
      render();
      return;
    }
    if (del) {
      event.stopPropagation();
      const id = Number(del.dataset.delete);
      notes = notes.filter((n) => n.id !== id);
      save();
      render();
      return;
    }
    const card = event.target.closest(".note-card");
    if (card) openEditor(notes.find((n) => n.id === Number(card.dataset.id)));
  });
  document.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
      $("sectionTitle").textContent = activeFilter === "all" ? "All notes" : activeFilter === "pinned" ? "Pinned notes" : activeFilter;
      document.querySelector(".sidebar").classList.remove("open");
      render();
    })
  );
  $("searchInput").addEventListener("input", render);
  $("gridView").addEventListener("click", () => {
    $("notesGrid").classList.remove("list-view");
    $("gridView").classList.add("active");
    $("listView").classList.remove("active");
  });
  $("listView").addEventListener("click", () => {
    $("notesGrid").classList.add("list-view");
    $("listView").classList.add("active");
    $("gridView").classList.remove("active");
  });
  $("mobileMenu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
  $("themeButton").addEventListener("click", () => document.body.classList.toggle("dark"));
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      $("searchInput").focus();
    }
    if (event.key === "Escape" && !$("noteModal").hidden) closeEditor();
  });
  render();
})();
