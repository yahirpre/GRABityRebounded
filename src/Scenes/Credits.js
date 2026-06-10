class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    init() {

    }

    preload() {
    }

    create(){

        //text
        my.text.GRABity = this.add.bitmapText(game.config.width/2, game.config.height/2 - 48,"kenneySquare", `Credits`, 64).setOrigin(0.5);
        my.text.GRABity = this.add.bitmapText(game.config.width/2, game.config.height/2 +48,"kenneySquare", `Developer`, 32).setOrigin(0.5);
        my.text.GRABity = this.add.bitmapText(game.config.width/2, game.config.height/2 + 84,"kenneySquare", `Yahir Prenger`, 28).setOrigin(0.5);

        this.drawLink("back", game.config.width/2, game.config.height/2 + 168, "startScene");

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