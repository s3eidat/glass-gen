/* Glass Gen — glassmorphism CSS generator. All local; the preview uses the real backdrop-filter. */
(function () {
  "use strict";
  var $ = S3.$, $$ = S3.$$, h = S3.h;
  var DEFAULT = { blur: 16, transparency: 82, saturation: 180, border: 30, radius: 20, tint: "#ffffff", shadow: true };
  var PRESETS = [
    ["Frosted", DEFAULT],
    ["Clear", { blur: 6, transparency: 94, saturation: 120, border: 22, radius: 16, tint: "#ffffff", shadow: false }],
    ["Milky", { blur: 28, transparency: 45, saturation: 160, border: 50, radius: 24, tint: "#ffffff", shadow: true }],
    ["Dark", { blur: 20, transparency: 55, saturation: 140, border: 12, radius: 18, tint: "#0f1720", shadow: true }],
    ["Teal", { blur: 14, transparency: 78, saturation: 200, border: 35, radius: 22, tint: "#3dd6d0", shadow: true }],
    ["Rose", { blur: 18, transparency: 80, saturation: 190, border: 30, radius: 28, tint: "#ff6f91", shadow: true }]
  ];

  // ---------- core ----------
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16 & 255) + ", " + (n >> 8 & 255) + ", " + (n & 255) + ", " + Math.round(a * 100) / 100 + ")"; }
  function lum(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255].reduce(function (s, v, i) { v /= 255; v = v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); return s + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  function decls(s) {
    var alpha = (100 - s.transparency) / 100, filt = "blur(" + s.blur + "px)" + (s.saturation !== 100 ? " saturate(" + s.saturation + "%)" : "");
    // Light tints get a white edge, dark tints a faint white edge too: it reads as the glass rim either way.
    var d = [["background", rgba(s.tint, alpha)], ["backdrop-filter", filt], ["-webkit-backdrop-filter", filt]];
    if (s.border > 0) d.push(["border", "1px solid " + rgba("#ffffff", s.border / 100)]);
    d.push(["border-radius", s.radius + "px"]);
    if (s.shadow) d.push(["box-shadow", "0 8px 32px " + rgba("#0f1720", 0.18)]);
    return d;
  }
  function cssText(s) { return ".glass {\n" + decls(s).map(function (d) { return "  " + d[0] + ": " + d[1] + ";"; }).join("\n") + "\n}"; }

  // ---------- UI ----------
  var st = Object.assign({}, DEFAULT, S3.store("glass.state") || {});
  var glass = $("#glass"), stage = $("#stage"), ownUrl = null;

  function render() {
    glass.removeAttribute("style");
    decls(st).forEach(function (d) { glass.style.setProperty(d[0], d[1]); });
    if (!st.border) glass.style.border = "1px solid transparent";
    var alpha = (100 - st.transparency) / 100;
    glass.classList.toggle("ink-dark", lum(st.tint) > 0.5 && alpha > 0.5);
    $("#css").textContent = cssText(st);
    $$("#ctl input[type=range]").forEach(function (r) { r.value = st[r.dataset.k]; });
    $$("#ctl .v").forEach(function (v) { var k = v.dataset.v; v.textContent = st[k] + (k === "blur" || k === "radius" ? "px" : "%"); });
    $("#tint").value = st.tint; $("#shadow").checked = st.shadow;
    $$(".preset").forEach(function (b) { var p = PRESETS[+b.dataset.i][1]; b.setAttribute("aria-pressed", String(Object.keys(p).every(function (k) { return p[k] === st[k]; }))); });
    S3.store("glass.state", st);
  }

  $("#ctl").addEventListener("input", function (e) {
    var k = e.target.dataset.k;
    if (k) st[k] = +e.target.value;
    else if (e.target.id === "tint") st.tint = e.target.value;
    else if (e.target.id === "shadow") st.shadow = e.target.checked;
    render();
  });
  PRESETS.forEach(function (p, i) {
    $("#presets").appendChild(h("button", { "class": "preset", "data-i": i }, [h("span", { "class": "pv", style: "background:" + rgba(p[1].tint, (100 - p[1].transparency) / 100 + 0.25) }), h("span", { text: p[0] })]));
  });
  $("#presets").addEventListener("click", function (e) { var b = e.target.closest(".preset"); if (!b) return; st = Object.assign({}, PRESETS[+b.dataset.i][1]); render(); S3.done(); });
  $$("#bg button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#bg button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      stage.dataset.bg = b.dataset.v; stage.style.backgroundImage = "";
    });
  });
  $("#own-bg input").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    if (ownUrl) URL.revokeObjectURL(ownUrl);
    ownUrl = URL.createObjectURL(f); e.target.value = "";
    stage.dataset.bg = "image"; stage.style.backgroundImage = "url(\"" + ownUrl + "\")";
    $$("#bg button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
  });
  $("#pause").addEventListener("click", function () {
    var paused = stage.classList.toggle("paused");
    this.setAttribute("aria-pressed", String(paused));
    this.querySelector("span").textContent = paused ? "Play" : "Pause";
    this.querySelector("use").setAttribute("href", paused ? "#i-play" : "#i-pause");
  });
  $("#copy").addEventListener("click", function () { S3.copy(cssText(st), "CSS copied"); S3.done(); });

  render();

  window.S3_DEMO = function () { st = Object.assign({}, DEFAULT); render(); stage.classList.add("paused"); };

  window.S3_SELFTEST = function () {
    var s = { blur: 10, transparency: 80, saturation: 150, border: 25, radius: 12, tint: "#3dd6d0", shadow: false };
    var expect = ".glass {\n  background: rgba(61, 214, 208, 0.2);\n  backdrop-filter: blur(10px) saturate(150%);\n  -webkit-backdrop-filter: blur(10px) saturate(150%);\n" +
      "  border: 1px solid rgba(255, 255, 255, 0.25);\n  border-radius: 12px;\n}";
    var noSat = decls({ blur: 4, transparency: 100, saturation: 100, border: 0, radius: 0, tint: "#000000", shadow: true });
    // the browser must actually accept what we generate
    var probe = document.createElement("div");
    decls(s).forEach(function (d) { probe.style.setProperty(d[0], d[1]); });
    return cssText(s) === expect && noSat[0][1] === "rgba(0, 0, 0, 0)" && noSat[1][1] === "blur(4px)" &&
      !noSat.some(function (d) { return d[0] === "border"; }) && noSat[noSat.length - 1][0] === "box-shadow" &&
      rgba("#ffffff", 0.333) === "rgba(255, 255, 255, 0.33)" && Math.abs(lum("#ffffff") - 1) < 1e-9 && lum("#000000") === 0 &&
      /blur\(10px\)/.test(probe.style.backdropFilter || probe.style.webkitBackdropFilter) && probe.style.borderRadius === "12px";
  };
})();
