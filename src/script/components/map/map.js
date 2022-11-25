'use strict';

import './map.scss';
import eventEmitter from '../../utils/event-emitter';
import { gsap } from "gsap";
import Draggable from "gsap/Draggable";

gsap.registerPlugin(Draggable);


export default class Map {
    constructor() {
        this.build();
        fetch('https://storage.googleapis.com/sheet-parser/fb39d5b08b6a7b777ae26b38465b7b76-ukrainekorttidslinje-konfiguration.json')
            .then(data => data.json())
            .then(data => {
                this.config = data.data[0];

                this.populateLayers();

            })

    }

    build() {
        this.markers = []
        this.overlays = []
        this.currentLayer = null;
        this.mapWrapper = document.getElementById('map-wrapper')



        //this.buildEvents();
        this.buildBasemap();
        this.buildFronts();
        this.buildNamesLayer();
        this.buildPlaceLayer();

        eventEmitter.addEventListener('select-date', (data) => {

            if (data.detail.file) {
                this.updateFrontLayer(data.detail.file)
            } else {
                this.updateFrontLayer()
            }
            this.updatePlaceLayer(data.detail.events)
        })

        eventEmitter.addEventListener('fronts-file-change', event => {

            console.log('new svg')
            console.log(event)

            this.updateFrontLayer(event.detail);

        })

        eventEmitter.addEventListener('add-event', data => {
            console.log(data.detail)
            this.addEventMarker({ x: 10, y: 10, id: data.detail.id }, data.detail.index -1 )
        })

        eventEmitter.addEventListener('list-updated', data => {
            this.updatePlaceLayer(data.detail)
        })
    }
    isValidUrl(string) {

        let url;
        try {
          url = new URL(string);

        } catch (error) {
          return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }
    updateFrontLayer(svg) {

        if (svg) {

            this.overlayEl.innerHTML = svg;

        } else {
            //this.overlayEl.setAttribute()
            this.overlayEl.innerText = ''
        }


    }

    buildBasemap() {



        this.basemapWrapper = document.createElement('img');
        this.basemapWrapper.id = 'basemap';
        this.mapWrapper.appendChild(this.basemapWrapper)


    }
    buildFronts() {

            this.overlayEl = document.createElement('div');
            this.overlayEl.id = `front-overlay`;

            this.mapWrapper.appendChild(this.overlayEl)

    }
    buildNamesLayer() {
        this.namesPicture = document.createElement('picture');
        this.namesPicture.id = 'names-picture';
        this.mapWrapper.appendChild(this.namesPicture)

    }
    populateLayers() {

        this.basemapWrapper.src = this.config.grundkort;

        const sourceDesk = document.createElement("source");
        sourceDesk.media = "(min-width: 700px)"
        sourceDesk.srcset = this.config['navne-desk'];

        const sourceMobile = document.createElement("source");
        sourceMobile.media = "(max-width: 699px)"
        sourceMobile.srcset = this.config['navne-mobil'];

        const img = document.createElement("img");
        img.src = this.config['navne-mobil'];
        img.alt = 'Bynavne';
        img.id = 'names-image';

        this.namesPicture.appendChild(sourceDesk);
        this.namesPicture.appendChild(sourceMobile);
        this.namesPicture.appendChild(img);
    }
    buildPlaceLayer() {

        this.placeWrapper = document.createElement('div');
        this.placeWrapper.id = 'place-wrapper'
        this.placeWrapper.innerHTML = `
            <svg version="1.1" id="map-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 300 197.65" style="enable-background:new 0 0 300 197.65;" xml:space="preserve">

            </svg>
        `;
        this.mapWrapper.appendChild(this.placeWrapper)
        this.mapSvg = document.getElementById('map-svg')

    }
    addEventMarker(event,index) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        group.id = index;



        group.dataset['eventId'] = 'asdfasdf'

        this.mapSvg.appendChild(group);

            /*  <circle style="fill:url(#toning);stroke:#010101;stroke-width:1.6871;stroke-miterlimit:10;" cx="250" cy="250" r="245">
            </circle>
            <text x="50%" y="50%" text-anchor="middle" stroke="#51c5cf" stroke-width="2px" dy=".3em">Look, I’m centered!Look, I’m centered!</text>
        */
        const el = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        el.setAttribute('cx', event.x)
        el.setAttribute('cy', event.y);
        el.setAttribute('r', 5);
        el.dataset.id = event.id;
        el.style = "fill:#0861ce;"

        const txt = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        txt.setAttribute('x', event.x)
        txt.setAttribute('y', Number(event.y) + 1.8);
        txt.setAttribute('text-anchor', 'middle');
        txt.textContent = index + 1;


        group.appendChild(el);
        group.appendChild(txt);


        Draggable.create(group, {
            type: "x,y",
            onDragEnd: (event) => {

                const getMousePosition = (event) => {
                    var CTM = this.mapSvg.getScreenCTM();
                    return {
                      x: (event.clientX - CTM.e) / CTM.a,
                      y: (event.clientY - CTM.f) / CTM.d
                    };
                }

                const { x, y } = getMousePosition(event);

                eventEmitter.dispatchEvent('update-position', {
                    id: event.target.dataset.id,
                    x: x,
                    y: y
                })

            }
        });


        this.markers.push(group)
    }
    updatePlaceLayer(events) {


        this.mapSvg.innerHTML = '';


        if (!events) {
            console.log('no events')
            return;
        }
        events.forEach((event, index) => {

            this.addEventMarker(event, index)
        })


    }
}

// https://storage.googleapis.com/sheet-parser/fb39d5b08b6a7b777ae26b38465b7b76-ukrainekorttidslinje-konfiguration.json