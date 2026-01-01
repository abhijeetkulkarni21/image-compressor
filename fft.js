function fft(re, im) {
  const n = re.length;
  if (n <= 1) return;

  const evenRe = new Array(n / 2);
  const evenIm = new Array(n / 2);
  const oddRe = new Array(n / 2);
  const oddIm = new Array(n / 2);

  for (let i = 0; i < n / 2; i++) {
    evenRe[i] = re[i * 2];
    evenIm[i] = im[i * 2];
    oddRe[i] = re[i * 2 + 1];
    oddIm[i] = im[i * 2 + 1];
  }

  fft(evenRe, evenIm);
  fft(oddRe, oddIm);

  for (let k = 0; k < n / 2; k++) {
    const angle = (-2 * Math.PI * k) / n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const tre = cos * oddRe[k] - sin * oddIm[k];
    const tim = sin * oddRe[k] + cos * oddIm[k];

    re[k] = evenRe[k] + tre;
    im[k] = evenIm[k] + tim;
    re[k + n / 2] = evenRe[k] - tre;
    im[k + n / 2] = evenIm[k] - tim;
  }
}

function ifft(re, im) {
  for (let i = 0; i < re.length; i++) im[i] = -im[i];
  fft(re, im);
  for (let i = 0; i < re.length; i++) {
    re[i] /= re.length;
    im[i] = -im[i] / re.length;
  }
}
