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

export class DynamicStyles {
  constructor(cssText) {
    this._count = 0;
    this._cssText = cssText;
  }
  append() {
    this._count++;
    if(this._count === 1 && !this.node) {
      this.node = document.createElement('style');
      document.head.appendChild(this.node).textContent = this._cssText;
    }
  }
  remove() {
    this._count--;
    if(!this._count && this.node) {
      this.node.remove();
      this.node = null;
    }
  }
  add(selectorText, cssText) {
    if(!this.node) return null;

    return this.node.sheet.cssRules[this.node.sheet.insertRule(`${ selectorText } { ${ cssText } }`)];
  }
  del(rule) {
    const idx = [...this.node.sheet.cssRules].indexOf(rule);

    return idx >= 0 ? !this.node.sheet.deleteRule(idx) : false;
  }
}
