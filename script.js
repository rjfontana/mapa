const totalPages = 72;
let currentPage = parseInt(localStorage.getItem('currentPage')) || 1;
const imgLeft = document.getElementById('page-img-left');
const imgRight = document.getElementById('page-img-right');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('page-info');
const pageSearch = document.getElementById('page-search');
const goPageBtn = document.getElementById('go-page');
const startBtn = document.getElementById('start');
const endBtn = document.getElementById('end');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const book = document.getElementById('book');
let isDark = false;
let scale = 1;
let panX = 0, panY = 0;
let isPanning = false, startX = 0, startY = 0;

function clampPage(page) {
  return Math.max(1, Math.min(page, totalPages - (totalPages % 2 === 0 ? 1 : 0)));
}

function updatePage(animate = true) {
  currentPage = clampPage(currentPage);
  const leftPageStr = String(currentPage).padStart(4, '0');
  const rightPageNum = currentPage + 1 <= totalPages ? currentPage + 1 : '';
  const rightPageStr = rightPageNum ? String(rightPageNum).padStart(4, '0') : '';
  imgLeft.src = `pages/livro_page-${leftPageStr}.jpg`;
  imgLeft.alt = `Página ${currentPage}`;
  imgRight.src = rightPageNum ? `pages/livro_page-${rightPageStr}.jpg` : '';
  imgRight.alt = rightPageNum ? `Página ${rightPageNum}` : '';
  pageInfo.textContent = `Página ${currentPage}${rightPageNum ? ' - ' + rightPageNum : ''} / ${totalPages}`;
  pageSearch.value = currentPage;
  localStorage.setItem('currentPage', currentPage);

  // Fade animation
  if (animate) {
    imgLeft.classList.add('fade');
    imgRight.classList.add('fade');
    setTimeout(() => {
      imgLeft.classList.remove('fade');
      imgRight.classList.remove('fade');
    }, 400);
  }
}

prevBtn.onclick = function() {
  if (currentPage > 1) {
    currentPage -= 2;
    if (currentPage < 1) currentPage = 1;
    updatePage();
  }
};

nextBtn.onclick = function() {
  if (currentPage + 1 < totalPages) {
    currentPage += 2;
    updatePage();
  }
};

startBtn.onclick = function() {
  currentPage = 1;
  updatePage();
};

endBtn.onclick = function() {
  currentPage = totalPages % 2 === 0 ? totalPages - 1 : totalPages;
  updatePage();
};

goPageBtn.onclick = function() {
  let page = parseInt(pageSearch.value);
  if (!isNaN(page)) {
    currentPage = page % 2 === 0 ? page - 1 : page;
    updatePage();
  }
};

pageSearch.onkeydown = function(e) {
  if (e.key === 'Enter') goPageBtn.click();
};

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft') prevBtn.click();
  if (e.key === 'ArrowRight') nextBtn.click();
  if (e.key === 'Home') startBtn.click();
  if (e.key === 'End') endBtn.click();
});

// Dark mode
darkModeToggle.onclick = function() {
  isDark = !isDark;
  document.body.classList.toggle('dark', isDark);
  darkModeToggle.textContent = isDark ? '☀️' : '🌙';
};

// Zoom
book.onwheel = function(e) {
  if (e.ctrlKey || e.altKey) {
    e.preventDefault();
    scale += e.deltaY > 0 ? -0.1 : 0.1;
    scale = Math.max(0.5, Math.min(scale, 2));
    book.style.setProperty('--scale', scale);
  }
};

// Pan (drag)
book.onmousedown = function(e) {
  isPanning = true;
  startX = e.clientX - panX;
  startY = e.clientY - panY;
  book.style.cursor = 'grab';
};
document.onmousemove = function(e) {
  if (isPanning) {
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    book.style.setProperty('--pan-x', panX + 'px');
    book.style.setProperty('--pan-y', panY + 'px');
  }
};
document.onmouseup = function() {
  isPanning = false;
  book.style.cursor = 'default';
};

// Touch support for pan
book.ontouchstart = function(e) {
  if (e.touches.length === 1) {
    isPanning = true;
    startX = e.touches[0].clientX - panX;
    startY = e.touches[0].clientY - panY;
  }
};
book.ontouchmove = function(e) {
  if (isPanning && e.touches.length === 1) {
    panX = e.touches[0].clientX - startX;
    panY = e.touches[0].clientY - startY;
    book.style.setProperty('--pan-x', panX + 'px');
    book.style.setProperty('--pan-y', panY + 'px');
  }
};
book.ontouchend = function() {
  isPanning = false;
};

// Reset zoom/pan on double click
book.ondblclick = function() {
  scale = 1;
  panX = 0;
  panY = 0;
  book.style.setProperty('--scale', scale);
  book.style.setProperty('--pan-x', '0px');
  book.style.setProperty('--pan-y', '0px');
};

// Mapa Conceitual - Adicionar e arrastar blocos
const conceptForm = document.getElementById('concept-form');
const conceptInput = document.getElementById('concept-input');
const conceptSize = document.getElementById('concept-size');
const conceptColor = document.getElementById('concept-color');
const conceptFont = document.getElementById('concept-font');
const conceptOutline = document.getElementById('concept-outline');
const conceptMap = document.getElementById('concept-map');
const downloadBtn = document.getElementById('download-map');
const conceptSVG = document.getElementById('concept-svg');
let lineStartBlock = null;

conceptForm.onsubmit = function(e) {
  e.preventDefault();
  const text = conceptInput.value.trim();
  const size = parseInt(conceptSize.value) || 20;
  const color = conceptColor.value;
  const font = conceptFont.value;
  const outline = conceptOutline.checked;
  const imgFile = document.getElementById('concept-img').files[0];

  const block = document.createElement('div');
  block.className = 'concept-block';
  block.style.fontSize = size + 'px';
  block.setAttribute('draggable', 'true');
  block.setAttribute('data-color', color);
  block.style.setProperty('--block-color', color);
  block.style.fontFamily = font;
  block.style.border = outline ? '2px solid #232323' : '1px solid #d8cfc0';
  block.contentEditable = false;
  block.style.left = '20px';
  block.style.top = '20px';

  if (imgFile) {
    const img = document.createElement('img');
    img.className = 'concept-img';
    img.style.width = '48px';
    img.style.height = '48px';
    img.style.objectFit = 'contain';
    img.title = 'Clique para redimensionar';
    img.draggable = false;
    img.onload = function() { URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(imgFile);
    block.appendChild(img);

    // Redimensionar imagem ao clicar
    img.onclick = function(e) {
      e.stopPropagation();
      const newSize = prompt('Novo tamanho (px):', img.width);
      if (newSize) {
        img.style.width = newSize + 'px';
        img.style.height = newSize + 'px';
      }
    };
  }

  if (text) block.appendChild(document.createTextNode(text));
  conceptMap.appendChild(block);
  conceptInput.value = '';
  document.getElementById('concept-img').value = '';
};

// Drag & drop
let dragBlock = null, offsetX = 0, offsetY = 0;
conceptMap.addEventListener('dragstart', function(e) {
  if (e.target.classList.contains('concept-block')) {
    dragBlock = e.target;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  }
});
conceptMap.addEventListener('dragend', function(e) {
  if (dragBlock) {
    const rect = conceptMap.getBoundingClientRect();
    dragBlock.style.position = 'absolute';
    dragBlock.style.left = (e.clientX - rect.left - offsetX) + 'px';
    dragBlock.style.top = (e.clientY - rect.top - offsetY) + 'px';
    dragBlock = null;
  }
});

// Editar texto: duplo clique ativa edição, Enter/desfoca salva
conceptMap.addEventListener('dblclick', function(e) {
  if (e.target.classList.contains('concept-block')) {
    e.target.contentEditable = true;
    e.target.focus();
  }
});
conceptMap.addEventListener('blur', function(e) {
  if (e.target.classList.contains('concept-block')) {
    e.target.contentEditable = false;
  }
}, true);
conceptMap.addEventListener('keydown', function(e) {
  if (e.target.classList.contains('concept-block') && e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  }
});

let selectedBlock = null;

// Selecionar bloco ao clicar
conceptMap.addEventListener('click', function(e) {
  if (e.target.classList.contains('concept-block')) {
    if (selectedBlock) selectedBlock.classList.remove('selected-block');
    selectedBlock = e.target;
    selectedBlock.classList.add('selected-block');
  } else {
    if (selectedBlock) selectedBlock.classList.remove('selected-block');
    selectedBlock = null;
  }
});

// Excluir bloco com Delete ou Backspace
document.addEventListener('keydown', function(e) {
  if (selectedBlock && (e.key === 'Delete' || e.key === 'Backspace')) {
    selectedBlock.remove();
    selectedBlock = null;
  }
});

// Adicionar opção de excluir no menu de contexto
conceptMap.addEventListener('contextmenu', function(e) {
  if (e.target.classList.contains('concept-block')) {
    e.preventDefault();
    if (confirm('Excluir este bloco?')) {
      e.target.remove();
      if (selectedBlock === e.target) selectedBlock = null;
      return;
    }
    const newColor = prompt('Cor (hex):', e.target.getAttribute('data-color'));
    if (newColor) {
      e.target.setAttribute('data-color', newColor);
      e.target.style.setProperty('--block-color', newColor);
    }
    const newFont = prompt('Fonte (ex: Arial, Georgia):', e.target.style.fontFamily);
    if (newFont) e.target.style.fontFamily = newFont;
    const newSize = prompt('Tamanho da fonte (px):', parseInt(e.target.style.fontSize) || 20);
    if (newSize) e.target.style.fontSize = parseInt(newSize) + 'px';
    const outline = confirm('Adicionar contorno preto?');
    e.target.style.border = outline ? '2px solid #232323' : '1px solid #d8cfc0';
  }
});

// Baixar mapa como imagem
downloadBtn.onclick = function() {
  html2canvas(conceptMap).then(function(canvas) {
    const link = document.createElement('a');
    link.download = 'mapa_conceitual.png';
    link.href = canvas.toDataURL();
    link.click();
  });
};

// Iniciar ligação ao clicar com Shift
conceptMap.addEventListener('mousedown', function(e) {
  if (e.target.classList.contains('concept-block') && e.shiftKey) {
    lineStartBlock = e.target;
    conceptMap.style.cursor = 'crosshair';
  }
});

// Finalizar ligação ao soltar em outro bloco
conceptMap.addEventListener('mouseup', function(e) {
  if (lineStartBlock && e.target.classList.contains('concept-block') && e.target !== lineStartBlock) {
    drawLineBetweenBlocks(lineStartBlock, e.target);
    lineStartBlock = null;
    conceptMap.style.cursor = 'default';
  } else if (lineStartBlock) {
    lineStartBlock = null;
    conceptMap.style.cursor = 'default';
  }
});

// Função para desenhar linha SVG entre dois blocos
function drawLineBetweenBlocks(blockA, blockB) {
  const rectA = blockA.getBoundingClientRect();
  const rectB = blockB.getBoundingClientRect();
  const parentRect = conceptMap.getBoundingClientRect();

  const x1 = rectA.left + rectA.width / 2 - parentRect.left;
  const y1 = rectA.top + rectA.height / 2 - parentRect.top;
  const x2 = rectB.left + rectB.width / 2 - parentRect.left;
  const y2 = rectB.top + rectB.height / 2 - parentRect.top;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.classList.add('concept-line');
  conceptSVG.appendChild(line);

  // Permitir excluir linha ao clicar nela
  line.addEventListener('click', function(e) {
    e.stopPropagation();
    if (confirm('Excluir esta ligação?')) line.remove();
  });
}

// Atualizar linhas ao mover blocos
conceptMap.addEventListener('dragend', function() {
  updateAllLines();
});
function updateAllLines() {
  const lines = conceptSVG.querySelectorAll('line');
  lines.forEach(line => {
    const blocks = Array.from(conceptMap.querySelectorAll('.concept-block'));
    let blockA = null, blockB = null;
    blocks.forEach(b => {
      const rect = b.getBoundingClientRect();
      const parentRect = conceptMap.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - parentRect.left;
      const y = rect.top + rect.height / 2 - parentRect.top;
      if (Math.abs(x - line.getAttribute('x1')) < 2 && Math.abs(y - line.getAttribute('y1')) < 2) blockA = b;
      if (Math.abs(x - line.getAttribute('x2')) < 2 && Math.abs(y - line.getAttribute('y2')) < 2) blockB = b;
    });
    if (blockA && blockB) {
      const rectA = blockA.getBoundingClientRect();
      const rectB = blockB.getBoundingClientRect();
      const parentRect = conceptMap.getBoundingClientRect();
      line.setAttribute('x1', rectA.left + rectA.width / 2 - parentRect.left);
      line.setAttribute('y1', rectA.top + rectA.height / 2 - parentRect.top);
      line.setAttribute('x2', rectB.left + rectB.width / 2 - parentRect.left);
      line.setAttribute('y2', rectB.top + rectB.height / 2 - parentRect.top);
    }
  });
}
updatePage(false);