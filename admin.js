const STORE_KEY = "store_v1";
const $ = (s)=>document.querySelector(s);

let state = loadState();

function loadState(){
  const raw = localStorage.getItem(STORE_KEY);
  if(!raw) return structuredClone(window.SEED);
  return JSON.parse(raw);
}
function saveState(s){
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

function applyTheme(theme){
  const r = document.documentElement;
  r.style.setProperty("--primary", theme.primary);
  r.style.setProperty("--accent", theme.accent);
  r.style.setProperty("--bg", theme.bg);
  r.style.setProperty("--panel", theme.panel);
  r.style.setProperty("--text", theme.text);
  r.style.setProperty("--muted", theme.muted);
}

function buildAdmin(){
  if($("#adminModal")) return;

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.id = "adminOverlay";

  const modal = document.createElement("div");
  modal.className = "checkout-modal";
  modal.id = "adminModal";
  modal.innerHTML = `
    <div class="checkout-step-head">
      <div>
        <h2 style="margin:0;">لوحة تحكم المتجر (Demo)</h2>
        <div style="color:var(--muted);font-weight:900;margin-top:6px;">تعديل الألوان + البنرات + الأصناف + المنتجات</div>
      </div>
      <button class="btn" type="button" id="adminClose">إغلاق</button>
    </div>

    <div class="hr"></div>

    <div class="form-grid">
      <div class="field" style="grid-column:1/-1;">
        <label>كلمة المرور (Demo)</label>
        <input id="adminPass" type="password" placeholder="admin"/>
      </div>
    </div>

    <div class="step-btn-row">
      <button class="btn primary" type="button" id="adminUnlock">فتح</button>
    </div>

    <div id="adminUnlocked" style="display:none; margin-top:14px;">
      <div class="hr"></div>

      <h3 style="margin:0 0 10px;">1) الألوان</h3>
      <div class="form-grid">
        ${themeField("primary","primary")}
        ${themeField("accent","accent")}
        ${themeField("bg","bg")}
        ${themeField("panel","panel")}
        ${themeField("text","text")}
        ${themeField("muted","muted")}
      </div>
      <div class="step-btn-row" style="margin-top:10px;">
        <button class="btn primary" type="button" id="saveTheme">حفظ الألوان</button>
      </div>

      <div class="hr"></div>

      <h3 style="margin:0 0 10px;">2) البنرات</h3>
      <div id="sliderEditor"></div>
      <div class="step-btn-row" style="margin-top:10px;">
        <button class="btn primary" type="button" id="saveSliders">حفظ البنرات</button>
      </div>

      <div class="hr"></div>

      <h3 style="margin:0 0 10px;">3) الأصناف</h3>
      <div id="categoryEditor"></div>
      <div class="step-btn-row" style="margin-top:10px;">
        <button class="btn primary" type="button" id="saveCats">حفظ الأصناف</button>
      </div>

      <div class="hr"></div>

      <h3 style="margin:0 0 10px;">4) المنتجات (كل وسم/سعر قبل/جديد اختياري)</h3>
      <div id="productEditor"></div>
      <div class="step-btn-row" style="margin-top:10px;">
        <button class="btn primary" type="button" id="saveProducts">حفظ المنتجات</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  overlay.addEventListener("click", ()=> closeAdmin());
  modal.querySelector("#adminClose").addEventListener("click", ()=> closeAdmin());

  modal.querySelector("#adminUnlock").addEventListener("click", ()=>{
    const pass = (modal.querySelector("#adminPass").value || "").trim();
    if(pass !== "admin"){ alert("كلمة المرور غير صحيحة"); return; }
    modal.querySelector("#adminUnlocked").style.display = "block";
    renderEditors(modal);
  });

  function themeField(key,label){
    return `
      <div class="field">
        <label>${label}</label>
        <input data-theme="${key}" value="${state.theme[key] || ""}"/>
      </div>
    `;
  }

  function closeAdmin(){
    overlay.remove();
    modal.remove();
  }

  function renderEditors(root){
    // sliders
    root.querySelector("#sliderEditor").innerHTML = state.sliders.map(s=>`
      <div class="category-block" style="padding:12px; margin-bottom:12px;">
        <b>${s.id}</b>
        <div class="form-grid">
          <div class="field"><label>title</label><input data-s-title="${s.id}" value="${escapeHtml(s.title||"")}"/></div>
          <div class="field"><label>subtitle</label><input data-s-sub="${s.id}" value="${escapeHtml(s.subtitle||"")}"/></div>
          <div class="field" style="grid-column:1/-1;"><label>image URL</label><input data-s-img="${s.id}" value="${escapeHtml(s.image||"")}"/></div>
          <div class="field"><label>cta</label><input data-s-cta="${s.id}" value="${escapeHtml(s.cta||"")}"/></div>
          <div class="field"><label>link</label><input data-s-link="${s.id}" value="${escapeHtml(s.link||"")}"/></div>
        </div>
      </div>
    `).join("");

    // categories
    root.querySelector("#categoryEditor").innerHTML = state.categories.map(c=>`
      <div class="category-block" style="padding:12px; margin-bottom:12px;">
        <b>${c.id}</b>
        <div class="form-grid">
          <div class="field"><label>name</label><input data-c-name="${c.id}" value="${escapeHtml(c.name||"")}"/></div>
          <div class="field" style="grid-column:1/-1;"><label>image URL</label><input data-c-img="${c.id}" value="${escapeHtml(c.image||"")}"/></div>
        </div>
      </div>
    `).join("");

    // products
    root.querySelector("#productEditor").innerHTML = state.products.map(p=>`
      <div class="category-block" style="padding:12px; margin-bottom:12px;">
        <b>${p.id}</b>
        <div class="form-grid">
          <div class="field"><label>name</label><input data-p-name="${p.id}" value="${escapeHtml(p.name||"")}"/></div>
          <div class="field">
            <label>categoryId</label>
            <select data-p-cat="${p.id}">
              ${state.categories.map(c=>`<option value="${c.id}" ${c.id===p.categoryId?"selected":""}>${c.name}</option>`).join("")}
            </select>
          </div>
          <div class="field" style="grid-column:1/-1;"><label>image URL</label><input data-p-img="${p.id}" value="${escapeHtml(p.image||"")}"/></div>

          <div class="field"><label>priceAfter (رقم)</label><input type="number" step="0.01" data-p-after="${p.id}" value="${p.priceAfter ?? 0}"/></div>
          <div class="field"><label>priceBefore (اختياري)</label><input type="number" step="0.01" data-p-before="${p.id}" value="${p.priceBefore ?? ""}"/></div>

          <div class="field"><label>badge (اختياري)</label><input data-p-badge="${p.id}" value="${escapeHtml(p.badge ?? "")}" placeholder="مثال: عرض/خصم/مميز"/></div>
          <div class="field">
            <label>isNew (اختياري)</label>
            <select data-p-new="${p.id}">
              <option value="false" ${p.isNew?"" :"selected"}>false</option>
              <option value="true" ${p.isNew? "selected":""}>true</option>
            </select>
          </div>
        </div>
      </div>
    `).join("");

    // save theme
    root.querySelector("#saveTheme").addEventListener("click", ()=>{
      ["primary","accent","bg","panel","text","muted"].forEach(k=>{
        state.theme[k] = root.querySelector(`[data-theme="${k}"]`).value;
      });
      saveState(state);
      applyTheme(state.theme);
      alert("تم حفظ الألوان");
      location.reload();
    });

    root.querySelector("#saveSliders").addEventListener("click", ()=>{
      state.sliders = state.sliders.map(s=>{
        return {
          ...s,
          title: root.querySelector(`[data-s-title="${s.id}"]`).value,
          subtitle: root.querySelector(`[data-s-sub="${s.id}"]`).value,
          image: root.querySelector(`[data-s-img="${s.id}"]`).value,
          cta: root.querySelector(`[data-s-cta="${s.id}"]`).value,
          link: root.querySelector(`[data-s-link="${s.id}"]`).value,
        };
      });
      saveState(state);
      alert("تم حفظ البنرات");
      location.reload();
    });

    root.querySelector("#saveCats").addEventListener("click", ()=>{
      state.categories = state.categories.map(c=>{
        return {
          ...c,
          name: root.querySelector(`[data-c-name="${c.id}"]`).value,
          image: root.querySelector(`[data-c-img="${c.id}"]`).value,
        };
      });
      saveState(state);
      alert("تم حفظ الأصناف");
      location.reload();
    });

    root.querySelector("#saveProducts").addEventListener("click", ()=>{
      state.products = state.products.map(p=>{
        const beforeRaw = root.querySelector(`[data-p-before="${p.id}"]`).value;
        return {
          ...p,
          name: root.querySelector(`[data-p-name="${p.id}"]`).value,
          categoryId: root.querySelector(`[data-p-cat="${p.id}"]`).value,
          image: root.querySelector(`[data-p-img="${p.id}"]`).value,
          priceAfter: Number(root.querySelector(`[data-p-after="${p.id}"]`).value),
          priceBefore: beforeRaw === "" ? null : Number(beforeRaw),
          badge: (()=>{ const v = root.querySelector(`[data-p-badge="${p.id}"]`).value.trim(); return v ? v : null; })(),
          isNew: root.querySelector(`[data-p-new="${p.id}"]`).value === "true"
        };
      });
      saveState(state);
      alert("تم حفظ المنتجات");
      location.reload();
    });
  }
}

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

document.addEventListener("DOMContentLoaded", ()=>{
  // فتح لوحة التحكم
  $("#openAdmin")?.addEventListener("click", ()=>{
    state = loadState();
    buildAdmin();
  });
});
