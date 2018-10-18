import {Component} from "../vendor/hyperhtml.min.js";
import {DynamicStyles} from "../libs/dynamic-style.js";
import "./canvas-src.intent.js";

const dynamicStyle = new DynamicStyles(`
  .image-box {
    position: relative;
    width: 140px;
    height: 110px;
    border-top: solid 1px ghostwhite;
    border-left: solid 1px ghostwhite;
    border-bottom: solid 1px ghostwhite;
    will-change: background-color;
  }
  .image-box canvas {
    position: absolute;
    width: 100%;
    top: 0px;
  }
  .image-box div {
    position: absolute;
    padding: 3px;
    bottom: 0px;
    width: 100%;
    font-size: 13px;
    line-height: 13px;
    text-align: center;
    border-top: solid 1px ghostwhite;
    background-color: rgba(255,255,255,0.8);
    color: black;
    will-change: contents;
  }
`);

export class ImageBox extends Component {

  constructor(data) {
    super();
    this.setState(data);
  }

  onclick(e) {
    console.log('item-clicked:', e, this.state);
  }
  // noinspection JSMethodCanBeStatic
  onconnected() {
    dynamicStyle.append();
  }
  // noinspection JSMethodCanBeStatic
  ondisconnected() {
    dynamicStyle.remove();
  }
  render() {
    // noinspection HtmlUnknownAttribute
    return this.html`
      <div
        onconnected="${ this }"
        ondisconnected="${ this }"
        onclick="${ this }"
        style="${ `background-color: ${ this.state.color }` }"
        class="image-box"
      >
        <canvas
          canvas-src="${ this.state.img /*`https://rsz.io/${ this.state.img.substr(8) }?w=140&downscale-prefilter=true`*/ }" <!-- TODO: handle pixelratio -->
        ></canvas>
        <div>${ this.state.color }</div>
      </div>
    `;
  }
}
