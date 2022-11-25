export function create (type, parent, classname){
    // Genbruges til at bygge elementer i DOM strukturen
    var el = document.createElement(type);
    if(classname != undefined){
        if(classname.constructor === Array){
            classname.forEach(function(item){
                el.classList.add(item);
            })
        }else if (classname.constructor === String){
            el.classList.add(classname);
        }
    }
    if(parent){
        parent.appendChild(el);
    }
    return el;
};
export function select (s, e = document){
    // Shortcut to select dom elements
    return e.querySelector(s);
};
export function selectAll (s, e = document){
    // Shortcut to select dom elements
    return e.querySelectorAll(s);
}
export function addNodeListForEach(nodelist){
    if(window.NodeList && !NodeList.prototype.forEach){
        nodelist.forEach = function(callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };

    }
};
export function fetchJSON(url){
    function handleErrors(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }
    let f = fetch(url)
        .catch(err => {
            return Promise.reject('URL REJECTED');
        })
        .then(handleErrors)
        .then((response) => {
            console.log('load ok')
            return response.json();
        })
        .then( json => {
            return Promise.resolve(json);
        })
        .catch(error => console.log('There is an error:', error));
    return f;
}