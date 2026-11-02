(function () {
  "use strict";

  const storage = {
    get: function (key, fallback) {
      try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
      } catch (error) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
      }
    }
  };

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function dateInDays(days) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return localDateString(date);
  }

  let plants = storage.get("sproutPlants", null);
  if (!Array.isArray(plants)) {
    plants = PLANT_STARTERS.map(function (plant) {
      return {
        id: plant.id,
        name: plant.name,
        interval: plant.interval,
        nextDate: dateInDays(plant.dueIn),
        icon: plant.icon,
        detail: plant.detail
      };
    });
    storage.set("sproutPlants", plants);
  }

  let currentFilter = "all";
  document.title = STARTUP.name;
  document.getElementById("brand-name").textContent = STARTUP.name;
  document.getElementById("page-title").textContent = STARTUP.tagline;
  document.getElementById("pitch").textContent = STARTUP.pitch;

  const plantList = document.getElementById("plant-list");
  const emptyMessage = document.getElementById("empty-message");
  const summaryNote = document.getElementById("summary-note");
  const formPanel = document.getElementById("add-panel");
  const plantForm = document.getElementById("plant-form");
  const nextDateInput = plantForm.elements.nextDate;
  const formError = document.getElementById("form-error");
  const limitMessage = document.getElementById("limit-message");
  const freeLimit = 5;

  function todayString() {
    return localDateString(new Date());
  }

  function dateLabel(dateString) {
    const date = new Date(dateString + "T12:00:00");
    if (dateString === todayString()) return "Today";
    if (dateString === dateInDays(1)) return "Tomorrow";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function isDue(plant) {
    return plant.nextDate <= todayString();
  }

  function makePlantRow(plant) {
    const row = document.createElement("article");
    row.className = "plant-row" + (isDue(plant) ? " is-due" : "");

    const icon = document.createElement("span");
    icon.className = "plant-icon plant-icon-" + plant.icon;
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = plant.icon === "herb" ? "B" : plant.icon === "orchid" ? "O" : plant.icon === "succulent" ? "S" : "F";

    const identity = document.createElement("div");
    identity.className = "plant-identity";
    const name = document.createElement("h3");
    name.textContent = plant.name;
    const detail = document.createElement("p");
    detail.textContent = plant.detail || "Your plant care routine";
    identity.append(name, detail);

    const interval = document.createElement("span");
    interval.className = "interval-value";
    interval.textContent = plant.interval === 1 ? "Every day" : "Every " + plant.interval + " days";

    const next = document.createElement("div");
    next.className = "next-water";
    const date = document.createElement("strong");
    date.textContent = dateLabel(plant.nextDate);
    const state = document.createElement("span");
    state.className = "plant-state" + (isDue(plant) ? " due" : "");
    state.textContent = isDue(plant) ? "WATER TODAY" : "NEXT WATERING";
    next.append(date, state);

    const actions = document.createElement("div");
    actions.className = "row-actions";
    const watered = document.createElement("button");
    watered.type = "button";
    watered.className = "water-button";
    watered.textContent = "Watered";
    watered.setAttribute("aria-label", "Mark " + plant.name + " as watered");
    watered.addEventListener("click", function () { markWatered(plant.id); });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", "Remove " + plant.name);
    remove.addEventListener("click", function () { removePlant(plant.id); });

    actions.append(watered, remove);
    row.append(icon, identity, interval, next, actions);
    return row;
  }

  function renderPlants() {
    const duePlants = plants.filter(isDue);
    document.getElementById("due-count").textContent = duePlants.length;
    document.getElementById("due-copy").textContent = duePlants.length === 1 ? "plant" : "plants";
    document.getElementById("all-count").textContent = plants.length;
    document.getElementById("filter-due-count").textContent = duePlants.length;
    summaryNote.textContent = duePlants.length === 0
      ? "Your garden is looking good."
      : duePlants.length === 1 ? "One plant is ready for a drink." : "A few plants are ready for a drink.";

    const filtered = plants.filter(function (plant) {
      if (currentFilter === "due") return isDue(plant);
      if (currentFilter === "upcoming") return !isDue(plant);
      return true;
    }).sort(function (first, second) {
      return first.nextDate.localeCompare(second.nextDate);
    });

    plantList.replaceChildren.apply(plantList, filtered.map(makePlantRow));
    emptyMessage.hidden = filtered.length > 0;
    if (filtered.length === 0 && plants.length > 0) {
      emptyMessage.querySelector("h3").textContent = currentFilter === "due" ? "Nothing needs water right now." : "No upcoming waterings.";
      emptyMessage.querySelector("p").textContent = currentFilter === "due" ? "Your plants are between waterings. Check back soon." : "Everything in your garden is due today or overdue.";
      document.getElementById("empty-add").hidden = true;
    } else {
      emptyMessage.querySelector("h3").textContent = "Your garden is ready to grow.";
      emptyMessage.querySelector("p").textContent = "Add your first plant to start a watering routine.";
      document.getElementById("empty-add").hidden = false;
    }
    plantList.hidden = filtered.length === 0;
    limitMessage.hidden = plants.length < freeLimit;
    document.getElementById("open-form").disabled = plants.length >= freeLimit;
    document.getElementById("plant-limit-note").textContent = plants.length >= freeLimit
      ? "Free garden limit reached. Remove a plant to add another."
      : "Free garden: " + (freeLimit - plants.length) + " spot" + (freeLimit - plants.length === 1 ? "" : "s") + " left.";
  }

  function savePlants() {
    storage.set("sproutPlants", plants);
    renderPlants();
  }

  function markWatered(id) {
    plants = plants.map(function (plant) {
      if (plant.id !== id) return plant;
      const nextDate = new Date();
      nextDate.setHours(12, 0, 0, 0);
      nextDate.setDate(nextDate.getDate() + Number(plant.interval));
      return Object.assign({}, plant, { nextDate: localDateString(nextDate) });
    });
    savePlants();
  }

  function removePlant(id) {
    plants = plants.filter(function (plant) { return plant.id !== id; });
    savePlants();
  }

  function openForm() {
    if (plants.length >= freeLimit) {
      limitMessage.hidden = false;
      return;
    }
    formPanel.hidden = false;
    nextDateInput.value = todayString();
    plantForm.elements.name.focus();
  }

  document.getElementById("open-form").addEventListener("click", openForm);
  document.getElementById("empty-add").addEventListener("click", openForm);
  document.getElementById("close-form").addEventListener("click", function () {
    formPanel.hidden = true;
    formError.hidden = true;
  });

  plantForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (plants.length >= freeLimit) {
      formError.textContent = "The free garden limit is 5 plants. Remove one before adding another.";
      formError.hidden = false;
      return;
    }
    const formData = new FormData(plantForm);
    const name = String(formData.get("name")).trim();
    if (!name) return;
    plants.push({
      id: "plant-" + Date.now(),
      name: name,
      interval: Number(formData.get("interval")),
      nextDate: String(formData.get("nextDate")),
      icon: "fern",
      detail: "Added to your garden"
    });
    plantForm.reset();
    formPanel.hidden = true;
    formError.hidden = true;
    savePlants();
  });

  document.querySelectorAll("[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (filterButton) {
        const active = filterButton === button;
        filterButton.classList.toggle("active", active);
        filterButton.setAttribute("aria-pressed", active ? "true" : "false");
      });
      renderPlants();
    });
  });

  document.getElementById("plus-button").addEventListener("click", function () {
    window.alert("Sprout Plus is a pricing concept for this student prototype. No purchase is available. A real launch should test willingness to pay before building subscriptions.");
  });

  function notifyDuePlants() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const notifiedDate = storage.get("sproutNotifiedDate", "");
    if (notifiedDate === todayString()) return;
    const due = plants.filter(isDue);
    if (due.length === 0) return;
    new Notification("Time for a little plant care", {
      body: due.length === 1 ? due[0].name + " is ready for water." : due.length + " plants are ready for water."
    });
    storage.set("sproutNotifiedDate", todayString());
  }

  const reminderNote = document.getElementById("reminder-note");
  if ("Notification" in window && Notification.permission === "default") {
    const enableButton = document.createElement("button");
    enableButton.type = "button";
    enableButton.className = "text-button reminder-button";
    enableButton.textContent = "Enable browser reminders";
    enableButton.addEventListener("click", function () {
      Notification.requestPermission().then(function (permission) {
        reminderNote.textContent = permission === "granted"
          ? "Browser reminders are on. Sprout can remind you when you open this site."
          : "Browser reminders are off. Your due plants will still appear here.";
        if (permission === "granted") notifyDuePlants();
        enableButton.remove();
      });
    });
    reminderNote.append(" ", enableButton);
  } else if ("Notification" in window && Notification.permission === "granted") {
    reminderNote.textContent = "Browser reminders are on when you open this site on this device.";
    notifyDuePlants();
  }

  renderPlants();
})();
