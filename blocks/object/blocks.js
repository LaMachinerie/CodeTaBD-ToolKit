'use strict';
var SpriteManager = SpriteManager || {};


goog.provide('Blockly.Blocks.object');

goog.require('Blockly.Blocks');

Blockly.Blocks.object.HUE = 180;


Blockly.Blocks['object'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Afficher")
        .appendField(new Blockly.FieldDropdown([["vase", "VALUE"], ["WIP", "VALUE"]]), "OBJ")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};