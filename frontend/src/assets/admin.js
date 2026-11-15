/* Protected CMS client. Persistence, roles and publication are always enforced by the API. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const tabs = {
  overview: "Overview",
  pages: "Pages & content",
  translations: "Translation review",
  services: "Services",
  video: "Media & video",
  enquiries: "Enquiries",
  settings: "Contact & social",
};
const locales = {
  uk: "Українська",
  en: "English",
  ar: "العربية",
  ru: "Русский",
};
const statuses = [
  "new",
  "reviewing",
  "awaiting_customer",
  "quoted",
  "booked",
  "completed",
  "closed",
  "spam",
];
const state = {
  session: null,
  view: "overview",
  settings: null,
  page: "home",
  locale: "uk",
  revision: null,
  sourceRevision: null,
  publishedRevision: null,
  reviewStatus: "needs_review",
  content: null,
  unsaved: false,
  busy: false,
  loading: false,
  sequence: 0,
  filter: "",
  mediaId: null,
  mediaItems: [],
  mediaCursor: null,
  mediaRequest: 0,
  dirtySections: new Set(),
  enquiryChanges: new Set(),
};
const sidebar = $("#sidebar"),
  menu = $(".mobile-menu"),
  title = $("#hero-title"),
  description = $("#hero-description"),
  message = $("#editor-message");
const humanize = (value) =>
  String(value)
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (x) => x.toUpperCase());
const node = (tag, text, cls) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (cls) el.className = cls;
  return el;
};
function button(text, handler, cls = "soft-btn") {
  const el = node("button", text, cls);
  el.type = "button";
  el.addEventListener("click", handler);
  return el;
}
function note(text, kind = "neutral") {
  const feedback = $("#workspace-feedback");
  feedback.textContent = text;
  feedback.dataset.kind = kind;
  feedback.hidden = false;
  feedback.setAttribute("role", kind === "error" ? "alert" : "status");
  if (kind === "error") {
    feedback.tabIndex = -1;
    feedback.focus({ preventScroll: true });
    feedback.scrollIntoView({ block: "nearest" });
    return;
  }
  const toast = $("#toast");
  clearTimeout(note.timer);
  toast.textContent = text;
  toast.hidden = false;
  note.timer = setTimeout(() => (toast.hidden = true), 4000);
}
function dirty(value = true, section = state.view) {
  if (value) state.dirtySections.add(section);
  else state.dirtySections.delete(section);
  state.unsaved = state.dirtySections.size > 0;
  const label = $("#editor-dirty");
  label.textContent = state.unsaved ? "Unsaved changes" : "No unsaved changes";
  updateControls();
}
function updateControls() {
  const unavailable = !state.session || state.busy;
  for (const el of $$("main button,main input,main select,main textarea"))
    el.disabled =
      unavailable ||
      (el.dataset.ownerOnly === "true" && state.session?.role !== "owner") ||
      el.dataset.blocked === "true";
  const pageUnavailable = unavailable || state.loading || !state.content;
  for (const el of $$(
    "#view-pages input,#view-pages textarea,#view-pages .editor-actions button",
  ))
    el.disabled =
      pageUnavailable ||
      (el.dataset.ownerOnly === "true" && state.session?.role !== "owner") ||
      el.dataset.blocked === "true";
  $("#publish-page").disabled =
    pageUnavailable ||
    state.session?.role !== "owner" ||
    state.unsaved ||
    !state.revision ||
    state.reviewStatus === "needs_review";
  $("#review-page").disabled =
    pageUnavailable || state.unsaved || !state.revision;
  $("#review-page").hidden =
    state.locale === "en" || state.reviewStatus !== "needs_review";
}
function mayLeave() {
  if (state.busy) {
    note("Please wait for the current operation to finish.", "error");
    return false;
  }
  if (state.unsaved && !confirm("Discard unsaved changes?")) return false;
  state.enquiryChanges.clear();
  state.dirtySections.clear();
  dirty(false);
  return true;
}
window.addEventListener("beforeunload", (event) => {
  if (state.unsaved || state.busy) {
    event.preventDefault();
    event.returnValue = "";
  }
});
async function api(path, options = {}) {
  const response = await fetch("/api/v1/admin" + path, {
    ...options,
    credentials: "same-origin",
    signal: AbortSignal.timeout(15000),
    headers: {
      accept: "application/json",
      ...(options.body instanceof FormData
        ? {}
        : { "content-type": "application/json" }),
      ...options.headers,
    },
  });
  const body = response.headers
    .get("content-type")
    ?.includes("application/json")
    ? await response.json()
    : null;
  if (!response.ok || body?.ok !== true) {
    const error = new Error(
      body?.message ||
        "The protected service did not respond. Reload to sign in again, or retry.",
    );
    error.status = response.status;
    error.code = body?.code;
    if (
      [401, 403].includes(response.status) &&
      (!body ||
        ["AUTH_REQUIRED", "FORBIDDEN", "UNAUTHORIZED"].includes(body.code))
    ) {
      state.session = null;
      updateControls();
    }
    throw error;
  }
  return body;
}
async function action(work) {
  if (!state.session || state.busy) return;
  state.busy = true;
  updateControls();
  try {
    await work();
  } catch (error) {
    note(
      error.status === 409
        ? `${error.message} Your unsaved input is preserved. Open a separate preview to compare; reload only after copying changes you want to keep.`
        : error.message,
      "error",
    );
  } finally {
    state.busy = false;
    updateControls();
  }
}
function closeMenu() {
  sidebar.classList.remove("is-open");
  menu.setAttribute("aria-expanded", "false");
}
menu.addEventListener("click", () => {
  const open = !sidebar.classList.contains("is-open");
  sidebar.classList.toggle("is-open", open);
  menu.setAttribute("aria-expanded", String(open));
  if (open) $(".nav-item", sidebar).focus();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
    closeMenu();
    menu.focus();
  }
  if (
    event.key === "Tab" &&
    sidebar.classList.contains("is-open") &&
    matchMedia("(max-width:760px)").matches
  ) {
    const items = $$("a,button", sidebar);
    if (event.shiftKey && document.activeElement === items[0]) {
      event.preventDefault();
      items.at(-1).focus();
    } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
      event.preventDefault();
      items[0].focus();
    }
  }
});
function current(view, sequence) {
  return state.view === view && state.sequence === sequence;
}
function go(view, { page = state.page, locale = state.locale } = {}) {
  if (!tabs[view] || !mayLeave()) return;
  state.view = view;
  state.page = page;
  state.locale = locale;
  state.sequence++;
  state.loading = false;
  for (const el of $$(".panel-view"))
    el.classList.toggle("is-visible", el.id === "view-" + view);
  for (const el of $$(".nav-item")) {
    el.classList.toggle("is-active", el.dataset.view === view);
    el.removeAttribute("aria-current");
    if (el.dataset.view === view) el.setAttribute("aria-current", "page");
  }
  $("#breadcrumb").textContent = tabs[view];
  $("#workspace-feedback").hidden = true;
  closeMenu();
  $("#view-" + view + " h1")?.focus({ preventScroll: true });
  ({
    overview: loadOverview,
    pages: loadPage,
    translations: loadTranslations,
    services: loadServices,
    video: loadVideo,
    enquiries: loadEnquiries,
    settings: loadContact,
  })[view]();
}
for (const el of $$("[data-view],[data-go]"))
  el.addEventListener("click", () => go(el.dataset.view || el.dataset.go));
$(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  go("overview");
});
const pageSelect = node("select", undefined, "admin-input");
pageSelect.id = "admin-page-select";
for (const key of [
  "home",
  "about",
  "lessons",
  "coaching",
  "translation",
  "contact",
  "privacy",
]) {
  const option = node("option", humanize(key));
  option.value = key;
  pageSelect.append(option);
}
const pageLabel = node("label", "Choose page", "edit-label");
pageLabel.htmlFor = pageSelect.id;
$(".locale-tabs").before(pageLabel, pageSelect);
pageSelect.addEventListener("change", () => {
  if (!mayLeave()) {
    pageSelect.value = state.page;
    return;
  }
  state.page = pageSelect.value;
  loadPage();
});
const extraEditor = node("div");
extraEditor.id = "extra-field-editor";
$("#editor-fields").append(extraEditor);
const mediaLabel = node(
  "label",
  "Approved portrait media ID (optional)",
  "edit-label",
);
const mediaField = node("input", undefined, "admin-input");
mediaField.id = "portrait-media-id";
mediaLabel.htmlFor = mediaField.id;
mediaField.maxLength = 80;
extraEditor.after(mediaLabel, mediaField);
mediaField.addEventListener("input", () => dirty());
const actions = $(".editor-actions");
const publishBtn = $("button[disabled]", actions);
publishBtn.id = "publish-page";
publishBtn.dataset.ownerOnly = "true";
const reviewBtn = button("Approve translation", reviewPage);
reviewBtn.id = "review-page";
const historyBtn = button("History / rollback", loadHistory);
historyBtn.id = "history-page";
actions.append(reviewBtn, historyBtn);
function setLocale(locale) {
  if (!mayLeave()) return false;
  state.locale = locale;
  loadPage();
  return true;
}
for (const tab of $$("[data-locale]"))
  tab.addEventListener("click", () => setLocale(tab.dataset.locale));
$(".locale-tabs").addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const list = $$("[data-locale]");
  const index = list.indexOf(document.activeElement);
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? list.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + list.length) %
          list.length;
  if (setLocale(list[next].dataset.locale)) list[next].focus();
});
function editKeys() {
  return state.page === "home"
    ? ["hero", "hero_desc"]
    : ["title", "description"];
}
function fillPreview() {
  for (const [el, value] of [
    [$("#preview-heading"), title.value],
    [$("#preview-description"), description.value],
  ]) {
    el.textContent = value;
    el.dir = state.locale === "ar" ? "rtl" : "ltr";
    el.lang = state.locale;
  }
}
function readEditor() {
  const [a, b] = editKeys();
  state.content.fields[a] = title.value;
  state.content.fields[b] = description.value;
  for (const el of $$("[data-content-key]"))
    state.content.fields[el.dataset.contentKey] = el.value;
  for (const el of $$("[data-seo-key]"))
    state.content.seo[el.dataset.seoKey] = el.value;
  const key = state.page === "about" ? "aboutPortrait" : "heroPortrait";
  if (mediaField.value.trim())
    state.content.media[key] = mediaField.value.trim();
  else delete state.content.media[key];
}
function editorInput() {
  if (!state.content) return;
  readEditor();
  fillPreview();
  dirty();
}
title.addEventListener("input", editorInput);
description.addEventListener("input", editorInput);
extraEditor.addEventListener("input", editorInput);
function inputField(key, value, schema, source) {
  const label = node("label", schema?.label || humanize(key), "edit-label");
  const el = node(
    schema?.multiline ? "textarea" : "input",
    undefined,
    "admin-input",
  );
  el.id = "content-" + key;
  label.htmlFor = el.id;
  el.maxLength = schema?.maxLength || 2500;
  el.value = value;
  el.dataset.contentKey = key;
  el.lang = state.locale;
  el.dir = state.locale === "ar" ? "rtl" : "ltr";
  if (el.tagName === "TEXTAREA") el.rows = 3;
  const fragment = document.createDocumentFragment();
  fragment.append(label, el);
  if (source !== undefined) {
    const original = node("p", source, "source-field");
    original.lang = "en";
    original.dir = "ltr";
    fragment.append(original);
  }
  return fragment;
}
async function loadPage() {
  if (!state.session) return;
  const sequence = ++state.sequence,
    page = state.page,
    locale = state.locale;
  state.loading = true;
  updateControls();
  $("#revision-history")?.remove();
  for (const tab of $$("[data-locale]")) {
    tab.setAttribute("aria-selected", String(tab.dataset.locale === locale));
    tab.tabIndex = tab.dataset.locale === locale ? 0 : -1;
  }
  $("#editor-fields").setAttribute("aria-labelledby", "locale-" + locale);
  try {
    const [result, english] = await Promise.all([
      api(`/pages/${page}?locale=${locale}`),
      locale === "en" ? null : api(`/pages/${page}?locale=en`),
    ]);
    if (!current("pages", sequence)) return;
    const base = result.defaultContent || { fields: {}, seo: {}, media: {} },
      saved = result.draft || result.published || {};
    state.content = {
      fields: { ...base.fields, ...saved.fields },
      seo: { ...base.seo, ...saved.seo },
      media: { ...base.media, ...saved.media },
    };
    state.revision = result.draftRevision;
    state.publishedRevision = result.publishedRevision;
    state.reviewStatus = result.reviewStatus;
    state.sourceRevision = english?.draftRevision ?? null;
    const source = english
      ? {
          ...english.defaultContent?.fields,
          ...(english.draft || english.published)?.fields,
        }
      : null;
    const [a, b] = editKeys();
    for (const [el, key] of [
      [title, a],
      [description, b],
    ]) {
      el.value = state.content.fields[key] || "";
      el.maxLength = result.fieldSchema?.[key]?.maxLength || 2500;
      el.dir = locale === "ar" ? "rtl" : "ltr";
      el.lang = locale;
    }
    pageSelect.value = page;
    extraEditor.replaceChildren();
    const groups = new Map();
    for (const [key, value] of Object.entries(base.fields || {})) {
      if ([a, b].includes(key) || result.fieldSchema?.[key]?.editable === false)
        continue;
      const schema = result.fieldSchema?.[key],
        name = schema?.group || "Page sections";
      if (!groups.has(name)) {
        const details = node("details", undefined, "content-group");
        details.append(node("summary", name));
        extraEditor.append(details);
        groups.set(name, details);
      }
      groups
        .get(name)
        .append(
          inputField(
            key,
            state.content.fields[key] ?? value,
            schema,
            source?.[key],
          ),
        );
    }
    const seo = node("details", undefined, "content-group");
    seo.append(node("summary", "Search and sharing"));
    for (const key of ["title", "description"]) {
      const fragment = inputField("seo_" + key, state.content.seo[key] || "", {
        label: "SEO " + key,
        maxLength: key === "title" ? 100 : 500,
        multiline: key === "description",
      });
      const el = fragment.querySelector("input,textarea");
      delete el.dataset.contentKey;
      el.dataset.seoKey = key;
      seo.append(fragment);
    }
    extraEditor.append(seo);
    mediaField.value =
      state.content.media?.[
        page === "about" ? "aboutPortrait" : "heroPortrait"
      ] || "";
    mediaLabel.hidden = mediaField.hidden = !["home", "about"].includes(page);
    $("#source-comparison").hidden = !source;
    $("#source-heading").textContent = source?.[a] || "";
    $("#source-description").textContent = source?.[b] || "";
    $("#source-heading").lang = $("#source-description").lang = "en";
    $("#source-heading").dir = $("#source-description").dir = "ltr";
    message.textContent = `${locales[locale]} · Saved draft: ${state.revision || "none"} · Published: ${state.publishedRevision || "source baseline"} · Review: ${humanize(state.reviewStatus)}`;
    fillPreview();
    dirty(false);
  } catch (error) {
    if (current("pages", sequence)) {
      state.content = null;
      note(`Editor unavailable: ${error.message}`, "error");
    }
  } finally {
    if (current("pages", sequence)) {
      state.loading = false;
      updateControls();
    }
  }
}
$("#save-draft").addEventListener("click", () =>
  action(async () => {
    readEditor();
    const result = await api(`/pages/${state.page}?locale=${state.locale}`, {
      method: "PUT",
      body: JSON.stringify({
        baseRevision: state.revision,
        payload: state.content,
      }),
    });
    state.revision = result.revision;
    dirty(false);
    await loadPage();
    note(
      `Draft revision ${result.revision} saved. It is not published.`,
      "success",
    );
  }),
);
$("#preview-content").addEventListener("click", () => {
  if (state.unsaved)
    return note("Save the draft before opening the secure preview.", "error");
  window.open(
    `/preview/${state.locale}/${state.page}/`,
    "_blank",
    "noopener,noreferrer",
  );
});
publishBtn.addEventListener("click", () => {
  if (state.session?.role !== "owner" || state.unsaved || !state.revision)
    return;
  if (
    !confirm(
      `Publish saved revision ${state.revision} of ${state.page} in ${locales[state.locale]}? This changes the public page.`,
    )
  )
    return;
  action(async () => {
    const result = await api(
      `/pages/${state.page}/publish?locale=${state.locale}`,
      { method: "POST", body: JSON.stringify({ revision: state.revision }) },
    );
    await loadPage();
    note(
      `Published revision ${result.revision}. Public caches refresh within ${result.cacheRefreshWithinSeconds || 90} seconds.`,
      "success",
    );
  });
});
function reviewPage() {
  if (state.unsaved) return;
  action(async () => {
    await api(`/pages/${state.page}/review?locale=${state.locale}`, {
      method: "POST",
      body: JSON.stringify({
        revision: state.revision,
        sourceRevision: state.sourceRevision,
      }),
    });
    await loadPage();
    note(
      "Translation reviewed against the current English source. Publish when ready.",
      "success",
    );
  });
}
async function loadHistory() {
  const page = state.page,
    locale = state.locale,
    sequence = state.sequence;
  try {
    const result = await api(`/pages/${page}/revisions?locale=${locale}`);
    if (!current("pages", sequence)) return;
    $("#revision-history")?.remove();
    const history = node("section");
    history.id = "revision-history";
    history.append(node("h2", "Revision history"));
    actions.after(history);
    if (!result.revisions.length)
      history.append(node("p", "No saved revisions yet."));
    for (const revision of result.revisions) {
      const row = node("div", undefined, "history-row");
      row.append(
        node(
          "p",
          `Revision ${revision.id} · ${revision.created_at} · ${revision.created_by} · ${revision.published ? "Previously published" : "Draft only"}`,
        ),
      );
      const link = node("a", "Preview revision", "soft-btn");
      link.href = `/preview/${locale}/${page}/?revision=${revision.id}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const restore = button("Restore published revision", () => {
        if (
          !confirm(
            `Restore ${page} (${locales[locale]}) to published revision ${revision.id}?`,
          ) ||
          !mayLeave()
        )
          return;
        action(async () => {
          await api(`/pages/${page}/rollback?locale=${locale}`, {
            method: "POST",
            body: JSON.stringify({ toRevision: revision.id }),
          });
          await loadPage();
          note(
            "Published revision restored. Public caches refresh within 90 seconds.",
            "success",
          );
        });
      });
      restore.dataset.ownerOnly = "true";
      restore.dataset.blocked = String(!revision.published);
      row.append(link, restore);
      history.append(row);
    }
    updateControls();
  } catch (error) {
    note(`History unavailable: ${error.message}`, "error");
  }
}
async function loadOverview() {
  const sequence = state.sequence;
  if (!state.session) return;
  try {
    const data = await api("/summary");
    if (!current("overview", sequence)) return;
    const cards = $$("#view-overview .count");
    cards[0].textContent = data.openEnquiries;
    cards[1].textContent = data.translationsToReview;
    const last = data.lastPublication;
    cards[2].textContent = last
      ? `Revision ${last.revision}`
      : "No publication recorded";
    $("#last-publication-detail").textContent = last
      ? `${humanize(last.pageKey)} · ${locales[last.locale]} · ${last.action === "rollback" ? "Restored" : "Published"} ${new Date(last.occurredAt).toLocaleString("en-GB")}`
      : "The source baseline remains active until an owner publishes.";
    $("#connection-title").textContent = "Admin connected";
    $("#connection-description").textContent =
      `Authenticated ${state.session.role} session. Last checked ${new Date().toLocaleTimeString("en-GB")}. This is not a public-site uptime check.`;
  } catch (error) {
    if (current("overview", sequence)) {
      $("#connection-title").textContent = "Connection unavailable";
      for (const count of $$("#view-overview .count")) count.textContent = "—";
      $("#last-publication-detail").textContent =
        "Publication data could not be loaded.";
      note(error.message, "error");
    }
  }
}
async function loadTranslations() {
  const sequence = state.sequence;
  if (!state.session) return;
  try {
    const data = await api("/pages");
    if (!current("translations", sequence)) return;
    const section = $("#view-translations .box");
    section.replaceChildren();
    for (const page of data.pages) {
      const row = node("article", undefined, "translation-row");
      const heading = node("div");
      heading.append(node("strong", humanize(page.key)));
      row.append(heading);
      for (const [locale, label] of Object.entries(locales)) {
        const value = page.locales[locale];
        row.append(
          button(`${label} — ${humanize(value.status)}`, () =>
            go("pages", { page: page.key, locale }),
          ),
        );
      }
      section.append(row);
    }
  } catch (error) {
    if (current("translations", sequence)) note(error.message, "error");
  }
}
async function getSettings() {
  const result = await api("/settings");
  return structuredClone(result.settings);
}
async function saveSettings() {
  const result = await api("/settings", {
    method: "PUT",
    body: JSON.stringify({ settings: state.settings }),
  });
  state.settings = result.settings;
  dirty(false);
  note(
    `Settings published. Public caches refresh within ${result.cacheRefreshWithinSeconds || 90} seconds.`,
    "success",
  );
}
async function loadServices() {
  const sequence = state.sequence;
  if (!state.session) return;
  try {
    const settings = await getSettings();
    if (!current("services", sequence)) return;
    state.settings = settings;
    const root = $("#view-services .service-admin-grid");
    root.replaceChildren();
    for (const [id, value] of Object.entries(settings.services)) {
      const card = node("article", undefined, "box service-admin");
      card.append(node("h2", humanize(id)));
      for (const [key, text] of [
        ["visible", "Show on website"],
        ["acceptingRequests", "Accept new enquiries"],
      ]) {
        const label = node("label", undefined, "edit-label");
        const input = node("input");
        input.type = "checkbox";
        input.checked = value[key];
        input.dataset.ownerOnly = "true";
        input.addEventListener("change", () => {
          value[key] = input.checked;
          dirty();
        });
        label.append(input, document.createTextNode(text));
        card.append(label);
      }
      root.append(card);
    }
    const label = node(
        "label",
        "Approved directed language pairs (for example en:ru, ru:en)",
        "edit-label",
      ),
      input = node("input", undefined, "admin-input");
    input.value = settings.approvedTranslationPairs.join(", ");
    input.dataset.ownerOnly = "true";
    input.maxLength = 500;
    label.append(input);
    input.addEventListener("input", () => dirty());
    root.append(label);
    const controls = node("div", undefined, "settings-actions");
    const save = button(
      "Publish service settings",
      () =>
        action(async () => {
          state.settings.approvedTranslationPairs = input.value
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
          await saveSettings();
        }),
      "dark-btn",
    );
    save.dataset.ownerOnly = "true";
    controls.append(save);
    root.append(controls);
    updateControls();
  } catch (error) {
    if (current("services", sequence)) note(error.message, "error");
  }
}
async function loadContact() {
  const sequence = state.sequence;
  if (!state.session) return;
  try {
    const settings = await getSettings();
    if (!current("settings", sequence)) return;
    state.settings = settings;
    const root = $("#contact-settings");
    root.replaceChildren();
    for (const [group, keys] of [
      ["contact", ["email", "phone"]],
      ["links", ["preply", "instagram", "linkedin"]],
    ])
      for (const key of keys) {
        const label = node("label", humanize(key), "edit-label"),
          input = node("input", undefined, "admin-input");
        input.type =
          key === "email" ? "email" : key === "phone" ? "tel" : "url";
        input.value = settings[group][key] || "";
        input.dataset.ownerOnly = "true";
        input.maxLength = 500;
        input.addEventListener("input", () => {
          settings[group][key] = input.value.trim();
          dirty();
        });
        label.append(input);
        root.append(label);
      }
    const save = button(
      "Publish contact settings",
      () => {
        const invalid = $$("input", root).find(
          (input) => !input.checkValidity(),
        );
        if (invalid) {
          invalid.reportValidity();
          return;
        }
        action(saveSettings);
      },
      "dark-btn",
    );
    save.dataset.ownerOnly = "true";
    root.append(save);
    updateControls();
  } catch (error) {
    if (current("settings", sequence)) note(error.message, "error");
  }
}
function installMediaUploader() {
  const parent = $("#view-video .media-placeholder");
  if ($("#media-upload-form")) return;
  const form = node("form");
  form.id = "media-upload-form";
  form.className = "media-upload-form";
  for (const [name, labelText, type] of [
    ["file", "Image file", "file"],
    ["altText", "Accessible image description", "text"],
    ["source", "Owner / photographer and licence", "text"],
  ]) {
    const label = node("label", labelText, "edit-label"),
      input = node("input", undefined, "admin-input");
    input.type = type;
    input.name = name;
    input.required = true;
    if (type === "file") input.accept = "image/jpeg,image/png,image/webp";
    else input.maxLength = name === "source" ? 260 : 240;
    input.addEventListener("input", () => dirty(true, "media-upload"));
    label.append(input);
    form.append(label);
  }
  const upload = node("button", "Upload privately", "dark-btn");
  upload.type = "submit";
  form.append(
    upload,
    node(
      "p",
      "Maximum 4 MB. Uploading does not make an image public.",
      "box-note",
    ),
  );
  parent.append(form);
  const result = node("section");
  result.id = "media-upload-result";
  parent.append(result);
  const library = node("section");
  library.id = "media-library";
  library.append(node("h3", "Saved media library"));
  const filterLabel = node("label", "Show media", "edit-label"),
    filter = node("select", undefined, "admin-input");
  filter.id = "media-filter";
  filterLabel.htmlFor = filter.id;
  for (const [value, text] of [
    ["private", "Awaiting owner approval"],
    ["published", "Approved for public use"],
    ["all", "All media"],
  ]) {
    const option = node("option", text);
    option.value = value;
    filter.append(option);
  }
  filter.addEventListener("change", () => action(() => loadMedia()));
  const list = node("ul", undefined, "media-library-list");
  list.id = "media-library-list";
  const more = button("Load more media", () =>
    action(() => loadMedia(null, true)),
  );
  more.id = "media-load-more";
  more.hidden = true;
  library.append(
    filterLabel,
    filter,
    button("Refresh media library", () => action(() => loadMedia())),
    list,
    more,
  );
  parent.append(library);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const file = form.elements.namedItem("file").files[0];
    if (!file || file.size > 4 * 1024 * 1024)
      return note("Choose a JPEG, PNG or WebP no larger than 4 MB.", "error");
    action(async () => {
      const uploaded = await api("/media", {
        method: "POST",
        body: new FormData(form),
      });
      state.mediaId = uploaded.id;
      showMedia({
        id: uploaded.id,
        altText: form.elements.namedItem("altText").value,
        source: form.elements.namedItem("source").value,
        contentType: file.type,
        byteSize: file.size,
        published: false,
      });
      form.reset();
      dirty(false, "media-upload");
      note(
        "Image uploaded privately. Owner approval is required before public use.",
        "success",
      );
      $("#media-filter").value = "private";
      await loadMedia(uploaded.id);
    });
  });
}
async function loadMedia(selectId = state.mediaId, append = false) {
  const sequence = state.sequence,
    request = ++state.mediaRequest;
  const params = new URLSearchParams({
    status: $("#media-filter").value,
    limit: "20",
  });
  if (append && state.mediaCursor) params.set("cursor", state.mediaCursor);
  const result = await api("/media?" + params);
  if (!current("video", sequence) || request !== state.mediaRequest) return;
  state.mediaItems = append
    ? [...state.mediaItems, ...result.items]
    : result.items;
  state.mediaCursor = result.nextCursor;
  const list = $("#media-library-list");
  list.replaceChildren();
  if (!state.mediaItems.length)
    list.append(
      node(
        "li",
        "No media in this view. Private uploads remain here until an owner approves them.",
      ),
    );
  for (const item of state.mediaItems) {
    const row = node("li"),
      inspect = button("Inspect image " + item.id.slice(0, 8), () =>
        showMedia(item),
      );
    row.append(
      node("p", item.altText),
      node(
        "p",
        (item.published ? "Approved" : "Private") + " · " + item.createdAt,
        "box-note",
      ),
      inspect,
    );
    list.append(row);
  }
  $("#media-load-more").hidden = !state.mediaCursor;
  showMedia(
    state.mediaItems.find((item) => item.id === selectId) ||
      state.mediaItems[0],
  );
  updateControls();
}
function showMedia(asset) {
  const root = $("#media-upload-result");
  root.replaceChildren();
  state.mediaId = asset?.id || null;
  if (!asset) return;
  root.append(
    node("h3", "Selected image"),
    node(
      "p",
      (asset.published ? "Approved media ID: " : "Private media ID: ") +
        asset.id,
    ),
    node("p", "Source / licence: " + asset.source),
    node(
      "p",
      asset.contentType + " · " + Math.ceil(asset.byteSize / 1024) + " KB",
      "box-note",
    ),
  );
  const image = node("img", undefined, "managed-preview");
  image.src = "/api/v1/admin/media/" + encodeURIComponent(asset.id);
  image.alt = asset.altText;
  root.append(image);
  if (asset.published) {
    root.append(
      node(
        "p",
        "Approved for public use. Add its media ID to a page or the video poster.",
      ),
    );
    updateControls();
    return;
  }
  const label = node("label", undefined, "edit-label"),
    consent = node("input");
  consent.type = "checkbox";
  consent.dataset.ownerOnly = "true";
  label.append(
    consent,
    document.createTextNode(
      "I confirm permission for public use of this image.",
    ),
  );
  root.append(label);
  const publish = button(
    "Approve image for public use",
    () => {
      if (!consent.checked)
        return note("Confirm permission for public use first.", "error");
      action(async () => {
        await api("/media/" + encodeURIComponent(asset.id) + "/publish", {
          method: "POST",
          body: JSON.stringify({ consentConfirmed: true }),
        });
        await loadMedia();
        showMedia({ ...asset, published: true });
        note(
          "Image approved for public use. Add its media ID to a page or the video poster.",
          "success",
        );
      });
    },
    "dark-btn",
  );
  publish.dataset.ownerOnly = "true";
  root.append(publish);
  updateControls();
}
async function loadVideo() {
  const sequence = state.sequence;
  if (!state.session) return;
  try {
    const settings = await getSettings();
    if (!current("video", sequence)) return;
    state.settings = settings;
    installMediaUploader();
    const url = $("#video-url");
    url.readOnly = false;
    url.dataset.ownerOnly = "true";
    url.value = settings.video.url;
    let toggle = $("#video-enabled"),
      poster = $("#video-poster-id"),
      save = $("#save-video");
    if (!toggle) {
      const enabledLabel = node("label", undefined, "edit-label");
      toggle = node("input");
      toggle.type = "checkbox";
      toggle.id = "video-enabled";
      toggle.dataset.ownerOnly = "true";
      enabledLabel.append(
        toggle,
        document.createTextNode("Show introduction video"),
      );
      url.after(enabledLabel);
      const label = node(
        "label",
        "Approved video poster media ID",
        "edit-label",
      );
      poster = node("input", undefined, "admin-input");
      poster.id = "video-poster-id";
      poster.dataset.ownerOnly = "true";
      label.append(poster);
      enabledLabel.after(label);
      save = button(
        "Publish video settings",
        () =>
          action(async () => {
            if (!url.checkValidity()) {
              url.reportValidity();
              return;
            }
            state.settings.video = {
              ...state.settings.video,
              url: url.value.trim(),
              enabled: toggle.checked,
              posterMediaId: poster.value.trim() || null,
            };
            await saveSettings();
          }),
        "dark-btn",
      );
      save.id = "save-video";
      save.dataset.ownerOnly = "true";
      label.after(save);
    }
    toggle.checked = settings.video.enabled;
    poster.value = settings.video.posterMediaId || "";
    for (const input of [url, toggle, poster]) input.oninput = () => dirty();
    updateControls();
    await loadMedia();
  } catch (error) {
    if (current("video", sequence)) note(error.message, "error");
  }
}
$("#enquiry-filter").addEventListener("change", (event) => {
  if (!mayLeave()) {
    event.target.value = state.filter;
    return;
  }
  state.filter = event.target.value;
  loadEnquiries();
});
async function loadEnquiries(cursor = "") {
  if (!state.session) return;
  const sequence = ++state.sequence;
  try {
    const data = await api(
      "/enquiries?limit=20" +
        (state.filter ? "&status=" + encodeURIComponent(state.filter) : "") +
        (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""),
    );
    if (!current("enquiries", sequence)) return;
    const root = $("#view-enquiries .empty-inbox");
    if (!cursor) root.replaceChildren(node("h2", "Customer enquiries"));
    $("#older-enquiries")?.remove();
    for (const item of data.items) {
      const row = node("article", undefined, "translation-row"),
        summary = node("div");
      summary.append(
        node("strong", `${item.name} · ${humanize(item.type)}`),
        node(
          "span",
          `${item.email} · ${item.createdAt} · Notification ${item.notificationStatus || "pending"}`,
        ),
      );
      row.append(summary);
      const select = node("select", undefined, "admin-input");
      select.setAttribute("aria-label", "Status for " + item.reference);
      for (const value of statuses) {
        const option = node("option", humanize(value));
        option.value = value;
        option.selected = value === item.status;
        select.append(option);
      }
      select.addEventListener("change", () => {
        state.enquiryChanges.add(item.reference);
        dirty();
      });
      const detail = node("section", undefined, "enquiry-detail");
      detail.hidden = true;
      detail.id = "detail-" + item.reference;
      const save = button("Update status", () =>
        action(async () => {
          const noteInput = $("[data-enquiry-note]", row);
          await api("/enquiries/" + item.reference, {
            method: "PATCH",
            body: JSON.stringify({
              status: select.value,
              note: noteInput?.value || "",
            }),
          });
          state.enquiryChanges.delete(item.reference);
          dirty(state.enquiryChanges.size > 0);
          if (noteInput) noteInput.value = "";
          detail.dataset.loaded = "";
          if (!detail.hidden) await readEnquiry(item, detail);
          note(`${item.reference} updated.`, "success");
        }),
      );
      const open = button("Read enquiry", async () => {
        detail.hidden = !detail.hidden;
        open.setAttribute("aria-expanded", String(!detail.hidden));
        if (!detail.hidden && !detail.dataset.loaded)
          await readEnquiry(item, detail);
      });
      open.setAttribute("aria-expanded", "false");
      open.setAttribute("aria-controls", detail.id);
      row.append(select, save, open, detail);
      root.append(row);
    }
    if (!data.items.length && !cursor)
      root.append(
        node(
          "p",
          "No enquiries match this view. New requests will appear here after they are saved.",
        ),
      );
    if (data.nextCursor) {
      const older = button("Load older enquiries", () => {
        if (state.unsaved) {
          note("Save enquiry changes before loading more requests.", "error");
          return;
        }
        loadEnquiries(data.nextCursor);
      });
      older.id = "older-enquiries";
      root.append(older);
    }
    updateControls();
  } catch (error) {
    if (current("enquiries", sequence))
      note(`Inbox unavailable: ${error.message}`, "error");
  }
}
async function readEnquiry(item, detail) {
  try {
    const data = await api("/enquiries/" + item.reference);
    if (!detail.isConnected) return;
    detail.replaceChildren();
    for (const [label, value] of Object.entries({
      Reference: item.reference,
      Message: data.enquiry.message,
      ...data.enquiry.details,
    }))
      detail.append(node("p", humanize(label) + ": " + value));
    const reply = node("a", "Open email reply");
    reply.href = "mailto:" + encodeURIComponent(item.email);
    detail.append(
      reply,
      node(
        "p",
        "Opening your email app does not send or record a reply.",
        "box-note",
      ),
    );
    const label = node("label", "Internal note", "edit-label"),
      input = node("textarea", undefined, "admin-input");
    input.dataset.enquiryNote = "true";
    input.maxLength = 1000;
    input.addEventListener("input", () => {
      state.enquiryChanges.add(item.reference);
      dirty();
    });
    label.append(input);
    detail.append(label, node("h3", "Activity"));
    for (const event of data.events || []) {
      let text = "";
      try {
        text = JSON.parse(event.payload_json || "{}").note || "";
      } catch {}
      detail.append(
        node(
          "p",
          `${event.created_at} · ${humanize(event.event_type)} · ${event.actor}${text ? " · " + text : ""}`,
        ),
      );
    }
    detail.dataset.loaded = "true";
    updateControls();
  } catch (error) {
    detail.replaceChildren(
      node("p", "Could not load this enquiry. Close and reopen to retry."),
    );
    note(error.message, "error");
  }
}
async function init() {
  updateControls();
  try {
    state.session = await api("/me");
    $(".demo-banner").textContent =
      `SECURE ADMIN · ${state.session.email} · ${state.session.role.toUpperCase()}`;
    $(".status-chip").textContent = "Protected admin";
    $(".sidebar-bottom small").textContent = "Verified " + state.session.role;
    updateControls();
    await loadOverview();
  } catch (error) {
    state.session = null;
    $(".demo-banner").textContent =
      "Protected administration · sign-in required";
    $(".status-chip").textContent = "Sign-in required";
    $("#connection-title").textContent = "Sign-in required";
    $("#connection-description").textContent =
      "Reload this protected page to authenticate before editing.";
    note(`Admin unavailable: ${error.message}`, "error");
    updateControls();
  }
}
init();
