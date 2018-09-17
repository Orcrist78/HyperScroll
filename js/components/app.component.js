import {Component, bind} from "../vendor/hyperhtml.min.js";
import {DynamicStyles} from "../libs/dynamic-style.js";
import {HyperScroll} from "./hyper-scroll.component.js";
import {ImageBox} from "./image-box.component.js";
import {TextBox} from "./text-box.component.js";
import {EditBox} from "./edit-box.component.js";
import {RowBox} from "./row-box.component.js";

(new DynamicStyles(`
  *::-webkit-scrollbar {
    display: none;
  }
  * {
    box-sizing: border-box;
    user-select: none;
    outline: none;
    -webkit-text-size-adjust: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    font-family: arial;
    font-weight: 400;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
  .title {
    padding: 15px;
    margin: 0;
    text-align: center;
    color: white;
  }
  .container {
    width: calc(100% - 20px);
    margin: 0 auto 10px auto;
    background-color: antiquewhite;
    border: solid 10px darkslategray;
    border-radius: 5px;
    overflow: hidden;
  }
  .container.one {
    height: 180px;
  }
  .container.two {
    height: 100px;
  }
  .container.three,
  .container.four {
    height: 130px;
  }
  .container p {
    text-align: center;
    line-height: 80px;
    color: black;
  }
`)).inc();

const getItemsData = (count, txt) => Array(count).fill(0).map((d, i) => ({ model: {
  color: `hsl(${ Math.random() * 360 }, 95%, 80%)`,
  text: `${ txt } - ${ i + 1 }`
}}));

const getImages = things => Promise.all(things.map(thing =>
  fetch(`https://server.picular.co/${ thing }`).then(resp => resp.json())
)).then(json => json.map(curr => curr.colors).reduce((ret, curr) => ret.concat(curr)));

export class MyTest extends Component {

  constructor() {
    super();

    this.hscroll1 = new HyperScroll({
      data: getItemsData(300, 'item-row'),
      direction: 'v',
      itemsBuffer: 4,
      component: RowBox
    });

    this.hscroll2 = new HyperScroll({
      data: getItemsData(300, 'item'),
      itemWidth: 80,
      itemHeight: 80,
      itemsBuffer: 3,
      component: TextBox
    });

    this.hscroll3 = new HyperScroll({
      data: getItemsData(50, 'EDITABLE'),
      itemWidth: 140,
      itemHeight: 110,
      itemsBuffer: 2,
      component: EditBox
    });

    this.hsPromise = (async () => (this.hscroll4 = new HyperScroll({
      data: await getImages(['ferrari', 'lamborghini', 'maserati', 'pagani', 'bugatti', 'porche', 'koenigsegg', 'mclaren']),
      itemsBuffer: 2,
      component: ImageBox
    })))();
  }
  render() {
    return this.html`
      <h3 class="title">HYPER-SCROLL TEST PAGE</h3>
      <section class="container one">
        ${ this.hscroll1 }
      </section>
      <section class="container two">
        ${ this.hscroll2 }
      </section>
      <section class="container three">
        ${ this.hscroll3 }
      </section>
      <section class="container four">
        ${{
          any: this.hsPromise,
          placeholder: { html: '<p>Loading ...</p>' }
        }}
      </section>
    `;
  }
}

window.oncontextmenu = event => event.preventDefault();
window.onunhandledrejection = event => console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
bind(document.body)`${ new MyTest }`;
