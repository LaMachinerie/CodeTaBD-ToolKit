'use strict';
var SpriteManager = SpriteManager || {};


goog.provide('Blockly.Blocks.room');

goog.require('Blockly.Blocks');

Blockly.Blocks.room.HUE = 180;

Blockly.Blocks['room'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Dans")
        .appendField(new Blockly.FieldDropdown([["une pièce", "default"]]), "ROOMS");
    this.appendStatementInput("CODE")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
  onchange: function(event) {
    var RoomDropdown = this.getField("ROOMS")
    RoomDropdown.menuGenerator_ = SpriteManager.getDisplayNameArray(SpriteManager.getRoomSubTree());
    if(RoomDropdown.menuGenerator_[0][1] == "default") RoomDropdown.setText("une pièce");
    else RoomDropdown.setText(RoomDropdown.menuGenerator_[0][0]);
    RoomDropdown.setValue(RoomDropdown.menuGenerator_[0][1]);
  }
};


Blockly.Blocks['light'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["allumer", "day"], ["éteindre", "night"]]), "LIGHT")
        .appendField("la lumière")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};