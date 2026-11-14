(() => {
  const fields = document.querySelectorAll(
    ".booking-parameters .booking-field",
  );
  if (!fields.length) return;

  let openControl = null;
  const controls = [];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeControl(field) {
    const input = field.querySelector("select, input");
    const kind = field.dataset.customField;
    if (!input || !kind) return;

    const trigger = element("button", "custom-field-trigger");
    trigger.type = "button";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute(
      "aria-haspopup",
      kind === "zone" || kind === "duration" ? "listbox" : "dialog",
    );
    trigger.setAttribute(
      "aria-labelledby",
      `${input.id}-label ${input.id}-value`,
    );
    const value = element("span", "custom-field-value");
    value.id = `${input.id}-value`;
    const icon = element(
      "span",
      "custom-field-icon",
      kind === "date" ? "▦" : kind === "time" ? "◷" : "⌄",
    );
    icon.setAttribute("aria-hidden", "true");
    trigger.append(value, icon);

    const panel = element(
      "div",
      `custom-field-panel custom-field-panel--${kind}`,
    );
    panel.id = `${input.id}-panel`;
    panel.hidden = true;
    trigger.setAttribute("aria-controls", panel.id);
    field.append(trigger, panel);

    const control = {
      field,
      input,
      kind,
      trigger,
      panel,
      value,
      close(focus = false) {
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        field.classList.remove("control-open");
        field.closest(".tool-card")?.classList.remove("control-active");
        if (openControl === control) openControl = null;
        if (focus) trigger.focus();
      },
      open() {
        if (openControl && openControl !== control) openControl.close();
        openControl = control;
        control.render();
        panel.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        field.classList.add("control-open");
        field.closest(".tool-card")?.classList.add("control-active");
        const focusTarget = panel.querySelector(
          '[aria-selected="true"]:not(:disabled), [aria-current="date"]:not(:disabled), input, button:not(:disabled)',
        );
        focusTarget?.focus();
      },
    };

    trigger.addEventListener("click", () => {
      if (openControl === control) control.close();
      else control.open();
    });
    field.querySelector("label")?.addEventListener("click", (event) => {
      event.preventDefault();
      trigger.focus();
    });
    input.addEventListener("change", () => control.sync());

    if (kind === "zone" || kind === "duration") setupList(control);
    else if (kind === "date") setupCalendar(control);
    else if (kind === "time") setupTime(control);
    else return;

    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    control.sync();
    controls.push(control);
  }

  function setupList(control) {
    const { input, panel, value } = control;
    panel.setAttribute("role", "listbox");
    panel.setAttribute("aria-labelledby", `${input.id}-label`);
    control.sync = () => {
      value.textContent =
        input.selectedOptions[0]?.textContent || "Выберите вариант";
    };
    control.render = () => {
      panel.replaceChildren();
      for (const option of input.options) {
        if (option.disabled) continue;
        const item = element("button", "custom-option", option.textContent);
        item.type = "button";
        item.setAttribute("role", "option");
        item.setAttribute(
          "aria-selected",
          String(option.value === input.value),
        );
        item.addEventListener("click", () => {
          if (input.value !== option.value) {
            input.value = option.value;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
          control.sync();
          control.close(true);
        });
        item.addEventListener("keydown", (event) => {
          const options = [...panel.querySelectorAll('[role="option"]')];
          const current = options.indexOf(item);
          let index = current;
          if (event.key === "ArrowDown") index = (current + 1) % options.length;
          else if (event.key === "ArrowUp")
            index = (current - 1 + options.length) % options.length;
          else if (event.key === "Home") index = 0;
          else if (event.key === "End") index = options.length - 1;
          else return;
          event.preventDefault();
          options[index].focus();
        });
        panel.append(item);
      }
    };
  }

  function parseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return match
      ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
      : null;
  }

  function dateValue(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function setupCalendar(control) {
    const { input, panel, value } = control;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Выбор даты бронирования");
    let month;

    control.sync = () => {
      const selected = parseDate(input.value);
      value.textContent = selected
        ? new Intl.DateTimeFormat("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(selected)
        : "Выберите дату";
    };
    control.render = () => {
      const minimum = parseDate(input.min);
      const selected = parseDate(input.value) || minimum || new Date();
      month = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
      draw();
    };

    function draw() {
      panel.replaceChildren();
      const minimum = parseDate(input.min);
      const maximum = minimum
        ? new Date(
            minimum.getFullYear(),
            minimum.getMonth(),
            minimum.getDate() + 90,
            12,
          )
        : null;
      const heading = element("div", "calendar-header");
      const previous = element("button", "calendar-nav", "‹");
      previous.type = "button";
      previous.setAttribute("aria-label", "Предыдущий месяц");
      previous.disabled =
        !!minimum &&
        month.getFullYear() * 12 + month.getMonth() <=
          minimum.getFullYear() * 12 + minimum.getMonth();
      previous.addEventListener("click", () => {
        month.setMonth(month.getMonth() - 1);
        draw();
        panel.querySelector(".calendar-nav:not(:disabled)")?.focus();
      });
      const title = element(
        "strong",
        "calendar-month",
        new Intl.DateTimeFormat("ru-RU", {
          month: "long",
          year: "numeric",
        }).format(month),
      );
      const next = element("button", "calendar-nav", "›");
      next.type = "button";
      next.setAttribute("aria-label", "Следующий месяц");
      next.disabled =
        !!maximum &&
        month.getFullYear() * 12 + month.getMonth() >=
          maximum.getFullYear() * 12 + maximum.getMonth();
      next.addEventListener("click", () => {
        month.setMonth(month.getMonth() + 1);
        draw();
        panel.querySelectorAll(".calendar-nav")[1]?.focus();
      });
      heading.append(previous, title, next);
      panel.append(heading);

      const weekdays = element("div", "calendar-grid calendar-weekdays");
      for (const name of ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"])
        weekdays.append(element("span", "", name));
      weekdays.setAttribute("aria-hidden", "true");
      panel.append(weekdays);
      const days = element("div", "calendar-grid calendar-days");
      const offset = (month.getDay() + 6) % 7;
      for (let i = 0; i < offset; i++)
        days.append(element("span", "calendar-empty"));
      const daysInMonth = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0,
      ).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const current = new Date(
          month.getFullYear(),
          month.getMonth(),
          day,
          12,
        );
        const iso = dateValue(current);
        const button = element("button", "calendar-day", String(day));
        button.type = "button";
        button.disabled =
          (!!minimum && current < minimum) || (!!maximum && current > maximum);
        button.setAttribute(
          "aria-label",
          new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(current),
        );
        if (iso === input.value) button.setAttribute("aria-current", "date");
        button.addEventListener("click", () => {
          if (input.value !== iso) {
            input.value = iso;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
          control.sync();
          control.close(true);
        });
        days.append(button);
      }
      panel.append(
        days,
        element(
          "p",
          "calendar-note",
          "Бронирование доступно на 90 дней вперёд.",
        ),
      );
    }
  }

  function setupTime(control) {
    const { input, panel, value } = control;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Выбор времени начала");
    control.sync = () => {
      value.textContent = input.value || "Выберите время";
    };
    control.render = () => {
      panel.replaceChildren();
      const form = element("form", "custom-time-form");
      const fields = element("div", "custom-time-fields");
      const [hoursValue, minutesValue] = (input.value || "18:00").split(":");
      const hoursLabel = element("label", "custom-time-label", "Часы");
      const hours = element("input", "custom-time-input");
      hours.type = "number";
      hours.min = "0";
      hours.max = "23";
      hours.step = "1";
      hours.required = true;
      hours.value = hoursValue;
      const minutesLabel = element("label", "custom-time-label", "Минуты");
      const minutes = element("input", "custom-time-input");
      minutes.type = "number";
      minutes.min = "0";
      minutes.max = "59";
      minutes.step = "1";
      minutes.required = true;
      minutes.value = minutesValue;
      hoursLabel.append(hours);
      minutesLabel.append(minutes);
      fields.append(hoursLabel, minutesLabel);
      const apply = element("button", "custom-time-apply", "Применить");
      apply.type = "submit";
      form.append(
        fields,
        element("p", "calendar-note", "Часы: 00–23, минуты: 00–59."),
        apply,
      );
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const time = `${String(Number(hours.value)).padStart(2, "0")}:${String(Number(minutes.value)).padStart(2, "0")}`;
        if (input.value !== time) {
          input.value = time;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        control.sync();
        control.close(true);
      });
      panel.append(form);
    };
  }

  fields.forEach(makeControl);
  document.addEventListener("prime:booking-update", () =>
    controls.forEach((control) => control.sync()),
  );
  document.addEventListener("pointerdown", (event) => {
    if (openControl && !openControl.field.contains(event.target))
      openControl.close();
  });
  document.addEventListener("focusin", (event) => {
    if (openControl && !openControl.field.contains(event.target))
      openControl.close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && openControl) {
      event.preventDefault();
      openControl.close(true);
    }
  });
})();
