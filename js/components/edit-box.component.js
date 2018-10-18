import {Component} from "../vendor/hyperhtml.min.js";
import {DynamicStyles} from "../libs/dynamic-style.js";

const dynamicStyle = new DynamicStyles(`
  .edit-box {
    width: 150px;
    height: 110px;
    position: relative;
    border-top: solid 1px ghostwhite;
    border-left: solid 1px ghostwhite;
    border-bottom: solid 1px ghostwhite;
    background-color: #000;
  }
  .edit-box textarea {
    width: 100%;  
    position: absolute;
    top: 0px;
    resize: none;
    border: none;
    padding: 9px;
    margin: 0;
    color: black;
    border-radius: 0;
    border-bottom: solid 1px ghostwhite;
    will-change: background-color, contents;
  }
  .edit-box input {
    width: 100%;
    height: 28px;
    position: absolute;
    color: white;
    padding: 0;
    border: none;
    bottom: 0px;
    background-color: transparent;
  }
  .edit-box::after {
    content: "CHANGE COLOR";
    position: absolute;
    pointer-events: none;
    left: 0;
    bottom: 7px;
    color: black;
    width: 100%;
    text-align: center;
  }
  _::-webkit-full-page-media, _:future, :root .edit-box::after {
    display: none;
  }
`);

const { style } = document.createElement('b');
const rxRgb = /^rgb\((\d+), (\d+), (\d+)/;
const toRgb = c => (style.color = c) && style.color;
const rgbToHex = rgb => rgb.match(rxRgb)
                            .filter((d, i) => i > 0)
                            .reduce((a, d) => a + (+d).toString(16).padEnd(2, '0'), '#');

export class EditBox extends Component {
// noinspection JSMethodCanBeStatic
  get defaultState() {
    return {
      model: {}
    }
  }

  constructor(data) {
    super();
    this.setState(data);
  }

  onclick(e) {
    console.log('item-clicked:', e, this.state);
  }
  oninput(e) {
    this.state.model[e.target.attributes['aria-label'].value] = e.target.value;
    this.render();
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
        class="edit-box"
      >
        <textarea
          aria-label="text" oninput="${ this }" value="${ this.state.model.text }"
          rows="4" cols="22" style="${ `background-color: ${ this.state.model.color }` }"
        ></textarea>
        <input aria-label="color" oninput="${ this }" value="${ rgbToHex(toRgb(this.state.model.color)) }" type="color">
      </div>
    `;
  }
}
