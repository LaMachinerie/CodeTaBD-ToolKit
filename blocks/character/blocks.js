'use strict';
var SpriteManager = SpriteManager || {};
var BotlyStudio = BotlyStudio || {};

goog.provide('Blockly.Blocks.character');

goog.require('Blockly.Blocks');

Blockly.Blocks.character.HUE = 180;

Blockly.Blocks['character'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Afficher")
        .appendField(new Blockly.FieldDropdown([["Quelqu'un", "default"]]), "CHAR")
        .appendField("qui")
        .appendField(new Blockly.FieldDropdown([["fait quelque chose", "default"]]), "ACTIONS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(345);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
  onchange: function(event) {
    var surround = this.getSurroundParent()
    var selectedBlock = BotlyStudio.workspace.getBlockById(Blockly.selected.id);
    if(event.type == Blockly.Events.MOVE && selectedBlock == this && !BotlyStudio.leftMouse && surround != this.oldSurround){
      console.log(event);
      if(this.previousConnection.isConnected()){
        if(surround != null){
          if(surround.getFieldValue("ROOMS") != null){
            var room = surround.getFieldValue("ROOMS");
            this.oldSurround = surround;
            setDropdown(room, this);
            return;
          }
        }
      }
      resetDropdown(this);
    }else if(event.type == Blockly.Events.CHANGE && event.element == 'field' && event.name == 'CHAR' && selectedBlock == this){
      if(this.previousConnection.isConnected()){
        var surround = this.getSurroundParent()
        if(surround != null){
          if(surround.getFieldValue("ROOMS") != null){
            var room = surround.getFieldValue("ROOMS");
            changeDropdown(room, this)
            return;
          }
        }
      }
    }else if(event.type == Blockly.Events.CHANGE && event.element == 'field' && event.name == 'ROOMS'){
      if(this.previousConnection.isConnected()){
        var surround = this.getSurroundParent()
        if(surround != null){
          if(surround.getFieldValue("ROOMS") != null){
            var room = surround.getFieldValue("ROOMS");
            setDropdown(room, this);
            return;
          }
        }
      }
    }
  }
};



function setDropdown(room, block){
  var CharacterDropdown = block.getField("CHAR")
  CharacterDropdown.menuGenerator_ = SpriteManager.getDisplayNameArray(SpriteManager.getCharacterSubTree(room));
  if(CharacterDropdown.menuGenerator_[0][1] == "default") CharacterDropdown.setText("Quelqu'un");
  else CharacterDropdown.setText(CharacterDropdown.menuGenerator_[0][0]);
  CharacterDropdown.setValue(CharacterDropdown.menuGenerator_[0][1]);

  var char = block.getFieldValue("CHAR");
  var actionsDropdown = block.getField('ACTIONS');
  actionsDropdown.menuGenerator_ = SpriteManager.getDisplayNameArray(SpriteManager.getActionsSubTree(room, char));
  if(actionsDropdown.menuGenerator_[0][1] == "default") actionsDropdown.setText("fait quelque chose");
  else actionsDropdown.setText(actionsDropdown.menuGenerator_[0][0]);
  actionsDropdown.setValue(actionsDropdown.menuGenerator_[0][1]);
}

function changeDropdown(room, block){
  var char = block.getFieldValue("CHAR");
  var actionsDrop = block.getField('ACTIONS');
  actionsDrop.menuGenerator_ = SpriteManager.getDisplayNameArray(SpriteManager.getActionsSubTree(room, char));
  actionsDrop.setText(actionsDrop.menuGenerator_[0][0]);
  actionsDrop.setValue(actionsDrop.menuGenerator_[0][1]);
}

function resetDropdown(block){
  var CharacterDropdown = block.getField("CHAR")
  CharacterDropdown.menuGenerator_ = SpriteManager.getDisplayNameArray(SpriteManager.getCharacterSubTree());
  CharacterDropdown.setText(CharacterDropdown.menuGenerator_[0][0]);
  CharacterDropdown.setValue(CharacterDropdown.menuGenerator_[0][1]);

  var actionsDropdown = block.getField('ACTIONS');
  actionsDropdown.menuGenerator_ = SpriteManager.getDisplayNameArray(SpriteManager.getActionsSubTree());
  actionsDropdown.setText(actionsDropdown.menuGenerator_[0][0]);
  actionsDropdown.setValue(actionsDropdown.menuGenerator_[0][1]);

  block.oldSurround = null;
}
