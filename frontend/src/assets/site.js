/* Lightweight progressive enhancements. No dependency or backend assumptions. */
const root = document.documentElement;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
if (menuButton && mobileMenu) {
  const close = () => {
    mobileMenu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute(
      "aria-label",
      menuButton.dataset.openLabel || "Open navigation",
    );
  };
  menuButton.dataset.openLabel = menuButton.getAttribute("aria-label");
  menuButton.addEventListener("click", () => {
    const opening = !mobileMenu.classList.contains("is-open");
    mobileMenu.classList.toggle("is-open", opening);
    menuButton.setAttribute("aria-expanded", String(opening));
    if (opening) mobileMenu.querySelector("a")?.focus();
    else menuButton.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      close();
      menuButton.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (
      mobileMenu.classList.contains("is-open") &&
      !mobileMenu.contains(event.target) &&
      !menuButton.contains(event.target)
    )
      close();
  });
  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });
}

const header = document.querySelector(".site-header");
if (header) {
  let last = false;
  window.addEventListener(
    "scroll",
    () => {
      const next = window.scrollY > 15;
      if (last !== next) {
        header.classList.toggle("is-scrolled", next);
        last = next;
      }
    },
    { passive: true },
  );
}

// Motion is decorative. Existing content is always readable without JS or an observer.
if (
  !reduced() &&
  matchMedia("(hover: hover) and (pointer: fine)").matches &&
  "IntersectionObserver" in window
) {
  root.classList.add("motion-on");
  const entries = [...document.querySelectorAll("[data-reveal]")];
  const observer = new IntersectionObserver(
    (changes, obs) => {
      for (const entry of changes) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.05, rootMargin: "0px 0px -14px 0px" },
  );
  // Let the observer trigger a one-shot entrance. Never pre-hide content or force layout.
  for (const el of entries) observer.observe(el);
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.(
    "change",
    (event) => {
      if (event.matches) {
        root.classList.remove("motion-on");
        observer.disconnect();
      }
    },
  );
}

// One configuration request per page; server-rendered availability needs no extra read.
let configPromise;
function getConfiguration() {
  return (configPromise ||= fetch("/api/v1/config", {
    headers: { accept: "application/json" },
    credentials: "same-origin",
    signal: AbortSignal.timeout(5000),
  }).then((response) => {
    if (!response.ok) throw Error("Configuration unavailable");
    return response.json();
  }));
}
function syncServices(config) {
  const open = (id) =>
    config.services?.[id]?.visible === true &&
    config.services[id].acceptingRequests === true &&
    (!["translation", "interpretation"].includes(id) ||
      config.approvedTranslationPairs?.length > 0);
  for (const el of document.querySelectorAll("[data-nusya-service]"))
    if (config.services?.[el.dataset.nusyaService]?.visible === false)
      el.hidden = true;
  for (const el of document.querySelectorAll("[data-nusya-status]")) {
    el.textContent = open(el.dataset.nusyaStatus)
      ? el.dataset.openLabel
      : el.dataset.closedLabel;
    el.dataset.configured = "true";
  }
  for (const el of document.querySelectorAll("[data-nusya-enquiry]"))
    el.hidden = !open(el.dataset.nusyaEnquiry);
}
if (document.querySelector("[data-nusya-status]:not([data-configured])"))
  getConfiguration()
    .then(syncServices)
    .catch(() => {});
// Only service context is carried between locales; visitor-entered personal data is never in links.
for (const link of document.querySelectorAll(".lang-link"))
  if (document.querySelector("#enquiry-form")) {
    const url = new URL(link.href);
    for (const key of ["service", "language"]) {
      const value = new URLSearchParams(location.search).get(key);
      if (
        value &&
        {
          service: ["lesson", "coaching", "translation", "interpretation"],
          language: ["english", "russian", "arabic"],
        }[key].includes(value)
      )
        url.searchParams.set(key, value);
    }
    link.href = url.pathname + url.search;
  }
for (const poster of document.querySelectorAll("[data-video]")) {
  const play = poster.querySelector(".video-play");
  if (!play) continue;
  const failed = () => {
    if (poster.querySelector(".video-error")) return;
    const error = document.createElement("p");
    error.className = "video-error";
    error.setAttribute("role", "alert");
    error.textContent = poster.dataset.videoError;
    poster.append(error);
    const fallback = poster
      .closest(".video-media")
      ?.querySelector(".video-fallback");
    if (fallback) {
      fallback.style.zIndex = "6";
      fallback.style.display = "block";
    }
  };
  play.addEventListener(
    "click",
    () => {
      let url;
      try {
        url = new URL(poster.dataset.vimeo);
        if (
          url.protocol !== "https:" ||
          url.hostname !== "player.vimeo.com" ||
          !/^\/video\/\d+$/.test(url.pathname) ||
          !/^[a-zA-Z0-9]+$/.test(url.searchParams.get("h") || "")
        )
          throw Error("Invalid video");
      } catch {
        failed();
        return;
      }
      url.searchParams.set("autoplay", "0");
      const iframe = document.createElement("iframe");
      iframe.src = url.toString();
      iframe.title = poster.dataset.videoTitle;
      iframe.allow =
        "fullscreen; picture-in-picture; encrypted-media; web-share";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      const timeout = setTimeout(failed, 12000);
      iframe.addEventListener("load", () => clearTimeout(timeout), {
        once: true,
      });
      iframe.addEventListener(
        "error",
        () => {
          clearTimeout(timeout);
          failed();
        },
        { once: true },
      );
      poster.classList.add("is-playing");
      poster.append(iframe);
    },
    { once: true },
  );
}

async function setupContactSecurity(form) {
  const target = document.getElementById("nusya-turnstile");
  if (!target) return;
  try {
    const config = await getConfiguration();
    syncServices(config);
    if (!config.ready || !config.turnstileSiteKey) throw Error("not ready");
    const permittedPairs = new Set(config.approvedTranslationPairs || []);
    const readiness = form.querySelector("#enquiry-readiness");
    const messages = JSON.parse(form.dataset.messages || "{}");
    if (readiness) readiness.hidden = true;
    for (const kind of ["translation", "interpretation"]) {
      const source = form.querySelector(
        `.form-detail[data-for="${kind}"] [name="sourceLanguage"]`,
      );
      const targetLanguage = form.querySelector(
        `.form-detail[data-for="${kind}"] [name="targetLanguage"]`,
      );
      if (!source || !targetLanguage) continue;
      for (const option of source.options)
        if (option.value)
          option.disabled = ![...permittedPairs].some((pair) =>
            pair.startsWith(option.value + ":"),
          );
      const updateTarget = () => {
        for (const option of targetLanguage.options)
          if (option.value)
            option.disabled = !permittedPairs.has(
              source.value + ":" + option.value,
            );
        if (targetLanguage.selectedOptions[0]?.disabled)
          targetLanguage.value = "";
      };
      source.addEventListener("change", updateTarget);
      updateTarget();
    }
    // Reflect owner-controlled availability: services not accepting enquiries cannot be chosen.
    const services = config.services || {},
      accepting = (id) =>
        services[id]?.visible !== false &&
        services[id]?.acceptingRequests === true;
    const lessonLangs = ["english", "russian", "arabic"];
    const typeOpen = {
      lesson: lessonLangs.some(accepting),
      coaching: accepting("coaching"),
      translation: accepting("translation") && permittedPairs.size > 0,
      interpretation: accepting("interpretation") && permittedPairs.size > 0,
    };
    for (const choice of form.querySelectorAll('input[name="type"]')) {
      const open = typeOpen[choice.value] !== false;
      choice.disabled = !open;
      choice.closest("label")?.classList.toggle("is-unavailable", !open);
      if (!open && choice.checked) choice.checked = false;
    }
    if (!form.querySelector('input[name="type"]:checked')) {
      const first = form.querySelector('input[name="type"]:not(:disabled)');
      if (first) {
        first.checked = true;
        first.dispatchEvent(new Event("change"));
      }
    }
    const lessonSelect = form.querySelector(
      '.form-detail[data-for="lesson"] [name="language"]',
    );
    if (lessonSelect) {
      for (const option of lessonSelect.options)
        if (option.value) option.disabled = !accepting(option.value);
      if (lessonSelect.selectedOptions[0]?.disabled) lessonSelect.value = "";
    }
    target.className = "cf-turnstile";
    target.dataset.sitekey = config.turnstileSiteKey;
    target.dataset.action = "nusya_enquiry";
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.append(script);
    form.dataset.backendReady = "true";
    const anyOpen = Object.values(typeOpen).some(Boolean);
    form.querySelector("[type=submit]").disabled = !anyOpen;
    const wanted = new URLSearchParams(location.search).get("service");
    if (!anyOpen || (wanted && typeOpen[wanted] === false)) {
      if (readiness) {
        readiness.hidden = false;
        readiness.textContent = messages.service_error || form.dataset.error;
      }
    }
  } catch {
    form.dataset.backendReady = "false";
    const readiness = form.querySelector("#enquiry-readiness");
    if (readiness) {
      readiness.hidden = false;
      readiness.textContent = form.dataset.error;
    }
  }
}
const form = document.querySelector("#enquiry-form");
if (form) {
  const messages = JSON.parse(form.dataset.messages || "{}");
  setupContactSecurity(form);
  const typeChoices = [...form.querySelectorAll('input[name="type"]')];
  const panels = [...form.querySelectorAll(".form-detail")];
  const feedback = form.querySelector("#enquiry-feedback");
  const submit = form.querySelector('[type="submit"]');
  function selectedType() {
    return typeChoices.find((x) => x.checked)?.value || "lesson";
  }
  function updatePanels() {
    const selected = selectedType();
    for (const panel of panels) {
      const active = panel.dataset.for === selected;
      panel.hidden = !active;
      for (const field of panel.querySelectorAll("input, select, textarea"))
        field.disabled = !active;
    }
    feedback.hidden = true;
  }
  for (const choice of typeChoices)
    choice.addEventListener("change", updatePanels);
  const params = new URLSearchParams(location.search);
  const kind = params.get("service");
  const requestedLanguage = params.get("language");
  if (requestedLanguage) {
    const select = form.querySelector("[name=language]");
    if (
      select &&
      [...select.options].some((o) => o.value === requestedLanguage)
    )
      select.value = requestedLanguage;
  }
  if (kind) {
    const wanted = typeChoices.find((choice) => choice.value === kind);
    if (wanted) wanted.checked = true;
  }
  updatePanels();
  const activeField = (name) =>
    form.querySelector(`.form-detail:not([hidden]) [name="${name}"]`)?.value ||
    "";
  function show(text, success = false) {
    feedback.textContent = text;
    feedback.classList.toggle("success", success);
    feedback.setAttribute("role", success ? "status" : "alert");
    feedback.tabIndex = -1;
    feedback.hidden = false;
    if (success) feedback.focus({ preventScroll: true });
    feedback.scrollIntoView({
      block: "nearest",
      behavior: reduced() ? "instant" : "smooth",
    });
  }
  function fieldError(field) {
    if (field.hasAttribute("aria-invalid")) return;
    const error = document.createElement("span");
    error.className = "field-error";
    error.id = "error-" + (field.id || field.name);
    error.textContent = messages.validation_error || form.dataset.error;
    field.dataset.originalDescription =
      field.getAttribute("aria-describedby") || "";
    field.setAttribute("aria-invalid", "true");
    field.setAttribute(
      "aria-describedby",
      [field.dataset.originalDescription, error.id].filter(Boolean).join(" "),
    );
    field.after(error);
  }
  const codeMessage = (code, status) =>
    status >= 500
      ? messages.request_error
      : messages[
          {
            VALIDATION_FAILED: "validation_error",
            BOT_CHECK_FAILED: "security_error",
            RATE_LIMITED: "rate_error",
            EDIT_CONFLICT: "conflict_error",
            SERVICE_UNAVAILABLE: "service_error",
          }[code]
        ] || messages.request_error;
  const retryFields = new Map();
  function lockRetry(lock) {
    for (const el of form.querySelectorAll(
      "input:not([name=cf-turnstile-response]),select,textarea",
    )) {
      if (lock) {
        if (!retryFields.has(el)) retryFields.set(el, el.disabled);
        el.disabled = true;
      } else if (retryFields.has(el)) {
        el.disabled = retryFields.get(el);
      }
    }
    if (!lock) retryFields.clear();
  }
  const newRequest = document.createElement("button");
  newRequest.type = "button";
  newRequest.className = "btn btn-outline";
  newRequest.hidden = true;
  newRequest.textContent = {
    uk: "Почати новий запит",
    en: "Start a new request",
    ar: "بدء طلب جديد",
    ru: "Начать новый запрос",
  }[form.dataset.locale];
  newRequest.addEventListener("click", () => {
    lockRetry(false);
    form._pendingRequest = null;
    delete form.dataset.idempotencyKey;
    newRequest.hidden = true;
    feedback.hidden = true;
  });
  submit.after(newRequest);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.hidden = true;
    for (const e of form.querySelectorAll(".field-error")) e.remove();
    for (const e of form.querySelectorAll("[aria-invalid]")) {
      e.removeAttribute("aria-invalid");
      if (e.dataset.originalDescription)
        e.setAttribute("aria-describedby", e.dataset.originalDescription);
      else e.removeAttribute("aria-describedby");
      delete e.dataset.originalDescription;
    }
    if (!form.checkValidity()) {
      const fields = [...form.querySelectorAll("input,select,textarea")].filter(
        (field) => !field.disabled && !field.checkValidity(),
      );
      fields.forEach(fieldError);
      show(messages.validation_error || form.dataset.error);
      fields[0]?.focus();
      return;
    }
    if (form.dataset.backendReady !== "true") {
      show(form.dataset.error || "The contact system is not configured yet.");
      return;
    }
    const token = form.querySelector('[name="cf-turnstile-response"]')?.value;
    if (!token) {
      show(
        {
          uk: "Пройдіть перевірку безпеки перед надсиланням.",
          en: "Complete the security challenge before submitting.",
          ar: "أكمل التحقق الأمني قبل الإرسال.",
          ru: "Пройдите проверку безопасности перед отправкой.",
        }[form.dataset.locale] || form.dataset.error,
      );
      return;
    }
    const type = selectedType();
    if (
      (type === "translation" || type === "interpretation") &&
      activeField("sourceLanguage") &&
      activeField("sourceLanguage") === activeField("targetLanguage")
    ) {
      show(form.dataset.same || "Source and target must differ.");
      return;
    }
    let request = {
      idempotencyKey:
        form.dataset.idempotencyKey ||
        (form.dataset.idempotencyKey =
          crypto.randomUUID?.() ||
          String(Date.now()) + "-" + Math.random().toString(36).slice(2)),
      locale: form.dataset.locale || "uk",
      type,
      name: form.elements.namedItem("name")?.value?.trim() || "",
      email: form.elements.namedItem("email")?.value?.trim() || "",
      message: form.elements.namedItem("message")?.value?.trim() || "",
      details: Object.fromEntries(
        [
          "language",
          "goal",
          "sourceLanguage",
          "targetLanguage",
          "dueDate",
          "eventDate",
          "format",
        ]
          .map((key) => [key, activeField(key)])
          .filter(([, value]) => value),
      ),
      privacyAcknowledged:
        form.elements.namedItem("privacyAcknowledged")?.checked || false,
      turnstileToken: token,
    };
    request = form._pendingRequest
      ? { ...form._pendingRequest, turnstileToken: token }
      : request;
    form._pendingRequest = { ...request };
    const submitHTML = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = messages.request_loading || submit.textContent;
    form.setAttribute("aria-busy", "true");
    try {
      const response = await fetch("/api/v1/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
        credentials: "same-origin",
        signal: AbortSignal.timeout(10000),
      });
      const json = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : null;
      if (response.status === 201 && json?.ok === true && json.reference) {
        show(`${form.dataset.success || "Received:"} ${json.reference}`, true);
        lockRetry(false);
        form.reset();
        form._pendingRequest = null;
        newRequest.hidden = true;
        delete form.dataset.idempotencyKey;
        updatePanels();
        feedback.hidden = false;
        window.turnstile?.reset?.();
      } else {
        if (response.status < 500) {
          lockRetry(false);
          form._pendingRequest = null;
          delete form.dataset.idempotencyKey;
        } else lockRetry(true);
        newRequest.hidden = false;
        for (const key of Object.keys(json?.fieldErrors || {})) {
          const names =
            key === "languagePair"
              ? ["sourceLanguage", "targetLanguage"]
              : [key];
          for (const name of names) {
            const field = form.querySelector(
              `[name="${CSS.escape(name)}"]:not(:disabled)`,
            );
            if (field) fieldError(field);
          }
        }
        show(codeMessage(json?.code, response.status));
        form.querySelector("[aria-invalid=true]")?.focus();
        window.turnstile?.reset?.();
      }
    } catch {
      lockRetry(true);
      newRequest.hidden = false;
      show(messages.request_error);
      window.turnstile?.reset?.();
    } finally {
      submit.disabled = false;
      submit.innerHTML = submitHTML;
      form.removeAttribute("aria-busy");
    }
  });
}
