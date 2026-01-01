const upload = document.getElementById("upload");
const thresholdSlider = document.getElementById("threshold");

const origCanvas = document.getElementById("original");
const compCanvas = document.getElementById("compressed");

const octx = origCanvas.getContext("2d");
const cctx = compCanvas.getContext("2d");

let imageData, width, height;

upload.addEventListener("change", loadImage);
thresholdSlider.addEventListener("input", compressImage);

function loadImage(event) {
  const img = new Image();
  img.onload = () => {
    width = img.width;
    height = img.height;

    origCanvas.width = compCanvas.width = width;
    origCanvas.height = compCanvas.height = height;

    octx.drawImage(img, 0, 0);
    imageData = octx.getImageData(0, 0, width, height);
    compressImage();
  };
  img.src = URL.createObjectURL(event.target.files[0]);
}

function compressImage() {
  if (!imageData) return;

  const gray = toGrayscale(imageData);
  const freqDomain = dft2D(gray, width, height);

  applyThreshold(freqDomain, thresholdSlider.value);

  const reconstructed = idft2D(freqDomain, width, height);
  drawCompressedImage(reconstructed);
}

function toGrayscale(img) {
  const gray = [];
  for (let i = 0; i < img.data.length; i += 4) {
    gray.push(img.data[i]);
  }
  return gray;
}

function dft2D(data, w, h) {
  const result = Array.from({ length: h }, () => Array(w));
  for (let u = 0; u < h; u++) {
    for (let v = 0; v < w; v++) {
      let real = 0, imag = 0;
      for (let x = 0; x < h; x++) {
        for (let y = 0; y < w; y++) {
          const angle = -2 * Math.PI * ((u * x) / h + (v * y) / w);
          const val = data[x * w + y];
          real += val * Math.cos(angle);
          imag += val * Math.sin(angle);
        }
      }
      result[u][v] = { real, imag };
    }
  }
  return result;
}

function applyThreshold(freq, threshold) {
  for (let i = threshold; i < freq.length; i++) {
    for (let j = threshold; j < freq[i].length; j++) {
      freq[i][j].real = 0;
      freq[i][j].imag = 0;
    }
  }
}

function idft2D(freq, w, h) {
  const output = [];
  for (let x = 0; x < h; x++) {
    for (let y = 0; y < w; y++) {
      let sum = 0;
      for (let u = 0; u < h; u++) {
        for (let v = 0; v < w; v++) {
          const angle = 2 * Math.PI * ((u * x) / h + (v * y) / w);
          sum +=
            freq[u][v].real * Math.cos(angle) -
            freq[u][v].imag * Math.sin(angle);
        }
      }
      output.push(sum / (w * h));
    }
  }
  return output;
}

function drawCompressedImage(data) {
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
