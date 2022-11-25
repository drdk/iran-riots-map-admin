# parceljs-boilerplate
### Project boilerplate for small and midsize projects.

Bundles with Parceljs both for development and deploy.
Javascript (ES6) and css (SASS) bundled separately.
Distributes with pure Nodejs. (node -v 10.11.0)

### Scripts:
```ruby
npm run dev
# Bundles to dev directory and starts watching for changes, 
# serving ./src/script/index.html via http://localhost:1234 from ./dev directory

npm run stage
# Bundles to ./stage directory and copies unminified bundles to mounted folder 
# defined in config.js -> config.stage.DEPLOY_FOLDER

npm run deploy
# Bundles to ./dist directory and copies minified and logging-stripped bundles to mounted folder 
# defined in config.js -> config.deploy.DEPLOY_FOLDER
```
#### Settings:
The 'config' object in config.js controls where the 3 different scripts output their files and wether you want a warning when overwriting existing folders (OVERWRITE_CONFIRM) ot not.

You can also choose to minify the staging and deploy bundles or not by setting MINIFY.

Each script type (dev/stage/deploy) has a 'global' object where you can set global variables. These are added to 'process.env' in the bundling process meaning they can be accessed in all js files in the project. In the boilerplate example you can this way set different values in 'ASSET_PATH' which is then available differently in dev, stage and deploy as process.env.ASSETS_PATH.

./src/styles/global.scss holds a variable ($assetpath) that points to the localhost of the dev server, but is replaced in stage and deploy builds with the corresponding global ASSETS_PATH. This can be used for CSS background images placed in ./src/assets/images that are copied along in the build script.

The deploy and stage config objects have a WEBDOK parameter that controls if the build should include a copy of ./src/webdok.html to be used by Dokmaster articles. If set to TRUE, the file is copied to the corresponding output folder and the paths to css and js files are changed to the proper online paths (BASE_URL + foldername).
If the entry point div is changed in index.html it should also be changed in webdok.html if needed.