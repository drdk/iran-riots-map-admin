const Parcel = require('parcel-bundler');
const fs = require('fs-extra');

const config = require('./config');
const pathArray = __dirname.split('/');
const folderName = pathArray[pathArray.length - 1];

const watcher = require('glob-watcher');

const replace = require('replace-in-file');

const htmlDevReplaceOptions = {
    files: './dev/index.html',
    from: [/https:\/\/www\.dr\.dk\/assets\/fonts\//g, /https:\/\/www\.dr\.dk\/global\//g],
    to: ['local-fonts/', './']
};

let type, vars, cssPathToDeployOptions, basePath;



const init = () => {
    if (process.argv.indexOf("-t") != -1) { //does our flag exist?
        type = process.argv[process.argv.indexOf("-t") + 1]; //grab the next item
    }
    vars = config[type];
    vars.OUT_DIR = (type === 'dev') ? 'dev' : 'workspace/output';

    for (let a in vars.global) {
        process.env[a] = vars.global[a];
    }

    cssPathToDeployOptions = {
        files: './src/styles/global.scss',
        from: 'http://localhost:1234/assets/',
        to: vars.global.ASSETS_PATH
    }

    cssPathFromDeployOptions = {
        files: './src/styles/global.scss',
        from: vars.global.ASSETS_PATH,
        to: 'http://localhost:1234/assets/'
    }



    if (type === 'dev') {
        dev();
    } else {
        build();
    }
}

const build = () => {



    console.log('Pakker ...');
    return new Promise((resolve, reject) => {
        fs.emptyDirSync(vars.OUT_DIR);
        replace(cssPathToDeployOptions);

        const parcel = new Parcel(
            ['./src/script/index.html', './src/script/index.js'],
            {
                outDir: vars.OUT_DIR,
                watch: false,
                contentHash: false,
                publicUrl: vars.BASE_URL,
                minify: vars.MINIFY
            });
        parcel.on('bundled', (bundle) => {
            replace(cssPathFromDeployOptions);
            resolve('pakkerne')
        });
        parcel.on('buildError', (err) => {
            replace(cssPathFromDeployOptions);
            reject(err);
        });
        // reject('Oops');
        parcel.bundle();
    }).then((result) => {

        console.log('Sætter base_url ... ');
        setBaseUrl(vars)

        console.log('Kopierer ... ');
        fs.copySync('./src/assets', vars.OUT_DIR + '/assets', { overwrite: true });

        console.log('Test URL:\n' + vars.BASE_URL + folderName);
    }
    ), (err) => {
        console.log(err);
    }


}
const dev = () => {
    // console.log('dev', process.env.TYPE);
    const parcel = new Parcel(
        ['./src/script/index.html', '../assets/**/*'],
        {
            outDir: './dev'
        }
    );
    fs.copy('./src/assets', './dev/assets', { overwrite: true });
    fs.copy('./src/styles/publik.css', './dev/publik.css', { overwrite: true });
    fs.copy('./src/local-fonts', './dev/local-fonts', { overwrite: true });

    watcher('./src/assets/**/*.*', (watchdone) => {
        // console.log('watch triggered')
        fs.emptyDirSync('./dev/assets');
        fs.copy('./src/assets', './dev/assets', { overwrite: true });
        parcel.hmr.broadcast({
            type: 'reload'
        })
        watchdone()
    });
    parcel.bundle()
        .then(() => {
            console.log('bundled')
            replace(htmlDevReplaceOptions);
        });
    parcel.serve();
}

const setBaseUrl = (vars) => {

    const file = vars.OUT_DIR + '/index.html'

    if (vars.BASE_URL) {

        replace.sync({
            files: file,
            from: '<base href="/">',
            to: `<base href="${vars.BASE_URL}">`
        });
    } else {
        replace.sync({
            files: file,
            from: '<base href="/">',
            to: ''
        });
    }
}
init();