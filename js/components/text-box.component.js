import {Component} from "../vendor/hyperhtml.min.js";
import {DynamicStyles} from "../libs/dynamic-style.js";

const dynamicStyle = new DynamicStyles(`
  .text-box {
    width: 80px;
    height: 80px;
    color: black;
    font-size: 13px;
    line-height: 80px;
    text-align: center;
    border-left: solid 1px ghostwhite;
    will-change: background-color, contents;
  }
`);

export class TextBox extends Component {
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
  // noinspection JSMethodCanBeStatic
  onconnected() {
    dynamicStyle.inc();
  }
  // noinspection JSMethodCanBeStatic
  ondisconnected() {
    dynamicStyle.dec();
  }
  render() { // TODO: create a template for text/row-box
    // noinspection HtmlUnknownAttribute
    return this.html`
      <div
        onconnected="${ this }"
        ondisconnected="${ this }"
        onclick="${ this }"
        style="${ `background-color: ${ this.state.model.color }` }"
        class="text-box"
      >
        ${ this.state.model.text }
      </div>
    `;
  }
}
