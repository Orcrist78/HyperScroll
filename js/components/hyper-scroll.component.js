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

  HyperScroll@0.2Alpha
*/


import {Component, wire} from "../vendor/hyperhtml.min.js";
import {DynamicStyles} from "../libs/dynamic-style.js";

const dynamicStyle = new DynamicStyles(`
  .hyper-scroll {
    width: var(--hs-width, 100%);
    height: var(--hs-height, 100%);
    overflow: auto;
    will-change: scroll-position;
  }
  .hyper-scroll .hs-scroller {
    width: var(--hss-width, var(--hs-width, 100%));
    height: var(--hss-height, var(--hs-height, 100%));
    display: flex;
    overflow: hidden;
    position: relative;
  }
  .hyper-scroll .hs-item {
    width: var(--hsi-width, 100%);
    height: var(--hsi-height, 100%);
    display: flex;
    contain: strict;
    overflow: hidden;
    position: absolute;
    will-change: transform;
  }
  .hs-dummy {
    visibility: hidden;
    position: fixed;
  }
`);

export const sleep = t => new Promise(r => setTimeout(r, t));
export const boundMethods = (i, ms) => ms.map(m => i[m] = i[m].bind(i));
export class HyperScroll extends Component {
// noinspection JSMethodCanBeStatic
  get defaultState() {
    return {
      data: null,
      itemWidth: 0,
      itemHeight: 0,
      itemsBuffer: 1,
      component: null,
      direction: 'h',
      maxPoolDim: 5,
    }
  }

  constructor(opts = {}) {
    super();

    if(!opts.itemsBuffer) opts.itemsBuffer = 1;
    if(!opts.data || !Array.isArray(opts.data) || !opts.data.length) throw Error('data is mandatory!');
    if(!opts.component || !(opts.component.prototype instanceof Component)) throw Error('component is mandatory!');

    boundMethods(this, ['_manageScroll', '_refreshItems', '_createItem']);
    this._sparams = { left: 0, top: 0, behavior: 'smooth' };
    this._ro = new ResizeObserver(this._refreshItems); //TODO: debounce _refreshItems
    this.setState(opts);
    this._setDir();
  }

  scroll(pos = 0, behavior = 'smooth') {
    this._sparams.behavior = behavior;
    this._sparams[this._sparam] = pos;
    this._wire$.scrollTo(this._sparams);
  }
  scrollTo(idx = 0, behavior = 'smooth') {
    this.scroll(idx * this.state[this._itemDim], behavior);
  }

  async onconnected() {
    const style = this._wire$.firstElementChild.style;
    const css = style.setProperty.bind(style);

    dynamicStyle.inc();
    await this._getItemSize();
    css(`--hsi-${ this._hsDim }`, `${ this.state[this._itemDim] }px`);
    css(`--hss-${ this._hsDim }`, `${ this.state[this._itemDim] * this.state.data.length }px`);
    this._ro.observe(this._wire$);
  }
  ondisconnected() {
    dynamicStyle.dec();
    this._ro.disconnect();
  }
  onscroll() {
    if(!this.isScroll) {
      requestAnimationFrame(this._manageScroll);
      this.isScroll = true;
    }
  }

  _setDir() {
    if(this.state.direction === 'h') {
      this._sparam = 'left';
      this._hsDim = 'width';
      this._itemDim = 'itemWidth';
      this._transProp = 'translateX';
      this._scrollProp = 'scrollLeft';
    } else {
      this._sparam = 'top';
      this._hsDim = 'height';
      this._itemDim = 'itemHeight';
      this._transProp = 'translateY';
      this._scrollProp = 'scrollTop';
    }
  }
  async _getItemSize() {
    if(!this.state.itemWidth || !this.state.itemHeight) {
      const dummy = document.body.appendChild(this._createItem(0, 'hs-dummy'));

      await sleep();
      this.state.itemWidth = dummy.offsetWidth;
      this.state.itemHeight = dummy.offsetHeight;
      (this._itemsPool = []).push(document.body.removeChild(dummy));
      dummy.classList.replace('hs-dummy', 'hs-item');
    }
  }
  _refreshItems(entry) {
    const position = this.position;
    const dataLen = this.state.data.length;

    this.itemsBuffer = this.state.itemsBuffer;
    this._wire$[this._scrollProp] = this.position = this.current = 0;
    this.elemsView = Math.min(dataLen, Math.ceil(entry[0].contentRect[this._hsDim] / this.state[this._itemDim]));
    this.elemsCount = Math.min(dataLen, this.elemsView + (this.itemsBuffer * 2));
    if(this.elemsCount === dataLen) this.itemsBuffer = 0;
    this._createItems(this.elemsCount);
    this.render();
    position && this.scroll(position, 'instant');
  }
  _createItems(len) {
    if(!this._itemsDom)
      this._itemsDom = Array(len).fill(0).map((d, i) => this._createItem(i));
    else
      if(len > this._itemsDom.length) {
        for(let i = 0; i < this._itemsDom.length; i++) this._itemsDom[i].update(this._getData(i), i - this.itemsBuffer);
        for(let i = this._itemsDom.length; i < len; i++) this._itemsDom.push(this._createItem(i));
      } else
        if(len < this._itemsDom.length) {
          for(let i = 0; i < len; i++) this._itemsDom[i].update(this._getData(i), i - this.itemsBuffer);
          for(let i = this._itemsDom.length - 1; i >= len; i--) this._removeItem(i);
          this._itemsDom.length = len;
        }
  }
  _getData(i) {
    const idx = i - this.itemsBuffer;

    return this.state.data[idx > 0 ? idx : 0];
  }
  _createItem(i, c = 'hs-item')  {
    if(this._itemsPool && this._itemsPool.length)
      return this._itemsPool.pop().update(this._getData(i), i - this.itemsBuffer);
    else {
      const itemObj = new this.state.component(this._getData(i));
      const itemDom = wire()`<div class="${ c }">${ itemObj }</div>`;

      itemDom.update = (d, t) => {
        d >= 0 && itemObj.setState(this.state.data[d]);
        itemDom.style.setProperty('transform', `${ this._transProp }(${ t * this.state[this._itemDim] }px)`);
        return itemDom;
      };
      return itemDom.update(-1, i - this.itemsBuffer);
    }
  }
  _removeItem(i)  {
    if(this.state.maxPoolDim > (this._itemsPool || (this._itemsPool = [])).length)
      this._itemsPool.push(this._itemsDom.pop());
  }
  _manageScroll() {
    const position = this._wire$[this._scrollProp];
    const current = (position / this.state[this._itemDim]) >> 0;
    const dir = position - this.position;

    this.position = position;
    if(this.itemsBuffer) {
      if(dir > 0) {
        for(let i = this.current; i < current; i++) {
          const idx = i + this.elemsCount - this.itemsBuffer;
          const elem = this._itemsDom[0].update(idx, idx);

          for(let i = 0; i < this.elemsCount - 1; i++) this._itemsDom[i] = this._itemsDom[i + 1];
          this._itemsDom[this.elemsCount - 1] = elem;
        }
      } else {
        for(let i = this.current + this.elemsView; i > current + this.elemsView; i--) {
          const idx = i - this.elemsCount + this.itemsBuffer - 1;
          const elem = this._itemsDom[this.elemsCount - 1].update(idx, idx);

          for(let i = this.elemsCount - 1; i > 0; i--) this._itemsDom[i] = this._itemsDom[i - 1];
          this._itemsDom[0] = elem;
        }
      }
    }
    this.current = current;
    this.isScroll = false;
  }

  render() {
    // noinspection HtmlUnknownAttribute
    return this.html`
      <div ondisconnected="${ this }" onconnected="${ this }" onscroll="${ this }" class="hyper-scroll">
        <div class="hs-scroller">${ this._itemsDom && this._itemsDom.slice() }</div>
      </div>
    `;
  }
}
