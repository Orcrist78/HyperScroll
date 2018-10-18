/*!
  ISC License

  Copyright (c) 2018, Giuseppe Scotto Lavina

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted, provided that the above
  copyright notice and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
*/

import {hyper} from "../vendor/hyperhtml.min.js";
import {DynamicStyles} from "../libs/dynamic-style.js";

(new DynamicStyles(`
  canvas[canvas-src] {
    transition: none;
    opacity: 0;
  }
  canvas[canvas-src].show {
    transition: opacity 250ms;
    opacity: 1;
  }
`)).append();

const srcBmpMap = new Map();
const elImgMap = new WeakMap();
const bitmap = 'createImageBitmap' in window && !navigator.userAgent.toLowerCase().includes('firefox');
const drawImg = (canvas, img) => { // TODO: handle pixelratio
  const {width, height} = img;

  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height, 0, 0, width, height);
  canvas.classList.add('show');
};

hyper.define('canvas-src', (el, src) => {
  let bmp = srcBmpMap.get(src);

  el.classList.remove('show');
  if(bmp)
    drawImg(el, bmp);
  else {
    let img = elImgMap.get(el);

    if(img) {
      if(img.src !== src) {
        img.src = '';
      } else
        return;
    } else {
      img = new Image();
      elImgMap.set(el, img);
      img.onload = async () => {
        img.onload = img.onerror = img.onabort = null;
        elImgMap.delete(el);
        drawImg(el, srcBmpMap.set(src, bitmap ? await createImageBitmap(img) : img).get(src)) // TODO: move createBitmap on worker ?
      };
      img.onerror = img.onabort = () => img.src && (img.src = '');
    }

    img.src = src;
  }
});
