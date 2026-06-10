class Selection extends Phaser.Scene {
    constructor() {
        super("selectionScene");
    }

    init() {

    }

    preload() {
    }

    create() {
        this.sound.setVolume(0.25);
       
        //keys
        this.AKey = this.input.keyboard.addKey("A"); //left
        this.DKey = this.input.keyboard.addKey("D"); //right
        this.RKey = this.input.keyboard.addKey("R"); //restart scene
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); //jump


        //text
        my.text.Levels = this.add.bitmapText(game.config.width/2, game.config.height/2 - 48,"kenneySquare", "Level Selection", 48).setOrigin(0.5);

        this.drawLevelLink("1", game.config.width/2, game.config.height/2 + 96, "level1Scene");
        this.drawLevelLink("2", game.config.width/2, game.config.height/2 + 120, "level2Scene");
        this.drawLink("back", game.config.width/2, game.config.height/2 + 144, "startScene");

    }

    update(){
        
    }

    drawLink(text, x, y, target){
        my.text[text] = this.add.bitmapText(x, y,"kenneySquare", text, 24).setOrigin(0.5);
        my.text[text].setInteractive();

        //on click, go to target
        my.text[text].on('pointerup', (pointer) =>{
            this.scene.start(target);
        });

        //on hover, darken text
        my.text[text].on('pointerover', (pointer) =>{
            my.text[text].setAlpha(0.5);
        });

        //on unhover, reset text
        my.text[text].on('pointerout', (pointer) =>{
            my.text[text].setAlpha(1);
        });
    }
    
    drawLevelLink(levelNum, x, y, target){
        let text = levelLocked[levelNum] ? `Level ${levelNum} (locked)` : `Level ${levelNum}`;
        my.text[text] = this.add.bitmapText(x, y,"kenneySquare", text, 24).setOrigin(0.5);
        my.text[text].setInteractive();

        //on click, go to target
        my.text[text].on('pointerup', (pointer) =>{
            this.scene.start(target);
        });

        //on hover, darken text
        my.text[text].on('pointerover', (pointer) =>{
            my.text[text].setAlpha(0.5);
        });

        //on unhover, reset text
        my.text[text].on('pointerout', (pointer) =>{
            my.text[text].setAlpha(1);
        });
    }

}