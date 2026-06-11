// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    //CANVAS SIZE (W * H): 20 TILES * 15
    width: 20 * 16 * 3, //SCALE = 3
    height: 15 * 16 * 3,
    scene: [Load, Start, Credits, Selection, Level1, Level2, Level3]
}

var cursors;
const SCALE = 3.0;
var my = {sprite: {}, text: {}};

//map that holds the level number as the key and a boolean representing if it is locked
var levelLocked = {
    "1": false,
    "2": true,
    "3": true
}

var gameCompleted = false;

const game = new Phaser.Game(config);