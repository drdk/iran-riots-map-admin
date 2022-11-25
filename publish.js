const request = require('request');
const fs = require('fs-extra');
let type = 'stage';

if(process.argv.length > 2){ //are there any parameters?
    type = process.argv[2]; //grab the first parameter and pass it to "type"
}

const sheetID = '1Pg07-LkXO1MSspqMnN1DbAE3Re2pE1UwO3ebzWJc5q8';
const publishBase = {
    'stage':'https://google-sheet-parser-docker.public.prod.gcp.dr.dk/test?spreadsheet=',
    'deploy':'https://google-sheet-parser-docker.public.prod.gcp.dr.dk/build?spreadsheet='
}
const loadBase = 'https://storage.googleapis.com/sheet-parser/';
// console.log('we use', publishBase[type] + sheetID);

function publishTroughLink() {
    request(`${publishBase[type]}${sheetID}&output=json`, (error, response, body)=> {
        if (!error && response.statusCode === 200) {
             const data = JSON.parse(body);
             if(type === 'stage'){
                data.forEach(element => {
                    console.log('name: ', element.filename);
                    setTimeout(()=>{
                        saveLocal(element.filename);
                    }, 1000)
                });
            };
         } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode)
        }
    })
}
function saveLocal(name){
    const url = `${loadBase}${name}`;
    console.log('loading' , url);
    request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const data = JSON.parse(body);
            console.log('loaded' , name);
            fs.writeFile('./src/assets/data/'+name, JSON.stringify(data), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("Generated file", name);
            });
        } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode, ", url: ", url)
        }
    })
}
publishTroughLink();
