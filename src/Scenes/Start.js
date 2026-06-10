class Start extends Phaser.Scene {
    constructor() {
        super("startScene");
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
        my.text.GRABity = this.add.bitmapText(game.config.width/2, game.config.height/2 - 48,"kenneySquare", `GRABity!`, 64).setOrigin(0.5);
        my.text.GRABity = this.add.bitmapText(game.config.width/2, game.config.height/2,"kenneySquare", `Rebounded`, 32).setOrigin(0.5);

        this.drawLink("levels", game.config.width/2, game.config.height/2 + 96, "selectionScene");
        this.drawLink("credits", game.config.width/2, game.config.height/2 + 120, "creditsScene");

    }

    update(){
        
    }

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