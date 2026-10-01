/* IFA Pattern Guide — image viewer + guided ICAP decision tree. */
(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  const state = {
    images: [], // { id, name, url }
    selected: null,
    view: { zoom: 1, x: 0, y: 0 },
    // guide
    started: false,
    path: [], // [{ nodeId, optionIndex }]
    current: TREE.start,
    findings: [], // [{ code, path: [{question, answer}] }]
    finished: false,
  };

  // ------------------------------------------------------------------
  // Image upload & viewer
  // ------------------------------------------------------------------
  const dropzone = $("#dropzone");
  const fileInput = $("#file-input");
  const viewer = $("#viewer");
  const stage = $("#stage");
  const mainImg = $("#main-image");
  const thumbs = $("#thumbs");

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") fileInput.click();
  });
  fileInput.addEventListener("change", () => addFiles(fileInput.files));
  ["dragenter", "dragover"].forEach((ev) =>
    document.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add("over");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    document.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove("over");
    })
  );
  document.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));

  function addFiles(fileList) {
    const files = [...fileList].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    files.forEach((f) => {
      const id = Math.random().toString(36).slice(2);
      state.images.push({ id, name: f.name, url: URL.createObjectURL(f) });
    });
    fileInput.value = "";
    if (!state.selected) state.selected = state.images[0].id;
    renderViewer();
    renderGuide();
  }

  function removeImage(id) {
    const img = state.images.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.url);
    state.images = state.images.filter((i) => i.id !== id);
    if (state.selected === id) state.selected = state.images[0]?.id ?? null;
    renderViewer();
    renderGuide();
  }

  function renderViewer() {
    const has = state.images.length > 0;
    viewer.classList.toggle("hidden", !has);
    dropzone.classList.toggle("compact", has);
    if (!has) return;

    const img = state.images.find((i) => i.id === state.selected);
    if (mainImg.dataset.id !== img.id) {
      mainImg.src = img.url;
      mainImg.dataset.id = img.id;
      resetView();
    }

    thumbs.innerHTML = state.images
      .map(
        (i) => `
        <figure class="thumb ${i.id === state.selected ? "active" : ""}" data-id="${i.id}" title="${esc(i.name)}">
          <img src="${i.url}" alt="">
          <figcaption>${esc(i.name)}</figcaption>
          <button class="remove" data-remove="${i.id}" type="button" aria-label="Remove image">×</button>
        </figure>`
      )
      .join("");
  }

  thumbs.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (rm) return removeImage(rm.dataset.remove);
    const t = e.target.closest(".thumb");
    if (t) {
      state.selected = t.dataset.id;
      renderViewer();
    }
  });

  // zoom / pan
  function applyTransform() {
    const { zoom, x, y } = state.view;
    mainImg.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    $("#zoom-label").textContent = Math.round(zoom * 100) + "%";
  }
  function setZoom(z) {
    state.view.zoom = Math.min(8, Math.max(1, z));
    if (state.view.zoom === 1) state.view.x = state.view.y = 0;
    applyTransform();
  }
  function resetView() {
    state.view = { zoom: 1, x: 0, y: 0 };
    applyTransform();
  }
  $("#zoom-in").addEventListener("click", () => setZoom(state.view.zoom * 1.4));
  $("#zoom-out").addEventListener("click", () => setZoom(state.view.zoom / 1.4));
  $("#zoom-reset").addEventListener("click", resetView);
  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      setZoom(state.view.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    },
    { passive: false }
  );
  let drag = null;
  stage.addEventListener("pointerdown", (e) => {
    if (state.view.zoom === 1) return;
    drag = { sx: e.clientX, sy: e.clientY, x: state.view.x, y: state.view.y };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("grabbing");
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag) return;
    state.view.x = drag.x + (e.clientX - drag.sx);
    state.view.y = drag.y + (e.clientY - drag.sy);
    applyTransform();
  });
  ["pointerup", "pointercancel"].forEach((ev) =>
    stage.addEventListener(ev, () => {
      drag = null;
      stage.classList.remove("grabbing");
    })
  );

  // image adjustments
  function applyFilters() {
    const b = $("#brightness").value;
    const c = $("#contrast").value;
    const g = $("#grayscale").checked ? 1 : 0;
    mainImg.style.filter = `brightness(${b}%) contrast(${c}%) grayscale(${g})`;
  }
  ["#brightness", "#contrast", "#grayscale"].forEach((s) => $(s).addEventListener("input", applyFilters));

  // ------------------------------------------------------------------
  // Guide
  // ------------------------------------------------------------------
  const guide = $("#guide");

  function resolve(code) {
    if (PATTERNS[code]) return { code, ...PATTERNS[code], level: "expert" };
    const g = GROUP_RESULTS[code];
    return {
      code: g.codes.join(" / "),
      name: g.name,
      group: "Group-level",
      level: "competent",
      description: `Reported at group level. Possible patterns: ${g.codes
        .map((c) => `${c} ${PATTERNS[c].name}`)
        .join("; ")}.`,
      antigens: [...new Set(g.codes.flatMap((c) => PATTERNS[c].antigens))],
      associations: [...new Set(g.codes.flatMap((c) => PATTERNS[c].associations))],
    };
  }

  function pathAsText(path) {
    return path.map(({ nodeId, optionIndex }) => {
      const n = TREE.nodes[nodeId];
      return { question: n.title, answer: n.options[optionIndex].label };
    });
  }

  function choose(optionIndex) {
    const node = TREE.nodes[state.current];
    const opt = node.options[optionIndex];
    state.path.push({ nodeId: state.current, optionIndex });
    if (opt.next) {
      state.current = opt.next;
    } else {
      state.findings.push({ key: opt.result, path: pathAsText(state.path) });
      state.finished = true;
    }
    renderGuide();
  }

  function back() {
    if (state.finished) {
      state.findings.pop();
      state.finished = false;
    }
    const last = state.path.pop();
    if (last) state.current = last.nodeId;
    else if (state.findings.length) state.finished = true; // back from "add pattern" to results
    else state.started = false;
    renderGuide();
  }

  function addAnotherPattern() {
    state.path = [];
    state.current = TREE.start;
    state.finished = false;
    renderGuide();
  }

  function reset() {
    state.started = false;
    state.path = [];
    state.current = TREE.start;
    state.findings = [];
    state.finished = false;
    renderGuide();
  }

  function renderSteps() {
    const steps = state.path.map(({ nodeId, optionIndex }) => TREE.nodes[nodeId].options[optionIndex].label);
    if (!steps.length) return "";
    return `<ol class="crumbs">${steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`;
  }

  function renderGuide() {
    if (!state.started) {
      const ready = state.images.length > 0;
      guide.innerHTML = `
        <div class="intro">
          <h2>Start evaluation</h2>
          <p>Upload one or more IFA images, then answer the questions step by step. Each answer narrows down the
             pattern until the guide gives you the ICAP pattern name (AC code).</p>
          <ul class="tips">
            <li>Read interphase cells first, then confirm with mitotic cells.</li>
            <li>Use zoom, brightness and contrast to inspect fine details.</li>
            <li>Choose <em>Not sure</em> to report at group (competent) level.</li>
            <li>Mixed patterns: after a result, add another pattern.</li>
          </ul>
          <button id="btn-start" class="btn primary" type="button" ${ready ? "" : "disabled"}>
            ${ready ? "Start guide" : "Upload an image to start"}
          </button>
        </div>`;
      $("#btn-start").addEventListener("click", () => {
        state.started = true;
        renderGuide();
      });
      return;
    }

    if (state.finished) return renderResult();

    const node = TREE.nodes[state.current];
    const stepNo = state.path.length + 1;
    const extra = state.findings.length ? `<p class="badge">Additional pattern #${state.findings.length + 1}</p>` : "";
    guide.innerHTML = `
      ${extra}
      ${renderSteps()}
      <div class="question">
        <p class="step mono">Step ${stepNo}</p>
        <h2>${esc(node.title)}</h2>
        <p class="help">${esc(node.help)}</p>
        <div class="options">
          ${node.options
            .map(
              (o, i) => `
            <button class="option" data-i="${i}" type="button">
              <span class="key mono">${i + 1}</span>
              <span><strong>${esc(o.label)}</strong><small>${esc(o.hint)}</small></span>
            </button>`
            )
            .join("")}
        </div>
      </div>
      <div class="nav">
        <button id="btn-back" class="btn ghost" type="button">← Back</button>
      </div>`;
    guide.querySelectorAll(".option").forEach((b) => b.addEventListener("click", () => choose(+b.dataset.i)));
    $("#btn-back").addEventListener("click", back);
  }

  function resultCard(f, i) {
    const r = resolve(f.key);
    return `
      <article class="result ${r.code === "AC-0" ? "negative" : ""}">
        <header>
          <span class="code mono">${esc(r.code)}</span>
          <span class="group">${esc(r.group)}${r.level === "competent" ? " · competent level" : ""}</span>
        </header>
        <h2>${esc(r.name)}</h2>
        <p>${esc(r.description)}</p>
        ${
          r.antigens.length
            ? `<h3>Associated antigens</h3><ul class="chips">${r.antigens.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>`
            : ""
        }
        ${
          r.associations.length
            ? `<h3>Clinical associations</h3><ul class="assoc">${r.associations.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>`
            : ""
        }
        <details>
          <summary>Decision path</summary>
          <ol class="path">${f.path.map((p) => `<li><span>${esc(p.question)}</span> <strong>${esc(p.answer)}</strong></li>`).join("")}</ol>
        </details>
        ${state.findings.length > 1 ? `<button class="btn small ghost" data-remove-finding="${i}" type="button">Remove</button>` : ""}
      </article>`;
  }

  function reportName() {
    return state.findings.map((f) => {
      const r = resolve(f.key);
      return `${r.name} (${r.code})`;
    });
  }

  function renderResult() {
    const names = reportName();
    guide.innerHTML = `
      <div class="summary">
        <p class="step mono">Result</p>
        <h2 class="final">${esc(names.join(" + "))}</h2>
        ${names.length > 1 ? `<p class="muted small">Mixed / composite pattern</p>` : ""}
      </div>
      ${state.findings.map(resultCard).join("")}
      <div class="nav wrap">
        <button id="btn-back" class="btn ghost" type="button">← Back</button>
        <button id="btn-add" class="btn" type="button">+ Add another pattern</button>
        <button id="btn-print" class="btn" type="button">Print report</button>
        <button id="btn-json" class="btn" type="button">Download JSON</button>
        <button id="btn-restart" class="btn primary" type="button">New evaluation</button>
      </div>`;
    $("#btn-back").addEventListener("click", back);
    $("#btn-add").addEventListener("click", addAnotherPattern);
    $("#btn-print").addEventListener("click", printReport);
    $("#btn-json").addEventListener("click", downloadJson);
    $("#btn-restart").addEventListener("click", reset);
    guide.querySelectorAll("[data-remove-finding]").forEach((b) =>
      b.addEventListener("click", () => {
        state.findings.splice(+b.dataset.removeFinding, 1);
        renderGuide();
      })
    );
  }

  // ------------------------------------------------------------------
  // Report export
  // ------------------------------------------------------------------
  function reportData() {
    return {
      sampleId: $("#sample-id").value.trim() || null,
      substrate: $("#substrate").value,
      titer: $("#titer").value || null,
      intensity: $("#intensity").value || null,
      date: new Date().toISOString(),
      images: state.images.map((i) => i.name),
      result: reportName().join(" + "),
      findings: state.findings.map((f) => {
        const r = resolve(f.key);
        return { code: r.code, name: r.name, group: r.group, level: r.level, antigens: r.antigens, associations: r.associations, decisionPath: f.path };
      }),
    };
  }

  function downloadJson() {
    const data = reportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ifa-report-${data.sampleId || "sample"}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function printReport() {
    const d = reportData();
    const img = state.images.find((i) => i.id === state.selected);
    const w = window.open("", "_blank");
    if (!w) return alert("Please allow pop-ups to print the report.");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>IFA report ${esc(d.sampleId || "")}</title>
      <style>
        body{font-family:system-ui,sans-serif;margin:32px;color:#111;max-width:800px}
        h1{font-size:20px;margin:0 0 4px} h2{font-size:16px;margin:20px 0 6px}
        table{border-collapse:collapse;width:100%;font-size:14px} td{padding:4px 8px;border-bottom:1px solid #ddd}
        td:first-child{color:#555;width:160px} .res{font-size:18px;font-weight:600;margin:12px 0}
        img{max-width:320px;border:1px solid #ccc;margin-top:8px} small{color:#666} li{margin:2px 0}
      </style></head><body>
      <h1>HEp-2 IFA pattern report</h1><small>${esc(new Date(d.date).toLocaleString())}</small>
      <table>
        <tr><td>Sample ID</td><td>${esc(d.sampleId || "—")}</td></tr>
        <tr><td>Substrate</td><td>${esc(d.substrate)}</td></tr>
        <tr><td>Titer</td><td>${esc(d.titer || "—")}</td></tr>
        <tr><td>Intensity</td><td>${esc(d.intensity || "—")}</td></tr>
        <tr><td>Images</td><td>${esc(d.images.join(", "))}</td></tr>
      </table>
      <p class="res">Result: ${esc(d.result)}</p>
      ${d.findings
        .map(
          (f) => `<h2>${esc(f.code)} — ${esc(f.name)}</h2>
          ${f.antigens.length ? `<div><b>Antigens:</b> ${esc(f.antigens.join(", "))}</div>` : ""}
          ${f.associations.length ? `<div><b>Associations:</b> ${esc(f.associations.join("; "))}</div>` : ""}
          <ol>${f.decisionPath.map((p) => `<li>${esc(p.question)} → <b>${esc(p.answer)}</b></li>`).join("")}</ol>`
        )
        .join("")}
      ${img ? `<img src="${img.url}" alt="">` : ""}
      <p><small>Pattern nomenclature according to ICAP. Decision-support output — interpret with titer, specific antibody testing and clinical findings.</small></p>
      <script>window.onload=()=>window.print()<\/script>
      </body></html>`);
    w.document.close();
  }

  // ------------------------------------------------------------------
  // Keyboard shortcuts: 1-9 choose option, Backspace = back
  // ------------------------------------------------------------------
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea")) return;
    if (!state.started || state.finished) return;
    const n = parseInt(e.key, 10);
    const opts = TREE.nodes[state.current].options;
    if (n >= 1 && n <= opts.length) choose(n - 1);
    else if (e.key === "Backspace") {
      e.preventDefault();
      back();
    }
  });

  $("#btn-new").addEventListener("click", () => {
    if (state.findings.length && !confirm("Discard the current evaluation?")) return;
    state.images.forEach((i) => URL.revokeObjectURL(i.url));
    state.images = [];
    state.selected = null;
    mainImg.removeAttribute("src");
    mainImg.dataset.id = "";
    $("#sample-form").reset();
    reset();
    renderViewer();
  });

  renderViewer();
  renderGuide();
})();
