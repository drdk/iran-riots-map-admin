let config = {
    dev: {
        global:{
            TYPE:'Local development',
            DEBUGGING:true,
            ASSETS_PATH: './assets/'
        }
    },
    preprod: {
        global:{
            TYPE:'Staging',
            DEBUGGING:true,
            ASSETS_PATH: 'https://preprod.dr.dk/feature/iran-riots-map-admin/assets/',
         },
        MINIFY:false,
        BASE_URL:'https://preprod.dr.dk/feature/iran-riots-map-admin/',
    },
    prod: {
        global:{
            TYPE:'Production',
            DEBUGGING:false,
            ASSETS_PATH: 'https://www.dr.dk/feature/iran-riots-map-admin/assets/',
        },
        MINIFY:true,
        BASE_URL: 'https://www.dr.dk/feature/iran-riots-map-admin/',
    }
}
module.exports = config;