let pdfDoc = null;
let pageNum = 1;
let totalPages = 0;
let scale = 1.0;

const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const wrapper = document.getElementById("canvasWrapper");

const pageInfo = document.getElementById("page-info");
const pageInput = document.getElementById("page-input");

document.getElementById("upload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file || file.type !== "application/pdf") {
    alert("Выберите PDF-файл.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const typedarray = new Uint8Array(this.result);
    pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
      pdfDoc = pdf;
      totalPages = pdf.numPages;
      pageNum = 1;
      scale = 1.0;
      renderPage(pageNum);
    });
  };
  reader.readAsArrayBuffer(file);
});

function renderPage(num) {
  pdfDoc.getPage(num).then(function (page) {
    const container = document.getElementById('viewer');
    const containerWidth = container.clientWidth;

    const viewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    page.render({
      canvasContext: ctx,
      viewport: scaledViewport
    });

    updatePageInfo();
  });
}

function animatePage(direction, pageNumberToLoad) {
  const distance = direction === 'left' ? '-100%' : '100%';

  wrapper.style.transition = 'none';
  wrapper.style.transform = `translateX(${direction === 'left' ? '100%' : '-100%'})`;

  pdfDoc.getPage(pageNumberToLoad).then(function (page) {
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    page.render({
      canvasContext: ctx,
      viewport
    }).promise.then(() => {
      wrapper.style.transition = 'transform 0.4s ease-in-out';
      requestAnimationFrame(() => {
        wrapper.style.transform = 'translateX(0)';
      });

      pageNum = pageNumberToLoad;
      updatePageInfo();
    });
  });
}

function nextPage() {
  if (!pdfDoc || pageNum >= totalPages) return;
  animatePage('left', pageNum + 1);
}

function prevPage() {
  if (!pdfDoc || pageNum <= 1) return;
  animatePage('right', pageNum - 1);
}

function goToPage() {
  const page = parseInt(pageInput.value);
  if (page >= 1 && page <= totalPages) {
    animatePage(page > pageNum ? 'left' : 'right', page);
  } else {
    alert(`Введите число от 1 до ${totalPages}`);
  }
}

function updatePageInfo() {
  pageInfo.textContent = `Страница ${pageNum} из ${totalPages}`;
  pageInput.value = pageNum;
}

pageInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    goToPage();
  }
});
