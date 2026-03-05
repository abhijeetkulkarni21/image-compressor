const upload = document.getElementById("upload");
const compression = document.getElementById("compression");

const originalCanvas = document.getElementById("original");
const compressedCanvas = document.getElementById("compressed");

const octx = originalCanvas.getContext("2d");
const cctx = compressedCanvas.getContext("2d");

const SIZE = 256;

upload.addEventListener("change", loadImage);
compression.addEventListener("input", processImage);

let imgData;

function loadImage(e){

const file = e.target.files[0];
const reader = new FileReader();

reader.onload = function(event){

const img = new Image();

img.onload = function(){

originalCanvas.width = SIZE;
originalCanvas.height = SIZE;

compressedCanvas.width = SIZE;
compressedCanvas.height = SIZE;

octx.drawImage(img,0,0,SIZE,SIZE);

imgData = octx.getImageData(0,0,SIZE,SIZE);

processImage();

}

img.src = event.target.result;

}

reader.readAsDataURL(file);

}

function processImage(){

if(!imgData) return;

let gray = [];

for(let i=0;i<imgData.data.length;i+=4){

let g = 0.299*imgData.data[i] + 0.587*imgData.data[i+1] + 0.114*imgData.data[i+2];

gray.push(g);

}

let matrix = [];

for(let i=0;i<SIZE;i++){

matrix.push(gray.slice(i*SIZE,(i+1)*SIZE));

}

let fft = fft2D(matrix);

let level = parseInt(compression.value);

for(let i=0;i<SIZE;i++){

for(let j=0;j<SIZE;j++){

if(i>level && j>level){

fft[i][j]=0;

}

}

}

let result = ifft2D(fft);

let output = cctx.createImageData(SIZE,SIZE);

for(let i=0;i<SIZE*SIZE;i++){

let val = result[Math.floor(i/SIZE)][i%SIZE];

output.data[i*4] = val;
output.data[i*4+1] = val;
output.data[i*4+2] = val;
output.data[i*4+3] = 255;

}

cctx.putImageData(output,0,0);

}

function fft2D(matrix){

return matrix;

}

function ifft2D(matrix){

return matrix;

}

document.getElementById("download").onclick = function(){

const link = document.createElement("a");

link.download = "compressed.png";
link.href = compressedCanvas.toDataURL();

link.click();

};
  applyThreshold(freq, slider.value);
  const spatial = ifft2D(freq, width, height);

  draw(spatial);

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
