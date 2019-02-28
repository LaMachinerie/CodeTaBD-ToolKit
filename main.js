//Ardublockly
const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow


const path = require('path');
const url = require('url');
var DecompressZip = require('decompress-zip');

const ipc = electron.ipcMain;

const root = app.getAppPath();
const assetPath = app.getAppPath() + "/assets"
const tmpPath = app.getAppPath() + "\\tmp";
const assetBackup = app.getAppPath() + "\\backup";

var fs = require('fs');

let mainWindow

function createWindow() {
  // Create the browser window.
  //1 233 × 925
  mainWindow = new BrowserWindow({ width: 1400, height: 925, icon: root + '\\logo.ico' });
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
  })


  initIpc();
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

function initIpc() {
  ipc.on('get-json', function (event, path, flag, keyA, keyB) {
    jsonResponse = jsonManager.readJson(path);
    event.sender.send('get-json-response', JSON.stringify(jsonResponse), flag, keyA, keyB);
  });

  ipc.on('add-json-element', function (path, jsonElement) {
    jsonElement = JSON.parse(jsonElement)
    rawJson = jsonManager.readJson(path);
    newJson = rawJson;
    for (objectKey in jsonElement) {
      if (rawJson[objectKey] == null){
        rawJson[objectKey] = jsonElement[objectKey];
      }
    }
    if(newJson != rawJson){
      jsonManager.saveJson(path, newJson);
    }
  });

  ipc.on('import-image', function (event) {

    //png file path
    const { dialog } = require('electron')
    filepath = dialog.showOpenDialog({ 
      properties: ['openFile'],
      title:"Select a .png file",
      filters: [
          {name: '.png Files', extensions: ['png']},
          {name: 'All Files', extensions: ['*']}
      ] 
    });
    if(filepath != undefined)
      event.sender.send('import-image-response', filepath[0]);
    else
      event.sender.send('import-image-response', undefined);
  });

  //Import Zip File
  ipc.on('import-asset', function (event) {

    //Zip file path
    const { dialog } = require('electron')
    filepath = dialog.showOpenDialog({ 
      properties: ['openFile'],
      title:"Select a .zip file",
      filters: [
          {name: '.ZIP Files', extensions: ['zip']},
          {name: 'All Files', extensions: ['*']}
      ] 
    });
    if(filepath != undefined){
      ZipManager.unzipJson(filepath[0], function(){
        if(AssetManager.checkDirectoryTree()){
          if (fs.existsSync(assetBackup)){
            ZipManager.clearDir(assetBackup);
          }
          if (fs.existsSync(tmpPath)){
            ZipManager.clearDir(tmpPath);
          }
          if(fs.existsSync(assetPath)){
            fs.renameSync(assetPath,assetBackup);
            ZipManager.zipBackup();
          }
          ZipManager.unzip(filepath[0],function(){
            fs.renameSync(tmpPath,assetPath);
          });
        }
      })
    }
    //event.sender.send('import-asset-response', "{}");
  });
}

/***********************
*
*     JSON Manager
*
***********************/


var jsonManager = {};

jsonManager.readJson = function (path) {
  var content = null;
  spath = root + '/' + path;
  try {
    content = fs.readFileSync(spath, 'utf-8')
  } catch (error) {
    console.log(error);
  }

  json = JSON.parse(content);
  return json;
}


jsonManager.saveJson = function (path, json) {
  spath = root + '/' + path;
  try {
    fs.writeFile(spath, JSON.stringify(json), (err) => {
      if (err) throw err;
    });
  } catch (error) {
    console.log(error);
  }
}


/***********************
*
*     ZIP Manager
*
***********************/

var ZipManager = {};

ZipManager.unzipJson = function(filepath, callback){

  //Output folder
  var destination = root + '\\tmp';

  //Create directory if it doesn't exist
  if (!fs.existsSync(destination)){
      fs.mkdirSync(destination);
  }
  var unzipper = new DecompressZip(filepath);

  unzipper.on('error', function (err) {
    console.log('Caught an error', err);
  });

  unzipper.on('extract', function (log) {
    //console.log('Finished extracting', log);
    callback();
  });

  unzipper.on('progress', function (fileIndex, fileCount) {
    console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
  });

  unzipper.extract({
    path: destination,
    filter: function (file) {
      //console.log(file);
      return file.filename == "tree.json";
    }
  });
}

ZipManager.unzip = function(filepath, callback){
  //Output folder
  var destination = root + '\\tmp';

  //Create directory if it doesn't exist
  if (!fs.existsSync(destination)){
      fs.mkdirSync(destination);
  }

  var unzipper = new DecompressZip(filepath);

  unzipper.on('error', function (err) {
    console.log('Caught an error', err);
  });

  unzipper.on('extract', function (log) {
    //console.log('Finished extracting', log);
    callback();
  });

  unzipper.on('progress', function (fileIndex, fileCount) {
    console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
  });

  unzipper.extract({
    path: destination
  });
}

ZipManager.clearDir = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        ZipManager.clearDir(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
  }
  fs.rmdirSync(path);
};

ZipManager.zipBackup = function(){
  var archiver = require('archiver');

  var output = fs.createWriteStream(root + '/backup.zip');
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function(err){
      throw err;
  });

  archive.pipe(output);
  archive.directory(assetBackup + '/', false);
  archive.finalize();
  ZipManager.clearDir(assetBackup);
}

ZipManager.zipAsset = function(){
  var archiver = require('archiver');

  var output = fs.createWriteStream(root + '/assets.zip');
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function(err){
      throw err;
  });

  archive.pipe(output);
  archive.directory(assetPath + '/',false);
  archive.finalize();
}

/***********************
*
*     Asset Manager
*
***********************/

AssetManager = {};


AssetManager.checkDirectoryTree = function(assetPath){
  return true
}