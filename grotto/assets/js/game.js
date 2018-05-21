// v1.0.0 (c)2018 ssatou0404 https://github.com/ssatou0404
var game;
var gameOptions = {
    gameWidth: 416,
    gameHeight: 234,
    gameScore: 0
}
window.onload = function() {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight, Phaser.AUTO, '');
    game.state.add('boot', boot);
    game.state.add('preload', preload);
    game.state.add('mainState', mainState);
    game.state.start('boot');
}
var boot = {
    create: function() {
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.renderer.renderSession.roundPixels = true;
        game.state.start('preload');
    },
};
var preload = {
    preload: function() {
        game.load.tilemap('map', 'assets/data/map.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/img/tiles.png');
        game.load.spritesheet('player', 'assets/img/player.png', 16, 16);
        game.load.spritesheet('enemies', 'assets/img/enemies.png', 16, 16);
        game.load.spritesheet('items', 'assets/img/items.png', 16, 16);
        game.load.spritesheet('meter', 'assets/img/meter.png', 28, 7);
        game.load.spritesheet('number', 'assets/img/number.png', 10, 16);
        game.load.spritesheet('text', 'assets/img/text.png', 260, 48);
        game.load.spritesheet('btns', 'assets/img/btns.png', 62, 62);
    },
    create: function() {
        game.state.start('mainState');
    },
};
var mainState = {
    create: function() {
        // setting
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // map
        this.map = game.add.tilemap('map');
        this.map.addTilesetImage('tiles', 'tiles');
        this.map.setCollision(2);
        this.map.setTileIndexCallback(3, this.hitPainTile, this);
        this.map.setTileIndexCallback(4, this.hitJumpTile, this);
        this.map.setTileIndexCallback(6, this.hitFakeTile, this);
        this.tileLayer = this.map.createLayer('tileLayer');
        this.collideLayer = this.map.createLayer('collideLayer');
        this.collideLayer.resizeWorld();
        this.collideLayer.visible = false;

        // bullets
        this.bullets = game.add.weapon(3, 'items');
        this.bullets.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
        this.bullets.bulletLifespan = 500;
        this.bullets.bulletSpeed = 200;
        this.bullets.fireRate = 300;
        this.bullets.addBulletAnimation('move',[8, 9], 10, true);
        this.bullets.setBulletBodyOffset(8,8,4,4);

        // player
        this.player = game.add.sprite(80,game.world.height-80,'player');
        game.physics.arcade.enable(this.player);
        this.player.anchor.setTo(0.5);
        this.player.body.collideWorldBounds = true;
        this.player.animations.add('walk', [0, 1, 2, 1], 10, true);
        this.player.animations.add('idol', [5], 10, true);
        this.player.animations.add('jump', [4], 10, true);
        this.player.animations.add('shoot', [3], 10, true);
        this.player.animations.play('idol');
        this.player.body.gravity.y = 800;
        this.player.body.maxVelocity.y = 500;
        this.player.playerState = 2; // 0 = normal, 1 = muteki, 2 = gameover,
        this.player.playerLife = 6;

        // fake layer
        this.fakeLayer = this.map.createLayer('fakeLayer');

        // cursor
        this.cursors = game.input.keyboard.createCursorKeys();
        this.jumpButton = this.input.keyboard.addKey(Phaser.KeyCode.Z);
        this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.X);

        // enemy
        this.enemys = game.add.group();

        this.slimes = game.add.group();
        this.slimes.enableBody = true;
        this.map.createFromObjects('objectLayer', 61, 'enemies', 0, true, false, this.slimes);
        this.slimes.callAll('animations.add', 'animations', 'run', [0,1,2,1], 5, true);
        this.slimes.callAll('body.setSize', 'body', 10, 10, 6, 6);
        this.slimes.setAll('anchor.x', .5);
        this.slimes.setAll('body.immovable', true);
        this.slimes.setAll('body.velocity.x', -25);
        this.slimes.setAll('body.bounce.x', 1);
        this.slimes.setAll('body.collideWorldBounds', true);
        for (var i = 0; i < this.slimes.children.length; i++) {
            this.slimes.children[i].scale.y = this.slimes.children[i].scaleY;
        }
        this.slimes.setAll('body.moves', false);
        this.enemys.add(this.slimes);

        this.lizard = game.add.group();
        this.lizard.enableBody = true;
        this.map.createFromObjects('objectLayer', 62, 'enemies', 0, true, false, this.lizard);
        this.lizard.callAll('animations.add', 'animations', 'run', [4,5,6,5], 5, true);
        this.lizard.callAll('body.setSize', 'body', 10, 10, 6, 6);
        this.lizard.setAll('body.immovable', true);
        this.lizard.setAll('body.bounce.y', 1);
        this.lizard.setAll('body.collideWorldBounds', true);
        this.lizard.setAll('body.gravity.y', 600);
        this.lizard.setAll('body.moves', false);
        this.enemys.add(this.lizard);

        this.bats = game.add.group();
        this.bats.enableBody = true;
        this.map.createFromObjects('objectLayer', 63, 'enemies', 0, true, false, this.bats);
        this.bats.callAll('animations.add', 'animations', 'run', [8,9,10,9], 5, true);
        this.bats.callAll('body.setSize', 'body', 10, 10, 6, 6);
        this.bats.setAll('anchor.x', .5);
        this.bats.setAll('body.immovable', true);
        this.bats.setAll('body.velocity.x', -35);
        this.bats.setAll('body.bounce.x', 1);
        this.bats.setAll('body.collideWorldBounds', true);
        this.bats.setAll('body.moves', false);
        this.enemys.add(this.bats);

        // objects
        this.objects = game.add.group();

        this.coins = game.add.group();
        this.coins.enableBody = true;
        this.map.createFromObjects('objectLayer', 65, 'items', 0, true, false, this.coins);
        this.coins.callAll('animations.add', 'animations', 'run', [4,5,6,7], 5, true);
        this.objects.add(this.coins);

        this.lifeUp = game.add.group();
        this.lifeUp.enableBody = true;
        this.map.createFromObjects('objectLayer', 67, 'items', 0, true, false, this.lifeUp);
        this.lifeUp.setAll('frame', 13);
        this.lifeUp.setAll('body.immovable', true);
        this.objects.add(this.lifeUp);

        this.goal = game.add.group();
        this.goal.enableBody = true;
        this.map.createFromObjects('objectLayer', 64, 'items', 0, true, false, this.goal);
        this.goal.callAll('animations.add', 'animations', 'run', [0,1,2], 5, true);
        this.goal.callAll('animations.play', 'animations', 'run');
        this.goal.setAll('body.immovable', true);
        this.objects.add(this.goal);

        // life
        this.life = game.add.sprite(5, 7, 'meter');
        this.life.frame = this.player.playerLife;
        this.life.fixedToCamera = true;

        // score
        this.scoreNumbers = game.add.group();
        this.scoreNumbers.fixedToCamera = true;
        var ret = ('000000' + gameOptions.gameScore ).slice(-6);
        var scoreString = String(ret);
        for (var i in scoreString) {
            var number = game.add.sprite(game.width-63+10*i,3,'number');
            number.frame = Number(scoreString[i]);
            this.scoreNumbers.add(number);
        }

        // btns
        this.leftBtn = game.add.sprite(8,game.height-8, 'btns')
        this.leftBtn.anchor.y = 1;
        this.leftBtn.frame = 0;

        this.rightBtn = game.add.sprite(77,game.height-8, 'btns')
        this.rightBtn.anchor.y = 1;
        this.rightBtn.frame = 1;

        this.zBtn = game.add.sprite(game.width-77,game.height-8, 'btns')
        this.zBtn.anchor.x = 1;
        this.zBtn.anchor.y = 1;
        this.zBtn.frame = 2;

        this.xBtn = game.add.sprite(game.width-8,game.height-8, 'btns')
        this.xBtn.anchor.x = 1;
        this.xBtn.anchor.y = 1;
        this.xBtn.frame = 3;

        this.btns = game.add.group();
        this.btns.add(this.leftBtn);
        this.btns.add(this.rightBtn);
        this.btns.add(this.zBtn);
        this.btns.add(this.xBtn);
        this.btns.setAll('inputEnabled', true);
        this.btns.setAll('fixedToCamera', true);
        this.btns.setAll('alpha', .75);
        this.btns.setAll('btnActive', false);
        this.btns.setAll('visible', false);

        // title
        this.text = game.add.sprite(game.width/2,game.height/2, 'text');
        this.text.anchor.setTo(0.5);
        this.text.animations.add('idol', [2, 3], 1, true);
        this.text.animations.play('idol');
        this.text.fixedToCamera = true;

        this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enterKey.onDown.add(this.startGame, this);
        game.input.onDown.add(this.startGameSP, this);

        // camera
        game.camera.follow(this.player);

    },

    onDownBtns: function(sprite){
        this.leftBtn.btnActive = false;
        this.rightBtn.btnActive = false;
        sprite.alpha = .9;
        sprite.btnActive = true;
    },

    onUpBtns: function(sprite){
        sprite.alpha = .75;
        sprite.btnActive = false;
    },

    update: function() {

        // collide
        game.physics.arcade.collide(this.player, this.collideLayer);
        game.physics.arcade.overlap(this.player, this.coins, this.hitCoins, null, this);
        game.physics.arcade.overlap(this.player, this.lifeUp, this.hitLifeUp, null, this);
        game.physics.arcade.overlap(this.player, this.goal, this.hitGoal, null, this);

        game.physics.arcade.collide(this.enemys.children, this.collideLayer);

        game.physics.arcade.overlap(this.bullets.bullets, this.enemys.children, this.hitBullets, null, this);
        game.physics.arcade.collide(this.bullets.bullets, this.collideLayer, this.hitBullets, null, this);

        if(this.player.playerState == 0) {
            game.physics.arcade.collide(this.player, this.enemys.children, this.hitEnemy, null, this);
        }

        // player
        this.player.body.gravity.y = 800;

        if(this.player.playerState !== 2) {

            // move
            if (this.cursors.left.isDown || this.leftBtn.btnActive){
                this.player.body.velocity.x = -100;
                this.player.scale.x = -1;
                if(this.player.body.onFloor()) {
                    this.player.animations.play('walk');
                }
            } else if (this.cursors.right.isDown || this.rightBtn.btnActive) {
                this.player.body.velocity.x = 100;
                this.player.scale.x = 1;
                if(this.player.body.onFloor()) {
                    this.player.animations.play('walk');
                }
            } else {
                this.player.body.velocity.x = 0;
                if(this.player.body.onFloor()) {
                    this.player.animations.play('idol');
                }
            }

            // jump
            if (this.cursors.up.isDown || this.jumpButton.isDown || this.zBtn.btnActive) {
                if(this.player.body.onFloor()) {
                    this.player.body.velocity.y = -250;
                    this.player.animations.play('jump');
                }
            }

            // fire
            if (this.fireButton.isDown || this.xBtn.btnActive) {
                this.player.animations.play('shoot');
                this.player.body.velocity.x = 0;
                if(this.player.body.velocity.y > 0) {
                    this.player.body.gravity.y = 300;
                }
                this.bullets.fireFrom.y = this.player.y;
                this.bullets.fireFrom.x = this.player.x;
                this.bullets.fireAngle = this.player.scale.x == 1 ? 0 : 180;
                this.bullets.fire();
            }

        }

        // enemy scale
        for (var j = 0; j < this.enemys.children.length; j++) {
            for (var i = 0; i < this.enemys.children[j].children.length; i++) {
                if(this.enemys.children[j].children[i].body.velocity.x < 0) {
                    this.enemys.children[j].children[i].scale.x = -1;
                } else if (this.enemys.children[j].children[i].body.velocity.x > 0){
                    this.enemys.children[j].children[i].scale.x = 1;
                }
            }
        }

        // lizard jump
        for (var i = 0; i < this.lizard.children.length; i++) {
            if(this.lizard.children[i].body.onFloor()) {
                this.lizard.children[i].body.velocity.y = -200;
            }
        }

        for (var j = 0; j < this.enemys.children.length; j++) {
            for (var i = 0; i < this.enemys.children[j].children.length; i++) {
                if(this.enemys.children[j].children[i].inCamera) {
                    this.enemys.children[j].children[i].body.moves = true;
                    if(!this.enemys.children[j].children[i].isPlaying) {
                        this.enemys.children[j].children[i].animations.play('run');
                    }
                } else {
                    this.enemys.children[j].children[i].body.moves = false;
                    this.enemys.children[j].children[i].animations.stop();
                }
            }
        }

        for (var i = 0; i < this.coins.children.length; i++) {
            if(this.coins.children[i].inCamera) {
                if(!this.coins.children[i].isPlaying) {
                    this.coins.children[i].animations.play('run');
                }
            } else {
                this.coins.children[i].animations.stop();
            }
        }

        // mouse out
        if(!game.input.mousePointer.withinGame) {
            this.btns.setAll('btnActive', false);
        }

    },

    scoreUpdate: function(num){
        gameOptions.gameScore += num;
        var ret = ('000000' + gameOptions.gameScore ).slice(-6);
        var scoreString = String(ret);
        for (var i in scoreString) {
            this.scoreNumbers.children[i].frame = Number(scoreString[i]);
        }
    },

    hitBullets: function (bullet, enemy) {
        bullet.kill();
        if(enemy.key == 'enemies') {
            enemy.destroy();
            this.scoreUpdate(100);
        }
    },

    hitCoins: function(player, coin){
        coin.destroy();
        this.scoreUpdate(100);
    },

    hitLifeUp: function(player, lifeUp){
        lifeUp.destroy();
        if(this.player.playerLife < 6) {
            this.player.playerLife++;
            this.life.frame = this.player.playerLife;
        }
        this.scoreUpdate(100);
    },

    hitEnemy: function(player) {
        this.playerDamage(player);
    },

    hitPainTile: function(player) {
        if(player == this.player && this.player.playerState == 0) {
            this.playerDamage(player);
        }
    },

    hitJumpTile: function(player) {
        if(player == this.player) {
            this.player.body.velocity.y = -400;
            if(this.player.playerState !== 2) {
                this.player.animations.play('jump');
            }
        }
    },

    hitFakeTile: function(player) {
        if(player == this.player) {
            this.fakeLayer.visible = false;
        }
    },

    playerDamage: function(player) {
        this.player.playerState = 1;
        this.player.body.velocity.y = -300;
        this.player.alpha = 0.5;
        this.player.playerLife--;
        this.life.frame = this.player.playerLife;
        if(this.player.playerLife == 0) {
            this.player.animations.stop();
            this.player.frame = 7;
            this.player.body.velocity.x = 0;
            this.player.alpha = 1;
            this.player.playerState = 2;
            gameOptions.gameScore = 0;
            this.gameOver();
        } else {
            setTimeout(function() {
                player.playerState = 0;
                player.alpha = 1;
            }, 3000);
        }
    },

    hitGoal: function(){
        this.player.animations.stop();
        this.player.frame = 6;
        this.player.body.velocity.x = 0;
        this.player.alpha = 1;
        this.player.playerState = 2;
        this.gameOver();
    },

    startGame: function() {
        this.player.playerState = 0;
        this.text.animations.stop();
        this.text.frame = 3;
        this.enterKey.onDown.remove(this.startGame, this);
        game.input.onDown.remove(this.startGame, this);
    },

    startGameSP: function() {
        this.btns.setAll('visible', true);
        this.btns.onChildInputDown.add(this.onDownBtns, this);
        this.btns.onChildInputOver.add(this.onDownBtns, this);
        this.btns.onChildInputUp.add(this.onUpBtns, this);
        this.btns.onChildInputOut.add(this.onUpBtns, this);
        this.startGame();
    },

    gameOver: function() {
        setTimeout(function() {
            this.game.state.start('mainState');
        }, 2000);
    },
};