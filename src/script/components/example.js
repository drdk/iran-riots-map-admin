'use strict';
import {create, select, fetchJSON} from '../utils/trix';
export default class Example {
    constructor() {
        this.build();
    }

    build() {

        let container = select('[entry-point]');

        container.innerHTML = '';

        let content = create('div', container, ['debug-container','content']);

        content.innerHTML = this.testHTML();

        console.log(`${process.env.DATA_ASSETS_PATH}${process.env.DATA_FILE}`);
        const url = `${process.env.DATA_ASSETS_PATH}${process.env.DATA_FILE}`;
        //http://httpstat.us/500
        fetchJSON(url)
        .then(result =>{
            console.log('result', result.data);
            content.innerHTML += result.data[0].text;
        });

    }
    testHTML(){
        console.log('test', process.env.DEBUGGING);
        let DEBUGGING = process.env.DEBUGGING;
        let ASSETS_PATH = process.env.ASSETS_PATH;
        let type = process.env.TYPE;
        return `Så er der hul igennem! <br/>
        Vi kører i konfigurationen: ${type.toUpperCase()} <br/>
        Debug variablen er sat til: <span class="highlight">${DEBUGGING}</span><br/>
        Stien til assets er sat til:
        <span class="path-thing">${ASSETS_PATH}</span>
        <img src="${ASSETS_PATH}images/train.svg"/>
        <div class="css-path-test">Path test</div>
        <div class="data-test">External data test:</div>`;
    }
}