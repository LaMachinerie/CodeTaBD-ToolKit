
'use strict';

goog.provide('Blockly.Javascript.room');

goog.require('Blockly.Javascript');

Blockly.JavaScript['room'] = function (block) {
  var dropdown_rooms = block.getFieldValue('ROOMS');
  var statements_code = Blockly.JavaScript.statementToCode(block, 'CODE');
  var code = 'room("' + dropdown_rooms + '", "day");\n';
  code += statements_code + '\n';
  return code;
};


Blockly.JavaScript['light'] = function (block) {
  var room = null;
  if (block.previousConnection.isConnected()) {
    var surround = block.getSurroundParent()
    if (surround != null) {
      if (surround.getFieldValue("ROOMS") != null) {
        room = surround.getFieldValue("ROOMS");
      }
    }
  }

  var dropdown_light = block.getFieldValue('LIGHT');

  var code = 'room("' + room + '", "' + dropdown_light + '");\n'
  return code;
};