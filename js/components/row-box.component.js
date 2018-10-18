import {Component} from "../vendor/hyperhtml.min.js";
import {DynamicStyles} from "../libs/dynamic-style.js";

const dynamicStyle = new DynamicStyles(`
  .row-box {
    width: calc(100vw - 40px);
    height: 50px;
    color: black;
    font-size: 13px;
    line-height: 50px;
    text-align: center;
    border-bottom: solid 1px ghostwhite;
    will-change: background-color, contents;
  }
`);

export class RowBox extends Component {
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
    dynamicStyle.append();
  }
  // noinspection JSMethodCanBeStatic
  ondisconnected() {
    dynamicStyle.remove();
  }
  render() { // TODO: create a template for text/row-box
    // noinspection HtmlUnknownAttribute
    return this.html`
      <div
        onconnected="${ this }"
        ondisconnected="${ this }"
        onclick="${ this }"
        style="${ `background-color: ${ this.state.model.color }` }"
        class="row-box"
      >
        ${ this.state.model.text }
      </div>
    `;
  }
}
