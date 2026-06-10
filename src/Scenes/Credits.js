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

}