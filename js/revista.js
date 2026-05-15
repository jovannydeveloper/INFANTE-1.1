const bookEl = document.getElementById("book");

function getBookSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight - 130; // navbar + controles
  // Proporción A5 landscape: 1.41
  let h = Math.min(vh * 0.82, 700);
  let w = Math.round(h / 1.41);
  // En móvil usamos portrait (una sola página)
  if (vw < 700) {
    w = Math.min(vw - 32, 380);
    h = Math.round(w * 1.41);
  }
  return { w, h };
}
const { w, h } = getBookSize();

const pageFlip = new St.PageFlip(bookEl, {
  width: w,
  height: h,
  size: "fixed",
  showCover: true,
  drawShadow: true,
  flippingTime: 800,
  usePortrait: true,
  mobileScrollSupport: false,
  maxShadowOpacity: 0.4,
  startZIndex: 10,
});

pageFlip.loadFromHTML(document.querySelectorAll("#book .page"));

// ── Contador de páginas ──
const counter = document.getElementById("page-counter");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

function updateControls() {
  const current = pageFlip.getCurrentPageIndex() + 1;
  const total = pageFlip.getPageCount();
  counter.textContent = current + " / " + total;
  btnPrev.disabled = current <= 1;
  btnNext.disabled = current >= total;
}

pageFlip.on("flip", updateControls);
pageFlip.on("changeState", updateControls);

btnNext.addEventListener("click", () => pageFlip.flipNext());
btnPrev.addEventListener("click", () => pageFlip.flipPrev());

// ── Función para saltar a página desde el índice ──
function flipTo(pageNum) {
  pageFlip.flip(pageNum);
}

// Inicializar contador
setTimeout(updateControls, 300);
