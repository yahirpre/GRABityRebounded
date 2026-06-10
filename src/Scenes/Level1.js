class Level1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 700;
        this.DRAG = 2000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000; 
        this.gravityFlipped = false;
        this.JUMP_VELOCITY = -700; 
        this.MAX_SPEED = 200;
        this.TERMINAL_VELOCITY = 400;
        this.SPAWN_X = 80;
        this.SPAWN_Y = 600;
        this.flipAbility = true; //flipAbility indicates if players are able to flip gravity
        this.lives = 3;
        this.gameRunning = true;
        this.canDoubleJump = true;
        this.levelCompleted = false;

        this.text = {};
    }

    preload() {
        // Load the animated tiles plugin
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        //set volume
        this.sound.setVolume(0.25);

        //draws all the layers on the layer's tilemap
       this.createMap();

       //make all the objects like gems/spikes etc.
       this.createObjects();

        // Make layers collidable
        this.platformLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.SPAWN_X, this.SPAWN_Y, "idle").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        //set world bounds
        this.physics.world.setBounds(0, -50, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE + 100);

        //set max velocity
        my.sprite.player.setMaxVelocity(this.MAX_SPEED, 10000);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.platformLayer);

        //set up camera
        this.createCamera();

        this.physics.world.drawDebug = false;
        this.physics.world.debugGraphic.clear();

        //make the keys and pointer inputs + callback functions
        this.createInput();

        //particles
        this.createParticles();

        this.createOverlap();

        this.createTextUI();

        this.animatedTiles.init(this.map);

    }

    //TODO:
    //sound effects
    //particles
    update(){
        if(this.gameRunning){
            this.handleInput();

            //check is no lives left
            if(this.lives < 0){
                this.sound.play("gameOver");
                this.endScreen("Game Over!", 3, this.scene.key)
            }

            //checks if player out of bounds
            this.handleOutOfBounds();

            //level complete
            if(this.grabbedGems == this.totalGems && !this.levelCompleted){
                this.levelCompleted = true; //prevents this block from being executed more than once
                levelLocked["2"] = false; //unlock level 2
                this.time.delayedCall(2000, () => {
                    this.sound.play("levelComplete");
                    this.endScreen("Level Completed!", 3, "selectionScene");
                })
            }

            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!this.playerBlocked()) {
                my.sprite.player.anims.play('jump');
            }
            if(this.playerBlocked() && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                // set a Y velocity to have the player "jump" upwards (negative Y direction)
                this.jumpVFX.start();
                my.sprite.player.setVelocityY(this.JUMP_VELOCITY);
                this.sound.play("jump");

            }
            //check if player canDoubleJump
            else if(this.canDoubleJump && Phaser.Input.Keyboard.JustDown(this.spaceKey)){
                this.jumpVFX.start();
                my.sprite.player.setVelocityY(this.JUMP_VELOCITY);
                this.canDoubleJump = false; //player has double jumped, set false now
                this.sound.play("jump");
            }

            //handle walkVFX
            if(this.playerBlocked() && my.sprite.player.body.velocity.x > 0){ //if on the ground AND moving
                this.walkVFX.start();
            }
            else{
                this.walkVFX.stop();
            }

            //handle TERMINAL_VELOCITY
            this.handleTerminalVelocity();
            
            //check if player is blocked, if so, reset flipAbility and canDoubleJump
            if(this.playerBlocked()){
                this.flipAbility = true;
                this.canDoubleJump = true;
            }
        }
    }

    flipGravity(){
        this.gravityFlipped = !this.gravityFlipped; //toggle gravityFlipped boolean

        this.physics.world.gravity.y *= -1; //flip gravity
        this.JUMP_VELOCITY *= -1; //flip jump velocity

        //start flipVFX
        if(this.gravityFlipped) this.flipUpVFX.start();
        else this.flipDownVFX.start();
        

        my.sprite.player.toggleFlipY(); //flip player sprite
    }

    playerDead(){

        //play sound if not the final death (lives > 0)
        if(this.lives > 0) this.sound.play("death",{
            rate: 1.5
        });

        //play deathVFX
        this.deathVFX.explode(50, my.sprite.player.x, my.sprite.player.y);

        this.lives--; //decrement lives
        my.text.lives.setText(`Lives: ${this.lives}`); //update text

        //reset player
        my.sprite.player.setPosition(80,400);
        my.sprite.player.setVelocity(0);

        //reset gravity
        if(this.gravityFlipped){
            this.flipGravity();
        }
    }

    //checks if the players foot is blocked
    playerBlocked(){

        //if gravity flipped, return blocked.up
        if(this.gravityFlipped){
            return my.sprite.player.body.blocked.up;
        }
        return my.sprite.player.body.blocked.down;
    }

    //text: text that will be displayed on screen 
    //time: time (in secs) until the scene restarts
    //target: the next scene after end
    endScreen(text, time, target){
        this.gameRunning = false;

        //prevent movement
        this.physics.world.gravity.y = 0; 
        my.sprite.player.setAcceleration(0);
        my.sprite.player.setVelocity(0);

        //draw black background (cover everything)
        let graphics = this.add.graphics();
        graphics.fillStyle(0x000000,1);
        graphics.fillRect(0,0,this.map.widthInPixels*SCALE,this.map.heightInPixels*SCALE);

        //my.sprite.blackoutScreen.setDepth(100); //set in front of everything
        my.text.gameOver = this.add.bitmapText(game.config.width/2, game.config.height/2,"kenneySquare", text).setOrigin(0.5);
        my.text.gameOver.setScrollFactor(0);
        this.time.delayedCall(time*1000, () =>{this.scene.start(target);}, [], this);
    }

    //draws the layers from the tilemap
    createMap(){
        // Create a new tilemap game object which uses 16x16 pixel tiles, and is
        // 60 tiles wide and 15 tiles tall.
        this.map = this.add.tilemap("level-1", 16, 16, 60, 15);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_transparent_packed", "tilemap_tiles");
        this.tilesetBlack = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap_tiles_black");

        //BACKGROUNDS
        // this.bg1Layer = this.map.createLayer("Background1", this.tileset, 0, 0);
        // this.bg1Layer.setScale(SCALE);
        // this.bg1Layer.setAlpha(0.25);
        // this.bg1Layer.setScrollFactor(0.25); //parallax effect

        this.bg1Layer = this.createTileLayer("Background1", this.tilesetBlack, 0.33, 0.5);

        this.platformLayer = this.createTileLayer("Platforms", this.tilesetBlack);

        //this.decorLayer = this.createTileLayer("Decor", this.tileset);
    }
    //returns a set-up tile layer from tilemap using the name and the tileset used
    createTileLayer(name, tileset, alpha = 1, scrollFactor = 1){

        let layer = this.map.createLayer(name, tileset, 0, 0);
        layer.setScale(SCALE);
        layer.setAlpha(alpha);
        layer.setScrollFactor(scrollFactor); //parallax effect

        return layer;
    }

    //set up camera
    createCamera(){
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels*SCALE, this.map.heightInPixels*SCALE);
        this.cameras.main.startFollow(my.sprite.player, true, 0.1, 0);
    }

    //sets up and creates any in game objects like gems and spikes
    createObjects(){
        //make gems
        this.gems = this.map.createFromObjects("Gems", {
            name: "Gem",
            key: "tilemap_sheet",
            frame: 82
        });
        this.physics.world.enable(this.gems, Phaser.Physics.Arcade.STATIC_BODY);
        //scale up and reposition
        this.gems.forEach(gem => {
            gem.setScale(SCALE);

            // scale position to match scaled map
            gem.x *= SCALE;
            gem.y *= SCALE;

            gem.body.updateFromGameObject();
        });
        this.gemGroup = this.add.group(this.gems);
        this.totalGems = this.gemGroup.getLength();
        this.grabbedGems = 0;
        //animations for gems
        this.anims.create({
            key: 'gemAnim', // Animation key
            frames: this.anims.generateFrameNumbers('tilemap_sheet', 
                {
                    prefix: '',
                    suffix: '',
                    zeroPad: 0,
                    frames: [82,62]
                    // outputArray: [], // Append frames into this array
                }),
            frameRate: 3,  // Higher is faster
            repeat: -1      // Loop the animation indefinitely
        });
        this.anims.play('gemAnim', this.gems);

        //make Spikes
        this.spikes = this.map.createFromObjects("Spikes", {
            name: "Spike",
            key: "tilemap_sheet", 
            frame: 166
        });
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        //scale up and reposition
        this.spikes.forEach(spike => {
            spike.setScale(SCALE);

            // scale position to match scaled map
            spike.x *= SCALE;
            spike.y *= SCALE;
            spike.body.updateFromGameObject();

            //scale down hitbox
            spike.body.setSize(spike.width*SCALE*0.5, spike.height*SCALE*0.5, true);
            spike.body.setOffset(4*SCALE,4*SCALE);
        });

        this.spikeGroup = this.add.group(this.spikes);
    }

    //initiates the various particles for the scene like jump particles and walking particles
    createParticles(){
        this.jumpVFX = this.add.particles(0, 0, "circleParticle", {
            frame: 0,
            blendMode: 'ADD', 
            radial: true,
            angle: {min: 0, max: 180},
            scale: {start: 0.2, end: 0.1},
            frequency: 1,
            maxAliveParticles: 10,
            lifespan: {min: 300, max: 500},
            speed: {min: 40, max: 60},
            alpha: {start: 1, end: 0.5}, 
            duration: 100
        });
        this.jumpVFX.stop();

        this.walkVFX = this.add.particles(0, 0, "circleParticle", {
            speed:      20,
            lifespan:   1000,
            scale:      { start: 0.15, end: 0.05 },
            alpha:      { start: 1.0, end: 0.5 },
            frequency:  100,                        
            emitting:   false,                      
            blendMode:  "ADD"
        });

        this.gemVFX = this.add.particles(0, 0, "starParticle", {
            frame: 0,
            blendMode: 'ADD',
            random: true,
            radial: true,
            angle: {min: 0, max: 360},
            scale: 0.1,
            frequency: 1,
            maxAliveParticles: 10,
            lifespan: 500,
            speed: 100,
            alpha: {start: 0.75, end: 0}, 
            duration: 100
        });
        this.gemVFX.stop();

        this.flipDownVFX = this.add.particles(0, 0, "circleParticle", {
            frame: 0,
            blendMode: 'ADD',
            radial: true,
            angle: 90,
            scale: {start: 0.2, end: 0.05},
            frequency: 50,
            lifespan: 500,
            speed: 1000,
            alpha: 1,
            duration: 300
        });
        this.flipDownVFX.stop();

        this.flipUpVFX = this.add.particles(0, 0, "circleParticle", {
            frame: 0,
            blendMode: 'ADD',
            radial: true,
            angle: -90,
            scale: {start: 0.2, end: 0.05},
            frequency: 50,
            lifespan: 500,
            speed: 1000,
            alpha: 1,
            duration: 300
        });
        this.flipUpVFX.stop();

        this.deathVFX = this.add.particles(0, 0, "circleParticle", {
            frame: 0,
            blendMode: 'ADD', 
            radial: true,
            angle: {min: 45, max: 135},
            scale: {start: 0.3, end: 0.1},
            frequency: 20,
            maxAliveParticles: 20,
            lifespan: {min: 500, max: 1000},
            speed: {min: 100, max: 200},
            gravityY: 500,
            alpha: {start: 1, end: 0.5}, 
            duration: 500
        });

        this.deathVFX.stop();

        //set to follow player
        this.jumpVFX.startFollow(my.sprite.player, 0, 0, false);
        this.walkVFX.startFollow(my.sprite.player, 0, 0, false);
        this.flipDownVFX.startFollow(my.sprite.player, 0, 0, false);
        this.flipUpVFX.startFollow(my.sprite.player, 0, 0, false);
    }

    //create the input keys and listeners for the scene
    createInput(){
        //keys
        this.AKey = this.input.keyboard.addKey("A"); //left
        this.DKey = this.input.keyboard.addKey("D"); //right
        this.RKey = this.input.keyboard.addKey("R"); //restart scene
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); //jump
        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC); //level select

        // debug key listener (assigned to Q key)
        this.input.keyboard.on('keydown-Q', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);
        this.physics.world.debugGraphic.clear();

        //on mouse down, flip gravity if adble to
        this.input.on('pointerdown', function (pointer)
        {
            if(this.flipAbility){
                this.sound.play("flip");
                this.flipGravity();
                this.flipAbility = false;
            }


        }, this);
    }

    //sets up the player-object overlaps and what to do during overlaps
    createOverlap(){
        //add gem overlap
        this.physics.add.overlap(my.sprite.player, this.gemGroup, (player, gem) => {
            this.grabbedGems++; //increment grabbedGems
            //update text
            my.text.gemCount.setText(`Gems: ${this.grabbedGems} / ${this.totalGems}`);
            this.sound.play("gemGrab");
            this.gemVFX.explode(10, gem.x, gem.y);
            gem.destroy(); // remove gem on overlap
        });

        //add spike overlap
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            this.playerDead();
        });
    }

    //draws the text UI on screen
    createTextUI(){
        //text
        my.text.gemCount = this.add.bitmapText(10, 10 ,"kenneySquare", `Gems: ${this.grabbedGems} / ${this.totalGems}`);
        my.text.gemCount.setScrollFactor(0); //stops text from scrolling
        my.text.lives = this.add.bitmapText(10, 40 ,"kenneySquare", `Lives: ${this.lives}`);
        my.text.lives.setScrollFactor(0); //stops text from scrolling

    }

    //handles player inputs for keys
    handleInput(){
        if(this.AKey.isDown){
                //have the player accelerate to the left
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
                
                my.sprite.player.setFlipX(true);
                my.sprite.player.anims.play('walk', true);
                this.walkVFX.start();

            } else if(this.DKey.isDown) {
                // have the player accelerate to the right
                my.sprite.player.setAccelerationX(this.ACCELERATION);

                my.sprite.player.setFlipX(false);
                my.sprite.player.anims.play('walk', true);
                this.walkVFX.start();

            } else {
                // set acceleration to 0 and have DRAG take over
                my.sprite.player.setAccelerationX(0);
                my.sprite.player.setDragX(this.DRAG);
                
                my.sprite.player.anims.play('idle');
                this.walkVFX.stop();
            }

            if(this.escapeKey.isDown){
                //go to level selection screen
                this.scene.start("selectionScene");
            }

            //restart scene
            if(Phaser.Input.Keyboard.JustDown(this.RKey)){
                this.endScreen("Restarting!", 1, this.scene.key);
            }
    }

    //makes sure player doesnt go past terminal velocity
    handleTerminalVelocity(){
        //handle TERMINAL_VELOCITY
        if(!this.gravityFlipped && my.sprite.player.body.velocity.y > this.TERMINAL_VELOCITY){
            my.sprite.player.setVelocityY(this.TERMINAL_VELOCITY);
        }
        else if(this.gravityFlipped && my.sprite.player.body.velocity.y < -this.TERMINAL_VELOCITY){
            my.sprite.player.setVelocityY(-this.TERMINAL_VELOCITY);
        }
    }

    //checks if player is out of bounds and then kills them if so
    handleOutOfBounds(){
            //if player out of bounds
            if(my.sprite.player.y > this.map.heightInPixels*SCALE + my.sprite.player.displayHeight/2
                || my.sprite.player.y < -my.sprite.player.displayHeight/2
            ){
                this.playerDead();
            }
    }

}