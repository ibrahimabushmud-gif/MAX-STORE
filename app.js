const STORE_KEY = "store_v1";
const CART_KEY = "cart_v1";

const $ = (s) => document.querySelector(s);

function loadState(){
  const raw = localStorage.getItem(STORE_KEY);
  if(!raw) return structuredClone(window.SEED);
  return JSON.parse(raw);
}
function saveState(state){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

let state = loadState();

function applyTheme(theme){
  const r = document.documentElement;
  r.style.setProperty("--primary", theme.primary);
  r.style.setProperty("--accent", theme.accent);
  r.style.setProperty("--bg", theme.bg);
  r.style.setProperty("--panel", theme.panel);
  r.style.setProperty("--text", theme.text);
  r.style.setProperty("--muted", theme.muted);
}

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}
function setCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function cartCount(){
  return Object.values(getCart()).reduce((s, qty)=>s+qty, 0);
}
function cartTotal(){
  const cart = getCart();
  let total = 0;
  for(const [pid, qty] of Object.entries(cart)){
    const p = state.products.find(x=>x.id===pid);
    if(!p) continue;
    total += (Number(p.priceAfter) * qty);
  }
  return total;
}

function money(n){
  return `${Number(n).toFixed(2)} $`;
}

/* ===== UI: Slider ===== */
function renderSlider(){
  const wrap = $("#sliderWrap");
  if(!state.sliders?.length) { wrap.innerHTML = ""; return; }

  let i = 0;

  function paint(){
    const s = state.sliders[i];
    wrap.innerHTML = `
      <div class="slider">
        <div class="slide">
          <img src="${s.image}" alt="${s.title}">
          <div class="overlay"></div>
        </div>

        <div class="slide-caption">
          <h1>${s.title}</h1>
          <p>${s.subtitle}</p>
          <div class="slide-actions">
            <a class="btn primary" href="${s.link}">${s.cta}</a>
            <button class="btn" type="button" id="jumpCats">استكشف الأصناف</button>
          </div>

          <div class="hr"></div>
          <div class="kpi-row" style="border-right:none; padding:0;">
            <div class="kpi">
              <div class="ico">⚡</div>
              <div><b>شحن سريع</b><div style="color:var(--muted);font-weight:900;">Demo</div></div>
            </div>
            <div class="kpi">
              <div class="ico">🔒</div>
              <div><b>دفع آمن</b><div style="color:var(--muted);font-weight:900;">واجهة فقط</div></div>
            </div>
            <div class="kpi">
              <div class="ico">↩️</div>
              <div><b>إرجاع سهل</b><div style="color:var(--muted);font-weight:900;">Demo</div></div>
            </div>
          </div>
        </div>
      </div>
    `;
    $("#jumpCats")?.addEventListener("click", ()=>{
      document.querySelector("#categoriesSection")?.scrollIntoView({behavior:"smooth"});
    });
  }

  paint();
  setInterval(()=>{ i=(i+1)%state.sliders.length; paint(); }, 4200);
}

/* ===== Products Rendering ===== */
function productMatchesSearch(p){
  const q = ($("#searchInput")?.value || "").trim().toLowerCase();
  if(!q) return true;
  return (p.name || "").toLowerCase().includes(q);
}

function sortProducts(list){
  const sort = $("#sortSelect")?.value || "featured";
  const arr = [...list];

  if(sort === "price-asc") arr.sort((a,b)=>a.priceAfter-b.priceAfter);
  if(sort === "price-desc") arr.sort((a,b)=>b.priceAfter-a.priceAfter);
  if(sort === "new") arr.sort((a,b)=>(b.isNew?1:0)-(a.isNew?1:0));
  // featured demo: استخدم isNew كبساطة
  if(sort === "featured") arr.sort((a,b)=>(b.isNew?1:0)-(a.isNew?1:0));

  return arr;
}

function renderCategories(){
  const host = $("#categories");
  const q = ($("#searchInput")?.value || "").trim().toLowerCase();
  host.innerHTML = "";

  for(const cat of state.categories){
    const list = state.products
      .filter(p => p.categoryId === cat.id)
      .filter(p => productMatchesSearch(p));

    const sorted = sortProducts(list);

    const block = document.createElement("div");
    block.className = "category-block";

    const cardsHtml = sorted.map(p=>{
      const tagParts = [];
      if(p.isNew) tagParts.push(`<div class="tag new">جديد</div>`);
      else if(p.badge) tagParts.push(`<div class="tag">${escapeHtml(p.badge)}</div>`);

      const beforeHtml = (p.priceBefore !== null && p.priceBefore !== undefined)
        ? `<span class="before">${money(p.priceBefore)}</span>`
        : "";

      return `
        <article class="card">
          <div class="card-img">
            ${tagParts.join("")}
            <img src="${p.image}" alt="${escapeHtml(p.name)}">
          </div>
          <div class="card-body">
            <h3>${escapeHtml(p.name)}</h3>

            <div class="meta">
              <div class="price">
                <strong>${money(p.priceAfter)}</strong>
                ${beforeHtml}
              </div>
              <div style="color:var(--muted);font-weight:900;font-size:.9rem;">${cat.name}</div>
            </div>

            <div class="card-actions">
              <button class="icon-add primary" type="button" data-add="${p.id}" title="إضافة للسلة">
                🛒
              </button>
              <button class="btn small" type="button" data-details="${p.id}">تفاصيل</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    block.innerHTML = `
      <div class="cat-top">
        <div class="cat-left">
          <div class="cat-img"><img src="${cat.image}" alt="${escapeHtml(cat.name)}"></div>
          <div class="cat-title">
            <b>${escapeHtml(cat.name)}</b>
            <span>${sorted.length} منتج</span>
          </div>
        </div>
      </div>

      <div class="hscroll" dir="rtl">
        ${cardsHtml || `<div style="color:var(--muted);font-weight:1000;padding:10px;">لا توجد نتائج</div>`}
      </div>
    `;

    host.appendChild(block);
  }
}

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

/* ===== Cart UI ===== */
function renderCart(){
  const itemsHost = $("#cartItems");
  const cart = getCart();
  itemsHost.innerHTML = "";

  const ids = Object.keys(cart);
  $("#cartCount").textContent = String(cartCount());

  if(ids.length === 0){
    itemsHost.innerHTML = `
      <div style="color:var(--muted);font-weight:1000;padding:10px;text-align:center;">
        السلة فارغة
      </div>
    `;
    $("#cartTotal").textContent = money(0);
    return;
  }

  for(const pid of ids){
    const p = state.products.find(x=>x.id===pid);
    if(!p) continue;

    const qty = cart[pid];
    itemsHost.insertAdjacentHTML("beforeend", `
      <div class="cart-item">
        <img src="${p.image}" alt="${escapeHtml(p.name)}">
        <div class="info">
          <p class="name">${escapeHtml(p.name)}</p>
          <div class="sub">
            <span>${money(p.priceAfter)}</span>
            <span>${qty} ×</span>
          </div>
          <div class="qty-controls">
            <button type="button" data-qty="${pid}" data-delta="-1">-</button>
            <span>${qty}</span>
            <button type="button" data-qty="${pid}" data-delta="1">+</button>
          </div>
        </div>
        <button class="remove-btn" type="button" data-remove="${pid}">حذف</button>
      </div>
    `);
  }

  $("#cartTotal").textContent = money(cartTotal());
}

function openCart(){
  $("#cartOverlay").classList.remove("hidden");
  $("#cartDrawer").classList.remove("hidden");
  $("#cartDrawer").setAttribute("aria-hidden","false");
  renderCart();
}
function closeCart(){
  $("#cartOverlay").classList.add("hidden");
  $("#cartDrawer").classList.add("hidden");
  $("#cartDrawer").setAttribute("aria-hidden","true");
}

function changeQty(pid, delta){
  const cart = getCart();
  if(!cart[pid]) return;
  cart[pid] += delta;
  if(cart[pid] <= 0) delete cart[pid];
  setCart(cart);
  renderCart();
}

/* ===== Checkout Wizard ===== */
let checkoutState = {
  step: 1,
  method: "full",   // full | installment
  firstPayment: 0,
  months: 12,
  schedule: [],
  cardForm: {},
  customer: {},
};

function openCheckout(){
  const total = cartTotal();
  if(total <= 0) return alert("السلة فارغة");

  checkoutState = { step: 1, method:"full", firstPayment:0, months:12, schedule:[], cardForm:{}, customer:{} };

  $("#checkoutOverlay").classList.remove("hidden");
  $("#checkoutModal").classList.remove("hidden");
  renderCheckoutStep();
}

function closeCheckout(){
  $("#checkoutOverlay").classList.add("hidden");
  $("#checkoutModal").classList.add("hidden");
}

function buildSchedule(total, first, months){
  // جدول شهري: تاريخ = اليوم + (i شهر)
  const now = new Date();
  const remaining = total - first;
  const each = months > 0 ? remaining / months : remaining;

  // نضبط آخر دفعة لتعويض فروقات التقريب
  const sched = [];
  for(let i=1;i<=months;i++){
    const d = new Date(now);
    d.setMonth(d.getMonth() + i);

    const amount = (i === months) ? (remaining - each*(months-1)) : each;

    sched.push({
      date: d.toLocaleDateString("ar", { year:"numeric", month:"long", day:"numeric" }),
      amount: Math.max(0, amount)
    });
  }
  return sched;
}

function renderCheckoutStep(){
  const total = cartTotal();
  const stepsTitle = {
    1: "تأكيد السلة",
    2: "بيانات العميل",
    3: "طريقة الدفع",
    4: "الدفع الأول + مدة التقسيط",
    5: "جدول الدفعات",
    6: "بيانات البطاقة",
    7: "تم (Demo)"
  };

  $("#checkoutModal").innerHTML = `
    <div class="checkout-step-head">
      <div>
        <h2 style="margin:0;">${stepsTitle[checkoutState.step] || ""}</h2>
        <div style="color:var(--muted);font-weight:900;margin-top:6px;">
          الخطوة ${checkoutState.step} / 6
        </div>
      </div>
      <button class="btn" type="button" id="checkoutClose">إغلاق</button>
    </div>
    <div class="hr"></div>

    ${checkoutStepHtml(total)}
  `;

  $("#checkoutClose")?.addEventListener("click", closeCheckout);
}

function checkoutStepHtml(total){
  switch(checkoutState.step){
    case 1: return `
      <div style="color:var(--muted);font-weight:1000;margin-bottom:10px;">
        سيتم خصم المبلغ من خلال طريقة الدفع التي تختارها لاحقاً.
      </div>

      <div class="table">
        <table>
          <thead>
            <tr>
              <th>العنصر</th>
              <th>الكمية</th>
              <th>السعر</th>
            </tr>
          </thead>
          <tbody>
            ${renderCartTableRows()}
          </tbody>
        </table>
      </div>

      <div class="hr"></div>

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <b style="font-size:1.1rem;">المجموع: ${money(total)}</b>
        <div style="color:var(--muted);font-weight:1000;">(Demo)</div>
      </div>

      <div class="step-btn-row">
        <button class="btn primary" type="button" id="next1">التالي</button>
      </div>
    `;
    case 2: return `
      <div class="form-grid">
        <div class="field">
          <label>الاسم</label>
          <input id="c_name" value="${escapeHtml(checkoutState.customer.name || "")}" placeholder="الاسم الكامل"/>
        </div>
        <div class="field">
          <label>الهوية</label>
          <input id="c_id" value="${escapeHtml(checkoutState.customer.idNumber || "")}" placeholder="رقم الهوية"/>
        </div>
        <div class="field">
          <label>رقم الواتس اب</label>
          <input id="c_whatsapp" value="${escapeHtml(checkoutState.customer.whatsapp || "")}" placeholder="05xxxxxxxx"/>
        </div>
        <div class="field">
          <label>المنطقة</label>
          <input id="c_region" value="${escapeHtml(checkoutState.customer.region || "")}" placeholder="مثال: الرياض"/>
        </div>
        <div class="field" style="grid-column:1/-1;">
          <label>الشارع</label>
          <input id="c_street" value="${escapeHtml(checkoutState.customer.street || "")}" placeholder="اسم الشارع / الحي"/>
        </div>
      </div>

      <div class="step-btn-row">
        <button class="btn" type="button" id="back2">رجوع</button>
        <button class="btn primary" type="button" id="next2">التالي</button>
      </div>
    `;
    case 3: return `
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <button class="btn ${checkoutState.method==='full'?'primary':''}" type="button" id="m_full" style="min-width:220px;">
          💳 دفع كامل
        </button>
        <button class="btn ${checkoutState.method==='installment'?'primary':''}" type="button" id="m_inst" style="min-width:220px;">
          🧾 تقسيط (Demo)
        </button>
      </div>

      <div class="hr"></div>
      <div style="color:var(--muted);font-weight:1000;">
        في التقسيط: تختار الدفعة الأولى + عدد الأشهر (حتى 24) ثم يظهر جدول الدفعات.
      </div>

      <div class="step-btn-row">
        <button class="btn" type="button" id="back3">رجوع</button>
        <button class="btn primary" type="button" id="next3">
          ${checkoutState.method==='full' ? "ادخل بيانات البطاقة" : "التالي"}
        </button>
      </div>
    `;
    case 4: return `
      ${checkoutState.method !== "installment" ? `
        <div style="color:var(--muted);font-weight:1000;">الدفع كامل—لن تحتاج دفعة أولى.</div>
      ` : `
        <div style="color:var(--muted);font-weight:1000;margin-bottom:10px;">
          المجموع: <b style="color:var(--text)">${money(total)}</b>
        </div>

        <div class="field">
          <label>اختر الدفعة الأولى</label>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            ${renderFirstPaymentOptions(total)}
          </div>
        </div>

        <div class="field" style="margin-top:10px;">
          <label>اختر عدد الأشهر (1 - 24)</label>
          <select id="monthsSelect">
            ${[3,6,12,24].map(m=>{
              const sel = checkoutState.months===m ? "selected" : "";
              return `<option value="${m}" ${sel}>${m} شهر</option>`;
            }).join("")}
            ${[1,2,4,5,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23].map(m=>{
              // نخليها مختصرة بشكل UI (اختياري). لن تظهر دائماً حسب الطلب.
              return `<option value="${m}">${m} شهر</option>`;
            }).join("")}
          </select>
        </div>

        <div style="color:var(--muted);font-weight:1000;margin-top:8px;">
          الباقي بعد الدفعة الأولى سيتم تقسيمه بالتساوي (آخر دفعة تعويض فروقات التقريب).
        </div>
      `}

      <div class="step-btn-row">
        <button class="btn" type="button" id="back4">رجوع</button>
        <button class="btn primary" type="button" id="next4">
          ${checkoutState.method==='full' ? "التالي" : "عرض جدول الدفعات"}
        </button>
      </div>
    `;
    case 5: return `
      ${checkoutState.method !== "installment" ? `
        <div style="color:var(--muted);font-weight:1000;">للدفع كامل: سيتم دفع المبلغ بالكامل.</div>
      ` : `
        <div style="color:var(--muted);font-weight:1000;margin-bottom:10px;">
          الدفعة الأولى: <b style="color:var(--text)">${money(checkoutState.firstPayment)}</b>
          — عدد الأشهر: <b style="color:var(--text)">${checkoutState.months}</b>
        </div>

        <div class="table">
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${checkoutState.schedule.map(row=>`
                <tr>
                  <td>${row.date}</td>
                  <td>${money(row.amount)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="hr"></div>

        <div style="color:var(--muted);font-weight:1000;">
          سيتم دفع الدفعة الأولى الآن: <b style="color:var(--text)">${money(checkoutState.firstPayment)}</b>
          والباقي حسب الجدول.
        </div>
      `}

      <div class="step-btn-row">
        <button class="btn" type="button" id="back5">رجوع</button>
        <button class="btn primary" type="button" id="next5">التالي (البطاقة)</button>
      </div>
    `;
    case 6: return `
      <div class="form-grid">
        <div class="field" style="grid-column:1/-1;">
          <label>رقم البطاقة</label>
          <input id="card_number" placeholder="1234 5678 9012 3456"/>
        </div>
        <div class="field">
          <label>تاريخ الانتهاء (MM/YY)</label>
          <input id="card_exp" placeholder="12/28"/>
        </div>
        <div class="field">
          <label>CVV</label>
          <input id="card_cvv" placeholder="123"/>
        </div>
        <div class="field" style="grid-column:1/-1;">
          <label>اسم حامل البطاقة</label>
          <input id="card_name" placeholder="الاسم على البطاقة"/>
        </div>
      </div>

      <div class="hr"></div>

      <div style="color:var(--muted);font-weight:1000;">
        ${checkoutState.method === "full"
          ? `سيتم دفع المبلغ بالكامل: ${money(total)}`
          : `سيتم دفع الدفعة الأولى: ${money(checkoutState.firstPayment)} الآن (Demo)`}
      </div>

      <div class="step-btn-row">
        <button class="btn" type="button" id="back6">رجوع</button>
        <button class="btn primary" type="button" id="confirmPay">
          تأكيد الدفع (Demo)
        </button>
      </div>
    `;
    case 7: return `
      <div style="text-align:center;">
        <div style="font-size:52px;">✅</div>
        <h2 style="margin:0;">تم!</h2>
        <p style="color:var(--muted);font-weight:1000;">
          هذه عملية تجريبية فقط. تم مسح السلة.
        </p>
        <div style="margin-top:14px;">
          <button class="btn primary" type="button" id="finish">رجوع للمتجر</button>
        </div>
      </div>
    `;
  }
}

function renderCartTableRows(){
  const cart = getCart();
  const ids = Object.keys(cart);

  if(ids.length===0){
    return `<tr><td colspan="3">السلة فارغة</td></tr>`;
  }

  return ids.map(pid=>{
    const p = state.products.find(x=>x.id===pid);
    const qty = cart[pid] || 0;
    const line = (p.priceAfter * qty);
    return `
      <tr>
        <td>${escapeHtml(p.name)}</td>
        <td>${qty}</td>
        <td>${money(line)}</td>
      </tr>
    `;
  }).join("");
}

function renderFirstPaymentOptions(total){
  // نعرض 1000/1500/2000 فقط إذا كان المجموع يسمح
  const options = [1000,1500,2000].filter(x=>x < total && total >= x);
  const arr = options.length ? options : [Math.floor(total/2)];
  const current = checkoutState.firstPayment || arr[0];

  return arr.map(v=>{
    const active = current === v ? "style='border-color:rgba(124,92,255,.75);background:rgba(124,92,255,.18)'" : "";
    return `<button class="btn" type="button" data-first="${v}" ${active}>${money(v)}</button>`;
  }).join("");
}

/* ===== Router: buttons handling within modal ===== */
function wireCheckoutEvents(){
  const id = (x)=>$("#"+x);

  if(checkoutState.step===1){
    id("next1")?.addEventListener("click", ()=>{
      checkoutState.step = 2;
      renderCheckoutStep();
    });
  }

  if(checkoutState.step===2){
    id("back2")?.addEventListener("click", ()=>{
      checkoutState.step = 1; renderCheckoutStep();
    });
    id("next2")?.addEventListener("click", ()=>{
      checkoutState.customer = {
        name: $("#c_name").value.trim(),
        idNumber: $("#c_id").value.trim(),
        whatsapp: $("#c_whatsapp").value.trim(),
        region: $("#c_region").value.trim(),
        street: $("#c_street").value.trim(),
      };
      checkoutState.step = 3;
      renderCheckoutStep();
    });
  }

  if(checkoutState.step===3){
    id("m_full")?.addEventListener("click", ()=> checkoutState.method="full");
    id("m_inst")?.addEventListener("click", ()=> checkoutState.method="installment");

    id("next3")?.addEventListener("click", ()=>{
      if(checkoutState.method==="full"){
        checkoutState.step = 6;
      }else{
        checkoutState.step = 4;
      }
      renderCheckoutStep();
    });

    id("back3")?.addEventListener("click", ()=>{ checkoutState.step=2; renderCheckoutStep(); });
  }

  if(checkoutState.step===4){
    id("back4")?.addEventListener("click", ()=>{ checkoutState.step=3; renderCheckoutStep(); });

    if(checkoutState.method==="installment"){
      // اختيار الدفعة الأولى
      document.querySelectorAll("#checkoutModal [data-first]").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          checkoutState.firstPayment = Number(btn.dataset.first);
          renderCheckoutStep(); // تحديث UI
        });
      });

      $("#monthsSelect")?.addEventListener("change", (e)=>{
        checkoutState.months = Number(e.target.value);
      });
    }

    id("next4")?.addEventListener("click", ()=>{
      if(checkoutState.method==="full"){
        checkoutState.step = 6;
      }else{
        checkoutState.months = checkoutState.months || 12;
        checkoutState.firstPayment = checkoutState.firstPayment || 1000;
        checkoutState.schedule = buildSchedule(cartTotal(), checkoutState.firstPayment, checkoutState.months);
        checkoutState.step = 5;
      }
      renderCheckoutStep();
    });
  }

  if(checkoutState.step===5){
    id("back5")?.addEventListener("click", ()=>{ checkoutState.step=4; renderCheckoutStep(); });
    id("next5")?.addEventListener("click", ()=>{ checkoutState.step=6; renderCheckoutStep(); });
  }

  if(checkoutState.step===6){
    id("back6")?.addEventListener("click", ()=>{ checkoutState.step = (checkoutState.method==="full"?3:5); renderCheckoutStep(); });

    id("confirmPay")?.addEventListener("click", ()=>{
      // Demo فقط
      localStorage.removeItem(CART_KEY);
      checkoutState.step = 7;
      renderCheckoutStep();
      // إعادة رسم السلة
      renderCart();
      $("#cartCount").textContent = "0";
    });
  }

  if(checkoutState.step===7){
    id("finish")?.addEventListener("click", ()=>{
      closeCheckout();
      renderCart();
      renderCategories();
    });
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  applyTheme(state.theme || SEED.theme);
  renderSlider();
  renderCategories();

  // cart open/close
  $("#openCart")?.addEventListener("click", openCart);
  $("#closeCart")?.addEventListener("click", closeCart);
  $("#cartOverlay")?.addEventListener("click", closeCart);

  // product add/details events (event delegation)
  document.addEventListener("click", (e)=>{
    const addBtn = e.target.closest("[data-add]");
    if(addBtn){
      const pid = addBtn.dataset.add;
      const cart = getCart();
      cart[pid] = (cart[pid] || 0) + 1;
      setCart(cart);
      renderCart();
      return;
    }

    const details = e.target.closest("[data-details]");
    if(details){
      const pid = details.dataset.details;
      const p = state.products.find(x=>x.id===pid);
      const cat = state.categories.find(c=>c.id===p.categoryId);
      alert(
        `${p.name}\n${cat?.name || ""}\n\n`+
        `السعر: ${money(p.priceAfter)}\n`+
        (p.priceBefore ? `قبل: ${money(p.priceBefore)}\n` : "")+
        (p.badge ? `وسم: ${p.badge}\n` : "")+
        (p.isNew ? `جديد ✅\n` : "")
      );
      return;
    }
  });

  // cart inner actions
  $("#cartItems")?.addEventListener("click", (e)=>{
    const minusPlus = e.target.closest("[data-qty]");
    if(minusPlus){
      const pid = minusPlus.dataset.qty;
      const delta = Number(minusPlus.dataset.delta);
      changeQty(pid, delta);
      return;
    }
    const rem = e.target.closest("[data-remove]");
    if(rem){
      const pid = rem.dataset.remove;
      const cart = getCart();
      delete cart[pid];
      setCart(cart);
      renderCart();
    }
  });

  $("#goCheckout")?.addEventListener("click", ()=>{
    openCheckout();
    // لكي تنفذ أحداث الخطوة
    setTimeout(wireCheckoutEvents, 0);
  });

  // search + sort
  $("#searchInput")?.addEventListener("input", renderCategories);
  $("#sortSelect")?.addEventListener("change", renderCategories);

  renderCart();

  // checkout modal overlay close
  $("#checkoutOverlay")?.addEventListener("click", closeCheckout);
});

/* override renderCheckoutStep to wire events after each paint */
const _renderCheckoutStep = renderCheckoutStep;
renderCheckoutStep = function(){
  _renderCheckoutStep();
  wireCheckoutEvents();
};
