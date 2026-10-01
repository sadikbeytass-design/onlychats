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
          <p>A synthetic example image is loaded so you can try the guide right away. Upload your own IFA images, then answer the questions step by step. Each answer narrows down the
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
        <button id="btn-copy" class="btn" type="button">Copy report</button>
        <button id="btn-restart" class="btn primary" type="button">New evaluation</button>
      </div>
      <textarea id="report-text" class="report-text" rows="12" readonly hidden aria-label="Report text"></textarea>`;
    $("#btn-back").addEventListener("click", back);
    $("#btn-add").addEventListener("click", addAnotherPattern);
    $("#btn-copy").addEventListener("click", (e) => copyReport(e.currentTarget));
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

  function reportText() {
    const d = reportData();
    const lines = [
      "HEp-2 IFA pattern report",
      `Date: ${new Date(d.date).toLocaleString()}`,
      `Sample ID: ${d.sampleId || "-"}`,
      `Substrate: ${d.substrate}`,
      `Titer: ${d.titer || "-"}`,
      `Intensity: ${d.intensity || "-"}`,
      `Images: ${d.images.join(", ") || "-"}`,
      "",
      `RESULT: ${d.result}`,
    ];
    d.findings.forEach((f) => {
      lines.push("", `${f.code} - ${f.name}`);
      if (f.antigens.length) lines.push(`  Antigens: ${f.antigens.join(", ")}`);
      if (f.associations.length) lines.push(`  Associations: ${f.associations.join("; ")}`);
      lines.push("  Decision path:");
      f.decisionPath.forEach((p, i) => lines.push(`    ${i + 1}. ${p.question} -> ${p.answer}`));
    });
    lines.push("", "Pattern nomenclature according to ICAP. Decision support only; interpret with titer, specific antibody tests and clinical findings.");
    return lines.join("\n");
  }

  function copyReport(btn) {
    const text = reportText();
    const box = $("#report-text");
    box.value = text;
    box.hidden = false;
    const done = (msg) => {
      btn.textContent = msg;
      setTimeout(() => (btn.textContent = "Copy report"), 2000);
    };
    try {
      navigator.clipboard.writeText(text).then(
        () => done("Copied"),
        () => {
          box.select();
          done("Select and copy below");
        }
      );
    } catch {
      box.select();
      done("Select and copy below");
    }
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

  let confirmTimer = null;
  $("#btn-new").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    if (state.findings.length && !confirmTimer) {
      btn.textContent = "Click again to discard";
      btn.classList.add("warn");
      confirmTimer = setTimeout(() => {
        confirmTimer = null;
        btn.textContent = "New evaluation";
        btn.classList.remove("warn");
      }, 3000);
      return;
    }
    clearTimeout(confirmTimer);
    confirmTimer = null;
    btn.textContent = "New evaluation";
    btn.classList.remove("warn");
    state.images.forEach((i) => URL.revokeObjectURL(i.url));
    state.images = [];
    state.selected = null;
    mainImg.removeAttribute("src");
    mainImg.dataset.id = "";
    $("#sample-form").reset();
    reset();
    renderViewer();
  });

  // ------------------------------------------------------------------
  // Example image: a synthetic HEp-2-like field (nuclear fine speckled look)
  // so the tool opens in a working state. Replace it with your own images.
  // ------------------------------------------------------------------
  function exampleImage() {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const W = 960, H = 720;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const x = c.getContext("2d");
    x.fillStyle = "#020502";
    x.fillRect(0, 0, W, H);
    const cells = [];
    for (let gy = 0; gy < 5; gy++)
      for (let gx = 0; gx < 6; gx++)
        cells.push({ cx: 90 + gx * 160 + (rnd() - 0.5) * 50, cy: 80 + gy * 145 + (rnd() - 0.5) * 40, r: 42 + rnd() * 14, a: rnd() * Math.PI });
    cells.forEach((cell, i) => {
      const mitotic = i === 14;
      // faint cytoplasm
      x.fillStyle = "rgba(40,120,50,0.18)";
      x.beginPath();
      x.ellipse(cell.cx, cell.cy, cell.r * 1.7, cell.r * 1.35, cell.a, 0, 7);
      x.fill();
      if (mitotic) {
        // speckled cytoplasm around a dark metaphase plate
        for (let k = 0; k < 900; k++) {
          const t = rnd() * 7, d = Math.sqrt(rnd()) * cell.r * 1.3;
          x.fillStyle = `rgba(90,230,100,${0.25 + rnd() * 0.5})`;
          x.fillRect(cell.cx + Math.cos(t) * d, cell.cy + Math.sin(t) * d, 2, 2);
        }
        x.fillStyle = "#031003";
        x.fillRect(cell.cx - 8, cell.cy - cell.r * 0.9, 16, cell.r * 1.8);
        return;
      }
      // nucleus: base glow + fine speckles, darker nucleoli
      const g = x.createRadialGradient(cell.cx, cell.cy, 2, cell.cx, cell.cy, cell.r);
      g.addColorStop(0, "rgba(60,190,70,0.55)");
      g.addColorStop(1, "rgba(30,120,40,0.35)");
      x.fillStyle = g;
      x.beginPath();
      x.ellipse(cell.cx, cell.cy, cell.r, cell.r * 0.8, cell.a, 0, 7);
      x.fill();
      for (let k = 0; k < 1400; k++) {
        const t = rnd() * 7, d = Math.sqrt(rnd());
        const px = cell.cx + Math.cos(t) * d * cell.r * Math.cos(cell.a) - Math.sin(t) * d * cell.r * 0.8 * Math.sin(cell.a);
        const py = cell.cy + Math.cos(t) * d * cell.r * Math.sin(cell.a) + Math.sin(t) * d * cell.r * 0.8 * Math.cos(cell.a);
        x.fillStyle = `rgba(120,255,120,${0.15 + rnd() * 0.55})`;
        x.fillRect(px, py, 2, 2);
      }
      for (let n = 0; n < 2 + Math.floor(rnd() * 2); n++) {
        x.fillStyle = "rgba(5,30,8,0.75)";
        x.beginPath();
        x.ellipse(cell.cx + (rnd() - 0.5) * cell.r, cell.cy + (rnd() - 0.5) * cell.r * 0.7, 6 + rnd() * 4, 5 + rnd() * 3, rnd() * 3, 0, 7);
        x.fill();
      }
    });
    return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
  }

  renderViewer();
  renderGuide();
  exampleImage().then((blob) => {
    if (!blob || state.images.length) return;
    state.images.push({ id: "example", name: "example-synthetic.png", url: URL.createObjectURL(blob) });
    state.selected = "example";
    renderViewer();
    renderGuide();
  });
})();
