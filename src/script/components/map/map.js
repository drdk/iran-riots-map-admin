import { gsap } from "gsap";


import './map.scss';
import eventEmitter from '../../utils/event-emitter';
import Draggable from "gsap/Draggable";

gsap.registerPlugin(Draggable);


export default class Map {
    constructor() {
        this.build();
        
        this.populateLayers();

        

    }

    build() {
        this.markers = []
        this.overlays = []
        this.currentLayer = null;
        this.mapWrapper = document.getElementById('map-wrapper')



        //this.buildEvents();
        this.buildBasemap();

        this.buildPlaceLayer();

        eventEmitter.addEventListener('select-date', (data) => {
            this.updatePlaceLayer(data.detail.events)
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


    buildBasemap() {



        this.basemapWrapper = document.createElement('img');
        this.basemapWrapper.id = 'basemap';
        this.mapWrapper.appendChild(this.basemapWrapper)


    }


    populateLayers() {

        
        this.basemapWrapper.src = process.env.ASSETS_PATH + 'images/basemap-v3.svg';

    }
    buildPlaceLayer() {

        this.placeWrapper = document.createElement('div');
        this.placeWrapper.id = 'place-wrapper'
        this.placeWrapper.innerHTML = `
            <svg version="1.1" id="map-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 372 369" style="enable-background:new 0 0 372 369;" xml:space="preserve">

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
            <text x="50%" y="50%" text-anchor="middle" stroke="#51c5cf" stroke-width="2px" dy=".3em">Look, I???m centered!Look, I???m centered!</text>
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