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

        //make particles
        this.createParticles();

        //start particles if player has completed the game
        if(gameCompleted) this.confettiVFX.start();
    }

    update(){
        
    }
    //text: the text to be drawn
    //x, y: integers representing the x and y position for the text
    // target: the key for the target scene
    drawLink(text, x, y, target){
        my.text[text] = this.add.bitmapText(x, y,"kenneySquare", text, 24).setOrigin(0.5);
        my.text[text].setInteractive();

        //on click, go to target
        my.text[text].on('pointerup', (pointer) =>{
            this.scene.start(target);
            this.sound.play("jump");
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
    
    //levelnum: a string with one characted representing the level number i.e. "2" for level 2
    //x, y: integers representing the x and y position for the text
    // target: the key for the target scene
    drawLevelLink(levelNum, x, y, target){
        let text = levelLocked[levelNum] ? `Level ${levelNum} (locked)` : `Level ${levelNum}`;
        my.text[text] = this.add.bitmapText(x, y,"kenneySquare", text, 24).setOrigin(0.5);
        my.text[text].setInteractive();

        //on click, go to target level
        my.text[text].on('pointerup', (pointer) =>{
            //only go to target level if level isn't locked
            if(!levelLocked[levelNum]){
                this.sound.play("jump");
                this.scene.start(target);
            }
            else{

            }
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

        //makes confetti particles
    createParticles(){

        this.confettiVFX = this.add.particles(0, 0, "starParticle", {
            frame: 0,
            blendMode: 'ADD', 
            radial: true,
            x: {min: 0, max: game.config.width},
            angle: 90,
            scale: {start: 0.1, end: 0.01},
            frequency: 50,
            lifespan: {min: 1000, max: 3000},
            speed: 100,
            gravityY: 300,
            alpha: {start: 1, end: 0.5},
            emitting: false
        });
    }

}