var GameSimonComa = function() {
    mse.Game.call(this);
    
    this.setDirectShow(true);
    this.firstShow = false;
    
    this.offx = mse.coor(mse.joinCoor(-30)); this.offy = mse.coor(mse.joinCoor(0));
    this.width = mse.coor(mse.joinCoor(400)); this.height = mse.coor(mse.joinCoor(560));
    this.darkox = mse.coor(mse.joinCoor(167)); this.darkoy = mse.coor(mse.joinCoor(320));
    this.darkw = mse.coor(mse.joinCoor(50)); this.darkh = mse.coor(mse.joinCoor(43));
    this.darkoffx = mse.coor(mse.joinCoor(174));
    this.maskx = mse.coor(mse.joinCoor(226)); this.masky = mse.coor(mse.joinCoor(343));
    
    this.zone = [mse.coor(mse.joinCoor(226)), mse.coor(mse.joinCoor(340)), 
                 mse.coor(mse.joinCoor(51)), mse.coor(mse.joinCoor(50))];
    this.touching = false;
    this.moveon = false;
    this.startAngle = -30;
    this.ratio = 0;
    
    this.back = new mse.Image(this, {pos:[0,20],size:[this.width,this.height-40]}, "simoncoma");
    this.dark = new mse.Image(null, {pos:[0,0],size:[this.darkw,this.darkh]}, "darkhead");
    this.mask = new mse.Image(this, {pos:[this.maskx,this.masky],size:[mse.coor(mse.joinCoor(51)),mse.coor(mse.joinCoor(44))],globalAlpha:0}, "sangmask");
    
    this.move = function(e) {
        var x = e.offsetX - this.getX();
        var y = e.offsetY - this.getY();
        if(x >= this.zone[0] && x <= this.zone[0]+this.zone[2] && 
           y >= this.zone[1] && y <= this.zone[1]+this.zone[3]) {
            this.moveon = true;
        }
        else this.moveon = false;
    };
    this.touchStart = function(e) {
        var x = e.offsetX - this.getX();
        var y = e.offsetY - this.getY();
        if(x >= this.zone[0] && x <= this.zone[0]+this.zone[2] && 
           y >= this.zone[1] && y <= this.zone[1]+this.zone[3]) {
            this.touching = true;
        }
    };
    this.touchMove = function(e) {
        var y = e.offsetY - this.getY() - this.zone[1];
        var x = e.offsetX - this.getX() - this.zone[0];
        if( this.touching && x >= 0 && x <= this.zone[2] && y >= 0 && y <= this.zone[3] ) {
            this.ratio = y / this.zone[3];
            if(this.mask.globalAlpha < 1) this.mask.globalAlpha += 0.0025;
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
        
        this.addListener('gestureStart', cbStart, true);
    	this.addListener('gestureUpdate', cbMove, true);
    	this.addListener('gestureEnd', cbEnd, true);
    	this.addListener('move', cbMoveon, true);
    };
    this.end = function() {
        this.removeListener('gestureStart', cbStart);
        this.removeListener('gestureUpdate', cbMove);
        this.removeListener('gestureEnd', cbEnd);
        this.removeListener('move', cbMoveon);
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
    	    ctx.translate(this.getX()+this.darkox, this.getY()+this.darkoy);
    	}
    	else if(this.moveon && !this.touching) {
    	    ctx.translate(this.getX()+this.darkoffx, this.getY()+this.darkoy);
    	}
    	else {
    	    ctx.translate(this.getX()+this.darkoffx+this.darkw/2, this.getY()+this.darkoy+this.darkh/2);
    	    var angle = (this.startAngle + 45*this.ratio) * Math.PI / 180;
    	    ctx.rotate(angle);
    	    ctx.translate(-this.darkw/2, -this.darkh/2);
    	}
    	this.dark.draw(ctx);
    	ctx.restore();
    };
};
extend(GameSimonComa, mse.Game);