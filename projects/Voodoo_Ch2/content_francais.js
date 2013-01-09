var GameSimonComa = function() {
    mse.Game.call(this);
    
    this.setDirectShow(true);
    this.firstShow = false;
    
    this.offx = mse.coor(mse.joinCoor(-30)); this.offy = mse.coor(mse.joinCoor(0));
    this.width = mse.coor(mse.joinCoor(400)); this.height = mse.coor(mse.joinCoor(560));
    
    this.zone = {
        'dark' : {
            'x' : 0.423*this.width,
            'y' : 0.58*this.height,
            'w' : 0.127*this.width,
            'h' : 0.084*this.height
        },
        'darkact' : {
            'x' : 0.445*this.width,
            'y' : 0.58*this.height,
            'w' : 0.127*this.width,
            'h' : 0.084*this.height
        },
        'mask' : {
            'x' : 0.566*this.width,
            'y' : 0.619*this.height,
            'w' : 0.127*this.width,
            'h' : 0.084*this.height
        },
        'actif' : {
            'x' : 0.556*this.width,
            'y' : 0.608*this.height,
            'w' : 0.156*this.width,
            'h' : 0.135*this.height
        }
    }
    
    this.touching = false;
    this.moveon = false;
    this.startAngle = -30;
    this.ratio = 0;
    
    mse.src.addSource('sangmaskalpha', 'games/sangmask.png', 'img', true);
    this.back = new mse.Image(this, {pos:[0,20],size:[this.width,this.height-40]}, "simoncoma");
    this.dark = new mse.Image(null, {pos:[0,0],size:[this.zone.dark.w,this.zone.dark.h]}, "darkhead");
    this.mask = new mse.Image(this, {pos:[this.zone.mask.x,this.zone.mask.y],size:[this.zone.mask.w, this.zone.mask.h],globalAlpha:0}, "sangmaskalpha");
    
    this.move = function(e) {
        var x = e.offsetX - this.getX();
        var y = e.offsetY - this.getY();
        if(x >= this.zone.actif.x && x <= this.zone.actif.x+this.zone.actif.w && 
           y >= this.zone.actif.y && y <= this.zone.actif.y+this.zone.actif.h) {
            this.moveon = true;
        }
        else this.moveon = false;
    };
    this.touchStart = function(e) {
        var x = e.offsetX - this.getX();
        var y = e.offsetY - this.getY();
        if(x >= this.zone.actif.x && x <= this.zone.actif.x+this.zone.actif.w && 
           y >= this.zone.actif.y && y <= this.zone.actif.y+this.zone.actif.h) {
            this.touching = true;
        }
    };
    this.touchMove = function(e) {
        var y = e.offsetY - this.getY() - this.zone.actif.y;
        var x = e.offsetX - this.getX() - this.zone.actif.x;
        if( this.touching && x >= 0 && x <= this.zone.actif.w && y >= 0 && y <= this.zone.actif.h ) {
            this.ratio = y / this.zone.actif.h;
            if(this.mask.globalAlpha < 1) this.mask.globalAlpha += 0.004;
        }
    };
    this.touchEnd = function(e) {
        this.touching = false;
        if(this.mask.globalAlpha >= 1) this.end();
    };
    
    var cbStart = new mse.Callback(this.touchStart, this);
    var cbMove = new mse.Callback(this.touchMove, this);
    var cbEnd = new mse.Callback(this.touchEnd, this);
    var cbMoveon = new mse.Callback(this.move, this);
    
    this.init = function() {
        this.parent.interrupt();
        
        this.getEvtProxy().addListener('gestureStart', cbStart);
    	this.getEvtProxy().addListener('gestureUpdate', cbMove);
    	this.getEvtProxy().addListener('gestureEnd', cbEnd);
    	this.getEvtProxy().addListener('move', cbMoveon);
    };
    this.end = function() {
        this.getEvtProxy().removeListener('gestureStart', cbStart);
        this.getEvtProxy().removeListener('gestureUpdate', cbMove);
        this.getEvtProxy().removeListener('gestureEnd', cbEnd);
        this.getEvtProxy().removeListener('move', cbMoveon);
        mse.root.evtDistributor.setDominate(null);
        
        this.parent.play();
    };
    
    this.draw = function(ctx) {
        if(!this.firstShow) {
        	this.firstShow = true;
        	this.evtDeleg.eventNotif('firstShow');
        	this.evtDeleg.eventNotif('start');
        }
        ctx.save();
    	this.back.draw(ctx);
    	// Mask to show the effet
    	this.mask.draw(ctx);
    	// Dark head
    	ctx.globalAlpha = 1;
    	if(!this.touching && !this.moveon) {
    	    ctx.translate(this.getX()+this.zone.dark.x, this.getY()+this.zone.dark.y);
    	}
    	else if(this.moveon && !this.touching) {
    	    ctx.translate(this.getX()+this.zone.darkact.x, this.getY()+this.zone.darkact.y);
    	}
    	else {
    	    ctx.translate(this.getX()+this.zone.darkact.x+this.zone.darkact.w/2, this.getY()+this.zone.darkact.y+this.zone.darkact.h/2);
    	    var angle = (this.startAngle + 45*this.ratio) * Math.PI / 180;
    	    ctx.rotate(angle);
    	    ctx.translate(-this.zone.darkact.w/2, -this.zone.darkact.h/2);
    	}
    	this.dark.draw(ctx);
    	ctx.restore();
    };
};
extend(GameSimonComa, mse.Game);var Fourchelangue = function() {
    mse.Game.call(this, {fillback:true, size:[600,480]});
    
    this.config.title = "Fourchelangue";
    this.score = 60;
    
    var base = [
        {fr:6,x:234,y:369,head:0,color:"#d4bf11"},
        {fr:2,x:115,y:388,head:2,color:"#8a8dbf"},
        {fr:4,x:353,y:388,head:6,color:"#368723"},
        {fr:0,x:33,y:420,head:2,color:"#ce1717"},
        {fr:3,x:435,y:420,head:6,color:"#d06f0f"}
    ];
    var ratPos = {
        head: {x:35,y:-92},
        body: {x:29,y:-70},
        bull: {x:66,y:-118}
    };
    var size = {
        base: {w:133,h:33},
        rat: {w:74,h:82},
        rathead: {w:62,h:43},
        question: {w:400,lh:25}
    };
    var fourchelangues = [
        [// Easy mode
            ["Si ton tonton tond ton tonton, ton tonton tondu sera. Mange ton thon tonton et tond ton tonton !", "ton", "tonton", "tond"],
            ["Si ta tata tasse ta tata, ta tata tassée sera. Ta tata tâta ta tata.", "ta", "tata", "tâta"],
            ["Si six scies scient six cyprès, alors six cent six scies scieront six cent six cyprès.", "six", "scies", "cyprès"]
        ],
        [// Normal mode
            ["On s’tait caché pour charcuter mon steak haché auprès duquel on s’tait caché.", "s’tait", "caché", "steak", "haché"],
            ["Un comte comptant ses comptes, content de son comté, raconte un conte, d'un comte comptant des comptes mécontents, en contant un conte contant un comte mécontent se contentant d'un compte en mangeant son comté.", "comte", "comptes", "conte", "comptant"],
            ["Cinq saints sains de corps et d'esprit et ceints de leur cordon, portaient sur leur sein le seing de leur Saint-Père.", "saints", "sains", "ceints", "sein"]
        ],
        [// Hard mode
            ["Didon dîna, dit-on, du dos dodu d'un dodu dindon. Du dos dodu du dodu dindon dont Didon dîna, dit-on, il ne reste rien.", "didon", "du", "dos", "dodu", "dindon"],
            ["Ah !, pourquoi, Pépita, sans répit m'épies-tu ? Dans les bois, Pépita, pourquoi te tapis-tu ? Tu m'épies sans pitié ! C'est piteux de m'épier ! De m'épier, Pépita, saurais-tu te passer ?", "pépita", "répit", "épies", "tu", "épier"],
            ["Tas de riz, tas de rats.\nTas de riz tenta tas de rats.\nTas de rats tenté tâta tas de riz.\nTu as un tas tentant tâté par un tas tenté.", "tas", "riz", "rats", "tenté", "tâté"]
        ]
    ];
    
    mse.src.addSource('gamebtns', 'games/boutons.png', 'img', true);
    mse.src.addSource('gamerats', 'games/rats.png', 'img', true);
    mse.src.addSource('gamedecor', 'games/Decors.jpg', 'img', true);
    mse.src.addSource('gamesign', 'games/signs.png', 'img', true);
    
    var ratHead = new mse.Sprite(null, {}, 'gamerats', size.rathead.w, size.rathead.h, 0,0,248,86);
    var ratBody = new mse.Sprite(null, {}, 'gamerats', size.rat.w, size.rat.h, 0,86,148,82);
    var baseImg = new mse.Sprite(null, {}, 'gamebtns', size.base.w, size.base.h, 0,0,133,231);
    var back = new mse.Image(null, {pos:[0,0],size:[this.width,this.height]}, 'gamedecor');
    var right = new mse.Sprite(null, {pos:[162,140],size:[275,200]}, 'gamesign', 278,200, 0,0,278,200);
    var wrong = new mse.Sprite(null, {pos:[162,140],size:[275,200]}, 'gamesign', 272,200, 278,0,272,200);
    var replaybn = new mse.Button(null, {pos:[170,420],size:[105,35],font:'12px Arial',fillStyle:'#FFF'}, 'Je réessaie', 'aideBar');
    var levelupbn = new mse.Button(null, {pos:[170,420],size:[105,35],font:'12px Arial',fillStyle:'#FFF'}, '', 'aideBar');
    var passbn = new mse.Button(null, {pos:[325,420],size:[105,35],font:'12px Arial',fillStyle:'#FFF'}, 'Je ne joue plus', 'wikiBar');
    
    this.mode = 0;
    this.successed = -1;
    
    var RatBase = function(id, wordid, currfcl) {
        this.id = id;
        this.wordid = wordid;
        this.base = base[id];
        this.currfcl = currfcl;
        this.ratfr = randomInt(2);
        this.cri = false;
        this.again = false;
        
        this.draw = function(ctx){
            ctx.save();
            ctx.translate(this.base.x, this.base.y);
            baseImg.drawFrame(this.base.fr, ctx, 0, 0);
            ratBody.drawFrame(this.ratfr, ctx, ratPos.body.x, ratPos.body.y);
            if(this.cri) {
                // Head up
                ratHead.drawFrame(this.base.head+1, ctx, ratPos.head.x, ratPos.head.y);
                var r = 65;
                var font = "Bold 22px Arial";
            }
            else {
                // Head down
                ratHead.drawFrame(this.base.head, ctx, ratPos.head.x, ratPos.head.y);
                var r = 48;
                var font = "16px Arial";
            }
            
            // Bull
            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.shadowColor = "#000";
            ctx.shadowBlur = 10;
            ctx.translate(ratPos.bull.x, ratPos.bull.y);
            ctx.scale(1,0.3);
            ctx.beginPath(); 
            ctx.arc(0,0,r,0,Math.PI*2,true);
            ctx.fill();
            ctx.restore();
            
            // Text
            ctx.translate(ratPos.bull.x, ratPos.bull.y);
            ctx.fillStyle = this.base.color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = font;
            ctx.fillText(this.currfcl[this.wordid], 0, 0);
            
            ctx.restore();
        }
        this.logic = function() {
            if(this.again) {
                if(this.count == 0) this.shout();
                else this.count--;
            }
            if(this.cri) {
                if(this.count == 0) this.cri = false;
                else this.count--;
            }
        }
        this.inObj = function(x, y) {
            x -= this.base.x;
            y -= this.base.y;
            if(x >= ratPos.body.x && x <= ratPos.body.x+size.rat.w && y >= ratPos.bull.y-24 && y <= size.base.h)
                return true;
            else return false;
        }
        this.shout = function(time) {
            if(this.cri) {
                this.cri = false;
                this.again = true;
                this.count = 1;
            }
            else {
                this.again = false;
                this.cri = true;
                this.count = isNaN(time) ? 10 : time;
            }
        }
    };
    
    this.msg = {
        "INIT": "Clique pour jouer.",
        "WIN": "Bravo!!! Tu as gagné ",
        "LOSE": "Perdu..."
    };
    this.state = "INIT";
    this.losecount = 0;
    this.levelupcount = 0;
    
    this.init = function(levelup) {
        // 0: easy, 1: normal, 2: hard
        if(levelup === true) {
            if(this.mode < 2)
                this.mode++;
            else this.mode = 0;
        }
        else if(levelup === false) {
            ;
        }
        // Start
        else {
            this.score = 0;
            this.losecount = 0;
            this.levelupcount = 0;
        }
        this.currfcl = fourchelangues[this.mode][randomInt(3)];
        
        this.colormap = {};
        this.bases = [];
        switch (this.mode) {
        case 0:
            var ids = [1,2,3];
            for(var i = 0; i < 3; ++i) {
                var id = randomInt(ids.length);
                var wordid = ids[id];
                this.bases.push(new RatBase(i, wordid, this.currfcl));
                ids.splice(id, 1);
                // Construction of color map for key words
                this.colormap[this.currfcl[wordid]] = base[i].color;
            }
        break;
        case 1:
            var ids = [1,2,3,4];
            for(var i = 1; i < 5; ++i) {
                var id = randomInt(ids.length);
                var wordid = ids[id];
                this.bases.push(new RatBase(i, wordid, this.currfcl));
                ids.splice(id, 1);
                // Construction of color map for key words
                this.colormap[this.currfcl[wordid]] = base[i].color;
            }
        break;
        case 2:
            var ids = [1,2,3,4,5];
            for(var i = 0; i < 5; ++i) {
                var id = randomInt(ids.length);
                var wordid = ids[id];
                this.bases.push(new RatBase(i, wordid, this.currfcl));
                ids.splice(id, 1);
                // Construction of color map for key words
                this.colormap[this.currfcl[wordid]] = base[i].color;
            }
        break;
        }
        
        this.lines = this.presetColoredText(mse.root.ctx, "20px Arial", this.currfcl[0], this.colormap, size.question.w, size.question.lh);
        this.currTime = 0;
        this.currGuess = {line:0,index:0};
        this.keycount = 0;
        this.state = "INIT";
        mse.setCursor("pointer");
        this.getEvtProxy().addListener('click', this.clickcb, true, this);
    };
    this.mobileLazyInit = function() {
    };
    
    this.checkFail = function() {
        this.state = "FAIL";
        this.losecount ++;
    };
    this.checkSuccess = function() {
        this.state = "SUCCESS";
        this.levelupcount ++;
        if(this.mode > this.successed) this.successed = this.mode;
        // Restart from the niveau 1
        if(this.mode+1 >= 3)
            levelupbn.txt = "Recommence";
        // Continue to challange the next niveau
        else levelupbn.txt = "Niveau " + (this.mode+2);
    };
    // Check guess
    this.check = function() {
        for(var i in this.lines) {
            for(var j in this.lines[i].keywords) {
                var keyword = this.lines[i].keywords[j];
                if(keyword.guess != keyword.word.toLowerCase()) {
                    this.checkFail();
                    return;
                }
            }
        }
        this.checkSuccess();
    };
    this.clicked = function(e) {
        if(MseConfig.android || MseConfig.iPhone) {
            var x = e.offsetX/0.8;
            var y = e.offsetY/0.62;
        }
        else {
            var x = e.offsetX;
            var y = e.offsetY;
        }
        if(this.state == "INIT") {
            mse.setCursor("default");
            this.state = "START";
        }
        // Restart button clicked
        else if(this.state == "FAIL" && replaybn.inObj(x, y)) {
            this.init(false);
        }
        else if(this.state == "SUCCESS" && levelupbn.inObj(x, y)) {
            // Levelup button clicked
            this.init(true);
        }
        // Finish game
        else if((this.state == "FAIL" || this.state == "SUCCESS") && passbn.inObj(x, y)) {
            this.setScore( (this.levelupcount > 0 ? 60 : 0) + 20 * (this.levelupcount==0?1:this.levelupcount-1) - 5 * this.losecount );
        
            this.getEvtProxy().removeListener('click', this.clickcb);
            if(this.successed >= 0) {
                this.state = "WIN";
                this.msg.WIN += "le niveau " + (this.successed+1);
                this.win();
            }
            else {
                this.state = "LOSE";
                this.lose();
            }
            
            
        }
        else if(this.state == "PLAYING") {
            for(var i in this.bases) {
                // Rat clicked
                if(this.bases[i].inObj(x, y)) {
                    this.bases[i].shout();
                    this.keycount++;
                    
                    // Line finished
                    if(this.currGuess.index >= this.lines[this.currGuess.line].keywords.length) {
                        this.currGuess.line++;
                        this.currGuess.index = 0;
                    }
                    var currKeyword = this.lines[this.currGuess.line].keywords[this.currGuess.index];
                    // Register guessed word
                    if(currKeyword) currKeyword.guess = this.currfcl[this.bases[i].wordid];
                    // Finishing guess
                    if(this.keycount >= this.keynb) this.check();
                    else this.currGuess.index++;
                    return;
                }
            }
        }
    };
    
    function sortKeyword(a, b) {
        if(a.offset < b.offset)
        	return -1;
        else if(a.offset > b.offset)
        	return 1;
        else return 0;
    }
    this.presetColoredText = function(ctx, font, text, colormap, width, lineHeight) {
        var lines = wrapTextWithWrapIndice(text, ctx, width, font);
        
        var prevFont = ctx.font;
        ctx.font = font;
        var keywords = [];
        for(var i in lines) {
            // Offset map
            var offsets = [];
            for(var word in colormap) {
                // Reg exp for this word
                var exp = new RegExp("((^"+word+"[\\'\\s\\,\\.])|([\\'\\s\\,\\.]"+word+"[\\'\\s\\,\\.])|([\\'\\s\\,\\.]"+word+"$))", "gi");
                while (exp.test(lines[i])===true) {
                    var index = exp.lastIndex-word.length-1;
                    var offset = ctx.measureText(lines[i].substr(0, index)).width;
                    var str = lines[i].substr(index, word.length);
                    var length = ctx.measureText(str).width;
                    offsets.push({'word': str, 'offset':offset, 'length':length, 'guess':""});
                }
            }
            offsets.sort(sortKeyword);
            keywords.push(offsets);
        }
        ctx.font = prevFont;
        var res = [];
        this.keynb = 0;
        for(var i in lines) {
            this.keynb += keywords[i].length;
            res.push({text:lines[i], keywords:keywords[i]});
        }
        return res;
    };
    this.drawColoredText = function(ctx) {
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "20px Arial";
        var y = 100, x = 100;
        for(var i in this.lines) {
            ctx.fillStyle = "#fff";
            ctx.fillText(this.lines[i].text, x, y);
            for(var j in this.lines[i].keywords) {
                var keyword = this.lines[i].keywords[j];
                if(this.state != "START") {
                    ctx.fillStyle = "#fff";
                    ctx.shadowBlur = 8;
                    ctx.fillRect(x+keyword.offset, y, keyword.length, 20);
                    ctx.shadowBlur = 0;
                    if(keyword.guess != "") {
                        ctx.fillStyle = this.colormap[keyword.guess];
                        ctx.fillText(keyword.guess, x+keyword.offset, y);
                    }
                }
                else {
                    ctx.fillStyle = this.colormap[keyword.word.toLowerCase()];
                    ctx.fillText(keyword.word, x+keyword.offset, y);
                }
            }
            y += size.question.lh;
        }
    };
    
    this.draw = function(ctx) {
        ctx.save();
        if(MseConfig.android || MseConfig.iPhone) {
            ctx.scale(0.8, 0.62);
        }
        back.draw(ctx);
        for(var i in this.bases) {
            this.bases[i].draw(ctx);
        }
        // Draw fourchelangue
        if(this.state != "INIT") this.drawColoredText(ctx);
        // Draw Time
        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.shadowBlur = 5;
        var timestr = Math.floor(this.currTime/600) +""+ Math.floor((this.currTime%600)/60) +":"+ Math.floor((this.currTime%60)/10) +""+ Math.floor(this.currTime%10);
        ctx.fillText(timestr, 530, 30);
        // Draw level
        ctx.fillText("Niveau "+(this.mode+1), 40, 30);
        
        // Draw help text
        ctx.fillStyle = "#fff";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 10;
        ctx.translate(300,200);
        if(this.state == "INIT") {
            ctx.fillText("Mémorise vite la phrase qui va suivre", 0,-80);
            ctx.fillText("puis fais la répéter par les rats !", 0,-40);
            ctx.fillText("Clique pour commencer...", 0,0);
        }
        else if(this.currTime > 6.5 && this.currTime < 7.5)
            ctx.fillText("3", 0,0);
        else if(this.currTime > 7.5 && this.currTime < 8.5)
            ctx.fillText("2", 0,0);
        else if(this.currTime > 8.5 && this.currTime < 9.5)
            ctx.fillText("1", 0,0);
        ctx.shadowBlur = 0;
        ctx.translate(-300,-200);
        
        if(this.state == "FAIL") {
            wrong.draw(ctx);
            replaybn.draw(ctx);
            passbn.draw(ctx);
        }
        else if(this.state == "SUCCESS") {
            right.draw(ctx);
            levelupbn.draw(ctx);
            passbn.draw(ctx);
        }
        
        ctx.restore();
    };
    this.logic = function(delta) {
        if(this.state == "START" && this.currTime > 10) {
            this.state = "PLAYING";
            this.keycount = 0;
        }
    
        for(var i in this.bases) {
            this.bases[i].logic();
        }
        if(this.state != "INIT") this.currTime += delta/1000;
    };
    
    this.clickcb = new mse.Callback(this.clicked, this);
};
extend(Fourchelangue, mse.Game);
mse.coords = JSON.parse('{"cid0":800,"cid1":600,"cid2":262,"cid3":346,"cid4":0,"cid5":400,"cid6":200,"cid7":20,"cid8":427.5,"cid9":91.25,"cid10":186.25,"cid11":105,"cid12":32.5,"cid13":221.25,"cid14":61.25,"cid15":290,"cid16":247.5,"cid17":341.25,"cid18":120,"cid19":230,"cid20":423.75,"cid21":17.5,"cid22":340,"cid23":590,"cid24":10,"cid25":22.5,"cid26":36.25,"cid27":425,"cid28":295,"cid29":262.5,"cid30":346.25,"cid31":306,"cid32":397.8,"cid33":17,"cid34":306,"cid35":428.4,"cid36":496.25,"cid37":27.5,"cid38":33,"cid39":221,"cid40":109,"cid41":363,"cid42":89,"cid43":320,"cid44":248,"cid45":178,"cid46":61,"cid47":18,"cid48":228,"cid49":421,"cid50":358,"cid51":121,"cid52":273,"cid53":184,"cid54":255,"cid55":301,"cid56":-74,"cid57":-250,"cid58":980,"cid59":1100,"cid60":284,"cid61":159,"cid62":300,"cid63":428,"cid64":350,"cid65":68,"cid66":60,"cid67":280,"cid68":206,"cid69":129,"cid70":-11,"cid71":211,"cid72":431,"cid73":201,"cid74":-281,"cid75":244,"cid76":309,"cid77":208,"cid78":269,"cid79":253,"cid80":263,"cid81":256,"cid82":3}');
initMseConfig();
mse.init();
window.pages={};
var layers={};
window.objs={};
var animes={};
var games={};
var wikis={};
function createbook(){
	if(config.publishMode == 'debug') mse.configs.srcPath='./Voodoo_Ch2/';
	window.root = new mse.Root('Voodoo_Ch2',mse.coor('cid0'),mse.coor('cid1'),'portrait');
	var temp = {};
	animes.maskshow=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.maskshow.block=true;
	animes.titleshow=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.titleshow.block=true;
	animes.chashow=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.chashow.block=true;
	animes.resumshow=new mse.Animation(89,1,false,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.resumshow.block=true;
	mse.src.addSource('src7','images/src7.png','img',true);
	mse.src.addSource('src9','images/src9.png','img',true);
	mse.src.addSource('src10','audios/src10','aud',false);
	mse.src.addSource('src13','images/src13.jpeg','img',true);
	mse.src.addSource('src14','images/src14.png','img',true);
	mse.src.addSource('src15','images/src15.png','img',true);
	mse.src.addSource('src16','images/src16.png','img',true);
	animes.hurla=new mse.Animation(22,1,true,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.hurla.block=true;
	mse.src.addSource('src17','images/src17.jpeg','img',true);
	mse.src.addSource('src18','images/src18.jpeg','img',true);
	mse.src.addSource('simoncoma','images/simoncoma.jpeg','img',true);
	mse.src.addSource('darkhead','images/darkhead.png','img',true);
	games.GameSimonComa = new GameSimonComa();
	mse.src.addSource('sangmask','images/sangmask.jpeg','img',true);
	animes.ratflash=new mse.Animation(39,1,true,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.ratflash.block=true;
	mse.src.addSource('src24','images/src24.jpeg','img',true);
	mse.src.addSource('src25','images/src25.jpeg','img',true);
	games.Fourchelangue = new Fourchelangue();
	mse.src.addSource('src26','images/src26.png','img',true);
	mse.src.addSource('src27','images/src27.png','img',true);
	mse.src.addSource('src28','images/src28.png','img',true);
	mse.src.addSource('src29','images/src29.png','img',true);
	mse.src.addSource('src30','images/src30.png','img',true);
	mse.src.addSource('src31','images/src31.jpeg','img',true);
	mse.src.addSource('src32','images/src32.jpeg','img',true);
	mse.src.addSource('src33','images/src33.jpeg','img',true);
	wikis.Chatiere=new mse.WikiLayer();
	wikis.Chatiere.addImage('src24', 'Chatière géologique. Photographie de Delaere ');
	wikis.Chatiere.addTextCard();
	wikis.Chatiere.textCard.addSection('Chatière', 'Nom féminin :\nOuverture qui permet aux chats de rentrer dans une maison.\nOuverture dans un toit servant à aérer les greniers. En géologie : galerie très  étroite dans laquelle on doit ramper.');
	wikis.Ballast=new mse.WikiLayer();
	wikis.Ballast.addImage('src25', 'Photo de R/DV/RS');
	wikis.Ballast.addTextCard();
	wikis.Ballast.textCard.addSection('Ballast', 'Nom masculin :\nLit de gravier qui supporte une voie de chemin de fer. Réservoir qui permet de modifier l’équilibre d’un bateau. Réservoir rempli d’air ou d’eau qui permet à un sous-marin de plonger (eau) ou de faire surface (air). Composant électrique utilisé pour réduire le courant dans un circuit électrique.');
	wikis.Spectrale=new mse.WikiLayer();
	wikis.Spectrale.addTextCard();
	wikis.Spectrale.textCard.addSection('Spectrale', 'Adjectif (spectral, spectraux) :\nQui a l’apparence d’un fantôme, d’un ectoplasme, d’un revenant, d’un spectre.');
	wikis.Perclus=new mse.WikiLayer();
	wikis.Perclus.addTextCard();
	wikis.Perclus.textCard.addSection('Perclus', 'Verbe passif : être perclus : être momentanément ou définitivement incapable de bouger en raison d’une maladie, d’une douleur ou d’une émotion : être perclus de douleur, de fatigue, de froid ou de stupéfaction.');
	wikis.Perclus.textCard.addSection('Synonymes', 'Impotent – Infirme – Paralysé - Engourdi');
	mse.src.addSource('intro','audios/intro','aud',false);
	mse.src.addSource('chutepluscris','audios/chutepluscris','aud',false);
	mse.src.addSource('sonchuteanime','audios/sonchuteanime','aud',false);
	mse.src.addSource('calme','audios/calme','aud',false);
	mse.src.addSource('ilestla','audios/ilestla','aud',false);
	mse.src.addSource('angoissante','audios/angoissante','aud',false);
	mse.src.addSource('visageSansCri','audios/visageSansCri','aud',false);
	mse.src.addSource('dark2','audios/dark2','aud',false);
	mse.src.addSource('couinement','audios/couinement','aud',false);
	mse.src.addSource('angoiseProg','audios/angoiseProg','aud',false);
	mse.src.addSource('sursaut','audios/sursaut','aud',false);
	mse.src.addSource('hurlement','audios/hurlement','aud',false);
	mse.src.addSource('darkdark','audios/darkdark','aud',false);
	mse.src.addSource('sursautlong','audios/sursautlong','aud',false);
	animes.simchute=new mse.Animation(139,1,true,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.simchute.block=true;
	animes.simchute2=new mse.Animation(139,1,true,null,{'size':[mse.coor('cid2'),mse.coor('cid3')]});
	animes.simchute2.block=true;
	pages.Couverture=new mse.BaseContainer(root,'Couverture',{size:[mse.coor('cid0'),mse.coor('cid1')]});
	layers.couver=new mse.Layer(pages.Couverture,1,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	pages.Couverture.addLayer('couver',layers.couver);
	layers.title=new mse.Layer(pages.Couverture,2,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj936=new mse.Image(layers.title,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid4'),mse.coor('cid4')]},'src33'); layers.title.addObject(objs.obj936);
	pages.Couverture.addLayer('title',layers.title);
	pages.Chapitre=new mse.BaseContainer(null,'Chapitre',{size:[mse.coor('cid0'),mse.coor('cid1')]});
	layers.chaback=new mse.Layer(pages.Chapitre,1,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj593=new mse.Image(layers.chaback,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid4'),mse.coor('cid4')]},'src17'); layers.chaback.addObject(objs.obj593);
	pages.Chapitre.addLayer('chaback',layers.chaback);
	layers.text=new mse.Layer(pages.Chapitre,2,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj11=new mse.Mask(layers.text,{"size":[mse.coor('cid5'),mse.coor('cid1')],"pos":[mse.coor('cid6'),mse.coor('cid4')],"fillStyle":"rgb(0, 0, 0)","globalAlpha":0.60,"font":"normal "+mse.coor('cid7')+"px Times","textAlign":"left"}); layers.text.addObject(objs.obj11);
	pages.Chapitre.addLayer('text',layers.text);
	layers.mask=new mse.Layer(pages.Chapitre,3,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj12=new mse.Text(layers.mask,{"size":[mse.coor('cid8'),mse.coor('cid9')],"pos":[mse.coor('cid10'),mse.coor('cid11')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid12')+"px Gudea","textAlign":"center","textBaseline":"top"},'MURUZÉ TROUSSIFÉE RASSIMAIS',true); layers.mask.addObject(objs.obj12);
	objs.obj13=new mse.Text(layers.mask,{"size":[mse.coor('cid13'),mse.coor('cid14')],"pos":[mse.coor('cid15'),mse.coor('cid16')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid12')+"px Gudea","textAlign":"center","textBaseline":"top"},'Episode II',true); layers.mask.addObject(objs.obj13);
	objs.obj585=new mse.Text(layers.mask,{"size":[mse.coor('cid17'),mse.coor('cid18')],"pos":[mse.coor('cid19'),mse.coor('cid20')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid21')+"px Gudea","textAlign":"left","textBaseline":"top"},'Simon a dû s’échapper de son foyer sous la menace d’une bande qui se fait appeler la Meute. Il s’est enfui à travers les rues de Paris pour se retrouver pris au piège dans le Parc Montsouris… ',true); layers.mask.addObject(objs.obj585);
	pages.Chapitre.addLayer('mask',layers.mask);
	pages.Content=new mse.BaseContainer(null,'Content',{size:[mse.coor('cid0'),mse.coor('cid1')]});
	layers.Contentdefault=new mse.Layer(pages.Content,1,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj594=new mse.Image(layers.Contentdefault,{"size":[mse.coor('cid0'),mse.coor('cid1')],"pos":[mse.coor('cid4'),mse.coor('cid4')]},'src17'); layers.Contentdefault.addObject(objs.obj594);
	pages.Content.addLayer('Contentdefault',layers.Contentdefault);
	layers.mask2=new mse.Layer(pages.Content,2,{"globalAlpha":1,"textBaseline":"top","size":[mse.coor('cid0'),mse.coor('cid1')]});
	objs.obj635=new mse.Mask(layers.mask2,{"size":[mse.coor('cid5'),mse.coor('cid1')],"pos":[mse.coor('cid6'),mse.coor('cid4')],"fillStyle":"rgb(0, 0, 0)","globalAlpha":0.65,"font":"normal "+mse.coor('cid7')+"px Times","textAlign":"left"}); layers.mask2.addObject(objs.obj635);
	pages.Content.addLayer('mask2',layers.mask2);
	layers.content=new mse.ArticleLayer(pages.Content,3,{"size":[mse.coor('cid22'),mse.coor('cid23')],"pos":[mse.coor('cid19'),mse.coor('cid24')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid25')+"px Gudea","textAlign":"left","textBaseline":"top","lineHeight":mse.coor('cid26')},null);
	objs.obj636=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Durant quelques instants, Simon ',true); layers.content.addObject(objs.obj636);
	objs.obj637=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'resta suspendu dans les airs. Une ',true); layers.content.addObject(objs.obj637);
	objs.obj638=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'sensation unique, enivrante. ',true); layers.content.addObject(objs.obj638);
	objs.obj639=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Comme s’il volait.',true); layers.content.addObject(objs.obj639);
	objs.obj640=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'unknown', 'src31' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj640);
	objs.obj641=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Il est malade ce type !',true);
	objs.obj640.addObject(objs.obj641);
	objs.obj642=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Et soudain, la chute. Interminable. ',true); layers.content.addObject(objs.obj642);
	objs.obj643=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il se mit à paniquer. Devant lui, il ',true); layers.content.addObject(objs.obj643);
	objs.obj644=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'n’y avait qu’un trou noir, béant, ',true); layers.content.addObject(objs.obj644);
	objs.obj645=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'une porte de ténèbres ouverte sur ',true); layers.content.addObject(objs.obj645);
	objs.obj646=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'les Enfers.',true); layers.content.addObject(objs.obj646);
	objs.obj647=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Après tout ce n’était peut-être pas ',true); layers.content.addObject(objs.obj647);
	objs.obj648=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'une bonne idée.',true); layers.content.addObject(objs.obj648);
	objs.obj649=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'unknown', 'src31' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj649);
	objs.obj650=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'On fait le tour et on le ',true);
	objs.obj649.addObject(objs.obj650);
	objs.obj651=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'récupère en bas.',true);
	objs.obj649.addObject(objs.obj651);
	objs.obj652=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Ce fut la dernière chose qu’il ',true); layers.content.addObject(objs.obj652);
	objs.obj653=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'entendit avant d’atterrir avec ',true); layers.content.addObject(objs.obj653);
	objs.obj654=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'violence dans un épais taillis. Le ',true); layers.content.addObject(objs.obj654);
	objs.obj655=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'choc lui arracha un cri. ',true);
	objs.obj655.addLink(new mse.Link('choc',16,'audio',mse.src.getSrc('chutepluscris'))); layers.content.addObject(objs.obj655);
	objs.obj656=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Tout son corps lui faisait mal, ses ',true); layers.content.addObject(objs.obj656);
	objs.obj657=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'bras zébrés d’écorchures, le ',true); layers.content.addObject(objs.obj657);
	objs.obj658=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'souffle définitivement coupé. ',true); layers.content.addObject(objs.obj658);
	objs.obj659=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il n’était pas tombé sur le sol. Il ',true); layers.content.addObject(objs.obj659);
	objs.obj660=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'était suspendu juste au-dessus de ',true); layers.content.addObject(objs.obj660);
	objs.obj661=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'la voie ferrée, sauvé par un ',true); layers.content.addObject(objs.obj661);
	objs.obj662=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'buisson providentiel qui poussait ',true); layers.content.addObject(objs.obj662);
	objs.obj663=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'dans le vide. ',true); layers.content.addObject(objs.obj663);
	objs.obj664=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Waouh, songea-t-il en essayant de ',true); layers.content.addObject(objs.obj664);
	objs.obj665=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'se dégager, je l’ai échappé belle…',true); layers.content.addObject(objs.obj665);
	objs.obj666=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Mais, alors qu’il pensait s’en être ',true); layers.content.addObject(objs.obj666);
	objs.obj667=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'sorti, les racines du taillis cédèrent ',true); layers.content.addObject(objs.obj667);
	objs.obj668=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'d’un seul coup, propulsant Simon ',true); layers.content.addObject(objs.obj668);
	objs.obj669=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'deux mètres plus bas. ',true); layers.content.addObject(objs.obj669);
	objs.obj945=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj945);
	objs.obj948=animes.simchute2; objs.obj948.setX(38.75); layers.content.addAnimation(objs.obj948);
	objs.obj946=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj946);
	objs.obj670=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Ne pas atterrir sur mon sac, ',true); layers.content.addObject(objs.obj670);
	objs.obj671=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'surtout ne pas atterrir sur mon ',true); layers.content.addObject(objs.obj671);
	objs.obj672=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'sac, fut sa seule pensée avant de ',true); layers.content.addObject(objs.obj672);
	objs.obj673=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'rejoindre le ballast. ',true);
	objs.obj673.addLink(new mse.Link('ballast',37,'wiki',wikis.Ballast)); layers.content.addObject(objs.obj673);
	objs.obj674=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Les angles aigus des pierres ',true); layers.content.addObject(objs.obj674);
	objs.obj675=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'pénétrèrent dans ses côtes et sa ',true); layers.content.addObject(objs.obj675);
	objs.obj676=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'tête heurta le métal de la voie ',true); layers.content.addObject(objs.obj676);
	objs.obj677=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'abandonnée. ',true); layers.content.addObject(objs.obj677);
	objs.obj678=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il était allongé sur une traverse, ',true); layers.content.addObject(objs.obj678);
	objs.obj679=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'son regard bleu inondé par la ',true); layers.content.addObject(objs.obj679);
	objs.obj680=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'lueur de la pleine lune. Il n’avait ',true); layers.content.addObject(objs.obj680);
	objs.obj681=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'plus envie de bouger, absorbé par ',true); layers.content.addObject(objs.obj681);
	objs.obj682=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'les dessins mystérieux que ',true); layers.content.addObject(objs.obj682);
	objs.obj683=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'traçaient les étoiles dans le ciel.',true); layers.content.addObject(objs.obj683);
	objs.obj684=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Une étrange sensation - humide ',true); layers.content.addObject(objs.obj684);
	objs.obj685=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'et râpeuse à la fois - le tira de sa ',true); layers.content.addObject(objs.obj685);
	objs.obj686=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'rêverie. C’était la minuscule ',true); layers.content.addObject(objs.obj686);
	objs.obj687=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'langue de Dark. ',true); layers.content.addObject(objs.obj687);
	objs.obj911=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj911);
	objs.obj914=new GameSimonComa(); layers.content.addGame(objs.obj914);
	objs.obj912=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj912);
	objs.obj688=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'simon', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj688);
	objs.obj689=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Dark ! Tu n’as rien ! ',true);
	objs.obj688.addObject(objs.obj689);
	objs.obj690=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'s’exclama Simon en se ',true);
	objs.obj688.addObject(objs.obj690);
	objs.obj692=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'redressant.',true);
	objs.obj688.addObject(objs.obj692);
	objs.obj693=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Aussitôt le rat se lova dans son ',true); layers.content.addObject(objs.obj693);
	objs.obj694=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'cou, rassuré à son tour par l’état ',true); layers.content.addObject(objs.obj694);
	objs.obj695=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'de santé de son maître.  ',true); layers.content.addObject(objs.obj695);
	objs.obj696=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'fouine', 'src26' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj696);
	objs.obj697=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Il est là. Vivant !',true);
	objs.obj696.addObject(objs.obj697);
	objs.obj698=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'La Fouine ! ',true); layers.content.addObject(objs.obj698);
	objs.obj699=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'La Meute n’avait pas mis bien ',true); layers.content.addObject(objs.obj699);
	objs.obj700=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'longtemps pour le retrouver. La ',true); layers.content.addObject(objs.obj700);
	objs.obj701=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'traque allait recommencer. Mais ',true); layers.content.addObject(objs.obj701);
	objs.obj702=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'l’adolescent était fourbu, perclus ',true);
	objs.obj702.addLink(new mse.Link('perclus',64,'wiki',wikis.Perclus)); layers.content.addObject(objs.obj702);
	objs.obj703=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'de douleurs et il se voyait mal fuir ',true); layers.content.addObject(objs.obj703);
	objs.obj704=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'encore une fois. ',true); layers.content.addObject(objs.obj704);
	objs.obj705=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il se releva, fouillant  l’obscurité ',true); layers.content.addObject(objs.obj705);
	objs.obj706=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'alentour. ',true); layers.content.addObject(objs.obj706);
	objs.obj707=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'A droite, le danger...',true); layers.content.addObject(objs.obj707);
	objs.obj708=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'A gauche, l’œil béant d’un tunnel ',true); layers.content.addObject(objs.obj708);
	objs.obj709=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'ferroviaire qui plongeait sous le ',true); layers.content.addObject(objs.obj709);
	objs.obj710=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'parc.',true); layers.content.addObject(objs.obj710);
	objs.obj711=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il n’y avait pas à hésiter.',true); layers.content.addObject(objs.obj711);
	objs.obj712=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il ramassa sa besace et se remit ',true); layers.content.addObject(objs.obj712);
	objs.obj713=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'en route. Il avait faim, il avait froid ',true); layers.content.addObject(objs.obj713);
	objs.obj714=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'et sa cheville le faisait ',true); layers.content.addObject(objs.obj714);
	objs.obj715=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'affreusement souffrir. ',true); layers.content.addObject(objs.obj715);
	objs.obj716=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il extirpa la lampe de son sac et ',true); layers.content.addObject(objs.obj716);
	objs.obj717=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'caressa la fourrure de Dark.',true); layers.content.addObject(objs.obj717);
	objs.obj718=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'simon', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj718);
	objs.obj719=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Eh bien, mon vieux, je crois ',true);
	objs.obj718.addObject(objs.obj719);
	objs.obj720=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'que nous sommes en bien ',true);
	objs.obj718.addObject(objs.obj720);
	objs.obj723=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'mauvaise posture. Désolé de ',true);
	objs.obj718.addObject(objs.obj723);
	objs.obj724=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'t’avoir entraîné là-dedans. ',true);
	objs.obj718.addObject(objs.obj724);
	objs.obj725=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Le rongeur l’écoutait d’un air ',true); layers.content.addObject(objs.obj725);
	objs.obj726=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'attentif, dressé sur ses pattes ',true); layers.content.addObject(objs.obj726);
	objs.obj727=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'postérieures, le nez tendu. ',true); layers.content.addObject(objs.obj727);
	objs.obj728=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'simon', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj728);
	objs.obj729=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Voilà que je me mets à parler ',true);
	objs.obj728.addObject(objs.obj729);
	objs.obj730=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'à mon rat comme s’il ',true);
	objs.obj728.addObject(objs.obj730);
	objs.obj732=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'comprenait quelque chose !',true);
	objs.obj728.addObject(objs.obj732);
	objs.obj733=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Dans la pénombre, l’entrée du ',true); layers.content.addObject(objs.obj733);
	objs.obj734=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'tunnel ressemblait au porche ',true); layers.content.addObject(objs.obj734);
	objs.obj735=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'d’un temple mystérieux. ',true); layers.content.addObject(objs.obj735);
	objs.obj736=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Indiana Jones. ',true); layers.content.addObject(objs.obj736);
	objs.obj737=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Sauf que l’adolescent ne possédait ',true); layers.content.addObject(objs.obj737);
	objs.obj738=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'ni chapeau, ni fouet. ',true); layers.content.addObject(objs.obj738);
	objs.obj739=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'kevin', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj739);
	objs.obj740=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Simon… Simon… Reviens…',true);
	objs.obj739.addObject(objs.obj740);
	objs.obj741=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'La voix de Kevin s’élevait dans la ',true); layers.content.addObject(objs.obj741);
	objs.obj742=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'nuit. Mielleuse, sournoise. ',true); layers.content.addObject(objs.obj742);
	objs.obj743=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'kevin', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj743);
	objs.obj744=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Simon, tu as gagné. Si tu ',true);
	objs.obj743.addObject(objs.obj744);
	objs.obj745=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'t’rends maintenant, j’te ',true);
	objs.obj743.addObject(objs.obj745);
	objs.obj750=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'promets qu’on t’fera pas trop ',true);
	objs.obj743.addObject(objs.obj750);
	objs.obj751=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'souffrir, ajouta-t-il en raclant la ',true);
	objs.obj743.addObject(objs.obj751);
	objs.obj752=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'lame de son couteau contre les ',true);
	objs.obj743.addObject(objs.obj752);
	objs.obj753=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'pierres d’un muret.',true);
	objs.obj743.addObject(objs.obj753);
	objs.obj754=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Un bruit affreux, qui fit dresser les ',true);
	objs.obj754.addLink(new mse.Link('Un bruit affreux',95,'audio',mse.src.getSrc('src10'))); layers.content.addObject(objs.obj754);
	objs.obj755=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'poils de l’adolescent. ',true); layers.content.addObject(objs.obj755);
	objs.obj756=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Hors de question de tomber entre ',true); layers.content.addObject(objs.obj756);
	objs.obj757=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'leurs mains! Il s’avança dans les ',true); layers.content.addObject(objs.obj757);
	objs.obj758=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'ténèbres du tunnel, guidé par le ',true); layers.content.addObject(objs.obj758);
	objs.obj759=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'minuscule halo de sa lampe ',true); layers.content.addObject(objs.obj759);
	objs.obj760=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'torche. ',true); layers.content.addObject(objs.obj760);
	objs.obj761=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'La voûte minérale répercutait le ',true); layers.content.addObject(objs.obj761);
	objs.obj762=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'bruit de ses pas. ',true);
	objs.obj762.addLink(new mse.Link('pas',103,'audio',mse.src.getSrc('sursaut'))); layers.content.addObject(objs.obj762);
	objs.obj763=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Simon balaya les murs et… hurla !',true); layers.content.addObject(objs.obj763);
	objs.obj765=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Là, dans la lueur blafarde, était ',true); layers.content.addObject(objs.obj765);
	objs.obj766=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'apparu un visage. Démesuré. ',true); layers.content.addObject(objs.obj766);
	objs.obj767=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Grimaçant.',true); layers.content.addObject(objs.obj767);
	objs.obj768=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Une fresque.',true); layers.content.addObject(objs.obj768);
	objs.obj769=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Quel idiot ! songea-t-il.',true); layers.content.addObject(objs.obj769);
	objs.obj770=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'L’œuvre représentait une créature ',true); layers.content.addObject(objs.obj770);
	objs.obj771=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'démoniaque qui semblait vouloir ',true); layers.content.addObject(objs.obj771);
	objs.obj772=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'dévorer l’intrus. Une sorte ',true); layers.content.addObject(objs.obj772);
	objs.obj773=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'d’avertissement.',true); layers.content.addObject(objs.obj773);
	objs.obj915=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj915);
	objs.obj926=new mse.Image(layers.content,{"size":[mse.coor('cid31'),mse.coor('cid32')],"pos":[mse.coor('cid33'),mse.coor('cid7')]},'src9');
	objs.obj926.activateZoom(); layers.content.addObject(objs.obj926);
	objs.obj916=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj916);
	objs.obj774=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Impressionné, Simon trébucha et ',true); layers.content.addObject(objs.obj774);
	objs.obj775=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'s’étala de tout son long. ',true); layers.content.addObject(objs.obj775);
	objs.obj776=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'simon', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj776);
	objs.obj777=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Et merde !',true);
	objs.obj776.addObject(objs.obj777);
	objs.obj778=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Une chute sans gravité. Sauf que ',true); layers.content.addObject(objs.obj778);
	objs.obj779=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Dark, sans doute agacé d’être de ',true); layers.content.addObject(objs.obj779);
	objs.obj780=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'nouveau balloté, avait disparu !',true); layers.content.addObject(objs.obj780);
	objs.obj781=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'simon', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj781);
	objs.obj782=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Dark ! Dark !',true);
	objs.obj781.addObject(objs.obj782);
	objs.obj783=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'L’adolescent avait presque crié. ',true); layers.content.addObject(objs.obj783);
	objs.obj784=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Les conséquences ne se firent pas ',true); layers.content.addObject(objs.obj784);
	objs.obj785=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'attendre. ',true); layers.content.addObject(objs.obj785);
	objs.obj786=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'unknown', 'src31' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj786);
	objs.obj787=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Venez les gars, il est là ! Tout ',true);
	objs.obj786.addObject(objs.obj787);
	objs.obj788=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'près !',true);
	objs.obj786.addObject(objs.obj788);
	objs.obj789=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Simon entendit un bruit de ',true); layers.content.addObject(objs.obj789);
	objs.obj790=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'cavalcade dans sa direction. Il ',true); layers.content.addObject(objs.obj790);
	objs.obj791=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'balaya la surface du tunnel. Mais il ',true); layers.content.addObject(objs.obj791);
	objs.obj792=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'n’y avait rien qui ressembla à une ',true); layers.content.addObject(objs.obj792);
	objs.obj793=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'cachette. Pas la moindre ',true); layers.content.addObject(objs.obj793);
	objs.obj794=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'anfractuosité, pas le moindre bloc ',true); layers.content.addObject(objs.obj794);
	objs.obj795=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'où se dissimuler. ',true); layers.content.addObject(objs.obj795);
	objs.obj796=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Juste la queue de Dark qui ',true); layers.content.addObject(objs.obj796);
	objs.obj797=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'disparaissait dans le mur, ',true); layers.content.addObject(objs.obj797);
	objs.obj798=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'quelques mètres devant lui. ',true); layers.content.addObject(objs.obj798);
	objs.obj799=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Simon se précipita.',true); layers.content.addObject(objs.obj799);
	objs.obj800=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Derrière lui, les prédateurs se ',true); layers.content.addObject(objs.obj800);
	objs.obj801=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'regroupaient.',true); layers.content.addObject(objs.obj801);
	objs.obj802=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'unknown', 'src31' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj802);
	objs.obj803=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'On se met en ligne et on ',true);
	objs.obj802.addObject(objs.obj803);
	objs.obj804=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'avance. Il n’a aucune chance ',true);
	objs.obj802.addObject(objs.obj804);
	objs.obj806=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'de nous échapper.',true);
	objs.obj802.addObject(objs.obj806);
	objs.obj807=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Une sueur froide inondait le dos ',true); layers.content.addObject(objs.obj807);
	objs.obj808=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'de l’adolescent. La peur.',true); layers.content.addObject(objs.obj808);
	objs.obj809=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'simon', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj809);
	objs.obj810=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Dark ?',true);
	objs.obj809.addObject(objs.obj810);
	objs.obj811=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Un couinement, juste devant lui. ',true);
	objs.obj811.addLink(new mse.Link('couinement',145,'audio',mse.src.getSrc('couinement'))); layers.content.addObject(objs.obj811);
	objs.obj812=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Simon s’approcha et découvrit un ',true); layers.content.addObject(objs.obj812);
	objs.obj813=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'trou, de la taille de son poing, qui ',true); layers.content.addObject(objs.obj813);
	objs.obj814=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'semblait avoir été creusé à ',true); layers.content.addObject(objs.obj814);
	objs.obj815=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'hauteur d’homme. Le rat ',true); layers.content.addObject(objs.obj815);
	objs.obj816=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'l’attendait là, comme pour ',true); layers.content.addObject(objs.obj816);
	objs.obj817=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'l’inviter à le suivre.',true); layers.content.addObject(objs.obj817);
	objs.obj818=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'simon', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj818);
	objs.obj819=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Et comment veux-tu que je ',true);
	objs.obj818.addObject(objs.obj819);
	objs.obj820=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'rentre là-dedans ? ',true);
	objs.obj818.addObject(objs.obj820);
	objs.obj821=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'La Meute se rapprochait encore. ',true); layers.content.addObject(objs.obj821);
	objs.obj822=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'L’adolescent plongea ses mains ',true); layers.content.addObject(objs.obj822);
	objs.obj823=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'dans l’orifice et s’aperçut que les ',true); layers.content.addObject(objs.obj823);
	objs.obj824=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'parois étaient friables. Sans doute ',true); layers.content.addObject(objs.obj824);
	objs.obj825=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'une chatière que l’on avait ',true);
	objs.obj825.addLink(new mse.Link('chatière',157,'wiki',wikis.Chatiere)); layers.content.addObject(objs.obj825);
	objs.obj826=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'dissimulée à la hâte. En quelques ',true); layers.content.addObject(objs.obj826);
	objs.obj827=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'gestes, il dégagea un espace ',true); layers.content.addObject(objs.obj827);
	objs.obj828=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'suffisant pour qu’il puisse s’y ',true); layers.content.addObject(objs.obj828);
	objs.obj829=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'engager. ',true); layers.content.addObject(objs.obj829);
	objs.obj830=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'simon', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj830);
	objs.obj831=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Dark, tu es un génie, ',true);
	objs.obj830.addObject(objs.obj831);
	objs.obj832=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'murmura Simon en songeant ',true);
	objs.obj830.addObject(objs.obj832);
	objs.obj837=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'à cette vieille comptine que lui ',true);
	objs.obj830.addObject(objs.obj837);
	objs.obj838=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'chantait sa mère, jadis : « Muruzé, ',true);
	objs.obj830.addObject(objs.obj838);
	objs.obj839=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Troussifée, Rassimais ». ',true);
	objs.obj830.addObject(objs.obj839);
	objs.obj840=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Des mots magiques, qu’il avait ',true); layers.content.addObject(objs.obj840);
	objs.obj841=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'mis des années à comprendre : « ',true); layers.content.addObject(objs.obj841);
	objs.obj842=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Mur usé, trou s’y fait, rat s’y ',true); layers.content.addObject(objs.obj842);
	objs.obj843=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'met… ».',true); layers.content.addObject(objs.obj843);
	objs.obj919=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj919);
	objs.obj922=new Fourchelangue(); layers.content.addGame(objs.obj922);
	objs.obj920=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj920);
	objs.obj844=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il sourit un instant puis plongea le ',true); layers.content.addObject(objs.obj844);
	objs.obj845=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'faisceau de sa lampe dans le ',true); layers.content.addObject(objs.obj845);
	objs.obj846=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'minuscule passage. Impossible ',true); layers.content.addObject(objs.obj846);
	objs.obj847=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'d’en apercevoir le bout. ',true); layers.content.addObject(objs.obj847);
	objs.obj848=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Impossible de savoir où il allait. ',true); layers.content.addObject(objs.obj848);
	objs.obj849=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Des bruits de pas sur le gravier, ',true); layers.content.addObject(objs.obj849);
	objs.obj850=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'juste derrière lui. Pas le choix !',true); layers.content.addObject(objs.obj850);
	objs.obj851=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il se faufila entre les étroites ',true); layers.content.addObject(objs.obj851);
	objs.obj852=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'parois, les bras en avant, ',true); layers.content.addObject(objs.obj852);
	objs.obj853=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'poussant son sac. Il n’avait même ',true); layers.content.addObject(objs.obj853);
	objs.obj854=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'pas la place de ramper, contraint ',true); layers.content.addObject(objs.obj854);
	objs.obj855=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'d’onduler à la manière d’un ',true); layers.content.addObject(objs.obj855);
	objs.obj856=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'serpent. ',true); layers.content.addObject(objs.obj856);
	objs.obj857=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'La poussière l’aveuglait, de la ',true); layers.content.addObject(objs.obj857);
	objs.obj858=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'boue s’engouffrait dans sa bouche ',true); layers.content.addObject(objs.obj858);
	objs.obj859=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'et il commençait à suffoquer.',true); layers.content.addObject(objs.obj859);
	objs.obj860=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'unknown', 'src31' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj860);
	objs.obj861=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Le salaud, il essaye encore de ',true);
	objs.obj860.addObject(objs.obj861);
	objs.obj862=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'nous échapper !',true);
	objs.obj860.addObject(objs.obj862);
	objs.obj863=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Repéré !',true); layers.content.addObject(objs.obj863);
	objs.obj864=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'L’adolescent tenta d’accélérer le ',true); layers.content.addObject(objs.obj864);
	objs.obj865=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'mouvement. Mais plus il avançait, ',true); layers.content.addObject(objs.obj865);
	objs.obj866=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'plus il avait l’impression que le ',true); layers.content.addObject(objs.obj866);
	objs.obj867=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'boyau allait l’avaler, qu’il allait ',true); layers.content.addObject(objs.obj867);
	objs.obj868=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'mourir là. Il aurait voulu hurler ',true); layers.content.addObject(objs.obj868);
	objs.obj869=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'mais sa cage thoracique était trop ',true); layers.content.addObject(objs.obj869);
	objs.obj870=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'oppressée.',true); layers.content.addObject(objs.obj870);
	objs.obj871=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'kevin', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj871);
	objs.obj872=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Vas-y ! Suis-le ! hurlait Kevin.',true);
	objs.obj871.addObject(objs.obj872);
	objs.obj873=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'fouine', 'src26' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj873);
	objs.obj874=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Mais…',true);
	objs.obj873.addObject(objs.obj874);
	objs.obj875=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'kevin', 'src27' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj875);
	objs.obj876=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Discute-pas la Fouine, vas-y !',true);
	objs.obj875.addObject(objs.obj876);
	objs.obj877=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Simon tremblait, la sueur collait à ',true); layers.content.addObject(objs.obj877);
	objs.obj878=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'son front tandis que l’autre se ',true); layers.content.addObject(objs.obj878);
	objs.obj879=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'faufilait déjà à sa poursuite. Il était ',true); layers.content.addObject(objs.obj879);
	objs.obj880=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'mince, agile et surtout il avait ',true); layers.content.addObject(objs.obj880);
	objs.obj881=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'encore plus peur de Kevin que lui. ',true); layers.content.addObject(objs.obj881);
	objs.obj882=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Cette fois, Simon était bel et bien ',true); layers.content.addObject(objs.obj882);
	objs.obj883=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'foutu.',true); layers.content.addObject(objs.obj883);
	objs.obj884=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Soudain, un éclair blanc le fit ',true); layers.content.addObject(objs.obj884);
	objs.obj885=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'sursauter. Une silhouette ',true); layers.content.addObject(objs.obj885);
	objs.obj886=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'spectrale venait de passer entre ',true);
	objs.obj886.addLink(new mse.Link('spectrale',207,'wiki',wikis.Spectrale)); layers.content.addObject(objs.obj886);
	objs.obj887=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'son corps et la paroi.',true); layers.content.addObject(objs.obj887);
	objs.obj927=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj927);
	objs.obj930=new mse.Image(layers.content,{"size":[mse.coor('cid31'),mse.coor('cid32')],"pos":[mse.coor('cid33'),mse.coor('cid7')]},'src13');
	objs.obj930.activateZoom(); layers.content.addObject(objs.obj930);
	objs.obj928=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj928);
	objs.obj888=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Dans les secondes qui suivirent, ',true); layers.content.addObject(objs.obj888);
	objs.obj889=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'un hurlement ébranla le tunnel. ',true);
	objs.obj889.addLink(new mse.Link('hurlement',213,'audio',mse.src.getSrc('hurlement'))); layers.content.addObject(objs.obj889);
	objs.obj890=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Mais l’adolescent n’eut pas le ',true); layers.content.addObject(objs.obj890);
	objs.obj891=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'temps de s’y intéresser car il ',true); layers.content.addObject(objs.obj891);
	objs.obj892=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'venait, enfin, de déboucher sur un ',true); layers.content.addObject(objs.obj892);
	objs.obj893=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'espace plus grand. ',true); layers.content.addObject(objs.obj893);
	objs.obj894=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Il s’assit un instant pour ',true); layers.content.addObject(objs.obj894);
	objs.obj895=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'reprendre son souffle tandis que ',true); layers.content.addObject(objs.obj895);
	objs.obj896=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Dark lissait ses moustaches à ses ',true); layers.content.addObject(objs.obj896);
	objs.obj897=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'côtés. Quelques gouttes de sang ',true); layers.content.addObject(objs.obj897);
	objs.obj898=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'poissaient son museau. ',true); layers.content.addObject(objs.obj898);
	objs.obj931=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj931);
	objs.obj934=new mse.Image(layers.content,{"size":[mse.coor('cid34'),mse.coor('cid35')],"pos":[mse.coor('cid33'),mse.coor('cid7')]},'src14');
	objs.obj934.activateZoom(); layers.content.addObject(objs.obj934);
	objs.obj932=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj932);
	objs.obj899=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Le visage de Simon s’éclaira : ',true); layers.content.addObject(objs.obj899);
	objs.obj900=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'l’éclair blanc, le hurlement.',true); layers.content.addObject(objs.obj900);
	objs.obj901=new mse.Speaker( layers.content,{"size":[mse.coor('cid22'),mse.coor('cid4')]}, 'simon', 'src30' , mse.coor(mse.joinCoor(45)) , '#f99200' ); layers.content.addObject(objs.obj901);
	objs.obj902=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'Sacré Dark ! Sans toi, je ',true);
	objs.obj901.addObject(objs.obj902);
	objs.obj903=new mse.Text(layers.content,{"size":[mse.coor('cid28'),mse.coor('cid26')]},'n’avais aucune chance… ',true);
	objs.obj901.addObject(objs.obj903);
	objs.obj907=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'Maintenant, la question est de ',true);
	objs.obj901.addObject(objs.obj907);
	objs.obj908=new mse.Text(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]},'savoir où nous avons atterri !',true);
	objs.obj901.addObject(objs.obj908);
	objs.obj909=new mse.UIObject(layers.content,{"size":[mse.coor('cid27'),mse.coor('cid26')]}); layers.content.addObject(objs.obj909);
	objs.obj924=new mse.Text(layers.content,{"size":[mse.coor('cid22'),mse.coor('cid26')],"pos":[mse.coor('cid4'),mse.coor('cid36')],"fillStyle":"rgb(255, 255, 255)","globalAlpha":1,"font":"normal "+mse.coor('cid37')+"px Gudea","textAlign":"center"},'À SUIVRE...',true); layers.content.addObject(objs.obj924);
	layers.content.setDefile(1300);
	temp.layerDefile=layers.content;
	pages.Content.addLayer('content',layers.content);
	animes.maskshow.addObj('obj11',objs.obj11);
	animes.maskshow.addAnimation('obj11',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,0.800000011921,0.800000011921]')});
	animes.titleshow.addObj('obj12',objs.obj12);
	animes.titleshow.addAnimation('obj12',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,1,1]')});
	animes.chashow.addObj('obj13',objs.obj13);
	animes.chashow.addAnimation('obj13',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,1,1]')});
	animes.resumshow.addObj('obj585',objs.obj585);
	animes.resumshow.addAnimation('obj585',{'frame':JSON.parse('[0,75,88,89]'),'opacity':JSON.parse('[0,0,1,1]')});
	temp.obj=new mse.Image(null,{'pos':[mse.coor('cid52'),mse.coor('cid53')],'size':[mse.coor('cid54'),mse.coor('cid55')]},'src16');
	animes.hurla.addObj('src16',temp.obj);
	animes.hurla.addAnimation('src16',{'frame':JSON.parse('[0,3,8,21,22]'),'pos':[[mse.coor('cid52'),mse.coor('cid53')],[mse.coor('cid56'),mse.coor('cid57')],[mse.coor('cid56'),mse.coor('cid57')],[mse.coor('cid60'),mse.coor('cid61')],[mse.coor('cid60'),mse.coor('cid61')]],'size':[[mse.coor('cid54'),mse.coor('cid55')],[mse.coor('cid58'),mse.coor('cid59')],[mse.coor('cid58'),mse.coor('cid59')],[mse.coor('cid19'),mse.coor('cid62')],[mse.coor('cid19'),mse.coor('cid62')]],'opacity':JSON.parse('[0.800000011921,1,1,0,0]')});
	temp.obj=new mse.Image(null,{'pos':[mse.coor('cid63'),mse.coor('cid64')],'size':[mse.coor('cid65'),mse.coor('cid66')]},'src15');
	animes.ratflash.addObj('src15',temp.obj);
	animes.ratflash.addAnimation('src15',{'frame':JSON.parse('[0,25,35,36,37,38,39]'),'opacity':JSON.parse('[0,0,1,1,1,1,1]'),'pos':[[mse.coor('cid63'),mse.coor('cid64')],[mse.coor('cid63'),mse.coor('cid64')],[mse.coor('cid63'),mse.coor('cid64')],[mse.coor('cid67'),mse.coor('cid60')],[mse.coor('cid70'),mse.coor('cid71')],[mse.coor('cid74'),mse.coor('cid75')],[mse.coor('cid74'),mse.coor('cid75')]],'size':[[mse.coor('cid65'),mse.coor('cid66')],[mse.coor('cid65'),mse.coor('cid66')],[mse.coor('cid65'),mse.coor('cid66')],[mse.coor('cid68'),mse.coor('cid69')],[mse.coor('cid72'),mse.coor('cid73')],[mse.coor('cid76'),mse.coor('cid77')],[mse.coor('cid76'),mse.coor('cid77')]]});
	temp.obj=new mse.Mask(null,{'pos':[mse.coor('cid78'),mse.coor('cid79')],'size':[mse.coor('cid80'),mse.coor('cid3')],'fillStyle':'rgb(255, 255, 255)'});
	animes.simchute.addObj('obj935',temp.obj);
	temp.obj=new mse.Sprite(null,{'pos':[mse.coor('cid52'),mse.coor('cid54')],'size':[mse.coor('cid81'),mse.coor('cid22')]},'src32',256,340, 0,0,1792,1700);
	animes.simchute.addObj('src32',temp.obj);
	animes.simchute.addAnimation('obj935',{'frame':JSON.parse('[0,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60,63,66,69,72,75,78,81,84,87,90,93,96,99,102,105,108,111,114,139]')});
	animes.simchute.addAnimation('src32',{'frame':JSON.parse('[0,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60,63,66,69,72,75,78,81,84,87,90,93,96,99,102,105,108,111,114,139]'),'spriteSeq':JSON.parse('[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,34]')});
	temp.obj=new mse.Mask(null,{'pos':[mse.coor('cid4'),mse.coor('cid4')],'size':[mse.coor('cid80'),mse.coor('cid3')],'fillStyle':'rgb(255, 255, 255)'});
	animes.simchute2.addObj('obj935',temp.obj);
	temp.obj=new mse.Sprite(null,{'pos':[mse.coor('cid82'),mse.coor('cid82')],'size':[mse.coor('cid81'),mse.coor('cid22')]},'src32',256,340, 0,0,1792,1700);
	animes.simchute2.addObj('src32',temp.obj);
	animes.simchute2.addAnimation('obj935',{'frame':JSON.parse('[0,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60,63,66,69,72,75,78,81,84,87,90,93,96,99,102,105,108,111,114,139]')});
	animes.simchute2.addAnimation('src32',{'frame':JSON.parse('[0,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60,63,66,69,72,75,78,81,84,87,90,93,96,99,102,105,108,111,114,139]'),'spriteSeq':JSON.parse('[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,34]')});
	var action={};
	var reaction={};
	action.chBack=new mse.Script([{src:objs.obj740,type:'firstShow'}]);
	reaction.chBack=function(){ 
		temp.width=objs.obj594.getWidth();temp.height=objs.obj594.getHeight();temp.boundingbox=imgBoundingInBox('src18',temp.width,temp.height);temp.obj=new mse.Image(objs.obj594.parent,temp.boundingbox,'src18');mse.transition(objs.obj594,temp.obj,25); 
	};
	action.chBack.register(reaction.chBack);
	action.start2SonAngoissant=new mse.Script([{src:objs.obj792,type:'firstShow'}]);
	reaction.start2SonAngoissant=function(){ 
		mse.src.getSrc('angoissante').play(); 
	};
	action.start2SonAngoissant.register(reaction.start2SonAngoissant);
	action.startAngoisseProg=new mse.Script([{src:objs.obj846,type:'firstShow'}]);
	reaction.startAngoisseProg=function(){ 
		mse.src.getSrc('angoiseProg').play(); 
	};
	action.startAngoisseProg.register(reaction.startAngoisseProg);
	action.startSonIntro=new mse.Script([{src:pages.Couverture,type:'click'}]);
	reaction.startSonIntro=function(){ 
		mse.src.getSrc('intro').play(); 
	};
	action.startSonIntro.register(reaction.startSonIntro);
	action.transCha=action.startSonIntro;
	reaction.transCha=function(){ 
		root.transition(pages.Chapitre); 
	};
	action.transCha.register(reaction.transCha);
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
	action.cursorChaDf=new mse.Script([{src:pages.Chapitre,type:'show'}]);
	reaction.cursorChaDf=function(){ 
		mse.setCursor('default'); 
	};
	action.cursorChaDf.register(reaction.cursorChaDf);
	action.startChaShow=action.cursorChaDf;
	reaction.startChaShow=function(){ 
		animes.chashow.start(); 
	};
	action.startChaShow.register(reaction.startChaShow);
	action.startResumeShow=action.cursorChaDf;
	reaction.startResumeShow=function(){ 
		animes.resumshow.start(); 
	};
	action.startResumeShow.register(reaction.startResumeShow);
	action.startTitleShow=action.cursorChaDf;
	reaction.startTitleShow=function(){ 
		animes.titleshow.start(); 
	};
	action.startTitleShow.register(reaction.startTitleShow);
	action.startMaskShow=action.cursorChaDf;
	reaction.startMaskShow=function(){ 
		animes.maskshow.start(); 
	};
	action.startMaskShow.register(reaction.startMaskShow);
	action.transContent=new mse.Script([{src:pages.Chapitre,type:'click'}]);
	reaction.transContent=function(){ 
		root.transition(pages.Content); 
	};
	action.addTransContent=new mse.Script([{src:animes.maskshow,type:'end'}]);
	reaction.addTransContent=function(){ 
		action.transContent.register(reaction.transContent); 
	};
	action.addTransContent.register(reaction.addTransContent);
	action.cursorChaPt=action.addTransContent;
	reaction.cursorChaPt=function(){ 
		mse.setCursor('pointer'); 
	};
	action.cursorChaPt.register(reaction.cursorChaPt);
	action.cursorContent=new mse.Script([{src:pages.Content,type:'show'}]);
	reaction.cursorContent=function(){ 
		mse.setCursor('default'); 
	};
	action.cursorContent.register(reaction.cursorContent);
	action.startAnimeSon=new mse.Script([{src:animes.simchute,type:'start'}]);
	reaction.startAnimeSon=function(){ 
		mse.src.getSrc('sonchuteanime').play(); 
	};
	action.startAnimeSon.register(reaction.startAnimeSon);
	action.startSonCalme=new mse.Script([{src:objs.obj678,type:'firstShow'}]);
	reaction.startSonCalme=function(){ 
		mse.src.getSrc('calme').play(); 
	};
	action.startSonCalme.register(reaction.startSonCalme);
	action.startIlestla=new mse.Script([{src:objs.obj697,type:'firstShow'}]);
	reaction.startIlestla=function(){ 
		mse.src.getSrc('ilestla').play(); 
	};
	action.startIlestla.register(reaction.startIlestla);
	action.startSonAngoissant=new mse.Script([{src:objs.obj705,type:'firstShow'}]);
	reaction.startSonAngoissant=function(){ 
		mse.src.getSrc('angoissante').play(); 
	};
	action.startSonAngoissant.register(reaction.startSonAngoissant);
	action.startHurlaAnime=new mse.Script([{src:objs.obj763,type:'show'}]);
	reaction.startHurlaAnime=function(){ 
		animes.hurla.start(); 
	};
	action.startHurlaAnime.register(reaction.startHurlaAnime);
	action.startDarkdark=new mse.Script([{src:objs.obj782,type:'firstShow'}]);
	reaction.startDarkdark=function(){ 
		mse.src.getSrc('darkdark').play(); 
	};
	action.startDarkdark.register(reaction.startDarkdark);
	action.start2AngoisProg=new mse.Script([{src:objs.obj865,type:'firstShow'}]);
	reaction.start2AngoisProg=function(){ 
		mse.src.getSrc('angoiseProg').play(); 
	};
	action.start2AngoisProg.register(reaction.start2AngoisProg);
	action.startRatFlash=new mse.Script([{src:objs.obj930,type:'show'}]);
	reaction.startRatFlash=function(){ 
		animes.ratflash.start(); 
	};
	action.startRatFlash.register(reaction.startRatFlash);
	action.startEndIntro=new mse.Script([{src:objs.obj924,type:'firstShow'}]);
	reaction.startEndIntro=function(){ 
		mse.src.getSrc('intro').play(); 
	};
	action.startEndIntro.register(reaction.startEndIntro);
	action.startSursaut=action.startRatFlash;
	reaction.startSursaut=function(){ 
		mse.src.getSrc('sursautlong').play(); 
	};
	action.startSursaut.register(reaction.startSursaut);
	action.startSimChute=new mse.Script([{src:objs.obj670,type:'show'}]);
	reaction.startSimChute=function(){ 
		animes.simchute.start(); 
	};
	mse.currTimeline.start();};
mse.autoFitToWindow(createbook);