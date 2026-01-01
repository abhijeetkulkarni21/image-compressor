const MAX_SIZE = 128;

const upload = document.getElementById("upload");
const slider = document.getElementById("threshold");

const oCanvas = document.getElementById("original");
const cCanvas = document.getElementById("compressed");

const octx = oCanvas.getContext("2d");
const cctx = cCanvas.getContext("2d");

let width, height, imageData;

upload.addEventListener("change", loadImage);
slider.addEventListener("input", processImage);

function loadImage(e) {
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1);
    width = Math.floor(img.width * scale);
    height = Math.floor(img.height * scale);

    oCanvas.width = cCanvas.width = width;
    oCanvas.height = cCanvas.height = height;

    octx.drawImage(img, 0, 0, width, height);
    imageData = octx.getImageData(0, 0, width, height);
    processImage();
  };
  img.src = URL.createObjectURL(e.target.files[0]);
}

function processImage() {
  if (!imageData) return;

  const gray = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    gray.push(imageData.data[i]);
  }

  const freq = fft2D(gray, width, height);
  applyThreshold(freq, slider.value);
  const spatial = ifft2D(freq, width, height);

  draw(spatial);
}

function fft2D(data, w, h) {
  const re = Array.from({ length: h }, (_, i) =>
    data.slice(i * w, (i + 1) * w)
  );
  const im = Array.from({ length: h }, () => Array(w).fill(0));

  for (let i = 0; i < h; i++) fft(re[i], im[i]);

  for (let j = 0; j < w; j++) {
    const colRe = re.map(r => r[j]);
    const colIm = im.map(r => r[j]);
    fft(colRe, colIm);
    for (let i = 0; i < h; i++) {
      re[i][j] = colRe[i];
      im[i][j] = colIm[i];
    }
  }

  return { re, im };
}

function ifft2D(freq, w, h) {
  const { re, im } = freq;

  for (let j = 0; j < w; j++) {
    const colRe = re.map(r => r[j]);
    const colIm = im.map(r => r[j]);
    ifft(colRe, colIm);
    for (let i = 0; i < h; i++) {
      re[i][j] = colRe[i];
      im[i][j] = colIm[i];
    }
  }

  for (let i = 0; i < h; i++) ifft(re[i], im[i]);

  return re.flat();
}

function applyThreshold(freq, t) {
  for (let i = t; i < height; i++) {
    for (let j = t; j < width; j++) {
      freq.re[i][j] = 0;
      freq.im[i][j] = 0;
    }
  }
}

function draw(data) {
  const img = cctx.createImageData(width, height);
  for (let i = 0; i < data.length; i++) {
    const v = Math.max(0, Math.min(255, data[i]));
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  cctx.putImageData(img, 0, 0);
}
