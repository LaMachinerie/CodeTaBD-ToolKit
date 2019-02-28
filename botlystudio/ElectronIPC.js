'use strict';


/** Create a name space for the application. */
var ElectronIPC = {};
const electron = require('electron');


const ipc = electron.ipcRenderer;


ElectronIPC.pendingRequest = 0;

ElectronIPC.initIPC = function () {
  ipc.on('get-json-response', function (event, json_str, flag, roomKey, characterKey) {
    ElectronIPC.pendingRequest --;
    var json = JSON.parse(json_str);
    if (json != null) {
      switch (flag) {
        case 'root':
          SpriteManager.processRootJson(json);
          break;
        case 'room':
          SpriteManager.processRoomJson(json, roomKey);
          break;
        case 'character':
          SpriteManager.processCharacterJson(json, roomKey);
          break;
        case 'background':
          SpriteManager.processBackgroundJson(json, roomKey);
          break;
        case 'actions':
          SpriteManager.processActionsJson(json, roomKey, characterKey);
          break;
        default :
          console.log("Unknown flag : " + flag);
      }
    }
    if(ElectronIPC.pendingRequest <= 0){
      ElectronIPC.pendingRequest = 0;
      SpriteManager.saveTree();
    }
  });

  ipc.on('import-image-response', function (event, filepath) {
    if(filepath != undefined)
      document.getElementById("sprite_filename").innerHTML = filepath;
    else
      document.getElementById("sprite_filename").innerHTML = "Aucun fichier";
  });

}



ElectronIPC.getJson = function (path, flag, keyA, keyB) {
  ipc.send('get-json', path, flag, keyA, keyB);
  ElectronIPC.pendingRequest ++;
};

ElectronIPC.addJsonElement = function (path, jsonElement) {
  ipc.send('add-json-element', path, flag, keyA, keyB);
};

ElectronIPC.importAsset = function (path) {
  ipc.send('import-asset', path);
};

ElectronIPC.importImage = function (path) {
  ipc.send('import-image', path);
};



ElectronIPC.addNewRoom = function (path, text, newKey) {
  ipc.send('add-room', path, text, newKey, day);
};

ElectronIPC.addNewObject= function (path, text, newKey, roomKey) {
  ipc.send('add-object', path, text, newKey, roomKey);
};

ElectronIPC.addNewCharacter = function (text, newKey, roomKey) {
  ipc.send('add-character', text, newKey, roomKey);
};

ElectronIPC.addNewAction = function (path, text, newKey, roomKey, characterKey) {
  ipc.send('add-action', path, text, newKey, roomKey, characterKey);
};




















ElectronIPC.createElementFromJson = function (json_data) {
  var parsed_json = JSON.parse(json_data);
  var element = null;

  if (parsed_json.element == 'text_input') {
    // Simple text input
    element = document.createElement('input');
    element.setAttribute('type', 'text');
    element.setAttribute('value', parsed_json.display_text);
  } else if (parsed_json.element == 'dropdown') {
    // Drop down list of unknown length with a selected item
    element = document.createElement('select');
    element.name = parsed_json.response_type;
    for (var i = 0; i < parsed_json.options.length; i++) {
      var option = document.createElement('option');
      option.value = parsed_json.options[i].value;
      option.text = parsed_json.options[i].display_text;
      // Check selected option and mark it
      if (parsed_json.options[i].value == parsed_json.selected) {
        option.selected = true;
      }
      element.appendChild(option);
    }
  } else if (parsed_json.element == 'div_ide_output') {
    // Formatted text for the Arduino IDE CLI output
    var el_title = document.createElement('h4');
    el_title.innerHTML = BotlyStudio.getLocalStr(parsed_json.conclusion);
    if (parsed_json.success == true) {
      el_title.className = 'arduino_dialog_success';
    } else {
      el_title.className = 'arduino_dialog_failure';
    }

    var el_out = document.createElement('span');
    el_out.className = 'arduino_dialog_out';
    // If larger than 50 characters then don't bother looking for language key
    if (parsed_json.output.length < 50) {
      el_out.innerHTML = BotlyStudio.getLocalStr(parsed_json.output) ||
        parsed_json.output.split('\n').join('<br />');
    } else {
      el_out.innerHTML = parsed_json.output.split('\n').join('<br />');
    }

    element = document.createElement('div');
    element.appendChild(el_title);
    element.appendChild(el_out);

    // Only ouput error message if it was not successful
    if (parsed_json.success == false) {
      var el_err = document.createElement('span');
      el_err.className = 'arduino_dialog_out_error';
      // If larger than 50 characters then don't bother looking for language key
      if (parsed_json.output.length < 50) {
        el_err.innerHTML = BotlyStudio.getLocalStr(parsed_json.error_output) ||
          parsed_json.error_output.split('\n').join('<br />');
      } else {
        el_err.innerHTML = parsed_json.error_output.split('\n').join('<br />');
      }
      element.appendChild(el_err);
    }
  } else {
    //TODO: Not recognised, alert the user/developer somehow
  }

  return element;
};
