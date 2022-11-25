'use strict';

import './admin-form.scss';
import { getEntity, saveEntity } from "../../utils/db";
// Default SortableJS
import Sortable from 'sortablejs';
import Map from '../map/map'

import eventEmitter from '../../utils/event-emitter';
const statusText = [
    'Ikke-publiceret',
    'Publiceret'
]
export default class AdminForm {
    constructor() {
        this.entity = {};


        this.build();
    }
    selectElements() {
        this.dateElement = document.getElementById('date')

        this.headlineElement = document.getElementById('headline')
        this.descriptionElement = document.getElementById('description')
        this.eventsElement = document.getElementById('events')
        this.addEventButtonElement = document.getElementById('add-event')
        this.saveButtonElement = document.getElementById('save')
        this.uploadButtonElement = document.getElementById('upload')
        this.deleteFileButtonElement = document.getElementById('delete-file')

        this.fileElement = document.getElementById('file')
        this.fileNameElement = document.getElementById('file-name')
        this.resetButtonElement = document.getElementById('reset')
        this.feedbackElement = document.getElementById('feedback')
        this.eventTemplate = document.querySelector('#event-template');
        this.publicationButton = document.getElementById('publication-button');
        this.publicationStatus = document.getElementById('publication-status');
    }
    setDefaults() {
        this.dateElement.value = this.currentDate;
    }
    build() {

        this.currentDate = this.getCurrentDate();

        this.map = new Map();

        this.selectElements();
        this.setDefaults();

        this.setGeneralEvents()

        this.loadDate(this.currentDate).then(() => {
            console.log('loaded')
            this.loaded = true;
            document.querySelector('[iran-riots-map-admin]').classList.add('active')
        })
        setTimeout(() => {
            if (!this.loaded) {
                const error = document.getElementById('error')
                error.innerHTML = '<p>Der er ikke forbindelse til serveren. Måske er du ikke på DRs netværk</p>';


            }
        }, 2000)

    }

    setGeneralEvents() {


        this.publicationButton.addEventListener('change', event => {
            console.log(event.target.checked)
            this.entity.public = event.target.checked;

            this.saveDate();
        })
        this.dateElement.addEventListener('change', (event) => {

            this.changeDate(event)
        })
        this.addEventButtonElement.addEventListener('click', (event) => {
            event.preventDefault();
            this.addEventElement()
        })

        this.resetButtonElement.addEventListener('click', (event) => {
            event.preventDefault()
            this.reset();
        })

        this.saveButtonElement.addEventListener('click', (event) => {
            event.preventDefault()
            this.saveDate();
        })


        eventEmitter.addEventListener('update-position', data => {



            const eventEl = this.eventsElement.querySelector(`[data-id="${data.detail.id}"]`)
            eventEl.querySelector('.x').value = data.detail.x;
            eventEl.querySelector('.y').value = data.detail.y;

        })



    }
    reset() {
        this.loadDate(this.currentDate)
    }
    loadDate(date) {
        return getEntity(date).then(data => {


            this.entity = data || { date: this.currentDate };

            this.setValues(this.entity)
            eventEmitter.dispatchEvent('select-date', this.entity)

        })
    }
    saveDate() {

        const events = this.buildEventList();
        const headlines = this.buildHeadlinesList();

        Promise.all([events, headlines]).then(() => {
            console.log(this.entity)
            this.feedbackElement.innerText = 'Gemmer'
            saveEntity(this.entity).then(data => {
                console.log(data)
                console.log('data saved')
                this.feedbackElement.innerText = 'Ændringerne er gemt'
                this.publicationStatus.innerText = statusText[Number(!!data.public)];
                setTimeout(() => {
                    this.feedbackElement.innerText = ''
                }, 2000)
            })
        })

    }
    buildHeadlinesList() {
        return new Promise((resolve, reject) => {

            const headlines = [];
            console.log()
            document.querySelectorAll('.headlines-wrapper input').forEach(input => {
                console.log(input)
                if (input.value) {
                    headlines.push(input.value)
                }




            })
            this.entity.headlines = headlines;
            resolve()

        })
    }
    buildEventList() {
        return new Promise((resolve, reject) => {

            const events = [];

            this.eventsElement.querySelectorAll('.event-wrapper').forEach(wrapper => {

                console.log(wrapper)
                const event = {

                    title: wrapper.querySelector('.title').value,
                    description: wrapper.querySelector('.description').value,
                    url: wrapper.querySelector('.url').value || '',
                    x: wrapper.querySelector('.x').value || 1,
                    y: wrapper.querySelector('.y').value || 1,
                    id: wrapper.dataset.id

                }
                console.log(event)
                // ERROR HANDLING
                events.push(event)

            })
            this.entity.events = events;
            resolve()

        })
    }
    changeDate(event) {

        const date = event.target.value;
        this.dateElement.value = date;
        this.currentDate = date;
        this.loadDate(date)
    }
    setValues(data) {

        if (!data) {
            return;
        }
        
        this.publicationButton.checked = !!data.public;
        
        console.log(data.public)
        console.log(!!data.public)
        console.log(Number(!!data.public))
        this.publicationStatus.innerText = statusText[Number(!!data.public)];
        this.eventsElement.innerText = '';
        if (data.events) {
            data.events.forEach(event => {

                const clone = document.importNode(this.eventTemplate.content, true);
                clone.querySelector('.title').value = event.title;
                clone.querySelector('.description').value = event.description;
                clone.querySelector('.url').value = event.url || '';
                clone.querySelector('.x').value = event.x || 1;
                clone.querySelector('.y').value = event.y || 1;
                this.eventsElement.appendChild(clone);

                const wrapper = this.eventsElement.querySelector('.event-wrapper:last-child')
                wrapper.dataset.id = event.id;
                this.addEventDeleteHandler(wrapper)
            })
            this.addDragEvents();
        }
        if (data.headlines) {

            const inputs = document.querySelectorAll('.headlines-wrapper input');

            data.headlines.forEach((headline, index) => {
                inputs[index].value = headline;
            })

        } else {
            document.querySelectorAll('.headlines-wrapper input').forEach(input => {
                input.value = '';
            })
        }
    }

    addEventDeleteHandler(wrapper) {
        wrapper.querySelector('button').addEventListener('click', (event) => {
            event.preventDefault();
            console.log( )
            event.target.parentNode.parentNode.remove()
            eventEmitter.dispatchEvent('list-updated', this.getUpdateList())
        });
    }
    getUpdateList() {
        const list = [];
        this.eventsElement.querySelectorAll('.event-wrapper').forEach(eventEl => {

            const event = {
                id: eventEl.dataset.id,
                x: eventEl.querySelector('.x').value,
                y: eventEl.querySelector('.y').value

            }
            list.push(event)
        })
        return list;
    }
    addEventElement() {
        const clone = document.importNode(this.eventTemplate.content, true);
        this.eventsElement.appendChild(clone);

        const wrapper = this.eventsElement.querySelector('.event-wrapper:last-child')
        wrapper.dataset.id = this.uuidv4();

        const index = this.eventsElement.querySelectorAll('.event-wrapper').length;
        console.log(index)

        eventEmitter.dispatchEvent('add-event', {
            index: index,
            id: wrapper.dataset.id
        })
        this.addEventDeleteHandler(wrapper)
    }
    addDragEvents(element) {

        if (!this.eventsElement) {
            return;
        }
        Sortable.create(this.eventsElement, {

            onUpdate: (event) => {
                console.log(event)
                console.log(this.data)

                eventEmitter.dispatchEvent('list-updated', this.getUpdateList())

            },
        });
    }
    getCurrentDate() {
        let date = new Date();
        const offset = date.getTimezoneOffset();
        date = new Date(date.getTime() - offset * 60 * 1000);
        return date.toISOString().split("T")[0];
    }
    uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }



}