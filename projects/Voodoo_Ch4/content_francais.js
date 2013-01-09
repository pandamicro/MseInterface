var Zombie = function(conf, sx) {
    this.sprite = new mse.Sprite(null, {}, 'zombiesprite', conf.fw, conf.fh, conf.sx, conf.sy, conf.sw, conf.sh);
    this.effet = new mse.EIColorFilter(this.sprite, {duration: 25, rMulti: 0.75, alpha: 0.6});
    this.walkanime = new mse.FrameAnimation(this.sprite, [0,1,2,3,4,5,6,7], 0, 5);
    this.deadanime = new mse.FrameAnimation(this.sprite, [0,8,9], 1, 3);
    this.deadSprite = new mse.Sprite(null, {}, 'zombiesprite', 75,100, 0,0,1050,100);
    this.fadeAnime = new mse.FrameAnimation(this.deadSprite, [0,1,2,3,4,5,6,7,8,9,10,11,12,13], 1, 3);
    this.walkanime.start();
    this.velo = conf.velo;
    this.life = conf.life;
    this.offy = 354 - conf.fh;
    this.minioy = 430 - conf.fh/2;
    this.offx = sx;
    this.state = "INIT";
};
Zombie.prototype = {
    constructor: Zombie,
    init: function(conf, sx) {
        this.sprite.configSprite(conf.fw, conf.fh, conf.sx, conf.sy, conf.sw, conf.sh);
        this.walkanime.start();
        this.count = 0;
        this.velo = conf.velo;
        this.life = conf.life;
        this.offy = 354 - conf.fh;
        this.minioy = 430 - conf.fh/2;
        this.offx = sx;
        this.state = "INIT";
    },
    hit: function(power) {
        this.life -= power;
        this.offx += 15;
        
        this.sprite.startEffect(this.effet);
        if(this.life <= 0) {
            this.state = "DIEING";
            this.deadanime.start();
            this.count = 0;
        }
    },
    logic: function() {
        this.sprite.logic();
        if(this.state == "INIT") {
            this.offx += this.velo;
        }
        else if(this.state == "DIEING") {
            this.count++;
            if(this.count == 9) {
                this.fadeAnime.start();
            }
            else if(this.count == 51)
                this.state = "DEAD";
        }
    },
    drawMini: function(ctx) {
        if(this.offx < 0) return;
        if(this.state == "DEAD" || this.state == "DIEING")
            ctx.drawImage(mse.src.getSrc('zombiesprite'), 698,100,30,30, 440+this.offx/5,this.minioy+10,30,30);
        else
            ctx.drawImage(mse.src.getSrc('zombiesprite'), this.sprite.sx,this.sprite.sy,this.sprite.fw,this.sprite.fh, 440+this.offx/5,this.minioy,30,this.sprite.fh/2);
    },
    draw: function(ctx) {
        if(this.count >= 9) this.deadSprite.draw(ctx, this.offx, this.offy);
        else this.sprite.draw(ctx, this.offx, this.offy);
    }
};

var Rock = function(sprite, type, force, angle) {
    this.sp = sprite;
    this.fr = type;
    var velo = (type == 1 ? force/6 : force/4);
    this.vx = velo * Math.cos(angle);
    this.vy = velo * Math.sin(angle);
    this.angle = angle;
    this.offx = 66;
    this.offy = 265;
    this.count = 10;
    this.rotation = 0;
};
Rock.prototype = {
    constructor: Rock,
    logic: function() {
        if(this.count > 0) {
            this.count--;
            return;
        }
        this.offx += this.vx;
        this.offy += this.vy;
        this.vy += 9.8*0.08;
    },
    draw: function(ctx) {
        if(this.count <= 0) {
            ctx.save();
            ctx.translate(this.offx + 9.5, this.offy + 8.5);
            ctx.rotate(this.rotation);
            this.rotation += Math.PI/6;
            if(this.rotation >= Math.PI * 2) this.rotation = 0;
            ctx.translate(-9.5, -8.5);
            this.sp.drawFrame(this.fr, ctx, 0, 0);
            ctx.restore();
        }
    }
};

var ShootZombie = function() {
    mse.Game.call(this, {fillback:true, size:[600,440]});
    this.config.title = "La cauchemar de Simon";
    
    this.msg = {
        "BEFOREINIT": "Clique pour jouer.",
        "WIN": "Bravo!!! Tu as gagné ",
        "LOSE": "Perdu..."
    };
    var zombieConfig = [
        {
            velo: -1,
            life: 3,
            fw: 64, fh: 94,
            sx: 0, sy: 100, sw: 640, sh: 94
        },
        {
            velo: -2,
            life: 1,
            fw: 60, fh: 101,
            sx: 0, sy: 194, sw: 600, sh: 101
        },
        {
            velo: -3,
            life: 2,
            fw: 60, fh: 102,
            sx: 0, sy: 295, sw: 600, sh: 102
        },
        {
            velo: -4,
            life: 1,
            fw: 60, fh: 105,
            sx: 0, sy: 397, sw: 600, sh: 105
        }
    ];
    var vague = [
        [1,1,1,1,3,1,1,1],
        [3,1,1,3,0,1,3,1,1],
        [3,1,0,1,1,2,3,0,0],
        [0,0,3,0,3,1,1,2,2,3,0],
        [2,2,3,3,0,3,0,2,3,0,2,2]
    ];
    var toolPos = [
        {x:42, y:400},
        {x:118, y:400},
        {x:194, y:400}
    ];
    var power = [
        1,3,2
    ];
    this.shootox = 66;
    this.shootoy = 265;
    
    mse.src.addSource('zombiedecor', 'games/zombieback.jpg', 'img', true);
    mse.src.addSource('zombiesprite', 'games/Sprites.png', 'img', true);
    
    this.decor = new mse.Image(null, {size:[600,440]}, 'zombiedecor');
    this.simon = new mse.Sprite(null, {pos:[17,262]}, 'zombiesprite', 81,92,0,502,729,92);
    this.shootAnime = new mse.FrameAnimation(this.simon, [0,1,2,3,4,5,6,7,8,0], 1, 2);
    this.rockSp = new mse.Sprite(null, {}, 'zombiesprite', 19,17,640,100,57,17);
    this.rocks = [];
    this.zombies = [];
    for(var i = 0; i < 12; ++i) {
        this.zombies[i] = new Zombie(zombieConfig[0], 600);
    }
    
    this.state = "BEFOREINIT";
    this.help = new mse.Text(null, {
    	pos:[60,140],
    	size:[this.width-120,0],
    	fillStyle:"rgb(255,255,255)",
    	font:"20px Arial",
    	textAlign:"center",
    	textBaseline:"top",
    	lineHeight:25}, "Simon rêve qu’il est attaqué par des zombis. Il lance des projectiles pour se défendre.\n \nMaintient le bouton gauche de la souris enfoncé et vise. Relache pour lancer le projectile.\n \nClique pour commencer!", true
    );
    this.currVague = 0;
    this.currTime = 0;
    
    this.init = function() {
        this.reinit();
        this.state = "INIT";
        this.currVague = 0;
        this.getEvtProxy().addListener('click', clickcb, true, this);
    };
    this.reinit = function() {
        if(this.currVague == vague.length) this.currVague = 0;
        this.max = vague[this.currVague].length;
        this.curr = 0;
        this.showtime = randomInt(20) + 50;
        this.count = 0;
        this.tool = 0;
        this.skelton = 3;
        this.rockSp.setFrame(0);
        this.angle = 0;
        this.miredis = 100;
        this.mirex = this.shootox+100;
        this.mirey = this.shootoy;
        this.shooting = false;
        this.force = 3;
        this.plus = true;
        this.nextVague = false;
        for(var i = 0; i < this.max; ++i)
            this.zombies[i].init(zombieConfig[vague[this.currVague][i]], 600);
        this.currTime = 0;
    };
    
    this.win = function() {
        this.getEvtProxy().removeListener('gestureStart', cbStart);
        this.getEvtProxy().removeListener('gestureUpdate', cbMove);
        this.getEvtProxy().removeListener('gestureEnd', cbEnd);
        this.state = "WIN";
        this.setScore( 20 * this.currVague + this.currTime * 0.05 );
        this.constructor.prototype.win.call(this);
    };
    this.die = function() {
        this.getEvtProxy().removeListener('gestureStart', cbStart);
        this.getEvtProxy().removeListener('gestureUpdate', cbMove);
        this.getEvtProxy().removeListener('gestureEnd', cbEnd);
        this.state = "LOSE";
        this.setScore( 20 * this.currVague + this.currTime * 0.025 );
        this.lose();
    };
    
    this.click = function(e) {
        if(this.state == "INIT") {
            this.state = "START";
            this.getEvtProxy().removeListener('click', clickcb);
            this.getEvtProxy().addListener('gestureStart', cbStart, true, this);
            this.getEvtProxy().addListener('gestureUpdate', cbMove, true, this);
            this.getEvtProxy().addListener('gestureEnd', cbEnd, true, this);
        }
    };
    this.touchStart = function(e) {
        if(MseConfig.android || MseConfig.iPhone) {
            var x = e.offsetX/0.8;
            var y = e.offsetY/0.62;
        }
        else {
            var x = e.offsetX;
            var y = e.offsetY;
        }
        
        // Tool clicked
        for(var i = 0; i < 3; ++i)
            if(Math.abs(x - toolPos[i].x) < 30 && Math.abs(y - toolPos[i].y) < 30) {
                this.tool = i;
                this.rockSp.setFrame(i);
                return;
            }
        
        if(this.tool == 2 && this.skelton <= 0)
            return;
        // Start shoot
        this.force = 3;
        this.shooting = true;
    };
    this.touchMove = function(e) {
        if(MseConfig.android || MseConfig.iPhone) {
            var x = e.offsetX/0.8;
            var y = e.offsetY/0.62;
        }
        else {
            var x = e.offsetX;
            var y = e.offsetY;
        }
        
        if(x < 66 || y > 320) return;
        this.angle = angleForLine(this.shootox, this.shootoy, x, y);
        this.mirex = this.shootox + this.miredis * Math.cos(this.angle);
        this.mirey = this.shootoy + this.miredis * Math.sin(this.angle);
    };
    this.touchEnd = function(e) {
        if(MseConfig.android || MseConfig.iPhone) {
            var x = e.offsetX/0.8;
            var y = e.offsetY/0.62;
        }
        else {
            var x = e.offsetX;
            var y = e.offsetY;
        }
        
        if(this.shooting) {
            this.shooting = false;
            if(this.tool == 2) {
                if(this.skelton <= 0) return;
                else this.skelton--;
            }
            this.shootAnime.start();
            this.rocks.push(new Rock(this.rockSp, this.tool, this.force, this.angle));
        }
    };
    
    this.logic = function() {
        if(this.state != "START") return;
        // Next vague count down
        if(this.nextVague) {
            if(this.count < 75) this.count++;
            else {
                if(this.currVague == vague.length-1) {
                    this.currVague++;
                    this.win();
                    return;
                }
                else {
                    this.currVague++;
                    this.reinit();
                }
            }
        }
        // Force
        if(this.shooting) {
            if(this.plus) {
                if(this.force < 100) this.force+=3;
                else this.plus = false;
            }
            else {
                if(this.force > 3) this.force-=3;
                else this.plus = true;
            }
        }
        // Rocks
        for(var i = 0; i < this.rocks.length; i++) {
            this.rocks[i].logic();
            if(this.rocks[i].offx >= 600 || this.rocks[i].offy >= 345)
                this.rocks.splice(i, 1);
        }
        // New zombie out
        if(this.curr < this.max) {
            this.count++;
            if(this.count == this.showtime) {
                this.showtime += randomInt(20) + 50;
                this.curr++;
            }
        }
        if(!this.nextVague && this.curr == this.max) var vaguefinish = true;
        // Zombie
        for(var i = 0; i < this.curr; ++i) {
            this.zombies[i].logic();
            
            if(this.zombies[i].state != "INIT") continue;
            vaguefinish = false;
            // Stone hit zombie
            var zx = this.zombies[i].offx + 30;
            var zxmax = this.zombies[i].offx + this.zombies[i].sprite.width;
            var zy = this.zombies[i].offy;
            var zymax = this.zombies[i].offy + this.zombies[i].sprite.height;
            for(var j = 0; j < this.rocks.length; j++) {
                var rx = this.rocks[j].offx+9.5;
                var ry = this.rocks[j].offy+8.5;
                if(rx >= zx && rx <= zxmax && ry >= zy && ry <= zymax) {
                    this.zombies[i].hit(power[this.rocks[j].fr]);
                    this.rocks.splice(j, 1);
                }
            }
            
            // Zombie touch simon
            if(this.zombies[i].offx < 50)
                this.die();
        }
        // All zombie down, vague finished, start countdown
        if(vaguefinish) {
            this.nextVague = true;
            this.count = 0;
        }
        
        this.currTime++;
    };
    this.draw = function(ctx) {
        ctx.save();
        if(MseConfig.android || MseConfig.iPhone) {
            ctx.scale(0.8, 0.62);
        }
        // Back
        this.decor.draw(ctx);
        
        // Simon
        this.simon.draw(ctx);
        
        // Zombie
        for(var i = 0; i < this.curr; ++i) {
            this.zombies[i].draw(ctx);
            this.zombies[i].drawMini(ctx);
        }
        
        // Rocks
        for(var i = 0; i < this.rocks.length; i++) {
            this.rocks[i].draw(ctx);
        }
        
        // Interface
        ctx.fillStyle = 'rgba(255,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(toolPos[this.tool].x, toolPos[this.tool].y, 29, 0, Math.PI*2, true);
        ctx.fill();
        // Skelton
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Arial";
        ctx.fillText(this.skelton, toolPos[2].x+15, toolPos[2].y-25);
        
        // Shooting
        if(this.shooting) {
            ctx.fillStyle = "#fff";
            ctx.fillRect(this.mirex-8, this.mirey, 18,2);
            ctx.fillRect(this.mirex, this.mirey-8, 2,18);
            ctx.strokeStyle = "#323232";
            ctx.lineWidth = 4;
            ctx.fillStyle = "#f70000";
            ctx.fillRect(22,232,0.8*this.force,18);
            ctx.strokeRoundRect(20,230,84,20,3);
        }
        
        // Start help message
        if(this.state == "INIT") {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.strokeStyle = 'rgb(188,188,188)';
            ctx.fillRect(0,0,this.width,this.height);
            ctx.strokeRect(0,0,this.width,this.height);
            this.help.draw(ctx);
        }
        
        ctx.restore();
    };
    
    var cbStart = new mse.Callback(this.touchStart, this);
    var cbMove = new mse.Callback(this.touchMove, this);
    var cbEnd = new mse.Callback(this.touchEnd, this);
    var clickcb = new mse.Callback(this.click, this);
};
extend(ShootZombie, mse.Game);var Bougie = function() {
    mse.Game.call(this);
    
    this.setDirectShow(true);
    this.firstShow = false;
    
    this.offx = mse.coor(mse.joinCoor(0)); this.offy = mse.coor(mse.joinCoor(0));
    this.width = mse.coor(mse.joinCoor(800)); this.height = mse.coor(mse.joinCoor(600));
    this.bougiePos = [
        {x:108*this.width/800,y:275*this.height/600,
         w:57*this.width/800,h:90*this.height/600},
        {x:310*this.width/800,y:250*this.height/600,
         w:40*this.width/800,h:60*this.height/600},
        {x:485*this.width/800,y:270*this.height/600,
         w:45*this.width/800,h:65*this.height/600},
        {x:580*this.width/800,y:345*this.height/600,
         w:65*this.width/800,h:110*this.height/600}
    ];
    
    mse.src.addSource('zippoimg', 'games/flame.png', 'img', true);
    mse.src.addSource('backcut0', 'games/grotte1.png', 'img', true);
    mse.src.addSource('backcut1', 'games/grotte2.png', 'img', true);
    mse.src.addSource('backcut2', 'games/grotte3.png', 'img', true);
    mse.src.addSource('backcut3', 'games/grotte4.png', 'img', true);
    mse.src.addSource('backlight', 'games/newback.jpg', 'img', true);
    
    this.zippo = new mse.Sprite(null, {}, 'zippoimg', 57,64, 0,0,57,64);
    this.fire = new mse.Sprite(null, {}, 'zippoimg', 17,58, 57,0,68,58);
    this.fireAnime = new mse.FrameAnimation(this.fire, [0,1,2,3,3], 0, 2);
    this.part = [];
    this.part[0] = new mse.Image(null, {pos:[0,0],size:[355*this.width/800,this.height],globalAlpha:0}, 'backcut0');
    this.part[1] = new mse.Image(null, {pos:[264*this.width/800,159*this.height/600],size:[129*this.width/800,208*this.height/600],globalAlpha:0}, 'backcut1');
    this.part[2] = new mse.Image(null, {pos:[418*this.width/800,148*this.height/600],size:[180*this.width/800,236*this.height/600],globalAlpha:0}, 'backcut2');
    this.part[3] = new mse.Image(null, {pos:[300*this.width/800,0],size:[500*this.width/800,this.height],globalAlpha:0}, 'backcut3');
    this.backlight = new mse.Image(null, {pos:[0,0],size:[this.width,this.height]}, 'backlight');
    
    this.light = [false, false, false, false];
    this.firstShow = false;
    this.mousex = 0;
    this.mousey = 0;
    this.count = null;
    
    this.move = function(e) {
        this.mousex = e.offsetX - this.offx;
        this.mousey = e.offsetY - this.offy;
    };
    this.click = function(e) {
        var x = e.offsetX - this.offx;
        var y = e.offsetY - this.offy;
        for(var i = 0; i < 4; ++i) {
            if(!this.light[i] && 
               x > this.bougiePos[i].x && x < this.bougiePos[i].x+this.bougiePos[i].w &&
               y > this.bougiePos[i].y && y < this.bougiePos[i].y+this.bougiePos[i].h) {
                
                this.light[i] = true;
                mse.src.getSrc('zippo').play();
                
                if(this.light[0] && this.light[1] && this.light[2] && this.light[3])
                    this.count = 60;
                break;
            }
        }
    };
    
    this.init = function() {
        if(layers.background.getObjectIndex(this) == -1)
            layers.background.insertAfter(this, objs.obj306);
        this.parent = layers.background;
        this.getEvtProxy().addListener("move", this.movecb);
        this.getEvtProxy().addListener("click", this.clickcb);
        layers.content.interrupt();
        mse.fadeout(layers.content, 25);
        mse.fadeout(layers.mask, 25);
        
        mse.setCursor('pointer');
        this.fireAnime.start();
        this.state = "START";
    };
    this.win = function() {
        this.getEvtProxy().removeListener("move", this.movecb);
        this.getEvtProxy().removeListener("click", this.clickcb);
        mse.root.evtDistributor.setDominate(null);
        mse.fadein(layers.content, 25);
        mse.fadein(layers.mask, 25, new mse.Callback(layers.content.play, layers.content));
        
        mse.setCursor('default');
        this.fireAnime.stop();
        
        this.state = "END";
    };
    this.logic = function(ctx) {
        if(this.state != "START") return;
        for(var i = 0; i < 4; i++) {
            if(this.light[i] && this.part[i].globalAlpha < 1) {
                this.part[i].globalAlpha += 0.04;
                if(this.part[i].globalAlpha > 1)
                    this.part[i].globalAlpha = 1;
            }
        }
        if(this.count !== null) {
            if(this.count > 0)
                this.count--;
            else this.win();
        }
    };
    this.draw = function(ctx) {
        if(this.state == "END") {
            this.backlight.draw(ctx);
            return;
        }
        if(this.state != "START") return;
        
        if(!this.firstShow) {
        	this.firstShow = true;
        	this.evtDeleg.eventNotif('firstShow');
        	this.evtDeleg.eventNotif('start');
        }
        ctx.save();
        ctx.translate(this.offx, this.offy);
        // Draw new back
        for(var i = 0; i < 4; i++)
            this.part[i].draw(ctx);
        
        // Zone
        ctx.globalCompositeOperation = "source-atop";
        ctx.translate(this.mousex, this.mousey);
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(0, -45, 54, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -45, 57, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -45, 60, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        
        // Zippo and fire
        this.fire.draw(ctx, -8.5, -74);
        this.zippo.draw(ctx, -40, -40);
        
        ctx.restore();
    };
    
    this.movecb = new mse.Callback(this.move, this);
    this.clickcb = new mse.Callback(this.click, this);
};
extend(Bougie, mse.Game);var SacGame = function() {
    mse.Game.call(this);
    
    this.setDirectShow(true);
    this.firstShow = false;
    this.audioplaying = false;
    this.audioplaytime = 0;
    
    this.offx = mse.coor(mse.joinCoor(-30)); this.offy = mse.coor(mse.joinCoor(0));
    this.width = mse.coor(mse.joinCoor(400)); this.height = mse.coor(mse.joinCoor(200));
    
    mse.src.addSource('sacsprite', 'games/sac_sprite.jpg', 'img', true);
    this.sac = new mse.Sprite(this, {pos:[0,0],size:[this.width,this.height]}, "sacsprite", 600,300, 0,0,1800,2400);
    this.anime = new mse.FrameAnimation(this.sac, [15,16,17,18,19,20,21,22,23,23,23], 1, 4);
    
    this.touching = false;
    
    this.touchStart = function(e) {
        this.touching = true;
    };
    this.touchMove = function(e) {
        if(!this.touching || this.state != "START") return;
        var x = e.offsetX - this.getX();
        var y = e.offsetY - this.getY();
        
        if (!this.audioplaying) {
            this.audioplaying = true;
            this.audioplaytime = 0;
            var i = randomInt(2)+1;
            mse.src.getSrc('zip'+i).play();
        }
        
        // Valid action
        if (x > 0.1*this.width && Math.abs(y - 0.5*this.height) < 0.4*this.height) {
            var ratio = Math.ceil(15 * (x - 0.1*this.width) / (0.9*this.width));
            this.sac.setFrame(ratio);
            if(ratio == 15) {
                this.state = "ANIME";
                this.anime.start();
                mse.src.getSrc('peur').play();
            }
        }
    };
    this.touchEnd = function(e) {
        this.touching = false;
    };
    
    var cbStart = new mse.Callback(this.touchStart, this);
    var cbMove = new mse.Callback(this.touchMove, this);
    var cbEnd = new mse.Callback(this.touchEnd, this);
    
    this.state = "INIT";
    
    this.init = function() {
        layers.content.interrupt();
        
        this.getEvtProxy().addListener('gestureStart', cbStart);
    	this.getEvtProxy().addListener('gestureUpdate', cbMove);
    	this.getEvtProxy().addListener('gestureEnd', cbEnd);
    	
    	mse.setCursor('pointer');
    	this.state = "START";
    };
    this.end = function() {
        this.getEvtProxy().removeListener('gestureStart', cbStart);
        this.getEvtProxy().removeListener('gestureUpdate', cbMove);
        this.getEvtProxy().removeListener('gestureEnd', cbEnd);
        mse.root.evtDistributor.setDominate(null);
        
        mse.setCursor('default');
        layers.content.play();
    };
    
    this.draw = function(ctx) {
        if(!this.firstShow) {
        	this.firstShow = true;
        	this.evtDeleg.eventNotif('firstShow');
        	this.evtDeleg.eventNotif('start');
        }
        
        if(this.audioplaying) {
            this.audioplaytime++;
            if(this.audioplaytime > 40)
                this.audioplaying = false;
        }
        
        this.sac.draw(ctx);
    };
    
    this.anime.evtDeleg.addListener('end', new mse.Callback(this.end, this));
};
extend(SacGame, mse.Game);
mse.coords = JSON.parse('{"cid0":800,"cid1":600,"cid2":0,"cid3":400,"cid4":200,"cid5":20,"cid6":448.75,"cid7":108.75,"cid8":175,"cid9":106.25,"cid10":32.5,"cid11":361.25,"cid12":178.75,"cid13":221.25,"cid14":17.5,"cid15":396.25,"cid16":56.25,"cid17":203.75,"cid18":246.25,"cid19":340,"cid20":590,"cid21":230,"cid22":10,"cid23":22.5,"cid24":36.25,"cid25":425,"cid26":295,"cid27":306,"cid28":404.11428571429,"cid29":17,"cid30":496.25,"cid31":30,"cid32":156.25,"cid33":41.25,"cid34":266.25,"cid35":33,"cid36":174,"cid37":108,"cid38":449,"cid39":109,"cid40":18,"cid41":223,"cid42":399,"cid43":358,"cid44":181,"cid45":100,"cid46":318,"cid47":283,"cid48":365,"cid49":463,"cid50":91,"cid51":80,"cid52":459,"cid53":141,"cid54":418,"cid55":380,"cid56":49,"cid57":189,"cid58":156,"cid59":300,"cid60":550,"cid61":120,"cid62":204,"cid63":246,"cid64":396,"cid65":56}');
initMseConfig();
mse.init();
window.pages={};
var layers={};
window.objs={};
var animes={};
var games={};
var wikis={};
function createbook(){
	if(config.publishMode == 'debug') mse.configs.srcPath='./Voodoo_Ch4/';
	window.root = new mse.Root('Voodoo_Ch4',mse.coor('cid0'),mse.coor('cid1'),'portrait');
	var temp = {};
	mse.src.addSource('src0','images/src0.jpeg','img',true);
	mse.src.addSource('darkback','images/darkback.jpeg','img',true);
	games.ShootZombie = new ShootZombie();
	mse.src.addSource('src10','images/src10.jpeg','img',true);
	mse.src.addSource('src11','images/src11.jpeg','img',true);
	mse.src.addSource('src12','images/src12.jpeg','img',true);
	mse.src.addSource('src13','images/src13.png','img',true);
	games.Bougie = new Bougie();
	mse.src.addSource('src18','images/src18.png','img',true);
	mse.src.addSource('src19','images/src19.jpeg','img',true);
	mse.src.addSource('src20','images/src20.jpeg','img',true);
	mse.src.addSource('src21','images/src21.jpeg','img',true);
	mse.src.addSource('src22','images/src22.jpeg','img',true);
	mse.src.addSource('src23','images/src23.jpeg','img',true);
	wikis.Borborygme=new mse.WikiLayer();
	wikis.Borborygme.addTextCard();
	wikis.Borborygme.textCard.addSection('Borborygme', 'Nom masculin :\nBruit provoqué par la digestion dans l’estomac et les intestins. Par extension : parole indistincte, bruit bizarre');
	wikis.Stalagmite=new mse.WikiLayer();
	wikis.Stalagmite.addImage('src22', 'Stalactite.\\nPhoto de J. Wynia');
	wikis.Stalagmite.addImage('src21', 'Stalagmites.\\nPhoto de cluczkow');
	wikis.Stalagmite.addTextCard();
	wikis.Stalagmite.textCard.addSection('Stalagmite', 'Nom féminin :\nColonne formée par le calcaire présent dans les gouttes d’eau et qui tombent sur le sol des grottes. La stalagmite monte vers le plafond.\nNe pas confondre avec la stalactite qui descend du plafond.');
	wikis.Stalagmite.textCard.addLink('Wikipédia', 'http:\/\/fr.wikipedia.org\/wiki\/Stalagmite');
	wikis.Zippo=new mse.WikiLayer();
	wikis.Zippo.addImage('src23', 'Zippo par  MARCO CABRE');
	wikis.Zippo.addTextCard();
	wikis.Zippo.textCard.addSection('Au cinéma', 'Le Zippo apparait au cinéma et à la télévision : Gran Torino, Buffy contre les vampires, Reservoir Dogs,  Babylon A.D., les films de la trilogie X-Men, Dexter, le manga GTO…');
	wikis.Zippo.addTextCard();
	wikis.Zippo.textCard.addSection('Anecdotes', 'Il existe de nombreuses anecdotes sur le Zippo : Serge Gainsbourg utilisait un briquet Zippo, que l\'on retrouve dans les paroles de sa chanson « Ford Mustang ».\nC’est avec un Zippo qu’il a brûlé un billet de 500 francs (environ 134€ aujourd’hui) en 1984 sur TF1.');
	wikis.Zippo.addTextCard();
	wikis.Zippo.textCard.addSection('Zippo', 'Zippo est une marque américaine de briquets, créée en 1932 par Georges G. Blaisdell, à Bradford, en Pennsylvanie. Ces briquets sont considérés comme des objets de collection.');
	wikis.Catacombes=new mse.WikiLayer();
	wikis.Catacombes.addImage('src19', 'Arches dans les catacombes . Photo de J. Veitch-Michaelis');
	wikis.Catacombes.addImage('src20', 'Catacombes. Photo de jphilipg');
	wikis.Catacombes.addTextCard();
	wikis.Catacombes.textCard.addSection('Visiter les catacombes', 'Au total, les carrières s’étendent sur près de 350 kilomètres  mais elles sont interdites au public car les dangers y sont nombreux. Une partie des catacombes situées sous le XIVème arrondissement peuvent se visiter.');
	wikis.Catacombes.textCard.addLink('Catacombes de Paris', 'http:\/\/www.catacombes-de-paris.fr\/');
	wikis.Catacombes.addTextCard();
	wikis.Catacombes.textCard.addSection('Catacombes', 'Nom féminin pluriel : souterrain servant de sépultures (tombes). A Paris, les catacombes sont d’anciennes carrières qui ont recueilli, entre 1786 et 1814, les ossements de tous les cimetières de Paris, soit près de 6 millions de personnes.');
	mse.src.addSource('src24','images/src24.jpeg','img',true);
	mse.src.addSource('src25','images/src25.jpeg','img',true);
	mse.src.addSource('src26','images/src26.jpeg','img',true);
	mse.src.addSource('src27','images/src27.png','img',true);
	mse.src.addSource('src28','images/src28.jpeg','img',true);
	games.SacGame = new SacGame();
	mse.src.addSource('src29','images/src29.jpeg','img',true);
	mse.src.addSource('src30','images/src30.png','img',true);
	mse.src.addSource('intro','audios/intro','aud',false);
	mse.src.addSource('angoisse','audios/angoisse','aud',false);
	mse.src.addSource('gouttes','audios/gouttes','aud',false);
	mse.src.addSource('bruitsac1','audios/bruitsac1','aud',false);
	mse.src.addSource('bruitsac2','audios/bruitsac2','aud',false);
	mse.src.addSource('torche','audios/torche','aud',false);
	mse.src.addSource('zip1','audios/src37','aud',false);
	mse.src.addSource('zip2','audios/zip2','aud',false);
	mse.src.addSource('peur','audios/peur','aud',false);
	mse.src.addSource('zippo','audios/zippo','aud',false);
	mse.src.addSource('zombie','audios/zombie','aud',false);
	mse.src.addSource('merde','audios/merde','aud',false);
	pages.Couverture=new mse.BaseContainer(root,'Couverture',{size:[mse.coor('cid0'),mse.coor('cid1')]});
	layers.Couverturedefault=new mse.Layer(pages.Couverture,1,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj307=new mse.Image(layers.Couverturedefault,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid2'),mse.coor('cid2')]},'src26'); layers.Couverturedefault.addObject(objs.obj307);
	pages.Couverture.addLayer('Couverturedefault',layers.Couverturedefault);
	pages.Title=new mse.BaseContainer(null,'Title',{size:[mse.coor('cid0'),mse.coor('cid1')]});
	layers.Titledefault=new mse.Layer(pages.Title,1,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj308=new mse.Image(layers.Titledefault,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid2'),mse.coor('cid2')]},'src25'); layers.Titledefault.addObject(objs.obj308);
	pages.Title.addLayer('Titledefault',layers.Titledefault);
	layers.titlemask=new mse.Layer(pages.Title,2,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj310=new mse.Mask(layers.titlemask,{"size":[mse.coor('cid3'),mse.coor('cid1')],"pos":[mse.coor('cid4'),mse.coor('cid2')],"fillStyle":"rgb(0, 0, 0)","globalAlpha":0.6,"font":"normal "+mse.coor('cid5')+"px Times","textAlign":"left"}); layers.titlemask.addObject(objs.obj310);
	pages.Title.addLayer('titlemask',layers.titlemask);
	layers.text=new mse.Layer(pages.Title,3,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj9=new mse.Text(layers.text,{"size":[mse.coor('cid6'),mse.coor('cid7')],"pos":[mse.coor('cid8'),mse.coor('cid9')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid10')+"px Gudea","textAlign":"center","textBaseline":"top"},'BEN MERDE, ALORS !',true); layers.text.addObject(objs.obj9);
	objs.obj11=new mse.Text(layers.text,{"size":[mse.coor('cid11'),mse.coor('cid12')],"pos":[mse.coor('cid13'),mse.coor('cid3')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid14')+"px Gudea","textAlign":"left","textBaseline":"top"},'S’enfonçant au cœur des catacombes, Simon et Dark se sont égarés dans le dédale souterrain. Harassé par ses dernières aventures, Simon s’est endormi. À son réveil, il assiste à une bien étrange cérémonie interrompue par une mystérieuse voix…',true); layers.text.addObject(objs.obj11);
	objs.obj311=new mse.Text(layers.text,{"size":[mse.coor('cid15'),mse.coor('cid16')],"pos":[mse.coor('cid17'),mse.coor('cid18')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid10')+"px Gudea","textAlign":"center","textBaseline":"top"},'Episode IV',true); layers.text.addObject(objs.obj311);
	pages.Title.addLayer('text',layers.text);
	pages.Content=new mse.BaseContainer(null,'Content',{size:[mse.coor('cid0'),mse.coor('cid1')]});
	layers.background=new mse.Layer(pages.Content,1,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj306=new mse.Image(layers.background,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid2'),mse.coor('cid2')],"fillStyle":"rgb(0, 0, 0)","globalAlpha":1,"font":"normal "+mse.coor('cid5')+"px Times","textAlign":"left"},'src25'); layers.background.addObject(objs.obj306);
	pages.Content.addLayer('background',layers.background);
	layers.mask=new mse.Layer(pages.Content,2,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj12=new mse.Mask(layers.mask,{"size":[mse.coor('cid3'),mse.coor('cid1')],"pos":[mse.coor('cid4'),mse.coor('cid2')],"fillStyle":"rgb(0, 0, 0)","globalAlpha":0.60,"font":"normal "+mse.coor('cid5')+"px Times","textAlign":"left"}); layers.mask.addObject(objs.obj12);
	pages.Content.addLayer('mask',layers.mask);
	layers.content=new mse.ArticleLayer(pages.Content,3,{"size":[mse.coor('cid19'),mse.coor('cid20')],"pos":[mse.coor('cid21'),mse.coor('cid22')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid23')+"px Gudea","textAlign":"left","textBaseline":"top","lineHeight":mse.coor('cid24')},null);
	objs.obj312=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’obscurité. ',true); layers.content.addObject(objs.obj312);
	objs.obj313=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Absolue, presque palpable. Une ',true); layers.content.addObject(objs.obj313);
	objs.obj314=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'chape de ténèbres qui s’était ',true); layers.content.addObject(objs.obj314);
	objs.obj315=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'abattue sur les épaules de Simon. ',true); layers.content.addObject(objs.obj315);
	objs.obj316=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Dark, terrifié, s’était réfugié ',true); layers.content.addObject(objs.obj316);
	objs.obj317=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'contre son ventre. Roulé en boule, ',true); layers.content.addObject(objs.obj317);
	objs.obj318=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'il poussait de petits cris. ',true); layers.content.addObject(objs.obj318);
	objs.obj319=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj319);
	objs.obj320=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Tout doux, tout doux, ',true);
	objs.obj319.addObject(objs.obj320);
	objs.obj321=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'murmurait l’adolescent en le ',true);
	objs.obj319.addObject(objs.obj321);
	objs.obj323=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'caressant, ça va aller…',true);
	objs.obj319.addObject(objs.obj323);
	objs.obj324=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Mais il avait lui-même du mal à se ',true); layers.content.addObject(objs.obj324);
	objs.obj325=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'rassurer. Il scrutait la pénombre à ',true); layers.content.addObject(objs.obj325);
	objs.obj326=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'la recherche d’un mouvement, ',true); layers.content.addObject(objs.obj326);
	objs.obj327=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'d’un indice qui pourrait lui faire ',true); layers.content.addObject(objs.obj327);
	objs.obj328=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'comprendre ce qui se passait.',true); layers.content.addObject(objs.obj328);
	objs.obj329=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'En quelques heures à peine, tous ',true); layers.content.addObject(objs.obj329);
	objs.obj330=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'ses repères avaient volé en éclats. ',true); layers.content.addObject(objs.obj330);
	objs.obj331=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Adieu la sécurité du foyer, la ',true); layers.content.addObject(objs.obj331);
	objs.obj332=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'bienveillance de Madame Lin et de ',true); layers.content.addObject(objs.obj332);
	objs.obj333=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'ses yeux verts. Adieu la tranquillité ',true); layers.content.addObject(objs.obj333);
	objs.obj334=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'des quelques mètres carrés de sa ',true); layers.content.addObject(objs.obj334);
	objs.obj335=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'chambre. Il était seul, dans le noir, ',true); layers.content.addObject(objs.obj335);
	objs.obj336=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'au beau milieu d’un réseau ',true); layers.content.addObject(objs.obj336);
	objs.obj337=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'souterrain - probablement les ',true); layers.content.addObject(objs.obj337);
	objs.obj338=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'catacombes, maintenant qu’il y ',true);
	objs.obj338.addLink(new mse.Link('catacombes',22,'wiki',wikis.Catacombes)); layers.content.addObject(objs.obj338);
	objs.obj339=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'réfléchissait - à attendre il ne ',true); layers.content.addObject(objs.obj339);
	objs.obj340=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'savait trop quoi.',true); layers.content.addObject(objs.obj340);
	objs.obj341=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'La Police ? ',true); layers.content.addObject(objs.obj341);
	objs.obj342=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il avait distinctement entendu ',true); layers.content.addObject(objs.obj342);
	objs.obj343=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'l’avertissement qui avait fait fuir ',true); layers.content.addObject(objs.obj343);
	objs.obj344=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'le prêtre vaudou et ses acolytes. ',true); layers.content.addObject(objs.obj344);
	objs.obj345=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Mais depuis, c’était le silence total. ',true); layers.content.addObject(objs.obj345);
	objs.obj346=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Mis à part le ploc ploc des gouttes',true);
	objs.obj346.addLink(new mse.Link('gouttes',30,'audio',mse.src.getSrc('gouttes'))); layers.content.addObject(objs.obj346);
	objs.obj347=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'qui suintaient du plafond, la ',true); layers.content.addObject(objs.obj347);
	objs.obj348=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'grotte restait murée dans un ',true); layers.content.addObject(objs.obj348);
	objs.obj349=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'mutisme inquiétant.',true); layers.content.addObject(objs.obj349);
	objs.obj350=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Son estomac se mit à rugir, ',true); layers.content.addObject(objs.obj350);
	objs.obj351=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'furieux d’être au trois quart vide. ',true); layers.content.addObject(objs.obj351);
	objs.obj352=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Le borborygme s’amplifia, ',true);
	objs.obj352.addLink(new mse.Link('borborygme',36,'wiki',wikis.Borborygme)); layers.content.addObject(objs.obj352);
	objs.obj353=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'ricochant sur les parois. C’était ',true); layers.content.addObject(objs.obj353);
	objs.obj354=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'raté pour la discrétion !',true); layers.content.addObject(objs.obj354);
	objs.obj355=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'unknown', 'src28' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj355);
	objs.obj356=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Y a quelqu’un ? ',true);
	objs.obj355.addObject(objs.obj356);
	objs.obj357=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Simon sursauta. La même voix ',true); layers.content.addObject(objs.obj357);
	objs.obj358=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'que tout à l’heure. ',true); layers.content.addObject(objs.obj358);
	objs.obj359=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'unknown', 'src28' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj359);
	objs.obj360=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Ventre-dieu ! Si quelqu’un ',true);
	objs.obj359.addObject(objs.obj360);
	objs.obj361=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'m’entend, venez m’aider !',true);
	objs.obj359.addObject(objs.obj361);
	objs.obj362=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'À présent, l’adolescent percevait ',true); layers.content.addObject(objs.obj362);
	objs.obj363=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'du bruit. Quelques mètres devant ',true);
	objs.obj363.addLink(new mse.Link('bruit',44,'audio',mse.src.getSrc('bruitsac1'))); layers.content.addObject(objs.obj363);
	objs.obj364=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'lui, probablement. Quelqu’un qui ',true); layers.content.addObject(objs.obj364);
	objs.obj365=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'s’agitait, comme s’il était pris au ',true); layers.content.addObject(objs.obj365);
	objs.obj366=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'piège. Comme s’il était enfermé ',true); layers.content.addObject(objs.obj366);
	objs.obj367=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'dans…',true); layers.content.addObject(objs.obj367);
	objs.obj368=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Le sac ! Le grand sac noir aux ',true); layers.content.addObject(objs.obj368);
	objs.obj369=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'pieds de Papa Legba !',true); layers.content.addObject(objs.obj369);
	objs.obj370=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'unknown', 'src28' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj370);
	objs.obj371=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Je sais que vous êtes là, je ',true);
	objs.obj370.addObject(objs.obj371);
	objs.obj372=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'vous entends respirer. Alors ',true);
	objs.obj370.addObject(objs.obj372);
	objs.obj375=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'décidez-vous ou je me fâche pour ',true);
	objs.obj370.addObject(objs.obj375);
	objs.obj376=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'de bon !',true);
	objs.obj370.addObject(objs.obj376);
	objs.obj377=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'D’instinct Simon bloqua sa ',true); layers.content.addObject(objs.obj377);
	objs.obj378=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'respiration. ',true); layers.content.addObject(objs.obj378);
	objs.obj379=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Le sac remua de plus belle.',true);
	objs.obj379.addLink(new mse.Link('Le sac ',54,'audio',mse.src.getSrc('bruitsac2'))); layers.content.addObject(objs.obj379);
	objs.obj380=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'unknown', 'src28' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj380);
	objs.obj381=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Alors c’est pour aujourd’hui ',true);
	objs.obj380.addObject(objs.obj381);
	objs.obj382=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'ou pour demain ?',true);
	objs.obj380.addObject(objs.obj382);
	objs.obj383=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Impossible de rester là sans rien ',true); layers.content.addObject(objs.obj383);
	objs.obj384=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'faire, songea l’adolescent.',true); layers.content.addObject(objs.obj384);
	objs.obj385=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il se leva avec précaution, prit sa ',true); layers.content.addObject(objs.obj385);
	objs.obj386=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'lampe et déposa Dark au fond de ',true); layers.content.addObject(objs.obj386);
	objs.obj387=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'son sac.',true); layers.content.addObject(objs.obj387);
	objs.obj388=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj388);
	objs.obj389=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Toi, tu restes là.',true);
	objs.obj388.addObject(objs.obj389);
	objs.obj390=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'unknown', 'src28' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj390);
	objs.obj391=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Je le savais ! Je le savais ! Qui ',true);
	objs.obj390.addObject(objs.obj391);
	objs.obj392=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'que vous soyez, merci du fond ',true);
	objs.obj390.addObject(objs.obj392);
	objs.obj394=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'du cœur !',true);
	objs.obj390.addObject(objs.obj394);
	objs.obj395=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Simon actionna le ',true); layers.content.addObject(objs.obj395);
	objs.obj396=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'bouton-poussoir de sa torche. ',true);
	objs.obj396.addLink(new mse.Link('torche',64,'audio',mse.src.getSrc('torche'))); layers.content.addObject(objs.obj396);
	objs.obj397=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Guidé par la lueur, il avançait avec ',true); layers.content.addObject(objs.obj397);
	objs.obj398=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'précaution. Le décor n’avait ',true); layers.content.addObject(objs.obj398);
	objs.obj399=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'soudain plus rien de merveilleux, ',true); layers.content.addObject(objs.obj399);
	objs.obj400=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'exhibant des reliefs pétris ',true); layers.content.addObject(objs.obj400);
	objs.obj401=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'d’ombres menaçantes. ',true); layers.content.addObject(objs.obj401);
	objs.obj402=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'À chaque pas, il avait l’impression ',true); layers.content.addObject(objs.obj402);
	objs.obj403=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'de s’enfoncer dans les entrailles ',true); layers.content.addObject(objs.obj403);
	objs.obj404=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'d’un lieu maudit, hérissé de ',true); layers.content.addObject(objs.obj404);
	objs.obj405=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'stalagmites carnassières. Un ',true);
	objs.obj405.addLink(new mse.Link('stalagmites',73,'wiki',wikis.Stalagmite)); layers.content.addObject(objs.obj405);
	objs.obj406=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'véritable décor de film d’horreur. ',true); layers.content.addObject(objs.obj406);
	objs.obj407=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Mais il ne pouvait pas abandonner ',true); layers.content.addObject(objs.obj407);
	objs.obj408=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'cet inconnu sans intervenir. Alors ',true); layers.content.addObject(objs.obj408);
	objs.obj409=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'il progressait, lentement, en ',true); layers.content.addObject(objs.obj409);
	objs.obj410=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'direction des jurons émis par le ',true); layers.content.addObject(objs.obj410);
	objs.obj411=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'sac.',true); layers.content.addObject(objs.obj411);
	objs.obj412=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Et soudain, il l’aperçut.',true); layers.content.addObject(objs.obj412);
	objs.obj413=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Enorme, sautillant comme un ver ',true); layers.content.addObject(objs.obj413);
	objs.obj414=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'sur un lit de braise. Un gros sac ',true); layers.content.addObject(objs.obj414);
	objs.obj415=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'noir, orné d’une fermeture éclair.',true); layers.content.addObject(objs.obj415);
	objs.obj416=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj416);
	objs.obj417=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Je… Je m’approche. Je viens ',true);
	objs.obj416.addObject(objs.obj417);
	objs.obj418=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'vous aider.',true);
	objs.obj416.addObject(objs.obj418);
	objs.obj419=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'unknown', 'src28' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj419);
	objs.obj420=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Eh bien, c’est pas trop tôt ',true);
	objs.obj419.addObject(objs.obj420);
	objs.obj421=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'mon gars.',true);
	objs.obj419.addObject(objs.obj421);
	objs.obj422=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Le sac cessa sa reptation. ',true); layers.content.addObject(objs.obj422);
	objs.obj423=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Simon hésita un instant puis se ',true); layers.content.addObject(objs.obj423);
	objs.obj424=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'baissa. ',true); layers.content.addObject(objs.obj424);
	objs.obj425=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il déposa sa lampe à terre, tira ',true); layers.content.addObject(objs.obj425);
	objs.obj426=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'d’un coup sec sur le zip avant de ',true); layers.content.addObject(objs.obj426);
	objs.obj427=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'se reculer d’un bond. ',true); layers.content.addObject(objs.obj427);
	objs.obj536=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj536);
	objs.obj539=new SacGame(); layers.content.addGame(objs.obj539);
	objs.obj537=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj537);
	objs.obj428=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Une main. Si blanche qu’elle en ',true); layers.content.addObject(objs.obj428);
	objs.obj429=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'paraissait translucide. Mangée de ',true); layers.content.addObject(objs.obj429);
	objs.obj430=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'touffes de poils jusqu’aux ',true); layers.content.addObject(objs.obj430);
	objs.obj431=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'phalanges. Puis une autre main. ',true); layers.content.addObject(objs.obj431);
	objs.obj432=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Et…',true); layers.content.addObject(objs.obj432);
	objs.obj433=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'C’est à cet instant précis que la ',true); layers.content.addObject(objs.obj433);
	objs.obj434=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'torche de Simon s’éteignit.',true); layers.content.addObject(objs.obj434);
	objs.unknown=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'unknown', 'src28' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.unknown);
	objs.obj547=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Qui a éteint la lumière ? ',true);
	objs.unknown.addObject(objs.obj547);
	objs.obj548=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'gronda la voix.',true);
	objs.unknown.addObject(objs.obj548);
	objs.obj437=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’homme - si c’en était un - ',true); layers.content.addObject(objs.obj437);
	objs.obj438=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'s’extirpa de sa prison de vinyle à ',true); layers.content.addObject(objs.obj438);
	objs.obj439=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'grand renfort de grognements. ',true); layers.content.addObject(objs.obj439);
	objs.obj440=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’adolescent restait immobile, ',true); layers.content.addObject(objs.obj440);
	objs.obj441=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'pétrifié de peur. Il pouvait à peine ',true); layers.content.addObject(objs.obj441);
	objs.obj442=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'deviner la silhouette de l’inconnu ',true); layers.content.addObject(objs.obj442);
	objs.obj443=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'dans la pénombre. Immense. ',true); layers.content.addObject(objs.obj443);
	objs.obj444=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Athlétique. ',true); layers.content.addObject(objs.obj444);
	objs.unknown=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'unknown', 'src28' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.unknown);
	objs.obj549=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Où êtes-vous ? hurla la voix. ',true);
	objs.unknown.addObject(objs.obj549);
	objs.simon=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.simon);
	objs.obj550=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Ici. Devant vous, monsieur.',true);
	objs.simon.addObject(objs.obj550);
	objs.angeli=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'angeli', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.angeli);
	objs.obj561=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Inspecteur Angéli de la ',true);
	objs.angeli.addObject(objs.obj561);
	objs.obj562=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Brigade Criminelle pour vous ',true);
	objs.angeli.addObject(objs.obj562);
	objs.obj567=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'servir, mystérieux sauveur. Mais ',true);
	objs.angeli.addObject(objs.obj567);
	objs.obj568=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'où sommes-nous et pourquoi ',true);
	objs.angeli.addObject(objs.obj568);
	objs.obj569=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'sommes-nous dans l’obscurité ?',true);
	objs.angeli.addObject(objs.obj569);
	objs.simon=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.simon);
	objs.obj551=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Je… je pense que nous avons ',true);
	objs.simon.addObject(objs.obj551);
	objs.obj552=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'échoué dans les catacombes ',true);
	objs.simon.addObject(objs.obj552);
	objs.obj554=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'et…',true);
	objs.simon.addObject(objs.obj554);
	objs.angeli=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'angeli', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.angeli);
	objs.obj570=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Les catacombes ? Nom d’un ',true);
	objs.angeli.addObject(objs.obj570);
	objs.obj571=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'chien écrasé, qu’est ce que je ',true);
	objs.angeli.addObject(objs.obj571);
	objs.obj573=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'fiche dans les catacombes ?',true);
	objs.angeli.addObject(objs.obj573);
	objs.simon=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.simon);
	objs.obj555=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Je ne sais…',true);
	objs.simon.addObject(objs.obj555);
	objs.angeli=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'angeli', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.angeli);
	objs.obj574=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Chut, je réfléchis. Et quand ',true);
	objs.angeli.addObject(objs.obj574);
	objs.obj575=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'l’inspecteur Angéli réfléchit, il ',true);
	objs.angeli.addObject(objs.obj575);
	objs.obj579=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'a besoin de silence. Trouve nous ',true);
	objs.angeli.addObject(objs.obj579);
	objs.obj580=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'plutôt de la lumière, veux-tu ?',true);
	objs.angeli.addObject(objs.obj580);
	objs.simon=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.simon);
	objs.obj556=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Bien, monsieur l’inspecteur.',true);
	objs.simon.addObject(objs.obj556);
	objs.obj463=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Simon se retourna dans la ',true); layers.content.addObject(objs.obj463);
	objs.obj464=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'direction où il pensait avoir laissé ',true); layers.content.addObject(objs.obj464);
	objs.obj465=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'son sac. Il avança les bras en ',true); layers.content.addObject(objs.obj465);
	objs.obj466=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'avant afin de ne pas se cogner ',true); layers.content.addObject(objs.obj466);
	objs.obj467=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'contre les parois. Malgré l’absence ',true); layers.content.addObject(objs.obj467);
	objs.obj468=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'de lumière, il finit par repérer la ',true); layers.content.addObject(objs.obj468);
	objs.obj469=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'minuscule niche où il s’était ',true); layers.content.addObject(objs.obj469);
	objs.obj470=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'réfugié à son arrivée.',true); layers.content.addObject(objs.obj470);
	objs.obj471=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il fouilla dans sa besace, sortit le ',true); layers.content.addObject(objs.obj471);
	objs.obj472=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Zippo qui ne le quittait jamais. ',true);
	objs.obj472.addLink(new mse.Link('Zippo',128,'wiki',wikis.Zippo)); layers.content.addObject(objs.obj472);
	objs.obj473=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Cadeau d’un père dont il n’avait ',true); layers.content.addObject(objs.obj473);
	objs.obj474=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'aucun souvenir. Au passage, il ',true); layers.content.addObject(objs.obj474);
	objs.obj475=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'gratifia Dark d’une caresse ',true); layers.content.addObject(objs.obj475);
	objs.obj476=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'amicale.',true); layers.content.addObject(objs.obj476);
	objs.simon=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.simon);
	objs.obj557=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'T’inquiètes pas mon vieux, il ',true);
	objs.simon.addObject(objs.obj557);
	objs.obj558=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'est de la Police. Tout devrait ',true);
	objs.simon.addObject(objs.obj558);
	objs.obj560=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'s’arranger.',true);
	objs.simon.addObject(objs.obj560);
	objs.obj480=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Mais, au fond de lui, Simon n’était ',true); layers.content.addObject(objs.obj480);
	objs.obj481=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'guère rassuré. L’inconnu était ',true); layers.content.addObject(objs.obj481);
	objs.obj482=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'certes inspecteur mais il l’avait ',true); layers.content.addObject(objs.obj482);
	objs.obj483=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'trouvé gémissant au fond d’un ',true); layers.content.addObject(objs.obj483);
	objs.obj484=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'sac…',true); layers.content.addObject(objs.obj484);
	objs.obj485=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’adolescent actionna la pierre du ',true);
	objs.obj485.addLink(new mse.Link('actionna',139,'audio',mse.src.getSrc('zippo'))); layers.content.addObject(objs.obj485);
	objs.obj486=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'briquet et se mit en quête des ',true); layers.content.addObject(objs.obj486);
	objs.obj487=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'bougies qui enluminaient la pièce ',true); layers.content.addObject(objs.obj487);
	objs.obj488=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'lors de la cérémonie. Peu à peu, ',true); layers.content.addObject(objs.obj488);
	objs.obj489=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'les lueurs repoussèrent les ',true); layers.content.addObject(objs.obj489);
	objs.obj490=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'ombres.',true); layers.content.addObject(objs.obj490);
	objs.obj601=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},' ',true); layers.content.addObject(objs.obj601);
	objs.angeli=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'angeli', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.angeli);
	objs.obj581=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Tu m’as l’air bien jeune pour ',true);
	objs.angeli.addObject(objs.obj581);
	objs.obj582=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'traîner dans des endroits ',true);
	objs.angeli.addObject(objs.obj582);
	objs.obj587=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'aussi peu fréquentables ! asséna ',true);
	objs.angeli.addObject(objs.obj587);
	objs.obj588=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Angéli en posant sa main sur ',true);
	objs.angeli.addObject(objs.obj588);
	objs.obj589=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'l’épaule de l’adolescent.',true);
	objs.angeli.addObject(objs.obj589);
	objs.obj496=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Surpris, Simon poussa un cri en ',true); layers.content.addObject(objs.obj496);
	objs.obj497=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'sursautant. ',true); layers.content.addObject(objs.obj497);
	objs.angeli=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'angeli', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.angeli);
	objs.obj590=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Désolé petit, je n’ai pas voulu ',true);
	objs.angeli.addObject(objs.obj590);
	objs.obj591=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'te faire peur, ajouta ',true);
	objs.angeli.addObject(objs.obj591);
	objs.obj594=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'l’inspecteur en le faisant pivoter ',true);
	objs.angeli.addObject(objs.obj594);
	objs.obj595=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'face à lui.',true);
	objs.angeli.addObject(objs.obj595);
	objs.obj501=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’adolescent découvrit alors le ',true); layers.content.addObject(objs.obj501);
	objs.obj502=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'policier. Et il se figea, pétrifié de ',true);
	objs.obj502.addLink(new mse.Link('pétrifié',151,'audio',mse.src.getSrc('zombie'))); layers.content.addObject(objs.obj502);
	objs.obj503=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'terreur. ',true); layers.content.addObject(objs.obj503);
	objs.obj529=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj529);
	objs.obj532=new mse.Image(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid28')],"pos":[mse.coor('cid29'),mse.coor('cid5')]},'src10');
	objs.obj532.activateZoom(); layers.content.addObject(objs.obj532);
	objs.obj530=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj530);
	objs.obj504=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’homme était entièrement nu, ',true); layers.content.addObject(objs.obj504);
	objs.obj505=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'une longue cicatrice balafrant son ',true); layers.content.addObject(objs.obj505);
	objs.obj506=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'torse, un trou s’ouvrant en regard ',true); layers.content.addObject(objs.obj506);
	objs.obj507=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'de son cœur. Blanc comme un ',true); layers.content.addObject(objs.obj507);
	objs.obj508=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'linceul, hirsute, il semblait tout ',true); layers.content.addObject(objs.obj508);
	objs.obj509=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'droit sorti d’un film de zombi !',true); layers.content.addObject(objs.obj509);
	objs.angeli=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'angeli', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.angeli);
	objs.obj596=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Et alors, qu’est ce qui t’arrive ',true);
	objs.angeli.addObject(objs.obj596);
	objs.obj597=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'petit ? On dirait que tu as vu ',true);
	objs.angeli.addObject(objs.obj597);
	objs.obj599=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'un revenant…',true);
	objs.angeli.addObject(objs.obj599);
	objs.obj513=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Mais Simon était incapable ',true); layers.content.addObject(objs.obj513);
	objs.obj514=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'d’articuler la moindre parole. Il se ',true); layers.content.addObject(objs.obj514);
	objs.obj515=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'contenta de lever son bras, l’index ',true); layers.content.addObject(objs.obj515);
	objs.obj516=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'tendu en direction de l’orifice.',true); layers.content.addObject(objs.obj516);
	objs.obj517=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’inspecteur haussa les sourcils ',true); layers.content.addObject(objs.obj517);
	objs.obj518=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'puis baissa le regard. ',true); layers.content.addObject(objs.obj518);
	objs.obj519=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il détailla les blessures qui ',true); layers.content.addObject(objs.obj519);
	objs.obj520=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'ornaient sa poitrine d’une main ',true); layers.content.addObject(objs.obj520);
	objs.obj521=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'curieuse. Puis il se redressa pour ',true); layers.content.addObject(objs.obj521);
	objs.obj522=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'fixer l’adolescent dans les yeux.',true); layers.content.addObject(objs.obj522);
	objs.angeli=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'angeli', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.angeli);
	objs.obj600=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Ben merde, alors !',true);
	objs.angeli.addObject(objs.obj600);
	objs.obj524=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Ce fut la dernière parole ',true); layers.content.addObject(objs.obj524);
	objs.obj525=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'qu’entendit l’adolescent avant de ',true); layers.content.addObject(objs.obj525);
	objs.obj526=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'s’évanouir.',true); layers.content.addObject(objs.obj526);
	objs.obj533=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj533);
	objs.obj535=new ShootZombie(); layers.content.addGame(objs.obj535);
	objs.obj527=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj527);
	objs.obj528=new mse.Text(layers.content,{"size":[mse.coor('cid19'),mse.coor('cid24')],"pos":[mse.coor('cid2'),mse.coor('cid30')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"bold "+mse.coor('cid31')+"px Gudea","textAlign":"center"},'À SUIVRE...',true); layers.content.addObject(objs.obj528);
	layers.content.setDefile(1300);
	temp.layerDefile=layers.content;
	pages.Content.addLayer('content',layers.content);
	layers.light=new mse.Layer(pages.Content,4,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj281=new mse.Image(layers.light,{"size":[mse.coor('cid32'),mse.coor('cid32')],"pos":[mse.coor('cid33'),mse.coor('cid34')],"fillStyle":"rgb(0, 0, 0)","globalAlpha":0,"font":"normal "+mse.coor('cid5')+"px Times","textAlign":"left"},'src18'); layers.light.addObject(objs.obj281);
	pages.Content.addLayer('light',layers.light);
	animes.titleanime=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.titleanime.block=true;
	animes.titleanime.addObj('obj9',objs.obj9);
	animes.titleanime.addAnimation('obj9',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,1,1]')});
	animes.resumeanime=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.resumeanime.block=true;
	animes.resumeanime.addObj('obj11',objs.obj11);
	animes.resumeanime.addAnimation('obj11',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,1,1]')});
	animes.sacanime2=new mse.Animation(145,1,true,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.sacanime2.block=true;
	temp.obj=new mse.Sprite(null,{'pos':[mse.coor('cid45'),mse.coor('cid46')],'size':[mse.coor('cid1'),mse.coor('cid47')]},'src11',600,282, 0,0,600,564);
	animes.sacanime2.addObj('src11',temp.obj);
	temp.obj=new mse.Image(null,{'pos':[mse.coor('cid48'),mse.coor('cid49')],'size':[mse.coor('cid50'),mse.coor('cid51')]},'src13');
	animes.sacanime2.addObj('src13',temp.obj);
	temp.obj=new mse.Image(null,{'pos':[mse.coor('cid45'),mse.coor('cid52')],'size':[mse.coor('cid1'),mse.coor('cid53')]},'src12');
	animes.sacanime2.addObj('src12',temp.obj);
	animes.sacanime2.addAnimation('src11',{'frame':JSON.parse('[0,13,18,68,118,131,144,145]'),'spriteSeq':JSON.parse('[0,0,1,1,1,1,1,1]'),'opacity':JSON.parse('[0,1,1,1,1,1,0,0]')});
	animes.sacanime2.addAnimation('src13',{'frame':JSON.parse('[0,13,18,68,118,131,144,145]'),'pos':[[mse.coor('cid48'),mse.coor('cid49')],[mse.coor('cid48'),mse.coor('cid49')],[mse.coor('cid48'),mse.coor('cid49')],[mse.coor('cid48'),mse.coor('cid49')],[mse.coor('cid54'),mse.coor('cid55')],[mse.coor('cid54'),mse.coor('cid55')],[mse.coor('cid54'),mse.coor('cid55')],[mse.coor('cid54'),mse.coor('cid55')]],'opacity':JSON.parse('[1,1,1,1,1,1,0,0]')});
	animes.sacanime2.addAnimation('src12',{'frame':JSON.parse('[0,13,18,68,118,131,144,145]'),'opacity':JSON.parse('[1,1,1,1,1,1,0,0]')});
	animes.hidelight=new mse.Animation(14,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.hidelight.block=true;
	animes.hidelight.addObj('obj281',objs.obj281);
	animes.hidelight.addAnimation('obj281',{'frame':JSON.parse('[0,13,14]'),'opacity':JSON.parse('[1,0,0]')});
	animes.showlight=new mse.Animation(72,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.showlight.block=true;
	animes.showlight.addObj('obj281',objs.obj281);
	animes.showlight.addAnimation('obj281',{'frame':JSON.parse('[0,13,33,71,72]'),'opacity':JSON.parse('[0,1,1,1,1]'),'pos':[[mse.coor('cid56'),mse.coor('cid57')],[mse.coor('cid56'),mse.coor('cid57')],[mse.coor('cid3'),mse.coor('cid59')],[mse.coor('cid60'),mse.coor('cid61')],[mse.coor('cid60'),mse.coor('cid61')]]});
	animes.maskanime=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.maskanime.block=true;
	animes.maskanime.addObj('obj310',objs.obj310);
	animes.maskanime.addAnimation('obj310',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,0.60000002384186,0.60000002384186]')});
	animes.chaanime=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.chaanime.block=true;
	animes.chaanime.addObj('obj311',objs.obj311);
	animes.chaanime.addAnimation('obj311',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,1,1]')});
	var action={};
	var reaction={};
	action.couvcursor=new mse.Script([{src:pages.Couverture,type:'show'}]);
	reaction.couvcursor=function(){ 
		mse.setCursor('pointer'); 
	};
	action.couvcursor.register(reaction.couvcursor);
	action.addTextEffet=action.couvcursor;
	reaction.addTextEffet=function(){ 
		function textEffect(effet,obj) {
	obj.startEffect(effet);
}
for(var i = 0; i < layers.content.objList.length; i++){
	var objCible = layers.content.getObject(i);
	if(objCible instanceof mse.Text){
	    objCible.addListener('firstShow', new mse.Callback(textEffect, null, {"typewriter":{}}, objCible));
	}
} 
	};
	action.addTextEffet.register(reaction.addTextEffet);
	action.transTitle=new mse.Script([{src:pages.Couverture,type:'click'}]);
	reaction.transTitle=function(){ 
		root.transition(pages.Title); 
	};
	action.transTitle.register(reaction.transTitle);
	action.curDefTitle=new mse.Script([{src:pages.Title,type:'show'}]);
	reaction.curDefTitle=function(){ 
		mse.setCursor('default'); 
	};
	action.curDefTitle.register(reaction.curDefTitle);
	action.transContent=new mse.Script([{src:pages.Title,type:'click'}]);
	reaction.transContent=function(){ 
		root.transition(pages.Content); 
	};
	action.startMaskAnime=action.curDefTitle;
	reaction.startMaskAnime=function(){ 
		animes.maskanime.start(); 
	};
	action.startMaskAnime.register(reaction.startMaskAnime);
	action.startChaAnime=action.curDefTitle;
	reaction.startChaAnime=function(){ 
		animes.chaanime.start(); 
	};
	action.startChaAnime.register(reaction.startChaAnime);
	action.startResumeAnime=action.curDefTitle;
	reaction.startResumeAnime=function(){ 
		animes.resumeanime.start(); 
	};
	action.startResumeAnime.register(reaction.startResumeAnime);
	action.startTitleAnime=action.curDefTitle;
	reaction.startTitleAnime=function(){ 
		animes.titleanime.start(); 
	};
	action.startTitleAnime.register(reaction.startTitleAnime);
	action.addTransContent=new mse.Script([{src:animes.maskanime,type:'end'}]);
	reaction.addTransContent=function(){ 
		action.transContent.register(reaction.transContent); 
	};
	action.addTransContent.register(reaction.addTransContent);
	action.curPtTitle=action.addTransContent;
	reaction.curPtTitle=function(){ 
		mse.setCursor('pointer'); 
	};
	action.curPtTitle.register(reaction.curPtTitle);
	action.curContent=new mse.Script([{src:pages.Content,type:'show'}]);
	reaction.curContent=function(){ 
		mse.setCursor('default'); 
	};
	action.curContent.register(reaction.curContent);
	action.startIntroSon=action.transTitle;
	reaction.startIntroSon=function(){ 
		mse.src.getSrc('intro').play(); 
	};
	action.startIntroSon.register(reaction.startIntroSon);
	action.startIntroSonEnd=new mse.Script([{src:objs.obj528,type:'click'}]);
	reaction.startIntroSonEnd=function(){ 
		mse.src.getSrc('intro').play(); 
	};
	action.startIntroSonEnd.register(reaction.startIntroSonEnd);
	action.startIntroSonEnd2=new mse.Script([{src:objs.obj528,type:'firstShow'}]);
	reaction.startIntroSonEnd2=function(){ 
		mse.src.getSrc('intro').play(); 
	};
	action.startIntroSonEnd2.register(reaction.startIntroSonEnd2);
	action.sstartBougieGame=new mse.Script([{src:objs.obj601,type:'firstShow'}]);
	reaction.sstartBougieGame=function(){ 
		games.Bougie.start(); 
	};
	action.sstartBougieGame.register(reaction.sstartBougieGame);
	action.startAngoisse=new mse.Script([{src:objs.obj312,type:'firstShow'}]);
	reaction.startAngoisse=function(){ 
		mse.src.getSrc('angoisse').play(); 
	};
	action.startAngoisse.register(reaction.startAngoisse);
	action.startMerde=new mse.Script([{src:objs.obj600,type:'firstShow'}]);
	reaction.startMerde=function(){ 
		mse.src.getSrc('merde').play(); 
	};
	action.startMerde.register(reaction.startMerde);
	action.stopIntroson=action.curContent;
	reaction.stopIntroson=function(){ 
		mse.src.getSrc('intro').pause(); 
	};
	action.stopIntroson.register(reaction.stopIntroson);
	mse.currTimeline.start();};
mse.autoFitToWindow(createbook);