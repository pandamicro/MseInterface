// Ghost
var Ghost = function(ox, oy, target, layer) {
    this.model = new mdj.BoxModel(ox, oy, 17, 36);
    this.model.target = target;
    this.model.count = 50;
    this.model.opacity = 0;
    this.model.dir = randomInt(4);
    this.model.state = "BIRTH";
    this.model.logic = this.modellogic;
    
    this.view = new mdj.Sprite(this.model, 'ghost', {w:17,h:36,sx:0,sy:0,sw:68,sh:144});
    this.view.addAnime("down", new mdj.AnimationSprite(this.view, [0,1,2,3,0], 0, 4));
    this.view.addAnime("left", new mdj.AnimationSprite(this.view, [4,5,6,7,4], 0, 4));
    this.view.addAnime("right", new mdj.AnimationSprite(this.view, [8,9,10,11,8], 0, 4));
    this.view.addAnime("up", new mdj.AnimationSprite(this.view, [12,13,14,15,12], 0, 4));
    this.model.proxy.addListener('movement', new mse.Callback(function(e){
        if(e.dx > 0) var dir = 'right';
        else if(e.dx < 0) var dir = 'left';
        else if(e.dy > 0) var dir = 'down';
        else if(e.dy < 0) var dir = 'up';
        if(this.prevDir != dir) {
            this.playAnime(dir);
        }
        this.prevDir = dir;
    }, this.view));
    
    layer.addObj(this.view);
    
    this.reinit = function(ox, oy) {
        this.model.count = 20;
        this.model.opacity = 0;
        this.model.state = "BIRTH";
        this.model.setPos(ox, oy);
    };
};
Ghost.prototype = {
    constructor: Ghost,
    borderx: 1570,
    bordery: 1250,
    modellogic: function() {
        if(this.state == "DEAD" || this.state == "WIN" || this.target.game.state != "PLAYING") return;
        if(this.state == 'BIRTH') {
            if(this.opacity < 1) {
                this.opacity += 0.05;
            }
            else this.state = "LOOK";
            return;
        }
        else if(this.state == "DIEING") {
            if(this.opacity > 0.1) {
                this.opacity -= 0.1;
            }
            else this.state = "DEAD";
            return;
        }
        var dis = distance2Pts(this.ox+8, this.oy+18, this.target.ox+8, this.target.oy+18);
        // Catch check
        if(dis < 20) {
            this.state = "WIN";
            this.target.game.state = "LOSE";
            this.target.game.count = 50;
            this.target.game.input.disable();
            this.target.inputv = 0;
            this.target.game.showMsg("Tu as été rattrapé par un fantôme!");
        }
        // Dead check
        var angle = mseAngleForLine(this.target.ox+8, this.target.oy+18, this.ox+8, this.oy+18);
        if(dis < 120) {
            if( (this.target.orient == "LEFT" && (angle > 150 || angle < -150)) ||
                (this.target.orient == "RIGHT" && (angle > -30 && angle < 30)) ||
                (this.target.orient == "DOWN" && (angle > 60 && angle < 120)) ||
                (this.target.orient == "UP" && (angle > -120 && angle < -60)) )
                this.state = "DIEING";
        }
        // Other logic
        if(this.state == "LOOK") {
            if(dis <= 180)
                this.state = "CHASING";
            else {
                if(this.count == 0) {
                    this.dir = randomInt(4);
                    this.count = randomInt(50) + 40;
                }
                else --this.count;
                
                switch(this.dir) {
                case 0: this.move(0, -2);break;
                case 1: this.move(2, 0);break;
                case 2: this.move(0, 2);break;
                case 3: this.move(-2, 0);break;
                }
                if(this.ox < 50 || this.oy < 50 || this.ox > this.borderx || this.oy > this.bordery)
                    this.count = 0;
            }
        }
        else if(this.state == "CHASING") {
            var disy = this.target.oy - this.oy, disx = this.target.ox - this.ox;
            var absdisy = Math.abs(disy), absdisx = Math.abs(disx);
            if(absdisy > 10) this.move(0, 6 * disy/absdisy);
            else if(absdisx > 10) this.move(6 * disx/absdisx, 0);
        }
    }
};


var Donjon = function(){
    mse.Game.call(this, {fillback:true});
    
    mse.src.addSource('light', 'games/trans.png', 'img', true);
    mse.src.addSource('sprite', 'games/sprite.png', 'img', true);
    mse.src.addSource('batery', 'games/Batterie.png', 'img', true);
    mse.src.addSource('map', 'games/map.jpg', 'img', true);
    mse.src.addSource('ghost', 'games/ghost.png', 'img', true);
    
    var row = 40, col = 50;
    var simonox = 31*32+7, simonoy = 2*32;
    
    this.msg = {
        "INIT": "Clique pour jouer.",
        "WIN": "Bravo!!! Tu as gagné.",
        "LOSE": "Perdu..."
    };
    this.config.title = "Labyrinthe";
    this.objGid = {
        hole: [12+11*col, 31+15*col, 32+15*col, 19+20*col, 23+29*col, 25+29*col, 39+32*col],
        skelton: [12+8*col, 15+8*col, 18+8*col, 30+2*col, 32+2*col, 30+5*col, 32+5*col, 35+5*col, 43+5*col, 44+4*col, 44+6*col, 29+18*col, 34+18*col, 17+30*col, 13+32*col, 28+34*col, 32+34*col, 31+35*col, 28+36*col, 32+37*col, 30+38*col],
        door: [29+34*col, 4+16*col]
    };
    
    this.currScene = new mdj.TileMapScene(this, 32*col, 32*row, 
                                          mse.configs.getSrcPath("games/map2.tmx"),
                                          "games/", 
                                          new mse.Callback(function(){
        // Lazy init function
        // Simon model and input
        this.simonM = new mdj.BoxModel(simonox, simonoy, 17, 37);
        this.simonM.setCollisionBox(2,20,13,17);
        this.simonM.orient = "DOWN";
        this.simonM.game = this;
        // Interaction
        this.input = new mdj.DirectionalInput(this, this.simonM, null);
        this.input.proxy.addListener('dirChange', new mse.Callback(function(e){
            switch(e.dir) {
            case "DOWN": case "UP": case "LEFT": case "RIGHT": 
                this.simonV.playAnime('run'+e.dir);
                this.simonM.orient = e.dir;
                break;
            case "NONE":
                this.simonV.stopAnime();
                switch (e.prev) {
                case "DOWN": this.simonV.setFrame(0);break;
                case "UP": this.simonV.setFrame(4);break;
                case "LEFT": this.simonV.setFrame(15);break;
                case "RIGHT": this.simonV.setFrame(8);break;
                }
            }
        }, this));
        // Collision
        var colliDetector = new mdj.CollisionDetector(this.simonM);
        colliDetector.register('tilelayer', this.currScene.getLayer('colli'), this.simonM.cancelMove);
        // Collision with objs
        colliDetector.register('objs', this.currScene.getLayer('elem'), new mse.Callback(function(e){
            if($.inArray(e.gid, this.objGid.hole) != -1) {
                this.simonV.playAnime('turn');
                this.simonM.setPos(simonox, simonoy);
            }
            else if($.inArray(e.gid, this.objGid.skelton) != -1) {
                this.simonM.inputv = 0.5;
                this.simonM.count = 5;
            }
            else if($.inArray(e.gid, this.objGid.door) != -1) {
                this.state = "WIN";
                this.count = 50;
                this.input.disable();
                this.simonM.inputv = 0;
                this.simonV.getAnime('turn').rep = 4;
                this.simonV.playAnime('turn');
                this.showMsg("Simon a trouvé la sortie !");
            }
        }, this));
        this.simonM.logic = function(delta) {
            if(this.inputv == 0.5) {
                if(this.count == 0) this.inputv = 4;
                else --this.count;
            }
        };
        // Simon view and animations
        this.simonV = new mdj.Sprite(this.simonM, 'sprite', {w:17,h:37,sx:0,sy:0,sw:68,sh:148});
        this.simonV.addAnime("runDOWN", new mdj.AnimationSprite(this.simonV, [0,1,2,3,0], 0, 4));
        this.simonV.addAnime("runUP", new mdj.AnimationSprite(this.simonV, [4,5,6,7,4], 0, 4));
        this.simonV.addAnime("runRIGHT", new mdj.AnimationSprite(this.simonV, [8,9,10,11,10,9,8], 0, 4));
        this.simonV.addAnime("runLEFT", new mdj.AnimationSprite(this.simonV, [15,14,13,12,13,14,15], 0, 4));
        this.simonV.addAnime("turn", new mdj.AnimationSprite(this.simonV, [15,4,8,0], 8, 2));
        
        var persoLayer = new mdj.ObjLayer("perso", this.currScene, 4);
        persoLayer.addObj(this.simonV);
        
        // Ghost layer
        this.ghosts = [];
        for(var i = 0; i < 10; i++) {
            this.ghosts.push(new Ghost(50 + randomInt(1700), 50 + randomInt(1200), this.simonM, persoLayer));
        }
        
        this.camera = new mdj.Camera(this.width, this.height, this.currScene, this.simonM, 8, 18);
        
        this.lazyInit();
    }, this));
    
    var maskLayer = new mdj.Layer("mask", this.currScene, 3);
    maskLayer.draw = function(ctx){
        var game = this.getScene().game;
        ctx.save();
        ctx.translate(game.camera.ox, game.camera.oy);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.rect(0,0,game.width,game.height);
        
        var x = game.simonM.getX() - game.camera.ox;
        var y = game.simonM.getY() - game.camera.oy;
        ctx.translate(x+8, y+18);
        switch(game.simonM.orient) {
        case "DOWN": ctx.rotate(0.5*Math.PI);break;
        case "UP": ctx.rotate(-0.5*Math.PI);break;
        case "LEFT": ctx.rotate(Math.PI);break;
        case "RIGHT": break;
        }
        ctx.arc(0, 0, 118.5, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        ctx.drawImage(mse.src.getSrc('light'), -119, -119);
        ctx.restore();
    };
    
    // Help message
    if(MseConfig.iOS) this.help = "Aide Simon à sortir du labyrinthe, fais glliser ton doigt dans la direction souhaitée.";
    else this.help = "Aide Simon à sortir du labyrinthe, à l'aide des flèches.";
    this.info = new mse.Text(null, {pos:[90,0],size:[this.width-180,0],font:"20px Arial",textAlign:"center",textBaseline:"top",fillStyle:"#000",lineHeight:25}, this.help, true);
    this.info.setY((this.height - this.info.height)/2);
    
    // Light
    this.light = new mse.Sprite(null, {pos:[20,20],size:[22,9]}, 'batery', 22,9, 0,0,132,9);
    // Map
    this.map = new mse.Image(null, {pos:[2*this.width/3-20, 20],size:[this.width/3,0.715*this.width/3]}, 'map');
    
    this.state = "INIT";
};
extend(Donjon, mse.Game);
$.extend(Donjon.prototype, {
    init: function() {
        this.currScene.init();
        
        // Ghosts
        for(var i = 0; i < this.ghosts.length; ++i)
            this.ghosts[i].reinit(50 + randomInt(1700), 50 + randomInt(1200));
        
        // UI objects
        this.showMsg(this.help);
        this.light.setFrame(0);

        this.state = "PREINIT";
        this.currTime = 0;
        this.nblight = 3;
    },
    lazyInit: function() {
        this.input.setTarProxy(this.getEvtProxy());
        this.simonM.inputv = 4;
        this.simonM.setPos(31*32+7, 2*32);
        // Orientation
        this.simonM.orient = "DOWN";
        
        this.simonV.playAnime('turn');
        
        this.state = "INIT";
    },
    showMsg: function(txt) {
        this.info.setText(txt);
        this.msgVisible = true;
        this.msgCount = 40;
    },
    mobileLazyInit: function() {
    },
    logic: function(delta) {
        if(this.state == "INIT" && this.currTime > 5) {
            this.state = "PLAYING";
            this.msgVisible = false;
            this.input.enable();
            this.currTime == 1;
        }
        if(this.state == "PLAYING") {
            if(this.currTime % 8 < 0.04) {
                if(this.light.curr < 5) this.light.setFrame(this.light.curr+1);
            }
            if(this.currTime % 40 < 0.04) {
                if(this.nblight >= 1) {
                    this.nblight--;
                    this.light.setFrame(0);
                }
                if(this.nblight == 0) {
                    this.state = "LOSE";
                    this.count = 50;
                    this.input.disable();
                    this.showMsg("Il n'y a plus de pile !");
                }
            }
            if(this.msgVisible) {
                if(this.msgCount == 0) this.msgVisible = false;
                else --this.msgCount;
            }
        }
        if(this.state == "WIN" || this.state == "LOSE") {
            if(this.count == 0) {
                if(this.state == "WIN") {
                    this.setScore( 4000 / this.currTime );
                    this.win()
                }
                else {
                    this.setScore( 0 );
                    this.lose();
                }
            }
            else this.count--;
        }
        this.currScene.logic(delta);
        for(var i = 0; i < this.ghosts.length; ++i) {
            if(this.ghosts[i].model.state == "DEAD") {
                this.ghosts[i].reinit(50 + randomInt(1700), 50 + randomInt(1200));
            }
        }
        
        this.currTime += 0.04;
    },
    draw: function(ctx) {
        ctx.save();
        
        this.camera.drawScene(ctx);
        
        // Light
        this.light.draw(ctx);
        ctx.fillStyle = "#fff";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.font = "10px Arial";
        ctx.fillText(this.nblight, 45, 20);
        // Map
        ctx.globalAlpha = 0.5;
        this.map.draw(ctx);
        ctx.globalAlpha = 1;
        // Msg
        if(this.msgVisible) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#fff";
            ctx.globalAlpha = ctx.globalAlpha * 0.3;
            ctx.fillRoundRect(50,this.info.offy-30,this.width-100,this.info.height+60, 10);
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 0;
            this.info.draw(ctx);
        }
        
        ctx.restore();
    }
});
mse.coords = JSON.parse('{"cid0":800,"cid1":600,"cid2":0,"cid3":400,"cid4":200,"cid5":20,"cid6":452.5,"cid7":56.25,"cid8":173.75,"cid9":107.5,"cid10":32.5,"cid11":396.25,"cid12":203.75,"cid13":246.25,"cid14":357.5,"cid15":181.25,"cid16":222.5,"cid17":398.75,"cid18":17.5,"cid19":340,"cid20":590,"cid21":230,"cid22":10,"cid23":22.5,"cid24":36.25,"cid25":425,"cid26":295,"cid27":306,"cid28":260.11566018424,"cid29":17,"cid30":33,"cid31":174,"cid32":108,"cid33":449,"cid34":109,"cid35":201,"cid36":246,"cid37":396,"cid38":56,"cid39":18,"cid40":223,"cid41":399,"cid42":358,"cid43":181,"cid44":119,"cid45":-21,"cid46":566,"cid47":790,"cid48":269,"cid49":154,"cid50":268,"cid51":351,"cid52":263,"cid53":158,"cid54":266,"cid55":273,"cid56":265,"cid57":235,"cid58":178,"cid59":320,"cid60":421,"cid61":241,"cid62":234}');
initMseConfig();
mse.init();
window.pages={};
var layers={};
window.objs={};
var animes={};
var games={};
var wikis={};
function createbook(){
	if(config.publishMode == 'debug') mse.configs.srcPath='./Voodoo_Ch3/';
	window.root = new mse.Root('Voodoo_Ch3',mse.coor('cid0'),mse.coor('cid1'),'portrait');
	var temp = {};
	mse.src.addSource('src0','images/src0.jpeg','img',true);
	games.Donjon = new Donjon();
	mse.src.addSource('src2','images/src2.png','img',true);
	mse.src.addSource('src3','images/src3.jpeg','img',true);
	mse.src.addSource('src4','images/src4.jpeg','img',true);
	mse.src.addSource('src5','images/src5.jpeg','img',true);
	mse.src.addSource('src7','images/src7.png','img',true);
	mse.src.addSource('src8','images/src8.png','img',true);
	mse.src.addSource('src9','images/src9.jpeg','img',true);
	mse.src.addSource('src10','images/src10.jpeg','img',true);
	mse.src.addSource('src11','images/src11.jpeg','img',true);
	mse.src.addSource('src12','images/src12.jpeg','img',true);
	mse.src.addSource('src13','images/src13.jpeg','img',true);
	mse.src.addSource('src15','images/src15.png','img',true);
	mse.src.addSource('src16','images/src16.jpeg','img',true);
	wikis.Gallinace=new mse.WikiLayer();
	wikis.Gallinace.addTextCard();
	wikis.Gallinace.textCard.addSection('Gallinacé', 'Nom : Désigne la plupart des oiseaux de la basse-cour : poule, coq, dindon, paon, faisan, perdrix, caille. \nAdjectif : De la famille de la poule ou du coq.\n');
	wikis.Gallinace.textCard.addLink('Wikipédia', 'http:\/\/fr.wikipedia.org\/wiki\/Gallinac%C3%A9');
	wikis.Veve=new mse.WikiLayer();
	wikis.Veve.addTextCard();
	wikis.Veve.textCard.addSection('Vévé', 'Dessin qui réunit les symboles d’un esprit vaudou.');
	wikis.Veve.textCard.addLink('Wikipédia', 'http:\/\/fr.wikipedia.org\/wiki\/V%C3%A9v%C3%A9');
	wikis.PapaLegba=new mse.WikiLayer();
	wikis.PapaLegba.addTextCard();
	wikis.PapaLegba.textCard.addSection('Papa Legba', 'Divinité vaudou. C’est le messager des dieux, il est le gardien de la frontière entre le monde des dieux et celui des hommes.');
	wikis.PapaLegba.textCard.addLink('Wikipédia', 'http:\/\/fr.wikipedia.org\/wiki\/Papa_Legba');
	wikis.Vaudou=new mse.WikiLayer();
	wikis.Vaudou.addTextCard();
	wikis.Vaudou.textCard.addSection('Vaudou', 'C’est une religion originaire d’Afrique, importée dans les Caraïbes et en Amérique par les esclaves à partir du XVI ième siècle. C’est un mélange de pratiques magiques, de sorcellerie, influencées par les rituels africains et chrétiens. Environ 50 millions de personnes pratiquent actuellement le vaudou. ');
	wikis.Vaudou.textCard.addLink('Wikipédia', 'http:\/\/fr.wikipedia.org\/wiki\/Vaudou');
	wikis.Troglodyte=new mse.WikiLayer();
	wikis.Troglodyte.addImage('src13', 'Troglodyte par Aralcal');
	wikis.Troglodyte.addImage('src10', 'Maison troglodyte des Pays de la Loire.  Photo de Nicolas Boullosa');
	wikis.Troglodyte.addImage('src11', 'Village troglodyte effondré en Cappadoce (Turquie). Photo de Claude Valette');
	wikis.Troglodyte.addTextCard();
	wikis.Troglodyte.textCard.addSection('Troglodyte', 'Nom masculin : Personne qui habite une grotte ou un habitat creusé dans la roche - Petit passereau au plumage brun-gris, à la queue redressée, au bec fin, qui vit en Europe et en Amérique du Nord.');
	wikis.Troglodyte.textCard.addLink('Wikipédia', 'http:\/\/fr.wikipedia.org\/wiki\/Habitat_troglodytique');
	mse.src.addSource('src17','images/src17.jpeg','img',true);
	mse.src.addSource('src19','images/src19.jpeg','img',true);
	mse.src.addSource('intro','audios/intro','aud',false);
	mse.src.addSource('angoisse','audios/angoisse','aud',false);
	mse.src.addSource('dark1','audios/dark1','aud',false);
	mse.src.addSource('angoisse2','audios/angoisse2','aud',false);
	mse.src.addSource('arracha','audios/arracha','aud',false);
	mse.src.addSource('voixetpoule','audios/voixetpoule','aud',false);
	mse.src.addSource('psalmodie','audios/psalmodie','aud',false);
	mse.src.addSource('anime','audios/anime','aud',false);
	mse.src.addSource('hurle','audios/hurle','aud',false);
	mse.src.addSource('sonChute','audios/sonChute','aud',false);
	mse.src.addSource('sonSang','audios/sonSang','aud',false);
	mse.src.addSource('gutturale','audios/gutturale','aud',false);
	mse.src.addSource('bourrasque','audios/bourrasque','aud',false);
	pages.Couverture=new mse.BaseContainer(root,'Couverture',{size:[mse.coor('cid0'),mse.coor('cid1')]});
	layers.back=new mse.Layer(pages.Couverture,1,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj447=new mse.Image(layers.back,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid2'),mse.coor('cid2')]},'src19'); layers.back.addObject(objs.obj447);
	pages.Couverture.addLayer('back',layers.back);
	pages.Titre=new mse.BaseContainer(null,'Titre',{size:[mse.coor('cid0'),mse.coor('cid1')]});
	layers.Titredefault=new mse.Layer(pages.Titre,1,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj219=new mse.Image(layers.Titredefault,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid2'),mse.coor('cid2')]},'src0'); layers.Titredefault.addObject(objs.obj219);
	pages.Titre.addLayer('Titredefault',layers.Titredefault);
	layers.mask=new mse.Layer(pages.Titre,2,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj226=new mse.Mask(layers.mask,{"size":[mse.coor('cid3'),mse.coor('cid1')],"pos":[mse.coor('cid4'),mse.coor('cid2')],"fillStyle":"rgb(0, 0, 0)","globalAlpha":0.6,"font":"normal "+mse.coor('cid5')+"px Times","textAlign":"left"}); layers.mask.addObject(objs.obj226);
	pages.Titre.addLayer('mask',layers.mask);
	layers.Text=new mse.Layer(pages.Titre,3,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj227=new mse.Text(layers.Text,{"size":[mse.coor('cid6'),mse.coor('cid7')],"pos":[mse.coor('cid8'),mse.coor('cid9')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid10')+"px Gudea","textAlign":"center","textBaseline":"top"},'LE VENTRE DE PARIS',true); layers.Text.addObject(objs.obj227);
	objs.obj228=new mse.Text(layers.Text,{"size":[mse.coor('cid11'),mse.coor('cid7')],"pos":[mse.coor('cid12'),mse.coor('cid13')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid10')+"px Gudea","textAlign":"center","textBaseline":"top"},'Episode III',true); layers.Text.addObject(objs.obj228);
	objs.obj229=new mse.Text(layers.Text,{"size":[mse.coor('cid14'),mse.coor('cid15')],"pos":[mse.coor('cid16'),mse.coor('cid17')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid18')+"px Gudea","textAlign":"left","textBaseline":"top"},'Grâce à son courage, un soupçon de chance et l’intervention de Dark, son rat apprivoisé, Simon est parvenu à échapper aux griffes de la Meute. Profitant d’une chatière, il s’est engouffré dans les sous-sols du parc Montsouris. Pour le meilleur ou pour le pire ?',true); layers.Text.addObject(objs.obj229);
	pages.Titre.addLayer('Text',layers.Text);
	pages.Content=new mse.BaseContainer(null,'Content',{size:[mse.coor('cid0'),mse.coor('cid1')]});
	layers.Contentdefault=new mse.Layer(pages.Content,1,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj0=new mse.Image(layers.Contentdefault,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid2'),mse.coor('cid2')]},'src0'); layers.Contentdefault.addObject(objs.obj0);
	pages.Content.addLayer('Contentdefault',layers.Contentdefault);
	layers.back2=new mse.Layer(pages.Content,2,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj450=new mse.Image(layers.back2,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid2'),mse.coor('cid2')],"fillStyle":"rgb(0, 0, 0)","globalAlpha":0,"font":"normal "+mse.coor('cid5')+"px Times","textAlign":"left"},'src5'); layers.back2.addObject(objs.obj450);
	pages.Content.addLayer('back2',layers.back2);
	layers.Contmask=new mse.Layer(pages.Content,3,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj2=new mse.Mask(layers.Contmask,{"size":[mse.coor('cid3'),mse.coor('cid1')],"pos":[mse.coor('cid4'),mse.coor('cid2')],"fillStyle":"rgb(0, 0, 0)","globalAlpha":0.6,"font":"normal "+mse.coor('cid5')+"px Times","textAlign":"left"}); layers.Contmask.addObject(objs.obj2);
	pages.Content.addLayer('Contmask',layers.Contmask);
	layers.content=new mse.ArticleLayer(pages.Content,4,{"size":[mse.coor('cid19'),mse.coor('cid20')],"pos":[mse.coor('cid21'),mse.coor('cid22')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid23')+"px Gudea","textAlign":"left","textBaseline":"top","lineHeight":mse.coor('cid24')},null);
	objs.obj242=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Perdu. Simon était perdu.',true); layers.content.addObject(objs.obj242);
	objs.obj243=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il avait tourné à gauche. Puis à ',true); layers.content.addObject(objs.obj243);
	objs.obj244=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'droite.',true); layers.content.addObject(objs.obj244);
	objs.obj245=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il s’était accroupi dans la boue. ',true); layers.content.addObject(objs.obj245);
	objs.obj246=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Avait rampé sous des grilles, des ',true); layers.content.addObject(objs.obj246);
	objs.obj247=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'arches de pierre. Il s’était enfoncé ',true); layers.content.addObject(objs.obj247);
	objs.obj248=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'dans le ventre de la terre. ',true); layers.content.addObject(objs.obj248);
	objs.obj249=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Toujours plus loin. ',true); layers.content.addObject(objs.obj249);
	objs.obj250=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Par moments, les parois étaient ',true); layers.content.addObject(objs.obj250);
	objs.obj251=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'tellement friables qu’elles ',true); layers.content.addObject(objs.obj251);
	objs.obj252=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'s’effondraient au moindre contact. ',true); layers.content.addObject(objs.obj252);
	objs.obj253=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'À d’autres endroits, c’était l’eau ',true); layers.content.addObject(objs.obj253);
	objs.obj254=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'qui envahissait tout. Un liquide ',true); layers.content.addObject(objs.obj254);
	objs.obj255=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'saumâtre, chargé de particules ',true); layers.content.addObject(objs.obj255);
	objs.obj256=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'dont il préférait ne pas connaître ',true); layers.content.addObject(objs.obj256);
	objs.obj257=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'la provenance. ',true); layers.content.addObject(objs.obj257);
	objs.obj258=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Les galeries succédaient aux ',true); layers.content.addObject(objs.obj258);
	objs.obj259=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'galeries, toutes identiques, ',true); layers.content.addObject(objs.obj259);
	objs.obj260=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'creusées à même la roche. ',true); layers.content.addObject(objs.obj260);
	objs.obj261=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Impossible de se repérer dans ce ',true); layers.content.addObject(objs.obj261);
	objs.obj262=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'dédale troglodyte où régnait une ',true);
	objs.obj262.addLink(new mse.Link('troglodyte',20,'wiki',wikis.Troglodyte)); layers.content.addObject(objs.obj262);
	objs.obj263=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'moiteur étouffante. ',true); layers.content.addObject(objs.obj263);
	objs.obj264=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Simon commençait à désespérer. ',true); layers.content.addObject(objs.obj264);
	objs.obj265=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il se demandait même s’il n’aurait ',true); layers.content.addObject(objs.obj265);
	objs.obj266=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'pas mieux fait de rejoindre la ',true); layers.content.addObject(objs.obj266);
	objs.obj267=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Meute. Perché sur son épaule, ',true); layers.content.addObject(objs.obj267);
	objs.obj268=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Dark tentait de rasséréner son ',true); layers.content.addObject(objs.obj268);
	objs.obj269=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'maitre par quelques coups de ',true); layers.content.addObject(objs.obj269);
	objs.obj270=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'langue.',true); layers.content.addObject(objs.obj270);
	objs.obj271=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src15' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj271);
	objs.obj272=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Heureusement que tu es là...',true);
	objs.obj271.addObject(objs.obj272);
	objs.obj273=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’adolescent interrogea les ',true); layers.content.addObject(objs.obj273);
	objs.obj274=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'ténèbres à la lueur vacillante de ',true); layers.content.addObject(objs.obj274);
	objs.obj275=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'sa lampe.',true); layers.content.addObject(objs.obj275);
	objs.obj276=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Trois chatières s’ouvraient face à ',true); layers.content.addObject(objs.obj276);
	objs.obj277=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'lui. Trois boyaux qui pouvaient ',true); layers.content.addObject(objs.obj277);
	objs.obj278=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'être autant de pièges.  ',true); layers.content.addObject(objs.obj278);
	objs.obj436=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj436);
	objs.obj439=new Donjon(); layers.content.addGame(objs.obj439);
	objs.obj437=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj437);
	objs.obj279=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src15' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj279);
	objs.obj280=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Eh bien, si tu as une idée, je ',true);
	objs.obj279.addObject(objs.obj280);
	objs.obj281=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'t’écoute. ',true);
	objs.obj279.addObject(objs.obj281);
	objs.obj282=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Aussitôt, comme s’il avait ',true); layers.content.addObject(objs.obj282);
	objs.obj283=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'compris, Dark abandonna son ',true);
	objs.obj283.addLink(new mse.Link('Dark',41,'audio',mse.src.getSrc('dark1'))); layers.content.addObject(objs.obj283);
	objs.obj284=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'perchoir et se coula à terre. Il se ',true); layers.content.addObject(objs.obj284);
	objs.obj285=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'dressa sur ses pattes ',true); layers.content.addObject(objs.obj285);
	objs.obj286=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'postérieures, tendit le museau et ',true); layers.content.addObject(objs.obj286);
	objs.obj287=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'s’engouffra dans le passage le ',true); layers.content.addObject(objs.obj287);
	objs.obj288=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'plus étroit.',true); layers.content.addObject(objs.obj288);
	objs.obj289=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src15' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj289);
	objs.obj290=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Bon, ben je suppose qu’il ne ',true);
	objs.obj289.addObject(objs.obj290);
	objs.obj291=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'me reste plus qu’à te faire ',true);
	objs.obj289.addObject(objs.obj291);
	objs.obj293=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'confiance…',true);
	objs.obj289.addObject(objs.obj293);
	objs.obj294=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Et Simon s’engagea à son tour ',true); layers.content.addObject(objs.obj294);
	objs.obj295=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'dans le trou. La progression était ',true); layers.content.addObject(objs.obj295);
	objs.obj296=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'difficile, laborieuse et les parois ',true); layers.content.addObject(objs.obj296);
	objs.obj297=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'semblaient se refermer peu à peu ',true); layers.content.addObject(objs.obj297);
	objs.obj298=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'sur lui. ',true); layers.content.addObject(objs.obj298);
	objs.obj299=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Soudain, une lueur. À quelques ',true); layers.content.addObject(objs.obj299);
	objs.obj300=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'mètres à peine. ',true); layers.content.addObject(objs.obj300);
	objs.obj301=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'S’il en avait été capable, Simon se ',true); layers.content.addObject(objs.obj301);
	objs.obj302=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'serait frotté les yeux. Mais ses ',true); layers.content.addObject(objs.obj302);
	objs.obj303=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'bras étaient coincés, tendus ',true); layers.content.addObject(objs.obj303);
	objs.obj304=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'devant lui. ',true); layers.content.addObject(objs.obj304);
	objs.obj305=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Prudemment, il éteignit sa torche.',true); layers.content.addObject(objs.obj305);
	objs.obj306=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'De la lumière. Ou plutôt, des ',true); layers.content.addObject(objs.obj306);
	objs.obj307=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'points lumineux. ',true); layers.content.addObject(objs.obj307);
	objs.obj308=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’adolescent accéléra sa reptation. ',true); layers.content.addObject(objs.obj308);
	objs.obj309=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Des bougies. Par centaines. C’est ',true); layers.content.addObject(objs.obj309);
	objs.obj310=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'ce qu’il découvrit lorsqu’il ',true); layers.content.addObject(objs.obj310);
	objs.obj311=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'déboucha, enfin, dans une vaste ',true); layers.content.addObject(objs.obj311);
	objs.obj312=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'cavité soutenue par des ',true); layers.content.addObject(objs.obj312);
	objs.obj313=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'empilements de pierres plates. ',true); layers.content.addObject(objs.obj313);
	objs.obj314=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'C’était la première fois depuis des ',true); layers.content.addObject(objs.obj314);
	objs.obj315=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'heures qu’il découvrait un espace ',true); layers.content.addObject(objs.obj315);
	objs.obj316=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'aussi grand. Un espace dont il ne ',true); layers.content.addObject(objs.obj316);
	objs.obj317=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'pouvait pas apercevoir les limites ',true); layers.content.addObject(objs.obj317);
	objs.obj318=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'malgré les flammes qui vacillaient ',true); layers.content.addObject(objs.obj318);
	objs.obj319=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'aux quatre coins.',true); layers.content.addObject(objs.obj319);
	objs.obj320=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Épuisé, il se laissa glisser le long ',true); layers.content.addObject(objs.obj320);
	objs.obj321=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'d’un pilier.',true); layers.content.addObject(objs.obj321);
	objs.obj322=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Dark le fixait de ses yeux rouges, ',true); layers.content.addObject(objs.obj322);
	objs.obj323=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'comme s’il attendait quelque ',true); layers.content.addObject(objs.obj323);
	objs.obj324=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'chose.',true); layers.content.addObject(objs.obj324);
	objs.obj325=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'simon', 'src15' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj325);
	objs.obj326=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Mon vieux, tu es un véritable ',true);
	objs.obj325.addObject(objs.obj326);
	objs.obj327=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'champion, déclara Simon en ',true);
	objs.obj325.addObject(objs.obj327);
	objs.obj331=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'fouillant dans son sac. Je crois ',true);
	objs.obj325.addObject(objs.obj331);
	objs.obj332=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'qu’il est grand temps que nous ',true);
	objs.obj325.addObject(objs.obj332);
	objs.obj333=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'fêtions cela.',true);
	objs.obj325.addObject(objs.obj333);
	objs.obj334=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Dans un large sourire, il exhiba ',true); layers.content.addObject(objs.obj334);
	objs.obj335=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'une barre de céréales. Il arracha ',true);
	objs.obj335.addLink(new mse.Link('arracha',81,'audio',mse.src.getSrc('arracha'))); layers.content.addObject(objs.obj335);
	objs.obj336=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'l’emballage, cassa un morceau ',true); layers.content.addObject(objs.obj336);
	objs.obj337=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'qu’il tendit au rongeur.  ',true); layers.content.addObject(objs.obj337);
	objs.obj338=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Dark émit quelques couinements ',true); layers.content.addObject(objs.obj338);
	objs.obj339=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'de satisfaction, tandis que ',true); layers.content.addObject(objs.obj339);
	objs.obj340=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'l’adolescent s’efforçait de mâcher ',true); layers.content.addObject(objs.obj340);
	objs.obj341=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'lentement. ',true); layers.content.addObject(objs.obj341);
	objs.obj342=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il ne sentit pas le sommeil ',true); layers.content.addObject(objs.obj342);
	objs.obj343=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'s’abattre sur ses épaules. ',true); layers.content.addObject(objs.obj343);
	objs.obj344=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il s’effondra d’un coup, endormi.',true); layers.content.addObject(objs.obj344);
	objs.obj345=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj345);
	objs.obj346=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Des voix. Plusieurs, graves, ',true);
	objs.obj346.addLink(new mse.Link('voix',92,'audio',mse.src.getSrc('voixetpoule'))); layers.content.addObject(objs.obj346);
	objs.obj347=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'inquiétantes. ',true); layers.content.addObject(objs.obj347);
	objs.obj348=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Une langue inconnue et des… des ',true); layers.content.addObject(objs.obj348);
	objs.obj349=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'poules ?',true); layers.content.addObject(objs.obj349);
	objs.obj350=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Simon se réveilla en sursaut. Un ',true); layers.content.addObject(objs.obj350);
	objs.obj351=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'cauchemar ? Mais non, il ne rêvait ',true); layers.content.addObject(objs.obj351);
	objs.obj352=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'pas. ',true); layers.content.addObject(objs.obj352);
	objs.obj353=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'À moins de vingt mètres de lui, ',true); layers.content.addObject(objs.obj353);
	objs.obj354=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'légèrement sur sa gauche, un ',true); layers.content.addObject(objs.obj354);
	objs.obj355=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'homme affublé d’un haut de ',true); layers.content.addObject(objs.obj355);
	objs.obj356=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'forme psalmodiait. À ses pieds, ',true);
	objs.obj356.addLink(new mse.Link('psalmodiait',102,'audio',mse.src.getSrc('psalmodie'))); layers.content.addObject(objs.obj356);
	objs.obj357=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'une poule noire tentait vainement ',true); layers.content.addObject(objs.obj357);
	objs.obj358=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'de s’échapper en tirant sur la ',true); layers.content.addObject(objs.obj358);
	objs.obj359=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'corde qui la retenait. ',true); layers.content.addObject(objs.obj359);
	objs.obj360=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Un peu plus loin, deux femmes, la ',true); layers.content.addObject(objs.obj360);
	objs.obj361=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'poitrine dénudée enluminée de ',true); layers.content.addObject(objs.obj361);
	objs.obj362=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'motifs blancs, dansaient en ',true); layers.content.addObject(objs.obj362);
	objs.obj363=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'poussant des cris.',true); layers.content.addObject(objs.obj363);
	objs.obj440=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj440);
	objs.obj445=new mse.Image(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid28')],"pos":[mse.coor('cid29'),mse.coor('cid5')]},'src17');
	objs.obj445.activateZoom(); layers.content.addObject(objs.obj445);
	objs.obj441=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj441);
	objs.obj364=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’adolescent n’en croyait pas ses ',true); layers.content.addObject(objs.obj364);
	objs.obj365=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'yeux. Il se recroquevilla dans ',true); layers.content.addObject(objs.obj365);
	objs.obj366=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'l’ombre d’un pilier. ',true); layers.content.addObject(objs.obj366);
	objs.obj367=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'L’homme, torse nu sous une ',true); layers.content.addObject(objs.obj367);
	objs.obj368=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'redingote rouge, arborait un ',true); layers.content.addObject(objs.obj368);
	objs.obj369=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'maquillage effrayant : un mélange ',true); layers.content.addObject(objs.obj369);
	objs.obj370=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'d’ocres et de craie qui recouvrait ',true); layers.content.addObject(objs.obj370);
	objs.obj371=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'entièrement sa peau noire, ',true); layers.content.addObject(objs.obj371);
	objs.obj372=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'figurant muscles et tendons ',true); layers.content.addObject(objs.obj372);
	objs.obj373=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'comme s’il était écorché. ',true); layers.content.addObject(objs.obj373);
	objs.obj374=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Les yeux révulsés, il chantait une ',true); layers.content.addObject(objs.obj374);
	objs.obj375=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'mélopée lugubre tout en ',true); layers.content.addObject(objs.obj375);
	objs.obj376=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'exécutant de grands cercles dans ',true); layers.content.addObject(objs.obj376);
	objs.obj448=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'le vide à l’aide d’une machette.',true); layers.content.addObject(objs.obj448);
	objs.obj449=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Les danseuses, pour leur part, se',true); layers.content.addObject(objs.obj449);
	objs.obj379=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'déplaçaient à l’intérieur d’un ',true); layers.content.addObject(objs.obj379);
	objs.obj380=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'curieux motif peint à même le sol.',true); layers.content.addObject(objs.obj380);
	objs.obj381=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Un Vévé !',true);
	objs.obj381.addLink(new mse.Link('Vévé',130,'wiki',wikis.Veve)); layers.content.addObject(objs.obj381);
	objs.obj382=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Simon se souvint soudain de ce ',true); layers.content.addObject(objs.obj382);
	objs.obj383=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'documentaire qu’il avait vu au ',true); layers.content.addObject(objs.obj383);
	objs.obj384=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'foyer. Une plongée hallucinante ',true); layers.content.addObject(objs.obj384);
	objs.obj385=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'en Haïti dans le monde du ',true); layers.content.addObject(objs.obj385);
	objs.obj386=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Vaudou. ',true);
	objs.obj386.addLink(new mse.Link('Vaudou',135,'wiki',wikis.Vaudou)); layers.content.addObject(objs.obj386);
	objs.obj387=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Papa Legba. Celui qui ouvre les ',true);
	objs.obj387.addLink(new mse.Link('Papa Legba',136,'wiki',wikis.PapaLegba)); layers.content.addObject(objs.obj387);
	objs.obj388=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'portes. L’homme était déguisé en ',true); layers.content.addObject(objs.obj388);
	objs.obj389=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Papa Legba ! ',true); layers.content.addObject(objs.obj389);
	objs.obj390=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Hypnotisé par le spectacle, ',true); layers.content.addObject(objs.obj390);
	objs.obj391=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'l’adolescent rampa pour se ',true); layers.content.addObject(objs.obj391);
	objs.obj392=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'rapprocher. Quelques mètres. ',true); layers.content.addObject(objs.obj392);
	objs.obj393=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Soudain, les deux femmes ',true); layers.content.addObject(objs.obj393);
	objs.obj394=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'hurlèrent.',true);
	objs.obj394.addLink(new mse.Link('hurlèrent',143,'audio',mse.src.getSrc('hurle'))); layers.content.addObject(objs.obj394);
	objs.obj395=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Simon sursauta et tenta de ',true); layers.content.addObject(objs.obj395);
	objs.obj396=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'réconforter Dark qui tremblait de ',true); layers.content.addObject(objs.obj396);
	objs.obj397=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'tous ses membres.',true); layers.content.addObject(objs.obj397);
	objs.obj398=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Elles se figèrent un instant puis ',true); layers.content.addObject(objs.obj398);
	objs.obj399=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'s’effondrèrent aux pieds de ',true); layers.content.addObject(objs.obj399);
	objs.obj400=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'l’homme.',true); layers.content.addObject(objs.obj400);
	objs.obj401=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Papa Legba leva alors son bras ',true); layers.content.addObject(objs.obj401);
	objs.obj402=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'armé et l’abattit sur le pauvre ',true); layers.content.addObject(objs.obj402);
	objs.obj403=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'gallinacé. Un flot rouge se ',true);
	objs.obj403.addLink(new mse.Link('gallinacé',152,'wiki',wikis.Gallinace)); layers.content.addObject(objs.obj403);
	objs.obj404=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'répandit à terre, abreuvant le ',true); layers.content.addObject(objs.obj404);
	objs.obj405=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'mystérieux dessin tracé dans la ',true); layers.content.addObject(objs.obj405);
	objs.obj406=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'boue. ',true); layers.content.addObject(objs.obj406);
	objs.obj407=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Un silence surnaturel envahit la ',true); layers.content.addObject(objs.obj407);
	objs.obj408=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'grotte tandis que l’homme se ',true); layers.content.addObject(objs.obj408);
	objs.obj409=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'penchait sur un étrange sac noir ',true); layers.content.addObject(objs.obj409);
	objs.obj410=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'que Simon n’avait pas remarqué ',true); layers.content.addObject(objs.obj410);
	objs.obj411=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'jusqu’alors.',true); layers.content.addObject(objs.obj411);
	objs.obj412=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Le prêtre se saisit du poulet et ',true);
	objs.obj412.addLink(new mse.Link('prêtre',161,'audio',mse.src.getSrc('gutturale'))); layers.content.addObject(objs.obj412);
	objs.obj413=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'aspergea le sac. ',true); layers.content.addObject(objs.obj413);
	objs.obj414=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Il prononça quelques paroles ',true); layers.content.addObject(objs.obj414);
	objs.obj415=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'gutturales et…',true); layers.content.addObject(objs.obj415);
	objs.obj416=new mse.Speaker( layers.content,{"size":[mse.coor('cid19'),mse.coor('cid2')]}, 'unknown', 'src16' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj416);
	objs.obj417=new mse.Text(layers.content,{"size":[mse.coor('cid26'),mse.coor('cid24')]},'Police ! On ne bouge plus !',true);
	objs.obj416.addObject(objs.obj417);
	objs.obj418=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'La voix avait claqué comme un ',true); layers.content.addObject(objs.obj418);
	objs.obj419=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'coup de révolver, se répercutant ',true); layers.content.addObject(objs.obj419);
	objs.obj420=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'en milliers d’échos sur les parois ',true); layers.content.addObject(objs.obj420);
	objs.obj421=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'minérales. Une voix chargée de ',true); layers.content.addObject(objs.obj421);
	objs.obj422=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'menaces, surgie de nulle part.',true); layers.content.addObject(objs.obj422);
	objs.obj423=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Papa Legba hésita un instant. Puis ',true); layers.content.addObject(objs.obj423);
	objs.obj424=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'il étendit les bras. Aussitôt, une ',true); layers.content.addObject(objs.obj424);
	objs.obj425=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'violente bourrasque souffla toutes ',true);
	objs.obj425.addLink(new mse.Link('bourrasque',173,'audio',mse.src.getSrc('bourrasque'))); layers.content.addObject(objs.obj425);
	objs.obj426=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'les bougies. Un bruit de cavalcade ',true); layers.content.addObject(objs.obj426);
	objs.obj451=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'résonna et puis plus rien.',true); layers.content.addObject(objs.obj451);
	objs.obj453=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Rien de rien du tout.',true); layers.content.addObject(objs.obj453);
	objs.obj454=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj454);
	objs.obj429=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'Simon n’osait bouger. Après tout, ',true); layers.content.addObject(objs.obj429);
	objs.obj430=new mse.Text(layers.content,{"size":[mse.coor('cid19'),mse.coor('cid24')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid23')+"px Gudea","textAlign":"left"},'il s’agissait peut-être vraiment ',true); layers.content.addObject(objs.obj430);
	objs.obj431=new mse.Text(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]},'d’un cauchemar…',true); layers.content.addObject(objs.obj431);
	objs.obj432=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj432);
	objs.obj433=new mse.UIObject(layers.content,{"size":[mse.coor('cid25'),mse.coor('cid24')]}); layers.content.addObject(objs.obj433);
	objs.obj434=new mse.Text(layers.content,{"size":[mse.coor('cid19'),mse.coor('cid24')],"pos":[mse.coor('cid2'),mse.coor('cid2')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid10')+"px Gudea","textAlign":"center"},'À SUIVRE...',true); layers.content.addObject(objs.obj434);
	layers.content.setDefile(1300);
	temp.layerDefile=layers.content;
	pages.Content.addLayer('content',layers.content);
	animes.mask=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.mask.block=true;
	animes.mask.addObj('obj226',objs.obj226);
	animes.mask.addAnimation('obj226',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,0.60000002384186,0.60000002384186]')});
	animes.title=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.title.block=true;
	animes.title.addObj('obj227',objs.obj227);
	animes.title.addAnimation('obj227',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,1,1]')});
	animes.cha=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.cha.block=true;
	animes.cha.addObj('obj228',objs.obj228);
	animes.cha.addAnimation('obj228',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,1,1]')});
	animes.resume=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.resume.block=true;
	animes.resume.addObj('obj229',objs.obj229);
	animes.resume.addAnimation('obj229',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,1,1]')});
	animes.sang=new mse.Animation(42,1,true,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.sang.block=true;
	temp.obj=new mse.Image(null,{'pos':[mse.coor('cid44'),mse.coor('cid45')],'size':[mse.coor('cid46'),mse.coor('cid47')]},'src2');
	animes.sang.addObj('src2',temp.obj);
	animes.sang.addAnimation('src2',{'frame':JSON.parse('[0,3,28,41,42]'),'pos':[[mse.coor('cid44'),mse.coor('cid45')],[mse.coor('cid48'),mse.coor('cid49')],[mse.coor('cid48'),mse.coor('cid49')],[mse.coor('cid48'),mse.coor('cid49')],[mse.coor('cid48'),mse.coor('cid49')]],'size':[[mse.coor('cid46'),mse.coor('cid47')],[mse.coor('cid50'),mse.coor('cid51')],[mse.coor('cid50'),mse.coor('cid51')],[mse.coor('cid50'),mse.coor('cid51')],[mse.coor('cid50'),mse.coor('cid51')]]});
	animes.papa=new mse.Animation(109,1,true,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.papa.block=true;
	temp.obj=new mse.Sprite(null,{'pos':[mse.coor('cid52'),mse.coor('cid53')],'size':[mse.coor('cid54'),mse.coor('cid55')]},'src8',300,307, 0,0,900,614);
	animes.papa.addObj('src8',temp.obj);
	animes.papa.addAnimation('src8',{'frame':JSON.parse('[0,20,25,30,35,40,45,58,108,109]'),'spriteSeq':JSON.parse('[0,0,1,2,3,4,5,5,5,5]'),'opacity':JSON.parse('[0,1,1,1,1,1,1,1,0,0]'),'size':[[mse.coor('cid54'),mse.coor('cid55')],[mse.coor('cid54'),mse.coor('cid55')],[mse.coor('cid56'),mse.coor('cid55')],[mse.coor('cid56'),mse.coor('cid55')],[mse.coor('cid56'),mse.coor('cid55')],[mse.coor('cid56'),mse.coor('cid55')],[mse.coor('cid56'),mse.coor('cid55')],[mse.coor('cid56'),mse.coor('cid55')],[mse.coor('cid56'),mse.coor('cid55')],[mse.coor('cid56'),mse.coor('cid55')]]});
	animes.chute=new mse.Animation(76,1,true,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.chute.block=true;
	temp.obj=new mse.Sprite(null,{'pos':[mse.coor('cid57'),mse.coor('cid58')],'size':[mse.coor('cid59'),mse.coor('cid60')]},'src7',320,421, 0,0,1280,421);
	animes.chute.addObj('src7',temp.obj);
	animes.chute.addAnimation('src7',{'frame':JSON.parse('[0,25,29,33,37,62,75,76]'),'spriteSeq':JSON.parse('[0,0,1,2,3,3,3,3]'),'opacity':JSON.parse('[0,1,1,1,1,1,0,0]'),'pos':[[mse.coor('cid57'),mse.coor('cid58'),1],[mse.coor('cid57'),mse.coor('cid58'),1],[mse.coor('cid61'),mse.coor('cid58'),1],[mse.coor('cid57'),mse.coor('cid58')],[mse.coor('cid57'),mse.coor('cid58')],[mse.coor('cid57'),mse.coor('cid58')],[mse.coor('cid62'),mse.coor('cid58')],[mse.coor('cid62'),mse.coor('cid58')]]});
	animes.showBack3Anime=new mse.Animation(16,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.showBack3Anime.block=true;
	animes.showBack3Anime.addObj('obj450',objs.obj450);
	animes.showBack3Anime.addAnimation('obj450',{'frame':JSON.parse('[0,15,16]'),'opacity':JSON.parse('[0,1,1]')});
	var action={};
	var reaction={};
	action.transCouv=new mse.Script([{src:pages.Couverture,type:'click'}]);
	reaction.transCouv=function(){ 
		root.transition(pages.Titre); 
	};
	action.transCouv.register(reaction.transCouv);
	action.transTitre=new mse.Script([{src:pages.Titre,type:'click'}]);
	reaction.transTitre=function(){ 
		root.transition(pages.Content); 
	};
	action.cursorCouv=new mse.Script([{src:pages.Couverture,type:'show'}]);
	reaction.cursorCouv=function(){ 
		mse.setCursor('pointer'); 
	};
	action.cursorCouv.register(reaction.cursorCouv);
	action.addTextEffet=action.cursorCouv;
	reaction.addTextEffet=function(){ 
		function textEffect(effet,obj) {
	obj.startEffect(effet);
}
for(var i = 0; i < layers.content.objList.length; i++){
	var objCible = layers.content.getObject(i);
	if(objCible instanceof mse.Text){
	    objCible.evtDeleg.addListener('firstShow', new mse.Callback(textEffect, null, {"typewriter":{}}, objCible));
	}
} 
	};
	action.addTextEffet.register(reaction.addTextEffet);
	action.showTitle=new mse.Script([{src:pages.Titre,type:'show'}]);
	reaction.showTitle=function(){ 
		animes.title.start(); 
	};
	action.showTitle.register(reaction.showTitle);
	action.showResume=action.showTitle;
	reaction.showResume=function(){ 
		animes.resume.start(); 
	};
	action.showResume.register(reaction.showResume);
	action.showEpisode=action.showTitle;
	reaction.showEpisode=function(){ 
		animes.cha.start(); 
	};
	action.showEpisode.register(reaction.showEpisode);
	action.showMask=action.showTitle;
	reaction.showMask=function(){ 
		animes.mask.start(); 
	};
	action.showMask.register(reaction.showMask);
	action.addTransTitle=new mse.Script([{src:animes.title,type:'end'}]);
	reaction.addTransTitle=function(){ 
		action.transTitre.register(reaction.transTitre); 
	};
	action.addTransTitle.register(reaction.addTransTitle);
	action.cursorDfTitle=action.showTitle;
	reaction.cursorDfTitle=function(){ 
		mse.setCursor('default'); 
	};
	action.cursorDfTitle.register(reaction.cursorDfTitle);
	action.cursorPtTitle=action.addTransTitle;
	reaction.cursorPtTitle=function(){ 
		mse.setCursor('pointer'); 
	};
	action.cursorPtTitle.register(reaction.cursorPtTitle);
	action.cursorContent=new mse.Script([{src:pages.Content,type:'show'}]);
	reaction.cursorContent=function(){ 
		mse.setCursor('default'); 
	};
	action.cursorContent.register(reaction.cursorContent);
	action.startPapa=new mse.Script([{src:objs.obj449,type:'show'}]);
	reaction.startPapa=function(){ 
		animes.papa.start(); 
	};
	action.startPapa.register(reaction.startPapa);
	action.startChute=new mse.Script([{src:objs.obj401,type:'show'}]);
	reaction.startChute=function(){ 
		animes.chute.start(); 
	};
	action.startChute.register(reaction.startChute);
	action.startSang=new mse.Script([{src:objs.obj404,type:'show'}]);
	reaction.startSang=function(){ 
		animes.sang.start(); 
	};
	action.startSang.register(reaction.startSang);
	action.changeToBack2=new mse.Script([{src:objs.obj306,type:'firstShow'}]);
	reaction.changeToBack2=function(){ 
		temp.width=objs.obj0.getWidth();temp.height=objs.obj0.getHeight();temp.boundingbox=imgBoundingInBox('src4',temp.width,temp.height);temp.obj=new mse.Image(objs.obj0.parent,temp.boundingbox,'src4');mse.transition(objs.obj0,temp.obj,25); 
	};
	action.changeToBack2.register(reaction.changeToBack2);
	action.showBack3=new mse.Script([{src:objs.obj453,type:'firstShow'}]);
	reaction.showBack3=function(){ 
		animes.showBack3Anime.start(); 
	};
	action.showBack3.register(reaction.showBack3);
	action.finPlayIntro=new mse.Script([{src:objs.obj434,type:'firstShow'}]);
	reaction.finPlayIntro=function(){ 
		mse.src.getSrc('intro').play(); 
	};
	action.finPlayIntro.register(reaction.finPlayIntro);
	action.startAngoisse=new mse.Script([{src:objs.obj242,type:'firstShow'}]);
	reaction.startAngoisse=function(){ 
		mse.src.getSrc('angoisse').play(); 
	};
	action.startAngoisse.register(reaction.startAngoisse);
	action.startAngoisse2=new mse.Script([{src:objs.obj294,type:'firstShow'}]);
	reaction.startAngoisse2=function(){ 
		mse.src.getSrc('angoisse2').play(); 
	};
	action.startAngoisse2.register(reaction.startAngoisse2);
	action.startSonAnime=new mse.Script([{src:animes.papa,type:'start'}]);
	reaction.startSonAnime=function(){ 
		mse.src.getSrc('anime').play(); 
	};
	action.startSonAnime.register(reaction.startSonAnime);
	action.startSonChute=new mse.Script([{src:animes.chute,type:'start'}]);
	reaction.startSonChute=function(){ 
		mse.src.getSrc('sonChute').play(); 
	};
	action.startSonChute.register(reaction.startSonChute);
	action.startSonSang=new mse.Script([{src:animes.sang,type:'start'}]);
	reaction.startSonSang=function(){ 
		mse.src.getSrc('sonSang').play(); 
	};
	action.startSonSang.register(reaction.startSonSang);
	action.playIntro=action.transCouv;
	reaction.playIntro=function(){ 
		mse.src.getSrc('intro').play(); 
	};
	action.playIntro.register(reaction.playIntro);
	action.stopSonIntro=action.cursorContent;
	reaction.stopSonIntro=function(){ 
		mse.src.getSrc('intro').pause(); 
	};
	action.stopSonIntro.register(reaction.stopSonIntro);
	mse.currTimeline.start();};
mse.autoFitToWindow(createbook);