
'use strict';

goog.provide('Blockly.Javascript.character');

goog.require('Blockly.Javascript');

Blockly.JavaScript['character'] = function(block) {
  var dropdown_charaters = block.getFieldValue('CHAR');
  var dropdown_actions = block.getFieldValue('ACTIONS');
  var room = null;
  if (block.previousConnection.isConnected()) {
    var surround = block.getSurroundParent()
    if (surround != null) {
      if (surround.getFieldValue("ROOMS") != null) {
        room = surround.getFieldValue("ROOMS");
      }
    }
  }



  var code = 'character("' + room + '","' + dropdown_charaters + '","' + dropdown_actions + '");\n';
  return code;
};