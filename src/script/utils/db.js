const BASE_URL = 'https://current-news-api.private.prod.gcp.dr.dk/tjenester/current-news-api/public/iran-riots'
//const BASE_URL = 'http://localhost:3000/tjenester/ukraine-war-api/private/fronts-events-map'


function getEntity(date) {
    return fetch(BASE_URL + '/map-entry/' + date).then(data => data.json())
}

function saveEntity(entity) {
  console.log(entity)
    return fetch(BASE_URL + '/map-entry/' + entity.date, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity)
      })
      .then(data => data.json())
      .then(data => { return data });
}
export { getEntity, saveEntity }