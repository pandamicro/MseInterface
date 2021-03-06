/*!
 * GUI of MseInterface library
 * Encre Nomade
 *
 * Author: LING Huabin - lphuabin@gmail.com
           Florent Baldino
           Arthur Brongniart
 * Copyright, Encre Nomade
 */
 
var msgCenter =(function(){    
    // private
    var normal = {},
        static = {},
        max = 5;
        
    normal.box =  $('<div id="msgCenter"><ul></ul></div>');
    normal.list = normal.box.children('ul');
    static.box = $('<div id="msgCenterStatic"><h1></h1><ul></ul></div>');
    static.list = static.box.children('ul');
    static.visible = false;
            
    function fadeIn(jQmsg){jQmsg.addClass('fadeIn');} // it show the message
    function fadeOut(jQmsg){jQmsg.removeClass('fadeIn');} // it hide
    function removeMsg(jQmsg){
        jQmsg.remove();
        if(normal.list.children('li').length == 0) // last message, remove the container
            normal.box.detach();
    }
    
    function hideTimeOut(jQmsg,time){
            time = isNaN(time) ? 0 : Math.abs(time);
            var fId = setTimeout(function(){ fadeOut(jQmsg); },time);
            var rId = setTimeout(function(){ removeMsg(jQmsg) ; jQmsg = null; },time+1000);
            
            return [fId, rId];
    }
    function show(jQmsg){setTimeout(function(){ fadeIn(jQmsg); jQmsg = null; }, 1);}
    
    // make staticBox moveable
    var drag = {target: static.box, x: 0, y: 0, moving: false};        
    // start move
    static.box.children('h1').mousedown(function(e){
        if (!drag.moving) {
            drag.x = e.pageX;
            drag.y = e.pageY;
            drag.moving = true;
            drag.target.addClass('moving');
            $(document).bind('mousemove', moving);
        }        
        e.preventDefault();
    });
    // moving
    var moving = function(e){
        if(drag.moving){
            var dx = e.pageX - drag.x,
                dy = e.pageY - drag.y,
                cur_offset = {
                    left: drag.target.offset().left,
                    bottom: parseInt(drag.target.css('bottom'))
                };
        
        drag.target.css({
            left: (cur_offset.left + dx),
            bottom: (cur_offset.bottom - dy)
        });

            drag.x = e.pageX;
            drag.y = e.pageY;
        }
    };
    // finish move
    $(document).mouseup(function() {
        if(drag.moving){
            drag.moving = false;        
            drag.target.removeClass('moving');
            $(document).unbind('mousemove', moving);
        }
    });
    
    // public       
    var public = new function MessageCenter(){};
    
    public.send = function(mes, time){
        if(normal.list.children('li').length == 0) // if no message the msgCenter is not in DOM
            normal.box.prependTo('body');
            
        var message = $('<li></li>');
        message.append(mes);
        normal.list.prepend(message);
        
        show(message);
        
        if(time === 0 || time === 'fixed') return message; // the message will stay in the list
        
        time = isNaN(time) ? 3000 : time;
        this.closeMessage(message, time);
        
        return message;
    };
    
    public.getList = function(){ return normal.list; };
    
    public.getMax = function(){ return max; };
    
    public.closeMessage = function(jQMsg, time){
        if(jQMsg.parents('#msgCenterStatic').length === 1) {
            // remove a static Message
            jQMsg.remove();
            return;
        }
        // its a normal message
        time = isNaN(time) ? 0 : time; // if no time, close immediately else wait the time
        var ids = hideTimeOut(jQMsg, time);
        
        jQMsg.hover(
            function(){clearTimeout(ids[0]); clearTimeout(ids[1]);}, // hover stop the removing time out
            function(){ids = hideTimeOut(jQMsg)}  // quit hover --> restart removing time out
        );
        
        normal.list.children('li').each(function(i){
            if(i >= max)
                hideTimeOut($(this));
        });
    };
    
    public.getStaticBox = function(){ return static.box; };
    
    public.showStaticBox = function(titre, params){
        static.list.html(' ');
        
        if(!titre || titre == '')
            titre = 'Notifications';
            
        static.box.children('h1').html(titre);
        static.box.prependTo('body');
        
        var elemDOM = static.box.get(0);
        elemDOM.style.removeProperty('left');
        elemDOM.style.removeProperty('bottom');
        elemDOM.style.removeProperty('width');
        
        if(typeof params == 'object'){
            if(!isNaN(params.width)) static.box.css('width', params.width);
            if(!isNaN(params.bottom)) static.box.css('bottom', params.bottom);
            if(!isNaN(params.left)) static.box.css('left', params.left);
            if(!isNaN(params.right)) static.box.css('right', params.right);
        }
        
        static.visible = true;
    };
    
    public.closeStaticBox = function(){
        static.list.html(' ');
        static.box.detach();
        
        static.visible = false;
    };
    
    public.sendToStatic = function(msg){
        if(!static.visible)
            this.showStaticBox();
        var message = $('<li></li>');
        message.append(msg);
        static.list.prepend(message);
        
        return message;
    };
    
    return public;
})();

var pages = {};
var managers = {};
var dialog, srcMgr;
// Parameters' list with disable configuration, defaultly all false
var paramdisablelist = {
	pos:false,
	size:false,
	text:false,
	opac:false,
	back:false,
	fill:false,
	stroke:false
};

function init() {
	dialog = new Popup();
	srcMgr = new SourceManager();
	
	$('#menu_mask').hide();
	$('.central_tools').hide();
	$('#editor').hide();
	window.shapeTool = initShapeTool();
	window.textTool = initTextTool();
	window.wikiTool = initWikiTool();
	window.animeTool = initAnimeTool();
	window.scriptTool = initScriptTool();
	window.translationTool = initTranslateTool();
	
	// Mouse event handler for the resize behavior
	$('body').supportResize();
	$('body').supportMove();
	
	// Bottom panel active function
	$('#bottom_panel .tabBar li:lt(2)').click(function() {
		var name = $(this).html();
		$(this).siblings('.active').removeClass('active');
		$(this).addClass('active');
        $('#Ressources_panel, #Scripts_panel').css('z-index','1');
		$('#'+name+'_panel').css('z-index','2');
	});
	$('#Ressources_panel').css('z-index','2');
	$('#bottom_panel .add').click(function(){
	    var bottom = $('#bottom_panel');
	    // Close
	    if(bottom.css('top') == "-180px") {
		    bottom.animate({'top':'-20px'}, 500, 'swing');
		    $(this).text('⋀');
		}
		// Open
		else {
		    bottom.animate({'top':'-180px'}, 500, 'swing');
		    $(this).text('⋁');
		}
	});
	
	// Init x and y rulers
	drawRulers();
	
	// Hide link setter
	$('#linkSetter').hide();
	// Link setter interaction
	$('.article').live('mouseup', textSelected);
	$('.scene').live('mousedown', hideLinkSetter);
	$('.wikilink, .fblink, .audiolink').live('mouseup', modifyLink);
	$('#linkType').change(function() {
	    var type = $(this).val();
	    $('#audiolinkInput, #wikilinkInput, #fblinkInput').remove();
	    var input = null;
	    switch(type) {
	    case "audio":
	        input = (new DropZone(dropToAudioElemZone, {'width':'80%','height':'80px'}, "audiolinkInput")).jqObj;
	        break;
	    case "wiki":
	        input = (new DropZone(dropToWikiElemZone, {'width':'80%','height':'80px'}, "wikilinkInput")).jqObj;
	        break;
	    case "fb":
	        input = $('<input id="fblinkInput" type="text" size="20"></input>');break;
	    }
	    if(input) $(this).after(input);
	}).change();
	// Add link
	$('#addLinkBn').click(function() {
	    if(!curr.selectNode) return;
	    
	    var type = $('#linkType').val();
	    if(!type) return;
	    
	    // Modify a exist link
	    if(curr.selectNode.get(0).nodeName.toLowerCase() == "span") {
            var linkType = false, target = false;
	        switch(type) {
	        case "audio":
	            var link = $('#audiolinkInput').attr('link');
	            if(link && srcMgr.isExist(link)) {
                        linkType = 'audiolink';
	            }
	            break;
	        case "wiki":
	            var link = $('#wikilinkInput').attr('link');
	            if(link && srcMgr.isExist(link)) {
                        linkType = 'wikilink';
	            }
	            break;
	        case "fb":
	            var link = $('#fblinkInput').val();
	            if(link && link.toLowerCase().match(/[\w\W]*www\.facebook\.com\/[\w\W]*/)) {
                        linkType = 'wikilink';
	            }
	            break;
	        }
            if(linkType) CommandMgr.executeCmd(new ModifyLinkCmd(linkType, link));
	    }
	    // Add a link
	    else {
	        var nodeHtml = curr.selectNode.html();
	        var selStr = nodeHtml.substring(curr.selectRange.startOffset, curr.selectRange.endOffset);
	        var linkedStr = null;
	        switch(type) {
	        case "audio":
	            var link = $('#audiolinkInput').attr('link');
	            if(link && srcMgr.isExist(link))
	                linkedStr = '<span class="audiolink" link="'+link+'">'+selStr+'</span>';break;
	        case "wiki":
	            var link = $('#wikilinkInput').attr('link');
	            if(link && srcMgr.isExist(link))
	                linkedStr = '<span class="wikilink" link="'+link+'">'+selStr+'</span>';break;
	        case "fb":
	            var link = $('#fblinkInput').val();
	            if(link && link.toLowerCase().match(/[\w\W]*www\.facebook\.com\/[\w\W]*/)) 
	                linkedStr = '<span class="fblink" link="'+link+'">'+selStr+'</span>';break;
	        }
	        if(linkedStr) 
                CommandMgr.executeCmd(new AddTextLinkCmd(nodeHtml, selStr, linkedStr));
	    }
	    hideLinkSetter();
	});
}


// Draw Rulers==========================================

function drawRulers() {
    var scales = [1,5,10];
    var ctxRulerX = $('#rulerX').get(0).getContext('2d');
    var ctxRulerY = $('#rulerY').get(0).getContext('2d');
    ctxRulerX.lineWidth = ctxRulerY.lineWidth = 1;
    ctxRulerX.strokeStyle = ctxRulerY.strokeStyle = "#000";
    ctxRulerX.lineCap = ctxRulerY.lineCap = "round";
    ctxRulerX.fillStyle = ctxRulerY.fillStyle = "#000";
    ctxRulerX.font = ctxRulerY.font = "8px Arial Narrow";
    ctxRulerX.textBaseline = ctxRulerY.textBaseline = "top";
    var width = $('#rulerX').width();
    var height = $('#rulerY').height();

    // Find the smallest division in ruler
    var scale = 0;
    for(var i = 0; i < scales.length; i++) {
        if(scales[i] * config.ratio > 4) {
            scale = scales[i];
            break;
        }
    }
    // Unit volume
    var unit = scale*config.ratio;
    
    var twidth, x, y;
    ctxRulerX.beginPath();
    ctxRulerX.moveTo(0,0.5);
    ctxRulerX.lineTo(width,0.5);
    for(x = 14.5, i = 0; x <= width; x += unit, i++) {
        if(i%5 == 0) {
            y = 9;
            twidth = ctxRulerX.measureText(i*scale).width;
            ctxRulerX.fillText(i*scale, x-twidth/2, 1, 15);
        }
        else y = 11;
        ctxRulerX.moveTo(x, 15);
        ctxRulerX.lineTo(x, y);
    }
    ctxRulerX.stroke();
    
    ctxRulerY.beginPath();
    ctxRulerY.moveTo(0,0);
    ctxRulerY.lineTo(0,height);
    for(y = 15.5, i = 0; y <= height; y += unit, i++) {
        if(i%5 == 0) {
            x = 9;
            ctxRulerY.fillText(i*scale, 1, y, 15);
        }
        else x = 11;
        ctxRulerY.moveTo(x, y);
        ctxRulerY.lineTo(15, y);
    }
    ctxRulerY.stroke();
}


// Dialog===============================================

// Add source files dialog
function addFileDialog() {
	dialog.showPopup('Ajout de fichiers', 400, 330, 'Télécharger');
	dialog.main.html('<h2> - Image et son:</h2><p><label>Lien internet:</label><input id="addLink" type="text"></p><p><label>Fichiers locaux:</label><input id="addFile" type="file" multiple="multiple"></p>');
	dialog.main.append('<h2> - Jeu</h2><p><label>Nom de classe:</label><input id="gamename" type="text"/></p><p><label>Code source:</label><input id="addjs" type="file" accept="text/javascript"/></p>');
	// Upload file
	dialog.confirm.click(uploadfile);
}
function uploadfile() {
    // Image or sound link
    var link = $('#addLink').val().toLowerCase();
    if(link && link != '') {
        if(link.indexOf('http') < 0) link = "http://" + link;
        var imgpattern = /(\.png|\.jpeg|\.jpg|\.gif|\.bmp)$/;
        var audpattern = /(\.mp3|\.ogg|\.wav)$/;
        if(link.search(imgpattern) != -1) {
            CommandMgr.executeCmd(new AddSrcCmd('image', link));
            dialog.close();
        }
        else if(link.search(audpattern) != -1) {
            CommandMgr.executeCmd(new AddSrcCmd('audio', link));
            dialog.close();
        }
        else {
            alert("Échec à télécharger, type inconnu");
        }
    }
    // Image or sound files
	var files = document.getElementById("addFile").files;
	if(files) {
	    var fails = 0;
	    for(var i = 0; i < files.length; i++) {
	        var file = files[i];
	        var name = ('name' in file) ? file.name : file.fileName;
	        var size = ('size' in file) ? file.size : file.fileSize;
	        var type = ('type' in file) ? file.type : (('mediaType' in file) ? file.mediaType : "unknown");
	        var srcreader = new FileReader();
	        // Check file size
	        if(!file || file.size >= 1100000) {
	    		fails++;
	        }
	        // Check file type 
	        else if(type.indexOf('image') >= 0) {
	            srcreader.readAsDataURL(file);
	            srcreader.onload = addImgSrc;
	        }
	        else if(type.indexOf('audio') >= 0) {
	            srcreader.readAsDataURL(file);
	            srcreader.onload = addAudioSrc;
	        }
	    }
	    if(fails > 0) alert("Échec à télécharger " + fails + " fichiers d'image ou de son, type inconnu ou fichier trop grand( >1Mb )");
	}
	// Game file
	curr.gamename = $('#gamename').val();
	// Game name exist
	if(curr.gamename && curr.gamename != "") {
	    var gamefile = document.getElementById("addjs").files;
	    // File exist
	    if(gamefile && gamefile.length == 1) {
	        var file = gamefile[0];
	        var size = ('size' in file) ? file.size : file.fileSize;
	        // Check file size
	        if(file.size >= 550000) {
	        	alert("Échec à télécharger le fichier javascript de jeu, fichier trop grand( >500Kb )");
	        }
	        else {
	            var jsreader = new FileReader();
	            jsreader.readAsText(file);
	            jsreader.onload = addJsSrc;
	        }
	    }
	}
	dialog.close();
}

// Add page dialog
function createPageDialog() {
	dialog.showPopup('Ajouter une page', 400, 200, 'Ajouter');
	dialog.main.html('<p><label>Name: </label><input id="addPage" type="text"></p>');
	dialog.confirm.click(function() {
		var name = $('#addPage').val();
		if(!name || !nameValidation(name) || pages[name]) {
		    dialog.showAlert('Nom choisi invalid ou nom existe déjà');
		    return;
		}
		var page = CommandMgr.executeCmd(new AddPageCmd(name));
		// Add default step
		var mgr = page.data('StepManager');
		mgr.addStep(name+'default', null, true);
		dialog.close();
	});
};
		

// Add step dialog
function createStepDialog() {
    if(typeof curr.page == 'undefined'){
        alert("Impossible de créer une étape s'il n'y a pas de page dans le projet");
        return;
    }
	dialog.showPopup('Ajouter un nouveau étape', 340, 200);
	// Name and Z-index
	var nz = $('<p><label>Nom:</label><input id="stepName" size="10" type="text"></p>');
	dialog.main.append(nz);
	// Differente type of Step
	dialog.main.append('<div style="position:relative;left:60px;top:15px"><div id="normalStep" class="big_button">Normal</div><div id="article" class="big_button">Article</div></div>');
	
	$('#normalStep, #article').click(function() {
		var params = {};
		var name = $('#stepName').val();
		
		if(!name || !nameValidation(name) || stepExist(name)) {
			dialog.showAlert('Nom choisi invalid ou nom existe déjà');
    			return;
		}
		
		if(this == $('#normalStep').get(0)) {
		    if(curr.page)
		        CommandMgr.executeCmd(new AddStepCmd(curr.page.data('StepManager'), name, params));
			dialog.close();
		}
		else if(this == $('#article').get(0)) {
			articleStepDialog(name, params);
		}
	});
};
// Add Article Step Dialog
function articleStepDialog(name, params) {
	dialog.showPopup('Configurer étape d\'article: '+name, 400, 520, 'Ajouter');
	dialog.main.append('<h2> - Parameters</h2>');
	dialog.main.append('<p><label>Défile auto:</label><input id="defile" type="checkbox"></p>');
	dialog.main.append('<p><label>Location:</label><input id="articlex" size="10" placeholder="x" type="text"><span>px</span><input id="articley" size="10" placeholder="y" type="text"><span>px</span></p>');
	dialog.main.append('<p><label>Ligne de texte:</label><input id="linew" size="10" placeholder="Largeur" type="text"><span>px</span><input id="lineh" size="10" placeholder="hauteur" type="text"><span>px</span></p>');
	dialog.main.append('<p><label>Police:</label><input id="articleFont" size="10" placeholder="famille" type="text"><input id="articleFsize" style="width: 28px;" type="number"><span>px</span><select id="articleFontw"><option value="normal">normal</option><option value="bold">bold</option></select></p>');
    dialog.main.append('<p><label>google font:</label><input type="checkbox" id="googleFont"/></p>');
	dialog.main.append('<p><label>Couleur:</label><input id="articleColor" size="10" type="text"></p>');
	dialog.main.append('<p><label>Alignement:</label><select id="articleAlign"><option value="left">left</option><option value="center">center</option><option value="right">right</option></select></p>');
	
	dialog.main.append('<h2> - Contenu de l\'article</h2>');
	dialog.main.append('<p><textarea id="articleContent" rows="10" cols="49" placeholder="Coller ou deplacer le contenu ici"></textarea></p>');
	
	dialog.confirm.click(function() {
		params.defile = $('#defile').get(0).checked;
		var x = parseInt($('#articlex').val()), y = parseInt($('#articley').val());
		var lw = parseInt($('#linew').val()), lh = parseInt($('#lineh').val());
		var font = $('#articleFont').val();
        var googleFont = $('#googleFont').get(0).checked;
		var fsize = $('#articleFsize').val();
		var weight = $('#articleFontw').val();
		var color = $('#articleColor').val();
		var align = $('#articleAlign').val();
		var content = $('#articleContent').val();
		if(!content || content == "") {
			$('#articleContent').animate({backgroundColor: "#fb4e4e"}, 800)
			                    .animate({backgroundColor: "#fff"}, 800);
			return;
		}
		
		if(isNaN(x) || isNaN(y)) {
			$('#articlex').parent().css('color','RED');
			return;
		}
		else {
			params.x = x; params.y = y;
			$('#articlex').parent().css('color','BLACK');
		}
		if(isNaN(lw) || isNaN(lh)) {
			$('#linew').parent().css('color','RED');
			return;
		}
		else {
			params.lw = lw; params.lh = lh;
			$('#linew').parent().css('color','BLACK');
		}
		if(font != "") params.font = font;
        if(googleFont && font != "") params.googleFont = font;
        
		if(!isNaN(fsize)) params.fsize = fsize;
		params.fweight = weight;
		if(isColor(color)) params.color = color;
		params.align = align;
		
		CommandMgr.executeCmd(new AddArticleCmd(curr.page.data('StepManager'), name, params, content));
		dialog.close();
	});
}


// Parameter dialog
function showParameter(obj, conf) {
	if(!obj || obj.length == 0) return;
	// Get parameters exited
	var x = obj.position().left, y = obj.position().top;
	var width = obj.width(), height = obj.height();
	var font = obj.css('font-family'), fsize = cssCoordToNumber(obj.css('font-size')), fstyle = obj.css('font-weight');
	var align = obj.css('text-align');
	var opac = obj.css('opacity')*100;
	var back = obj.css('background-color'), color = obj.css('color'), stroke = obj.css('border-top-color');
	var disables = paramdisablelist;
	if(conf) disables = $.extend(paramdisablelist, conf);
	// Coordinate system transform
	x = config.realX(x); y = config.realY(y);
	width = config.realX(width); height = config.realY(height);
	fsize = config.realY(fsize);
	
	dialog.showPopup('Modifier les paramètres', 400, 520, 'Confirmer');
	dialog.main.append('<h2> - Position et dimension</h2>');
	dialog.main.append('<p><label>Position:</label><input id="pm_x" size="10" value="'+x+'" placeholder="x" type="text"><span>px</span><input id="pm_y" size="10" value="'+y+'" placeholder="y" type="text"><span>px</span></p>');
	dialog.main.append('<p><label>Taille</label><input id="pm_width" size="10" value="'+width+'" placeholder="Largeur" type="text"><span>px</span><input id="pm_height" size="10" value="'+height+'" placeholder="hauteur" type="text"><span>px</span></p>');
	dialog.main.append('<h2> - Texte</h2>');
	dialog.main.append('<p><label>Police:</label><input id="pm_font" size="10" value="'+font+'" placeholder="famille" type="text"><input id="pm_fsize" style="width: 28px;" value="'+fsize+'" type="number"><span>px</span><select id="pm_fstyle" value="normal"><option value="normal">normal</option><option value="bold">bold</option></select></p>');
	dialog.main.append('<p><label>Alignement:</label><select id="pm_align"><option value="left">left</option><option value="center">center</option><option value="right">right</option></select></p>');
	dialog.main.append('<h2> - Couleur</h2>');
	dialog.main.append('<p><label>Opacity:</label><input id="pm_opac" style="width: 28px;" value="'+opac+'" type="number"></p>');
	dialog.main.append('<p><label>Fond:</label><input id="pm_back" size="10" value="'+back+'" type="text"></p>');
	dialog.main.append('<p><label>Color:</label><input id="pm_color" size="10" value="'+color+'" type="text"></p>');
	dialog.main.append('<p><label>Trace:</label><input id="pm_stroke" size="10" value="'+stroke+'" type="text"></p>');
	//dialog.main.append('<h2> - Les autres</h2>');
	
	// Disables
	if(disables.pos) $('#pm_x, #pm_y').attr('disabled', 'true');
	if(disables.size) $('#pm_width, #pm_height').attr('disabled', 'true');
	if(disables.text) $('#pm_font, #pm_fsize, #pm_fstyle, #pm_align').attr('disabled', 'true');
	if(disables.opac) $('#pm_opac').attr('disabled', 'true');
	if(disables.back) $('#pm_back').attr('disabled', 'true');
	if(disables.color) $('#pm_color').attr('disabled', 'true');
	if(disables.stroke) $('#pm_stroke').attr('disabled', 'true');
	$('#popup_dialog #pm_fstyle').val(fstyle);
	$('#popup_dialog #pm_align').val(align);
	
	dialog.confirm.click(function(){
		var res = {};
		res.left = config.sceneX($('#pm_x').val())+'px';
		res.top = config.sceneY($('#pm_y').val())+'px';
		res.width = config.sceneX($('#pm_width').val())+'px';
		res.height = config.sceneY($('#pm_height').val())+'px';
		res['font-family'] = $('#pm_font').val();
		res['font-size'] = config.sceneY($('#pm_fsize').val())+'px';
		res['font-weight'] = $('#pm_fstyle').val();
		res['text-align'] = $('#pm_align').val();
		res.opacity = $('#pm_opac').val()/100;
		res['background-color'] = $('#pm_back').val();
		res.color = $('#pm_color').val();
		res['border-color'] = $('#pm_stroke').val();
        CommandMgr.executeCmd(new ConfigObjCmd(obj, res));
		dialog.close();
	});
}


// Insert obj in Article dialog
function insertElemDialog(e) {
	dialog.showPopup('Inserer les éléments dans l\'article', 400, 300, 'Inserer');
	// show ressource panel
	showBottom();
	dialog.annuler.click(closeBottom);
	// Insert Zone
	var insert = $('<div class="insert_cont"></div>');
	// Drop zone
	var dzone = (new DropZone(dropToInsertZone, {'left':'0px','width':'240px','height':'140px','position':'absolute'})).jqObj;
	var tzone = $('<textarea class="insert_text"/>');
	insert.append(dzone).append(tzone);
	var typebn = $('<img class="insert_type_bn" src="./images/UI/text.jpg">');
	dialog.main.append(insert);
	dialog.main.append(typebn);
	typebn.click(function(){
	    var left = dzone.position().left;
	    if(left == 0) {
	        this.src = "./images/UI/srcs.jpg";
	        dzone.animate({'left':'-280px'}, 500, 'swing');
	        tzone.animate({'left':'0px'}, 500, 'swing');
	    }
	    else if(left == -280) {
	        this.src = "./images/UI/text.jpg";
	        dzone.animate({'left':'0px'}, 500, 'swing');
	        tzone.animate({'left':'280px'}, 500, 'swing');
	    }
	});
	
	dialog.confirm.click({'target':$(this).parent().parent()}, function(e) {
	    closeBottom();
	    var last = e.data.target;
		var prepared = dzone.children();
		for(var i = prepared.length-1; i >= 0; i--) {
			var id = $(prepared.get(i)).data('srcId');
			var elem = srcMgr.generateChildDomElem(id, e.data.target.parent());
			elem.attr('id', 'obj'+(curr.objId++));
			elem.deletable(null, true)
			    .selectable(selectP)
			    .staticButton('./images/UI/insertbelow.png', insertElemDialog)
			    .staticButton('./images/UI/config.png', staticConfig)
			    .staticButton('./images/tools/anime.png', animeTool.animateObj)
			    .staticButton('./images/UI/addscript.jpg', addScriptForObj)
			    .children('.del_container').hide();
			elem.insertAfter(last);
			last = elem;
		}
		var text = tzone.val();
		if(text && text != "") {
		    var font = e.data.target.css('font-weight');
		    font += " "+config.realX( cssCoordToNumber( e.data.target.css('font-size') ) )+"px";
		    font += " "+e.data.target.css('font-family');
            var content = generateSpeaks(text, font , config.realX( e.data.target.width() ) , config.realY( e.data.target.height()) );
			last.after(content);
            ArticleFormater.setConfigurable(content);
		}
		dialog.close();
	});
};



function deleteElem (elem) {
    scriptMgr.delRelatedScripts(elem);
    elem.remove();
}



// Set link popup dialog
function showLinkSetter(e) {
    $('#linkSetter .drop_zone').html("");
    $('#fblinkInput').attr('value', '');
    $('#linkSetter').css({top:e.pageY+5+'px',left:e.pageX-15+'px'}).show('slow');
};
function hideLinkSetter(e) {
    $('#linkSetter').hide('slow');
    curr.selectNode = null;
    curr.selectRange = null;
};

// Add script
function addScriptForObj(e){
    e.preventDefault();
    e.stopPropagation();
    var obj = $(this).parent().parent();
    addScriptDialog(obj, "obj");
};
function addScriptDialog(src, srcType){
    if(!(src instanceof jQuery) || src.length == 0) return;
    var name = "";
    var tagName = src[0].tagName;
    var srcid = "";
    if(srcType != "obj") {
        // Page label event
        if(tagName == "LI") {
            srcid = name = src.text();
            var page = $('#'+srcid);
            if(page.length == 0 || !page.hasClass('scene'))
                return;
            srcType = "page";
        }
        // No layer expo event
        else if(src.hasClass('layer_expo')) {
            return;
            name = src.children('h1').text(); 
            srcType = "layer"; 
            srcid = src.find('span').text();
        }
        // Anime obj event
        else if(src.hasClass('icon_src')) {
            srcid = src.data('srcId');
            if(srcMgr.sourceType(srcid) != "anime") 
                return;
            name = src.children('p').text(); 
            srcType = "anime";
        }
        else return;
    }
    else {
        name = "Object";
        srcid = src.prop('id');
    }
    if(!srcType || !srcid || srcid == "") return;
    
    
    dialog.showPopup('Ajouter un script pour '+name, 400, 410, 'Confirmer');
    dialog.main.append('<p><label>Ajout automatique:</label><input id="ajout_auto" type="checkbox" style="margin-top:12px;" checked></p>');
    dialog.main.append('<p><label>Name:</label><input id="script_name" type="text" size="20"></p>');
    dialog.main.append('<p><label>Source:</label><cite>id: '+srcid+', type: '+srcType+'</cite></p>');
    dialog.main.append('<p><label>Action:</label>'+scriptMgr.actionSelectList('script_action', srcType)+'</p>');
    dialog.main.append('<p><label>Réaction:</label>'+scriptMgr.reactionList('script_reaction')+'</p>');
    dialog.main.append('<p><label>Cible de réaction:</label></p>');
    $('#script_reaction').change(tarDynamic).blur(tarDynamic).change();
    dialog.annuler.click(closeBottom);
    dialog.confirm.click({sourceId: srcid, sourceType: srcType}, validScript);
    
    var relatScript = scriptMgr.getSameSrcScripts(srcid);

    if (relatScript.length > 0){
        var modifyScriptsButton = dialog.addButton($('<input type="button" value="Modifier les scripts existants"></input>'));
        modifyScriptsButton.click(function(){ modifyScriptDialog(relatScript, null, src); });
    }
};
// Modify a script related to an obj
function modifyScriptDialog(scriptsList, defaultScript, relatSrc) {
    if(!(scriptsList instanceof Array) || scriptsList.length == 0) return;
    if (typeof(defaultScript) === 'undefined') defaultScript = scriptsList[0];
    dialog.showPopup('Modifier les scripts',400, 430,'Modifier');
    
    var select = '<p><label>Choix du script:</label><select id="script_name">';
    for(var i = 0; i<scriptsList.length; i++) {
         select += '<option value="'+scriptsList[i]+'"';
         if (scriptsList[i] == defaultScript) select += ' selected ';
         select += '>'+scriptsList[i]+'</option>';
    }

    select += '</select></p>';
    dialog.main.append(select);
    $('#script_name').parent().css('font-weight', 'bold');
    $('#script_name').change({script: scriptsList, src: relatSrc},function(e){
        modifyScriptDialog(e.data.script, $(this).val(), e.data.src);
    });
    
    var choosedScript = $('#script_name').val();
    var checkbox = '<p><label>Ajout automatique:</label><input id="ajout_auto" type="checkbox" style="margin-top:12px;"';
    if(scriptMgr.scripts[choosedScript].immediate) checkbox += ' checked ';
    checkbox += '</p>';
    dialog.main.append(checkbox);
    
    var relatedAction = scriptMgr.scripts[choosedScript].action;
    var relatedReaction = scriptMgr.scripts[choosedScript].reaction;
    var srcid = scriptMgr.scripts[$('#script_name').val()].src;
    var srcType = scriptMgr.scripts[$('#script_name').val()].srcType;
    dialog.main.append('<p><label>Source:</label><cite>id: '+srcid+', type: '+srcType+'</cite></p>');
    dialog.main.append('<p><label>Action:</label>'+scriptMgr.actionSelectList('script_action', srcType, relatedAction)+'</p>');
    dialog.main.append('<p><label>Réaction:</label>'+scriptMgr.reactionList('script_reaction', relatedReaction)+'</p>');
    dialog.main.append('<p><label>Cible de réaction:</label></p>');
    $('#script_reaction').change(tarDynamic).blur(tarDynamic).change();
    dialog.annuler.click(closeBottom);
    
    var delScriptButton = dialog.addButton($('<input type="button" value="Supprimer" />'));
    delScriptButton.click(function(){
        var scriptName = $('#script_name').val();
        // Delete script
        CommandMgr.executeCmd(new DelScriptCmd(scriptName));     
        // Show next script 
        if ($('#script_name').children().length > 1)
            $('#script_name').children().remove('[value="'+scriptName+'"]');
        // Last script removed
        else { 
            // When delete the last script --> return on addScriptDialog
            if(relatSrc) addScriptDialog(relatSrc, srcType);
            else dialog.close();
        }
    });
    if(relatSrc) {
        var addScriptButton = dialog.addButton($('<input type="button" value="Nouveau script"></input>'));
        addScriptButton.click(function(){
            dialog.close(); 
            addScriptDialog(relatSrc, srcType);
        });
    }
    
    dialog.confirm.click({sourceId: srcid, sourceType: srcType}, validScript);
}

function validScript(e){
    var srcid = e.data.sourceId;
    var srcType = e.data.sourceType;
    var ajoutAuto = $('#ajout_auto').get(0).checked;
    var name = $('#script_name').val();
    var action = $('#script_action').val();
    var reaction = $('#script_reaction').val();
    if(!name || !nameValidation(name) || action == "" || reaction == ""){
        alert('Information invalid');
        return;
    }

    var tarType = scriptMgr.reactionTarget(reaction);
    var tar = null, supp = null;
    switch(tarType) {
    case "page": case "script": 
        tar = $('#script_tar').val();break;
    case "obj": 
        if($('#script_supp').children().length==0) {alert('Information incomplete');return;}
        tar = $('#script_tar').data('chooser').val().id;
        supp = $('#script_supp').attr('target');
        break;
    case "cursor":
        tar = $('#script_tar').val();
        if(tar == "autre") supp = $('#script_supp').attr('target');
        break;
    case "anime": case "image": case "game": case "audio": case "code":
        tar = $('#script_tar').attr('target');
        break;
    case "effetname": default:break;
    }
    if(tarType != 'effetname' && (!tar || tar == "")) {
        alert('Information incomplete');return;
    }
    
    if (scriptMgr.scripts[name]) {
        if(!confirm('Vous allez remplacer le script "'+name+'".')) return;
        CommandMgr.executeCmd(new ModifyScriptCmd(name, srcid, srcType, action, tar, reaction, ajoutAuto, supp));
    }
    else CommandMgr.executeCmd(new AddScriptCmd(name, srcid, srcType, action, tar, reaction, ajoutAuto, supp));
    closeBottom();
    dialog.close();
}

var showBottom = function() {
    $('#bottom').css('z-index','110');
};
var closeBottom = function() {
	$('#bottom').css('z-index','6');
};
function tarDynamic(e) {
    if ($('#script_name').is('select')) var choosedScript = $('#script_name').val();
    closeBottom();
    var react = $(this).val();
    var cible = $('.popup_body p:contains("Cible de réaction")');
    cible.children('label').nextAll().remove();
    cible.nextAll().remove();
    var type = scriptMgr.reactionTarget(react);
    switch(type) {
    case "page":
        var select = '<select id="script_tar">';
        $('.scene').each(function(){
            select += '<option value="'+$(this).prop('id')+'"';
            if(typeof(choosedScript) !== 'undefined' && scriptMgr.scripts[choosedScript].target == $(this).prop('id'))
                select += ' selected '; // prise en compte de la selection précédente
            select += '>'+$(this).prop('id')+'</option>';
        });
        select += '</select>';
        cible.append(select);
        break;
    case "obj":
        var objChooser = new ObjChooser("script_tar");
        objChooser.appendTo(cible);
        var dz = (new DropZone(dropToTargetZone, {'margin':'0px','padding':'0px','width':'60px','height':'60px'}, "script_supp")).jqObj;
        dz.data('type', 'image');
        var supp = $('<p><label>Image après la transition:</label></p>');
        supp.append(dz);
        cible.after(supp);
        if (typeof(choosedScript) !== 'undefined' && scriptMgr.scripts[choosedScript].reaction == "objTrans") {
            var choosedTarget = scriptMgr.scripts[choosedScript].target;
            $('#script_tar').children('h5').text(choosedTarget);
            dz.html(srcMgr.getExpoClone(scriptMgr.scripts[choosedScript].supp));
            dz.attr('target', scriptMgr.scripts[choosedScript].supp);
        }
        
        // show ressource panel
        showBottom();
        break;
    case "cursor":
        var choosedCursor = false;
        if (typeof(choosedScript) !== 'undefined') choosedCursor = scriptMgr.scripts[choosedScript].target;
        cible.append(scriptMgr.cursorSelectList('script_tar', choosedCursor));
        $('#script_tar').change(function(){
            var currp = $(this).parent();
            if($(this).val() == "autre") {
                // show ressource panel
                showBottom();
                var supp = $('<p><label>Cursor personalisé</label></p>');
                var dz = (new DropZone(dropToTargetZone, {'margin':'0px','padding':'0px','width':'60px','height':'60px'}, "script_supp")).jqObj;
                dz.data('type', "image");
                currp.after(supp.append(dz));
                if (typeof(choosedScript) !== 'undefined') dz.html(srcMgr.getExpoClone(scriptMgr.scripts[choosedScript].supp));
            }
            else {
                closeBottom();
                currp.nextAll().remove();
            }
        });
        if (choosedCursor == 'autre') $('#script_tar').change(); //trigger for display the choosed cursor if it's "autre"
        break;
    case "anime":
    case "image":
    case "game":
    case "audio":
    case "code":
        // show ressource panel
        showBottom();
        var dz = (new DropZone(dropToTargetZone, {'margin':'0px','padding':'0px','width':'60px','height':'60px'}, "script_tar")).jqObj;
        dz.data('type', type);
        cible.append(dz);
        if (typeof(choosedScript) !== 'undefined'){
            dz.html(srcMgr.getExpoClone(scriptMgr.scripts[choosedScript].target));
            dz.attr('target', scriptMgr.scripts[choosedScript].target);
        }
        break;
    case "script":
        cible.append(scriptMgr.scriptSelectList('script_tar', choosedScript));
        break;
    case "effetname": default:break;
    }
};
// Drop event for all type of target
function dropToTargetZone(e) {
    e = e.originalEvent;
	e.stopPropagation();
	$(this).css('border-style', 'dotted');
	
	var id = e.dataTransfer.getData('Text');
	var type = srcMgr.sourceType(id);
	if(!id || type != $(this).data('type')) return;
	// Place in the elem zone
	$(this).html(srcMgr.getExpoClone(id));
	$(this).attr('target', id);
};

function newTranslationDialog(){
    dialog.showPopup('Nouvelle langue pour '+pjName, 500, 260, 'Générer traduction');
    var htmlStr = '';
    $.post('load_project.php', {'pjName': pjName}, function(msg){
        if(!msg || msg == 'FAIL')
            console.error('fail to retrieve existing language for the project : see load_project.php');
        else {
            var langues = msg.split(' ');
            var htmlStr = '<p>Langues existantes pour ce projet :</p>';
            htmlStr += '<div id="language_list">';
            for(var i in langues){
                if(langues[i] == pjLanguage) htmlStr += '<p id="current_lang">'+langues[i]+'</p>';
                else  htmlStr += '<p>'+langues[i]+'</p>';
            }
            htmlStr += '</div>';
            dialog.main.prepend(htmlStr);
        }
    });
    
    dialog.main.append('<p><label for="newLanguage">Nouvelle langue:</label><input type="text" id="newLanguage" /></p>');
    dialog.main.append('<p><label for="openNewLanguage">Ouvrir le nouveau projet:</label><input type="checkbox" checked id="openNewLanguage" /></p>');
    
    dialog.confirm.click(function(){
        var jqNewLang = $('#newLanguage');
        window.newLang = jqNewLang.val().toLowerCase();
        var existLang = $('#language_list').children();
        window.autoOpen = $('#openNewLanguage').get(0).checked;
        
        // Language check
        if(!newLang || newLang == "") return;
        
        for(var i = 0; i<existLang.length; i++){
            if(existLang[i].innerHTML.toLowerCase() == newLang){
                jqNewLang.siblings('label').css('color','red');
                $(existLang[i]).css('color','red');
                // todo : REGEXP test 
                return;
            }
        }
        $.ajax({
            async:  false,
            type: 'POST', 
            url: 'create_translation.php', 
            data: {'pjName': pjName, 'lang':pjLanguage, 'newLang': newLang}, 
            success: function(data, textStatus, jqXHR) {
                if(data && data != '') {
                    alert('Error while creating translation : see console for info.');
                    console.log(data);
                }
                else if(window.autoOpen){
                    window.open('main_page.php?pjName='+pjName+'&lang='+window.newLang);
                }
                delete window.newLang;
                delete window.autoOpen;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // Une erreur s'est produite lors de la requete
            }
        });
        dialog.close();
    });
    
    
}


// Source management====================================

function addImgSrc(evt) {
	CommandMgr.executeCmd(new AddSrcCmd('image', evt.target.result));
};
function addAudioSrc(evt) {
    CommandMgr.executeCmd(new AddSrcCmd('audio', evt.target.result));
};
function addJsSrc(evt) {
    // No game class name, can't add a game
    if(!curr.gamename) return;
    var content = evt.target.result;
    var name = curr.gamename;
    var exp = "/"+name+"\\s*=\\s*function/";
    if(content.search(eval(exp)) >= 0) {
        CommandMgr.executeCmd(new AddSrcCmd('game', content, name));
    }
    else alert("Échec d'ajouter le jeu car il n'est pas trouvé dans le fichier.");
};

function addImageElem(id, data, page, step) {
    var img = $('<img name="'+ id +'">');
    img.attr('src', data);
    img.css({'width':'100%','height':'100%'});

    var src = srcMgr.getSource(id);
    if(src.width && src.height) var w = src.width, h = src.height;
    else var w = img.prop('width'), h = img.prop('height');
    var cw = page.width(), ch = page.height();
    if(!w || !h) return;
    
    var container = $('<div id="obj'+(curr.objId++)+'">');
    container.append(img);
    container.deletable();

    // Resize
    var ratiox = cw/w;
    var ratioy = ch/h;
    var ratio = (ratiox > ratioy ? ratioy : ratiox);
    if(ratio < 1) {w = w*ratio; h = h*ratio;};
    container.css({'position':'absolute', 'top':'0px', 'left':'0px'});
    container.css({'width':w+'px', 'height':h+'px', 'border-style':'solid', 'border-color':'#4d4d4d', 'border-width':'0px'});

    defineZ(step, container);

    // Listener to manipulate
    // Choose Resize Move
    container.resizable().moveable().configurable({text:true,stroke:true}).hoverButton('./images/UI/addscript.jpg', addScriptForObj);
    container.canGoDown();
    
    CommandMgr.executeCmd(new CreateElemCmd(step, container));
}

function addPage(name) {
	var page = $('<div id="'+name+'" class="scene"></div>');
	page.width(config.swidth).height(config.sheight);
	$('#scene_panel').append(page);
	pages[name] = page;
	
	// Add step manager
	page.addStepManager();
	// DnD listenerts to add Elements
	page.bind('dragover', dragOverScene).bind('drop', dropToScene);

	var pageLabel = $('<li>'+name+'</li>');
	pageLabel.click(activeBarLabel).circleMenu({
	        'test':['./images/UI/recut.png',null],
	        'test1':['./images/UI/left.png',null],
	        'addScript':['./images/UI/addscript.jpg',addScriptDialog]});
	$('#newPage').before(pageLabel);
	// Set active the label
	var parent = $(this).parents().find('.tabBar');
	$('#newPage').prevAll().removeClass('active');
	pageLabel.addClass('active');
	for(var i in pages) pages[i].css('z-index','1');
	page.css('z-index','2');
	curr.page = page;
	
	var mgr = page.data('StepManager');
	return page;
};
function delPage(name) {
    // Delete in labelbar
    $('#pageBar li').each(function() {
        if($(this).text() == name) {
            $(this).remove();
            return;
        }
    });
    // Delete step manager in dom
    pages[name].data("StepManager").remove();
    // Delete in dom
    pages[name].remove();
    // Delete in pages
    delete pages[name];
    // Active another page
    var another = $('#pageBar li:first-child');
    if(!another.hasClass('add')) another.click();
};
function delCurrentPage() {
    // Check number of the pages
    if($('.scene').length <= 1 || curr.page == null) {
        alert("Échec, il rest qu'une page ou pas de page activé.");
        return;
    }
    
    var name = curr.page.prop('id');
    CommandMgr.executeCmd(new DelPageCmd(name));
};

function staticConfig(e){e.preventDefault();e.stopPropagation();showParameter($(this).parent().parent());}

// parse the raw texte,  match the speaker balise
//use generateLines for creating object containing one text line, 

function generateSpeaks(content, font, width, lineHeight){
	
	// match [ <string> : <string> ]
	var regEx = /\[( *[a-zA-Z0-9]* *( *: *[a-zA-Z0-9]* *)?)\]/g;
	var regExEnd = /^ *(end|fin|\/.*) *$/;
	var regExId = /^ *([a-zA-Z0-9]*)/
	var regExParam = /^ *[a-zA-Z0-9]* *: *([a-zA-Z0-9]*) *$/
	var prev = 0;
	function getNextBalise(){
		var s , sa , sb , next , snext , alinea , primar , send ,
		id , param , closed , inside , outsidebefore , outsideafter ;
		if( !( s = regEx.exec( content ) ) )
			return null;
			
		s = s[ 1 ];							// s the contnent of the balise ( without [ and  ] )
		sa = regEx.lastIndex;				// the index of the character just before the balise
		
		// text before the balise
		outsidebefore = content.substring( prev , sa - s.length -2 );	// -2 for [ and ] 
		
		
		id 		= ( regExId.exec( s ) || [ null , null ] )[1];
		param 	= ( regExParam.exec( s ) || [ null , null ] )[1];
		
		// search for the end of the balise
		// check the next balise
		next  = ( regEx.exec( content ) || [ null , null ] )[1] ;
		snext = regEx.lastIndex;
		closed = next != null && next.match( regExEnd );
		
		alinea = content.indexOf( "\n" , sa )+1;
		if( alinea == 0 )
			alinea = content.length;
		
		if( closed ){
			// the balise begin at sa , and end at snext with a closure balise
			inside = content.substring( sa  , snext - next.length -2 )+"\n"; // notice that as the closure balise have to have a \n after it
			prev = snext+1;
		}else {
			// the balise begin at sa , and end at alinea with a alinea
			inside = content.substring( sa  , alinea ); // notice that the inside does contains the \n
			prev = alinea;
			
			// the next balise wasnt a closed one , so it need to be analysed next loop
			if( next )
				regEx.lastIndex = snext - next.length - 2;
			else
				regEx.lastIndex = content.length-1;
		}
		
		return { 
			inside : inside , 
			outsidebefore : outsidebefore , 
			id : id , 
			param : param 
			};
	}
	
	
	// first , check for syntax validity
	var b = null;
	while( b = regEx.exec( content ) )
		if( b[1].match( regExEnd )  ){
			if( content.charAt( regEx.lastIndex ) != "\n" ){
				console.log( '"'+content.replace( /\n/g , "\\n")+'"' )
				throw "invalide syntax, missing \\n after "+b[0]+", found \""+content.charAt( regEx.lastIndex )+"\" ";
			}
		}else{
			var indexBeforeBalise = regEx.lastIndex - b[0].length-1;
			if( indexBeforeBalise > 0 && content.charAt( indexBeforeBalise ) != "\n" ){
				console.log( '"'+content.replace( /\n/g , "\\n")+'"' )
				throw "invalide syntax, missing \\n before "+b[0]+", found \""+content.charAt( indexBeforeBalise )+"\" ";
			}
		}
	
	
	var res = $("<div/>");
	var baliseInfo ;
	var prev_end = "";
	while( baliseInfo = getNextBalise() ){
		
		// automaticly add the linked ressource speaker
		var alreadyExist = false;
		var id_ressource;
		for( var i in srcMgr.sources )
			if( srcMgr.sourceType( i ) == "speaker" && srcMgr.getSource( i ).name == baliseInfo.id ){
				alreadyExist = true;
				id_ressource = i;
				break;
			}
		if( !alreadyExist )
			id_ressource = speakerMgr.createSpeaker(baliseInfo.id);
		// and the mood
		var mood = baliseInfo.param ? baliseInfo.param : "neutre";
		var data = srcMgr.getSource( id_ressource );
		if( !data.hasMood( mood ) )
				data.addMood( mood );
		
		
		
		// append the textLine object
		// append the normal text , the text before the dialogues
		if( baliseInfo.outsidebefore.length > 0 )
			res.append( generateLines(  baliseInfo.outsidebefore , font, width, lineHeight ) );	
		
		if( baliseInfo.inside.length > 0 ){
			var id = "obj"+(curr.objId++);
			var lines = generateSpeakLines( baliseInfo.inside, font, width, lineHeight, id_ressource, mood, config.withdrawal );
			var color = srcMgr.getSource( id_ressource ).color;
			res.append( $('<div id="'+ id +'" class="speaker" data-who="'+baliseInfo.id+'" data-withdrawal="'+ config.sceneX(config.withdrawal) + '" data-color="'+color+'" data-mood="'+mood+'" style="width:'+  config.sceneX( width )+'px; background-color:'+color+';" />')
               .append( lines ) );
		}
	}
	
	var outsideAfter = content.substring( prev );
	if( outsideAfter.length > 0 )
			res.append( generateLines(  outsideAfter , font, width, lineHeight) );
	return res.children();
}
// setUp the speak formate with img associate
function generateSpeakLines( content, font, width, lineHeight, id , mood , decalage , prebreak ){
		
		if( !decalage )
			decalage = 50;
		
		var nline = Math.ceil( decalage / lineHeight );
		
		
		
		var first = generateLines( content , font, width - decalage , lineHeight , prebreak );
		
		var rest = "";
		
		var res = $("<div/>");
		
		// apend the image
		var img = $( '<img class="illu_speaker" src="'+ srcMgr.getSource( id ).getMoodUrl( mood ) +'" style="display:inline-block;" />' );
		res.append( img );
		
		// append the firsts lines
		var res_h = 0;
		var breakline = false;
		for( var i = 0 ; i < first.length ; i ++ ){
		    var line = $(first.get(i));
		    // Ignore paragraphtag
			if(line.prop('tagName') == "PARAGRAPHTAG") {  
				if( i <= nline ){
				   res.append( line );
			       nline++;
				} else 
					rest += "\n";
				 breakline = true
			} else 
				if( i < nline ){
					line.css("left" , config.sceneX( decalage )+"px" ); 
					line.css("position" , "relative" );
					line.css("width" , config.sceneX( width - decalage )+"px" );
					res_h += line.height();
					res.append( line );
				}else
					if( line.children("p").length == 0 || line.children("p").text().trim() == "" ){
						if( breakline )
							rest += "\n";
						else
							rest += "\n\n";
						breakline = true;
					}else {
						rest += line.children("p").text();
						breakline = false;
					}
		}
		
		// what
		if( res_h < decalage )
			res.append( $('<div style="height:'+ config.sceneX( decalage - res_h )+'px;" />' ) );
			
		// append the rest
		if( rest.length > 0 ) {
		    var last = generateLines( rest , font, width , lineHeight );
			res.append( last );
		}
		
        if( srcMgr.getSource( id ).portrait[ mood ] )
             img.attr('name', srcMgr.getSource( id ).portrait[ mood ]);
        else 
			img.attr('name', 'none');
        img.css({ "position": "absolute",
                  "width": config.sceneX(decalage*0.9),
                  "height": config.sceneX(decalage*0.9),
                  "left": config.sceneX(decalage*0.1) });
        img.attr( "height" , config.sceneX(decalage*0.9) );
        img.attr( "width" , config.sceneX(decalage*0.9) );
		
		
		img.click( function(e){
			speakerMgr.editDialogPopup( $( e.currentTarget ).parent() );
		});
		
		return res.children();
	}
function generateLines( content, font, width, lineHeight ){
    
	//cut the espace when its between 
	while( content.match( /(^|\n)(( |\r|\t)+)(\n|$)/ ) )
		content = content.replace( /\n(( |\r|\t)+)\n/g , "\n\n" ).replace( /^(( |\r|\t)+)\n/g , "\n" ).replace( /\n(( |\r|\t)+)$/g , "\n" );
	
	var res = '';
    // Content processing
	TextUtil.config(font);
	var maxM = Math.floor( width/TextUtil.measure('A') );	

	var arr = content.split('\n');
	var sep = 0;
	var prefix = true;
	for(var i = 0; i < arr.length; i++) {
	    if(arr[i].trim().length == 0 ) {
			if( i != arr.length-1 )
				res += '<div id="obj'+(curr.objId++)+'" class="textLine"></div>';
	       continue;
		}
        // Content paragraph
		for(var j = 0; j < arr[i].length;) {
			// Find the index of next line
			var next = TextUtil.checkNextline(arr[i].substr(j), maxM, width);
			res += '<div id="obj'+(curr.objId++)+'" class="textLine"><p>'+arr[i].substr(j, next)+'</p></div>';
			j += next;
		}
		res += '<paragraphtag></paragraphtag>';
	}
	res = $(res);
	res.each(function() {
	    if($(this).prop('tagName') == "PARAGRAPHTAG") return;
		$(this).height(config.sceneY(lineHeight));
	});
	return res;
}


function addArticle(manager, name, params, content) {
    if(!params)
        return false;
    params.type = 'ArticleLayer';
	var step = manager.addStep(name, params, true);
	var article = $('<div class="article" defile="'+(params.defile?params.defile:"false")+'"></div>');
	var lh = config.sceneY(params.lh);
	article.css({'left':config.sceneX(params.x)+'px', 'top':config.sceneY(params.y)+'px', 
				 'width':config.sceneX(params.lw)+'px', 'height':config.sheight-config.sceneY(params.y)+'px',
				 'line-height':lh+'px'});
	var font = "";
	if(params.fweight) {
		font += params.fweight + ' ';
		article.css('font-weight', params.fweight);
	}
	if(!isNaN(params.fsize)) {
		font += params.fsize+'px ';
		article.css('font-size', config.sceneY(params.fsize)+'px');
	}
    if(params.googleFont){
        $('head').append("<link href='http://fonts.googleapis.com/css?family="+params.googleFont+"' rel='stylesheet' type='text/css'>")        
		article.css('font-family', "'"+params.googleFont+"'");
        article.attr('data-googleFont', params.googleFont);
    }
	else if(params.font) {
		font += params.font;
		article.css('font-family', params.font);
	}
	if(params.color) article.css('color', params.color);
	if(params.align) article.css('text-align', params.align);
    var res = generateSpeaks(content, font, params.lw, params.lh)
	article.append(res);
	// Listener to manipulate
	article.deletable().configurable();
	step.append(article);
    
    ArticleFormater.setConfigurable(res);
}

function defineZ(step, obj){
    if(!(step instanceof jQuery) || !(obj instanceof jQuery))
        return false;
    
	var maxZ = 0;
    var childs = step.children()
	for(var i=0; i < childs.length; i++) {
        var elem = childs.eq(i);
        var z = parseInt(elem.css('z-index'));
        z = isNaN(z) ? 0 : z;
		if(z > maxZ)
            maxZ =  parseInt(elem.css('z-index'));
	}
	obj.css('z-index', maxZ+1); // a new obj is set upper others
}



// Active one label in the tab bar
function activeBarLabel() {
	if($(this).hasClass('add')) return;
	var name = $(this).text();
	var pagebar = $('#pageBar');
	pagebar.children('.active').removeClass('active');
	$(this).addClass('active');
	pagebar.children().each(function() {
		if(!$(this).hasClass('add'))
			pages[$(this).text()].css('z-index','1');
	});
	pages[name].css('z-index','2');
	curr.page = pages[name];
	
	// Active current step manager
	curr.page.data('StepManager').active();
};

// Drag over
function dragOverScene(e) {
    e = e.originalEvent;
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
	return false;
};
function dragOverExpo(e) {
    e = e.originalEvent;
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
	$(this).css('border', '1px #4d4d4d solid');
	return false;
};
// Drag leave
function dragLeaveExpo(e) {
	$(this).css('border', 'none');
};
// Function drop to add Elem
function dropToScene(e) {
    e = e.originalEvent;
	e.stopPropagation();
	var id = e.dataTransfer.getData('Text');
	var type = srcMgr.sourceType(id);
	if(!id || type != "image") return;
	var data = srcMgr.getSource(id);
	if(data == null) return;
	addImageElem(id, data, curr.page, curr.step);
};
function dropToExpo(e) {
    e = e.originalEvent;
	e.stopPropagation();
	$(this).css('border', 'none');
	var id = e.dataTransfer.getData('Text');
	var type = srcMgr.sourceType(id);
	if(!id || type != "image") return;
	var data = srcMgr.getSource(id);
	if(data == null) return;
	
	// Find step
	var step = curr.page.data('StepManager').getStep($(this).data('stepN'));
	addImageElem(id, data, curr.page, step);
};

// Article interaction
// Select <p> elem
function selectP(e) {
	e.preventDefault();
	var elem = $(this);
	if(curr.choosed && curr.choosed != elem) {
		//curr.choosed.css({'z-index':'0','background':'none'});
		curr.choosed.children('.del_container').css('display','none');
	}
	else if(curr.choosed == elem) return;
	
	elem.css({'z-index':'1'});
	elem.children('.del_container').css('display','block');
	curr.choosed = elem;
};
// Insert elems after <p>
function insertElemAfter(e) {
	insertElemDialog();
};

// Drop zone interaction
function dropToInsertZone(e) {
    e = e.originalEvent;
	e.stopPropagation();
	$(this).css('border-style', 'dotted');
	
	var id = e.dataTransfer.getData('Text');
	var data = srcMgr.getSource(id);
	var type = srcMgr.sourceType(id);
	// Verification
	if(!data || (type != "image" && type != "game" && type != "anime")) return;
	// Append to elem zone
	$(this).append(srcMgr.getExpoClone(id));
};

// Select words to set link
function textSelected(e) {
    var sel = getSelection();
    var evt = e || window.event;
    // No selection
    if(sel.isCollapsed) return;
    // Select a link existed
    if(sel.focusNode.parentNode.nodeName.toLowerCase() == "span") {
        modifyLink(evt);
        return;
    }
    // Select multiple lines
    if(sel.anchorNode != sel.focusNode) return;
    
    curr.selectNode = $(sel.anchorNode.parentNode);
    curr.selectRange = sel.getRangeAt(0);
    // Popup
    showLinkSetter(evt);
};
// Modify a exist link
function modifyLink(e) {
    var evt = e || window.event;
    
    var tar = $(evt.target);
    var type = tar.attr('class');
    var link = tar.attr('link');
    if(!type || !link) return;
    switch(tar.attr('class')) {
    case "audiolink": 
        $('#linkType').attr('value', 'audio');
        $('#linkType').change();
        $('#audiolinkInput').attr('link', link).html('<img src="./images/UI/audio.png"></img>');
        break;
    case "wikilink": 
        $('#linkType').attr('value', 'wiki');
        $('#linkType').change();
        break;
    case "fblink": 
        $('#linkType').attr('value', 'fb');
        $('#linkType').change();
        $('#fblinkInput').attr('value', link);
        break;
    default: return;
    }
    curr.selectNode = tar;
    // Popup
    showLinkSetter(evt);
};
// Audio drop zone interaction
function dropToAudioElemZone(e) {
    e = e.originalEvent;
	e.stopPropagation();
	$(this).css('border-style', 'dotted');
	
	var id = e.dataTransfer.getData('Text');
	var type = srcMgr.sourceType(id);
	// Verification
	if(!id || (type != "audio")) return;
	// Place in the elem zone
	$(this).append(srcMgr.getExpoClone(id));
	$(this).attr('link', id);
};
// Wiki resource drop zone interaction
function dropToWikiElemZone(e) {
    e = e.originalEvent;
    e.stopPropagation();
    $(this).css('border-style', 'dotted');
    
    var id = e.dataTransfer.getData('Text');
    var type = srcMgr.sourceType(id);
    // Verification
    if(!id || (type != "wiki")) return;
    // Place in the elem zone
    $(this).append(srcMgr.getExpoClone(id));
    $(this).attr('link', id);
};



function expressTrad(){
	
	var metas = ArticleFormater.parseMetaText($( ".article" ));
	var a = ArticleFormater.formate( $( ".article" ), metas );
	
	var e  = ArticleFormater.reverse( a , $( ".article" ), metas );
	
	$( ".article" ).children().remove();
	
	$( ".article" ).append( e );
}


var ArticleFormater = function() {
	
	var correspondanceType = { 	'audiolink' : 'audio' , 
								'wikilink' : 'wiki' };
	var correspondanceClass = { 'audio' : 'audiolink' , 
								'wiki' : 'wikilink' };
	var chart = {
			linkOpenA : "<",
			linkOpenB : ">",
			linkCloseA : "</",
			linkCloseB : ">",
			
			inserOpenA : "<",
			inserOpenB : "/>",
			
			i : /^ *([0-9]*)/ ,
			id : / id:([[a-zA-Z0-9]*)/ ,
			type : / type:([[a-zA-Z0-9]*)/ 
			
			}
	chart.all = new RegExp( "("+chart.linkCloseA+"|"+chart.linkOpenA+"|"+chart.inserOpenA+")[A-z0-9 :]*("+chart.linkCloseB+"|"+chart.linkOpenB+"|"+chart.inserOpenB+")" ,"g"  )
	
	
	return {
		// return the lists of the links in the related article ( a link is a wiki, an audio ,  a script , an animation )
		// return the lists of the insertions in the related article ( a insertion is a game, a image , a blank line )
parseMetaText : function( article ){
	if( !article || !article.hasClass('article') )
		return;
		
	var meta = [];
		
	// the links
	//var spans = article.children( "div.textLine, div.speaker div.textLine" ).find( "span.audiolink, span.wikilink" );
	var spans = article.find( "div.textLine, div.speaker div.textLine" ).find( "span.audiolink, span.wikilink" );
	for( var i = 0 ; i < spans.length ; i ++ ){
		var span = $( spans.get(i) );
		var textLine = span.parents( "div.textLine" );
		
		// retourne le text qui se trouve avant l'element, 
		// utilise previous sibling de dom element ( JQuery n'interprete pas le texte non encapsulé )
		function getTextBeforeMe( el , container ){
			if( el == container )
				return ""
			var e = el;
			var s = "";
			while( ( e = e.previousSibling ) != null )
				if( e instanceof Text )
					s = e.data + s;
				else
					s = e.innerText + s ;
			return getTextBeforeMe( el.parentNode  , container )+s;
		}
		
		var index = getTextBeforeMe( span[0] , span.parents( "p" )[0] ).length;
		
		meta.push( {objId : textLine.prop( "id" ) ,
					keyword : span.text(),
					format : "link",
					index : index,
					link :  { 	type : correspondanceType[ span.attr( "class" ) ] ,
								id : span.attr( "link" ) } 
				} );
	}
	
	// the animations
	for( var i in srcMgr.sources ) {
		if( srcMgr.sources[ i ].type == "anime" ){
			var anime = srcMgr.getSource( i );
			for( var objId in anime.objs ){
				var obj = article.find( "#"+objId );
				if( obj.hasClass( "textLine" ) )
					meta.push( {objId : objId ,
        						keyword : anime.objs[ objId ].content,
        						index : obj.children("p").text().indexOf( anime.objs[ objId ].content ),
        						format : "link",
        						link :  { 	type : "anime" ,
        									id : i } 
        					} );
			}
		}
	}
	
	// the scripts
	for( var i in scriptMgr.scripts ){
		var script = scriptMgr.scripts[ i ];
		var src = article.find( "#"+script.src );
		if( script.srcType == "obj"
		&& 	src.hasClass( "textLine" )  ) {
			meta.push( {objId : script.src,
            			keyword : src.children('p').text(),
            			index : 0,
            			format : "link",
            			link :  { 	type : "script",
            						id : i,
            						dep : "src"}
            		} );
        }
        
        var tar = article.find( "#"+script.target );
		if( tar.hasClass( "textLine" )  ) {
			meta.push( {objId : script.target,
        				keyword : tar.children('p').text(),
        				index : 0,
        				format : "link",
        				link :  { 	type : "script",
        							id : i,
        							dep : "target" } 
        			} );
        }
        
        var supp = article.find( "#"+script.supp );
		if( supp.hasClass( "textLine" )  ) {
			meta.push( {objId : script.supp ,
        				keyword : supp.children('p').text(),
        				index : 0,
        				format : "link",
        				link :  { 	type : "script" ,
        							id : i ,
        							dep : "supp" } 
        			} );
        }
	}
	
	// the illus
	var illus = article.children( "div.illu" );
	for( var i = 0 ; i < illus.length ; i ++ ){
		var illu = $( illus.get(i) );
		var img  = $( illu.children("img").get(0) );
		meta.push( {objId : illu.prop( "id" ) ,
        			keyword : "",
        			format : "inser",
        			index : 0,
        			link :  { 	type : "image" ,
        						id : img.attr( "name" ) } 
        		} );
	}
	
	// the games
	var games = article.children( "div.game" );
	for( var i = 0 ; i < games.length ; i ++ ){
		var game = $( games.get(i) );
		meta.push( {objId : game.attr( "id" ),
    				keyword : "",
    				format : "inser",
    				index : 0,
    				link :  { 	type : "game" ,
    							id : game.attr( "name" ) } 
    			} );
	}
	return meta;
},


//generate metaTextArticle
// assume that the article doesnt have \n espace\n issue ( true until it generate by generate line )
formate : function( article , meta , breakline ){ 

	if( !article || (!article.hasClass('article') && !article.hasClass('speaker')) )
		return;
	if( !meta )
		meta = this.parseMetaText( article );
	
	var s = "";
	if(breakline == null )
		breakline = true;
	var lines = article.children();
	for( var i = 0 ; i < lines.length ; i ++ ){
		var line = $( lines.get(i) );
		if( line.prop('tagName') == "PARAGRAPHTAG" ) {
		    s += '\n';
			breakline = true;
		}
		else if( line.hasClass( "textLine" ) ) {
		    // Line gap
			if( line.children('p').text().trim() == "" )
			   if( breakline )
					s += '\n';
				else{
					s += '\n\n';
					breakline = true;
				}
			else{
				s += wrap( line );
				breakline = false;
			}
		}	
		else if( line.hasClass( "speaker" ) ) {
			var formatedSpeak = this.formate( line , meta , breakline );
			formatedSpeak = formatedSpeak.substring( 0 , formatedSpeak.length - 1 ); // on supprime le \n, pour le placer apres le [end]
			s += "[ "+line.attr( "data-who")+" : "+line.attr( "data-mood")+" ]" + formatedSpeak +"[end]\n";
			breakline = true;			// un dialogue se termine toujours pas un \n
		}
		else if( line.hasClass( "game" ) || line.hasClass( "illu" ) ) {
			// retreive the game in meta ( by chance the objId will match )
			for( var j = 0 ; j < meta.length ; j ++ )
				if( meta[j].objId == line.prop( "id" ) ){
					s+= chart.inserOpenA + " "+j + "  " + meta[j].link.type + " sur la source " + meta[j].link.id +" "+ chart.inserOpenB;
					break;
				}
		}
		else 
		    continue;
	}
	
	
	return s;
	/*
	function wrap( obj ){
    	var r = obj.children("p").text();
    	if(r.trim() == "") {r = r.trim();}
		
		var charge = [], balise;
		var id = obj.attr( "id" );
		for( var i = 0 ; i< meta.length ; i ++ )
			if( meta[ i ].objId == id )
				if( meta[ i ].format == "link"){
					// start balise
					balise = chart.linkOpenA + " "+i + "  " + meta[i].link.type + " sur la source " + meta[i].link.id + chart.linkOpenB;
					charge.push( { index : meta[ i ].index , b : balise } );
					// close balise
					balise = chart.linkCloseA  + " "+i+" " + chart.linkCloseB;
					charge.unshift( { index : meta[ i ].index + meta[ i ].keyword.length , b : balise } );
				}else {
					// balise insertion
					balise = chart.inserOpenA + " "+i + "  " + meta[i].link.type + " sur la source " + meta[i].link.id + chart.inserOpenB;
					charge.push( { index : meta[ i ].index , b : balise } );
				}
		
		for( var i = 0 ; i < charge.length ; i ++ ){
			var avant = r.substring( 0 , charge[i].index );
			var apres = r.substring( charge[i].index );
			
			r = avant + charge[i].b + apres;
			
			// décalage des suivants
			for( var j = i+1 ; j < charge.length ; j ++ )
				if( charge[ j ].index >  charge[i].index )
					 charge[j].index += charge[i].b.length;	 
		}
		
		return r;
	}
	*/
	function wrap( obj ){
    	var r = obj.children("p").text();
    	if(r.trim() == "") {r = r.trim();}
		
		var charge = [], balise;
		var id = obj.attr( "id" );
		for( var i = 0 ; i< meta.length ; i ++ )
			if( meta[ i ].objId == id )
				if( meta[ i ].format == "link"){
					// start balise
					balise = chart.linkOpenA + " "+i + "  " + meta[i].link.type + " sur la source " + meta[i].link.id + chart.linkOpenB;
					charge.push( { index : meta[ i ].index , b : balise , o:"ouv" , i:i} );
					// close balise
					balise = chart.linkCloseA  + " "+i+" " + chart.linkCloseB;
					charge.push( { index : meta[ i ].index + meta[ i ].keyword.length , b : balise , o:"fer" , i:i } );
				}else {
					// balise insertion
					balise = chart.inserOpenA + " "+i + "  " + meta[i].link.type + " sur la source " + meta[i].link.id + chart.inserOpenB;
					charge.push( { index : meta[ i ].index , b : balise , o:"aut"} );
				}
		
		charge.sort( function(a,b){
			if( a.index != b.index || a.o != "ouv" || b.o != "ouv" )
				return a.index - b.index;
			var af , bf;
			for( var k = 0 ; k < charge.length ; k ++ )
				if( charge[ k ].i == a.i )
					af = charge[ k ];
				else 
				if( charge[ k ].i == b.i )
					bf = charge[ k ];
					
			return bf.index - af.index;
		});
		var i=0 , j , curr ;
		var stack = [];
		while(  charge.length > 0 ){
			curr = charge[ 0 ].index;
			for( j = 0 ; stack.length > 0 && j < charge.length && charge[ j ].index == curr ; j ++ ){	// pour toutes les charges qui ont le même index
				if( charge[ j ].o == "fer" && stack[0] == charge[ j ].i ){			// celle qui sont fermante et qui doivent se fermer maintenant ( car il y en a une ouverte avant )
					// early push
					var avant = r.substring( 0 , charge[j].index );
					var apres = r.substring( charge[j].index );
					
					r = avant + charge[j].b + apres;
					
					
					
					// décalage des suivants
					for( var k = 0 ; k < charge.length ; k ++ )
						charge[k].index += charge[j].b.length;	 
					
					charge.splice( j , 1 );
					
					stack.shift();
				}
			}
			if(  charge.length > 0 && curr == charge[ 0 ].index ){
				var avant = r.substring( 0 , charge[0].index );
				var apres = r.substring( charge[0].index );
					
				r = avant + charge[0].b + apres;
					
				if( charge[ 0 ].o == "ouv" )
					stack.unshift( charge[ 0 ].i );
				
				
				// décalage des suivants
				for( var k = 0 ; k < charge.length ; k ++ )
					charge[k].index += charge[0].b.length;	
					
				charge.shift();
			}
		}
		
		return r;
	}
},

// reverse	
reverse : function( parent , chaine , article , meta , font , width , lineHeight){ 
	if( !article || !article.hasClass('article') ) return;
	
	var log = "";

	if( !meta )
		if( !article  )
			meta = [];
		else
			meta = this.parseMetaText( article );
	
	// prevent the navigator to delete tag content because its not visible ( <span>    </span> is saved as <span></spans>  )
	while( chaine.match( /(^|\n)(( |\r|\t)+)(\n|$)/ ) )
		content = content.replace( /\n(( |\r|\t)+)\n/g , "\n\n" ).replace( /^(( |\r|\t)+)\n/g , "\n" ).replace( /\n(( |\r|\t)+)$/g , "\n" );
	
	// parsing de la chaine
	// suppression des balises, stockage des index et keywords
	var next;
	var lastIndex=0;
	var sortedMeta = [];
	while( (next = shiftNextBalise() ) ){
		
		if( !meta[ next.i ] ){
			console.log( "encounter error parsing the metaText, missing information" );
			return;
		}
		
		meta[ next.i ].prev_index   = meta[ next.i ].index;
		meta[ next.i ].prev_keyword = meta[ next.i ].keyword;
		meta[ next.i ].prev_objId   = meta[ next.i ].objId;
		
		meta[ next.i ].keyword = next.keyword;
		meta[ next.i ].offset  = next.index; 		// offset est le numero de caractére par rapport au debut du texte ( et non pas au début de la ligne comme index )
		meta[ next.i ].format  = next.format;
		meta[ next.i ].valide  = true;
		
		sortedMeta.push( meta[ next.i ] );
		
	}
	
	meta = sortedMeta;
	
	// traitement des éléments de dialogue 
	// les balises dialogue sont ignoré par le générateur de line, elle n'apparaissent plus post génération ce qui introduit des erreurs dans l'indexation des mots 
	// on corrige 
	
	var decalage = [];
	for( var i = 0 ; i < meta.length ; i ++ )
		decalage[ i ] = 0;
	
	var next;
	var start = 0;
	while(  (next = chaine.indexOf( "[" , start )) != -1 ){
		var end = chaine.indexOf( "]" , next )+1;	
		for( var i = 0 ; i < meta.length ; i ++ )
			if( meta[ i ].offset > next )
				decalage[ i ] -= next - end;
		start = end;
	}
	
	// introduit le décalage
	for( var i = 0 ; i < meta.length ; i ++ )
		meta[ i ].offset -= decalage[ i ];
	
	
	// genere les objets lines
	if( !font ){
		font = article.css('font-weight');
		font += " "+config.realX( cssCoordToNumber( article.css('font-size') ) )+"px";
		font += " "+article.css('font-family');
	}
	if( !width )
		width = config.realX( article.width() );
	if( !lineHeight )
		lineHeight = config.realY( cssCoordToNumber( article.css('line-height') ) );
	
    var res = generateSpeaks( chaine, font , width , lineHeight );
	parent.append( res );
    ArticleFormater.setConfigurable(res);
	
	// Deformat chiane
	var realchaine = chaine.replace(/\[[^\[\]]*\]/g, "");
	realchaine = realchaine.replace(/<[^<>]*>/g, "");
	
	
	// numerote les objets lignes
	parent.append( $("<div class=\"textLine\">") );			// on ajoute un element vide, pour pouvoir se repérer lorsque l'on place le dernier élément
	var table = [];
	var cursor = 0;
	var breakline = true;
	parent.find("div.textLine, paragraphtag").each(function(){
		var line = $( this );
		if(line.prop('tagName').toLowerCase() == "paragraphtag") {
			 table.push( { 	obj : line,
							l : 1,
        	    			ca : cursor,
        	    			cb : ( cursor = cursor + 1 ),
        	    			b : []
        	    		} );
		    breakline = true;
		}
		else {
        	var text = line.children("p").text();
        	// Line blank
        	if(text.trim().length == 0) {
        	    var size = breakline ? 1:2;
        	    table.push( { 	obj : line,
        	    				l : size,
        	    				ca : cursor,
        	    				cb : ( cursor = cursor + size ),
        	    				b : []
        	    			} );
        	    breakline = true;
        	}
        	// Line with content
        	else {
            	table.push( { 	obj : line ,
            					l : text.length,
            					ca : cursor ,
            					cb : ( cursor = cursor + text.length ),
            					b : []
            				} );
                breakline = false;
            }
		}
	});
	
		
	
	// recréer les référence vers les links ( ajout en deux temps )
	for( var i = 0 ; i < meta.length ; i ++ ){
		
		if( !meta[ i ] || !meta[ i ].valide )
			continue;
		
		var e = Math.floor( meta[ i ].offset / table[ table.length-1 ].cb * table.length );  // estimation
		
		while( meta[ i ].offset < table[ e ].ca  )    // ajustement
			e --;
		while( meta[ i ].offset >= table[ e ].cb  )	  // ajustement
			e ++;
		
		var new_obj= null;
		var new_index = null;
		var new_keyword= null;
		
		switch( meta[ i ].link.type ){
			case "audio" : case "wiki" :
				if( meta[ i ].format == "link" ){
					
					new_index = meta[ i ].offset - table[ e ].ca  	// relatif au debut de la ligne
					new_obj = table[ e ].obj;
					
					table[ e ].b.push( { index : new_index  , b : '<span class="'+ correspondanceClass[ meta[ i ].link.type ] +'" link="'+meta[ i ].link.id+'">' , o:"ouv" , i:i } );
					table[ e ].b.unshift( { 
						index : Math.min( new_index + meta[ i ].keyword.length , table[ e ].l ) ,  		// le span est sur une seule ligne, si le groupe de mot occupe 2 lignes,  le span sera sur le début du groupe 
						b : '</span>' ,
						o:"fer" , i:i
					} );
					
				}	
			break;
			case "image" : case "game" :
				if( meta[ i ].format == "inser" ){
					
					new_index = 0;
					new_obj = table[ e ].obj;
					
					
					var id = meta[ i ].link.id;
					var elem = srcMgr.generateChildDomElem(id, parent);
					elem.deletable(null, true)
					    .selectable(selectP)
					    .staticButton('./images/UI/insertbelow.png', insertElemDialog)
					    .staticButton('./images/UI/config.png', staticConfig)
					    .staticButton('./images/tools/anime.png', animeTool.animateObj)
					    .staticButton('./images/UI/addscript.jpg', addScriptForObj)
					    .children('.del_container').hide();
						
					
					var objParent = new_obj.parents( ".speaker" );
					if( objParent.length > 0 ){
						if( new_obj.prev()[0].tagName.toLowerCase() == "img" )
							new_obj = objParent;
						else
							throw " image or game in speak is forbidden"
					}
					
					elem.insertBefore( new_obj );
					
					log += meta[ i ].link.type+" "+id+" re inserée avant la ligne :\""+new_obj.children("p").text()+"\", ( il était précédement après \""+ $('#'+meta[ i ].prev_objId ).children("p").text()+"\" )\n";
				}

			break;
			case "script" :
				var lastIndex = meta[ i ].offset + meta[ i ].keyword.length;
				var lastLine = e;
				
				new_index = meta[ i ].offset - table[ e ].ca;
				
				while( lastIndex > table[ lastLine ].cb ){
					lastLine ++;
					new_index = 0;
				}
				
				new_index = 0;
				new_obj = table[ lastLine ].obj;
				new_keyword = new_obj.children("p").text().substring( new_index );
				
				scriptMgr.scripts[  meta[ i ].link.id ][   meta[ i ].link.dep  ] = new_obj.attr( "id" );
				
				log += "maintient de "+meta[ i ].link.dep+" du script "+meta[ i ].link.id+", celui ci est maintenant lié à la ligne :\""+new_obj.children("p").text()+"\", ( il était précédement lié à \""+ $('#'+meta[ i ].prev_objId ).children("p").text()+"\" )\n";
				
			break;
			case "anime" :
				var lastIndex = meta[ i ].offset + meta[ i ].keyword.length;
				var lastLine = e;
				
				new_index = meta[ i ].offset - table[ e ].ca;
				
				while( lastIndex > table[ lastLine ].cb ){
					lastLine ++;
					new_index = 0;
				}
				
				new_index = 0;
				new_obj = table[ lastLine ].obj;
				new_keyword = new_obj.children("p").text().substring( new_index );
				
				if( !meta[ i ].prev_objId ){
					console.log( "encounter error parsing the metaText, missing information relative to the previous link" );
					return;
				}
				
				var ex_id = meta[ i ].prev_objId;
				var new_id = new_obj.prop( "id" );
				
				var anim = srcMgr.getSource( meta[ i ].link.id );
				
				// change the obj id
				anim.objs[ new_id ] = { };
				for( var key in anim.objs[ ex_id ] )
					anim.objs[ new_id ][ key ] = anim.objs[ ex_id ][ key ];
				anim.objs[ new_id ].content = new_obj.children("p").text(); 
				
				// search occurence of the ex objid , replace it by the new
				for( var j = 0 ; j < anim.frames.length ; j ++ ){
					if( $.inArray( ex_id , Object.keys( anim.frames[ j ].objs )) != -1 ){
						anim.frames[ j ].objs[ new_id ] = {};
						for( var key in anim.frames[ j ].objs[ ex_id ] )
							anim.frames[ j ].objs[ new_id ][ key ] = anim.frames[ j ].objs[ ex_id ][ key ];
						delete anim.frames[ j ].objs[ ex_id ];
					}
				}
				
				delete srcMgr.getSource( meta[ i ].link.id ).objs[ ex_id ];
				
				log += "maintient de l'animation "+meta[ i ].link.id+", celle ci est maintenant lié à la ligne :\""+new_obj.children("p").text()+"\", ( il était précédement lié à \""+ $('#'+meta[ i ].prev_objId ).children("p").text()+"\" )\n";
				
			break;
		}

		// remplace avec les nouveaux index , objId et keyword
		meta[ i ].index = new_index;
		meta[ i ].objId = new_obj.prop('id');
		if( new_keyword )
			meta[ i ].keyword = new_keyword;
	}
	
	
	
	
	
	for( var e = 0 ; e < table.length ; e ++ ){
		var obj = $( table[ e ].obj ).children("p");
		if( !obj || obj.length < 1 ) 		// if its a blank textLine, there is no p balise
			continue
		var r = obj.text();
		
		// insertion
		var charge = table[ e ].b;
		charge.sort( function(a,b){
			if( a.index != b.index  )
				return a.index - b.index;
			if( a.o == "fer" )
				return 1;
			if( b.o == "fer" )
				return -1;
			if( a.o != "ouv" || b.o != "ouv" )
				return 0;
			var af , bf;
			for( var k = 0 ; k < charge.length ; k ++ )
				if( charge[ k ].i == a.i )
					af = charge[ k ];
				else 
				if( charge[ k ].i == b.i )
					bf = charge[ k ];
					
			return bf.index - af.index;
		});
		var i=0 , j , curr ;
		var stack = [];
		while(  charge.length > 0 ){
			curr = charge[ 0 ].index;
			for( j = 0 ; stack.length > 0 && j < charge.length && charge[ j ].index == curr ; j ++ ){	// pour toutes les charges qui ont le même index
				if( charge[ j ].o == "fer" && stack[0] == charge[ j ].i ){			// celle qui sont fermante et qui doivent se fermer maintenant ( car il y en a une ouverte avant )
					// early push
					var avant = r.substring( 0 , charge[j].index );
					var apres = r.substring( charge[j].index );
					
					r = avant + charge[j].b + apres;

					// décalage des suivants
					for( var k = 0 ; k < charge.length ; k ++ )
						charge[k].index += charge[j].b.length;	 
					
					charge.splice( j , 1 );
					
					stack.shift();
				}
			}
			if(  charge.length > 0 && curr == charge[ 0 ].index ){
				var avant = r.substring( 0 , charge[0].index );
				var apres = r.substring( charge[0].index );
					
				r = avant + charge[0].b + apres;
					
				if( charge[ 0 ].o == "ouv" )
					stack.unshift( charge[ 0 ].i );
				
				
				// décalage des suivants
				for( var k = 0 ; k < charge.length ; k ++ )
					charge[k].index += charge[0].b.length;	
					
				charge.shift();
			}
		}
		
		
		obj.get(0).innerHTML = r;
	}
	parent.children(":last").remove();
	
	//console.log( log );
	
	return parent;
	
	
	// share chaine, ( effet de bord )
	function shiftNextBalise(){
		
		// détermine la prochaine occurence d'une balise de type link et de type inser
		if( chart.linkOpenA != chart.inserOpenA ){
			var nlin = chaine.indexOf( chart.linkOpenA , lastIndex );
			var nins = chaine.indexOf( chart.inserOpenA , lastIndex  );
		} else {
			// si les debut de balise sont les mêmes, il faut tester la fin
			// on va faire un bricolage pour rester compatible avec la suite
			var nlin = chaine.indexOf( chart.linkOpenA , lastIndex );
			
			if( nlin == -1 )
				return;
			
			var endlin = chaine.indexOf( chart.linkOpenB , nlin ) ;
			var endins = chaine.indexOf( chart.inserOpenB , nlin ) ;
			
			if( endlin <= -1 || ( endins >= 0 && endins < endlin ) ){
				nins = nlin;
				nlin = -1;
			}else 
				nins = -1;
			
		}
		var i;
		var format;
		
		if( nlin <= -1 && nins <= -1 ) {
			return false;
		}
		
		
		if( nins <= -1 || ( nlin >= 0 && nlin < nins ) ){
			
			// si la balise la plus proche est une link
			format = "link";
			
			var iboA = nlin;
			var iboB = chaine.indexOf( chart.linkOpenB , iboA )+chart.linkOpenB.length;
			
			
			var b = chaine.substring( iboA + chart.linkOpenA.length , iboB - chart.linkOpenB.length );
			i = chart.i.exec( b ) || [ null , null ] ;
			if( !i[1] ){
				console.log( "encounter error parsing the metaText, missing i" );
				return false;
			}
			var reg =  new RegExp( chart.linkCloseA+" *" + i[1] +" *[^0-9]+.*"+chart.linkCloseB   );
			var ibfA = chaine.substring( iboA ).search( reg ); 
			if( ibfA < 0 ){
				console.log( "encounter error parsing the metaText, " );
				return false;
			}
			
			ibfA  += iboA;
			
			var ibfB = chaine.indexOf( chart.linkCloseB , ibfA )+chart.linkCloseB.length;
			
			var middle = chaine.substring(  iboB , ibfA );
			
			chaine = chaine.substring( 0 , iboA ) + middle + chaine.substring( ibfB );
			
			keyword = middle.replace( chart.all , "");
			
		} else {
			
			// la balise la plus proche est une inser
			format = "inser";
			
			var iboA = nins;
			
			var keyword = "";
			
			var iboB = chaine.indexOf( chart.inserOpenB , iboA )+chart.inserOpenB.length;
			
			var b = chaine.substring( iboA + chart.inserOpenA.length , iboB - chart.inserOpenB.length );
			
			chaine = chaine.substring( 0 , iboA ) + chaine.substring( iboB );
			
			lastIndex = iboA;
			
			i = chart.i.exec( b ) || [ null , null ] ;
			if ( !i[1] ){
				console.log( "encounter error parsing the metaText, missing i" );
				return false;
			}
		}
		
			
		var id = chart.id.exec( b ) || [ null , null ] ;
		var type = chart.type.exec( b ) || [ null , null ];
		
		return { i:parseInt( i[1] ) , type:type[1] , id:id[1] , index:iboA , keyword : keyword , format:format };
	}
},

setConfigurable: function ($content){
    // obj is the children of the article
    if(!$content.parent().hasClass('article'))
        return;
        
    function setArticleObjProp(jqObj){
        jqObj.deletable(null, true)
             .selectable(selectP)
             .staticButton('./images/UI/insertbelow.png', insertElemDialog)
             .staticButton('./images/UI/config.png', staticConfig)
             .staticButton('./images/tools/anime.png', animeTool.animateObj)
             .staticButton('./images/UI/addscript.jpg', addScriptForObj)
             .css({'z-index':'0','background':'none'});
        scriptMgr.countScripts(jqObj.attr('id'),'obj', jqObj);
        jqObj.children('.del_container').css({
            'position': 'relative',
            'left': jqObj.width()-15+'px',
            'display':'none'});
    }
    $content.each(function(){
        if(!$(this).is('div.textLine, div.illu, div.game, div.speaker, div.anime'))
            return;
        if ($(this).hasClass('speaker')){
            // speaker is a div which contains textLine
            // it also contains a img which need to have the click event binded
            $(this).children('.textLine, img').each(function(){
                // if its the img , bind the event
                if( this.tagName.toLowerCase() == "img" ){
                    $(this).click( function(e){
                        speakerMgr.editDialogPopup( $( e.currentTarget ).parent() );
                    });
                } else
                    // if its not, its textLine
                    setArticleObjProp($(this));
            });
        }
        else 
            setArticleObjProp($(this));
    });
},

/*
reverse_ : function( parent , chaine , article , meta , font , width , lineHeight){ 
	if( !article || !article.hasClass('article') ) return;
	
	var log = "";

	if( !meta )
		if( !article  )
			meta = [];
		else
			meta = this.parseMetaText( article );
	
	
	// parsing de la chaine
	// suppression des balises, stockage des index et keywords
	
	
	function getNextSpeak( i ){
		var save = chart.all.lastIndex;
		chart.all.lastIndex = i;
		var res = chart.all.exec( chaine );
		var ind = chart.all.lastIndex;
		chart.all.lastIndex = save;
		if( res == null )
			return { i:null };
	}
	function getNextSpace( i ){
		var res = chaine.indexOf( " " , i );
		return {i: i==-1?null:i };
	}
	function getNextAlinea( i ){
		var res = chaine.indexOf( "\n" , i );
		return {i: i==-1?null:i };
	}
	
	
	while( true ){
		
		
	}

	
	// traitement des éléments de dialogue 
	// les balises dialogue sont ignoré par le générateur de line, elle n'apparaissent plus post génération ce qui introduit des erreurs dans l'indexation des mots 
	// on corrige 
	
	var decalage = [];
	for( var i = 0 ; i < meta.length ; i ++ )
		decalage[ i ] = 0;
	
	var next;
	var start = 0;
	while(  (next = chaine.indexOf( "[" , start )) != -1 ){
		var end = chaine.indexOf( "]" , next )+1;	
		for( var i = 0 ; i < meta.length ; i ++ )
			if( meta[ i ].offset > next )
				decalage[ i ] -= next - end;
		start = end;
	}
	
	// introduit le décalage
	for( var i = 0 ; i < meta.length ; i ++ )
		meta[ i ].offset -= decalage[ i ];
	
	// genere les objets lines
	if( !font ){
		font = article.css('font-weight');
		font += " "+config.realX( cssCoordToNumber( article.css('font-size') ) )+"px";
		font += " "+article.css('font-family');
	}
	if( !width )
		width = config.realX( article.width() );
	if( !lineHeight )
		lineHeight = config.realY( cssCoordToNumber( article.css('line-height') ) );
	parent.append( generateSpeaks(chaine, font , width , lineHeight ) );
	
	// Deformat chiane
	var realchaine = chaine.replace(/\[[^\[\]]*\]/g, "");
	realchaine = realchaine.replace(/<[^<>]*>/g, "");
	
	// numerote les objets lignes
	parent.append( $("<div class=\"textLine\">") );			// on ajoute un element vide, pour pouvoir se repérer lorsque l'on place le dernier élément
	var table = [];
	var cursor = 0;
	var breakline = true;
	parent.find("div.textLine, paragraphtag").each(function(){
		var line = $( this );
		if(line.prop('tagName').toLowerCase() == "paragraphtag") {
			 table.push( { 	obj : line,
							l : 1,
        	    			ca : cursor,
        	    			cb : ( cursor = cursor + 1 ),
        	    			b : []
        	    		} );
		    breakline = true;
		}
		else {
        	var text = line.children("p").text();
        	// Line blank
        	if(text.trim().length == 0) {
        	    var size = breakline ? 1:2;
        	    table.push( { 	obj : line,
        	    				l : size,
        	    				ca : cursor,
        	    				cb : ( cursor = cursor + size ),
        	    				b : []
        	    			} );
        	    breakline = true;
        	}
        	// Line with content
        	else {
            	table.push( { 	obj : line ,
            					l : text.length,
            					ca : cursor ,
            					cb : ( cursor = cursor + text.length ),
            					b : []
            				} );
                breakline = false;
            }
		}
	});
	
		
	
	// recréer les référence vers les links ( ajout en deux temps )
	for( var i = 0 ; i < meta.length ; i ++ ){
		
		if( !meta[ i ] || !meta[ i ].valide )
			continue;
		
		var e = Math.floor( meta[ i ].offset / table[ table.length-1 ].cb * table.length );  // estimation
		
		while( meta[ i ].offset < table[ e ].ca  )    // ajustement
			e --;
		while( meta[ i ].offset >= table[ e ].cb  )	  // ajustement
			e ++;
		
		var new_obj;
		var new_index;
		var new_keyword;
		
		switch( meta[ i ].link.type ){
			case "audio" : case "wiki" :
				if( meta[ i ].format == "link" ){
					
					new_index = meta[ i ].offset - table[ e ].ca  	// relatif au debut de la ligne
					new_obj = table[ e ].obj;
					
					table[ e ].b.push( { index : new_index  , b : '<span class="'+ correspondanceClass[ meta[ i ].link.type ] +'" link="'+meta[ i ].link.id+'">' } );
					table[ e ].b.unshift( { 
						index : Math.min( new_index + meta[ i ].keyword.length , table[ e ].l ) ,  		// le span est sur une seule ligne, si le groupe de mot occupe 2 lignes,  le span sera sur le début du groupe 
						b : '</span>' 
					} );
					
				}	
			break;
			case "image" : case "game" :
				if( meta[ i ].format == "inser" ){
					
					if( table[ e ].ca == meta[ i ].offset )
						e = Math.max( 0 , e-1 );
					
					new_index = 0;
					new_obj = table[ e ].obj;
					
					var id = meta[ i ].link.id;
					var elem = srcMgr.generateChildDomElem(id, parent);
					elem.attr('id', 'obj'+(curr.objId++));
					elem.deletable(null, true)
					    .selectable(selectP)
					    .staticButton('./images/UI/insertbelow.png', insertElemDialog)
					    .staticButton('./images/UI/config.png', staticConfig)
					    .staticButton('./images/tools/anime.png', animeTool.animateObj)
					    .staticButton('./images/UI/addscript.jpg', addScriptForObj)
					    .children('.del_container').hide();
					
					elem.insertBefore( new_obj );
					
					log += meta[ i ].link.type+" "+id+" re inserée avant la ligne :\""+new_obj.children("p").text()+"\", ( il était précédement après \""+ $('#'+meta[ i ].prev_objId ).children("p").text()+"\" )\n";
				}

			break;
			case "script" :
				var lastIndex = meta[ i ].offset + meta[ i ].keyword.length;
				var lastLine = e;
				
				new_index = meta[ i ].offset - table[ e ].ca;
				
				while( lastIndex > table[ lastLine ].cb ){
					lastLine ++;
					new_index = 0;
				}
				
				new_index = 0;
				new_obj = table[ lastLine ].obj;
				new_keyword = new_obj.children("p").text().substring( new_index );
				
				scriptMgr.scripts[  meta[ i ].link.id ][   meta[ i ].link.dep  ] = new_obj.attr( "id" );
				
				log += "maintient de "+meta[ i ].link.dep+" du script "+meta[ i ].link.id+", celui ci est maintenant lié à la ligne :\""+new_obj.children("p").text()+"\", ( il était précédement lié à \""+ $('#'+meta[ i ].prev_objId ).children("p").text()+"\" )\n";
				
			break;
			case "anime" :
				var lastIndex = meta[ i ].offset + meta[ i ].keyword.length;
				var lastLine = e;
				
				new_index = meta[ i ].offset - table[ e ].ca;
				
				while( lastIndex > table[ lastLine ].cb ){
					lastLine ++;
					new_index = 0;
				}
				
				new_index = 0;
				new_obj = table[ lastLine ].obj;
				new_keyword = new_obj.children("p").text().substring( new_index );
				
				if( !meta[ i ].prev_objId ){
					console.log( "encounter error parsing the metaText, missing information relative to the previous link" );
					return;
				}
				
				var ex_id = meta[ i ].prev_objId;
				var new_id = new_obj.prop( "id" );
				
				var anim = srcMgr.getSource( meta[ i ].link.id );
				
				// change the obj id
				anim.objs[ new_id ] = { };
				for( var key in anim.objs[ ex_id ] )
					anim.objs[ new_id ][ key ] = anim.objs[ ex_id ][ key ];
				anim.objs[ new_id ].content = new_obj.children("p").text(); 
				
				// search occurence of the ex objid , replace it by the new
				for( var j = 0 ; j < anim.frames.length ; j ++ ){
					if( $.inArray( ex_id , Object.keys( anim.frames[ j ].objs )) != -1 ){
						anim.frames[ j ].objs[ new_id ] = {};
						for( var key in anim.frames[ j ].objs[ ex_id ] )
							anim.frames[ j ].objs[ new_id ][ key ] = anim.frames[ j ].objs[ ex_id ][ key ];
						delete anim.frames[ j ].objs[ ex_id ];
					}
				}
				
				delete srcMgr.getSource( meta[ i ].link.id ).objs[ ex_id ];
				
				log += "maintient de l'animation "+meta[ i ].link.id+", celle ci est maintenant lié à la ligne :\""+new_obj.children("p").text()+"\", ( il était précédement lié à \""+ $('#'+meta[ i ].prev_objId ).children("p").text()+"\" )\n";
				
			break;
		}

		// remplace avec les nouveaux index , objId et keyword
		meta[ i ].index = new_index;
		meta[ i ].objId = new_obj.prop('id');
		if( new_keyword )
			meta[ i ].keyword = new_keyword;
	}
	
	for( var e = 0 ; e < table.length ; e ++ ){
		var obj = $( table[ e ].obj ).children("p");
		if( !obj || obj.length < 1 ) 		// if its a blank textLine, there is no p balise
			continue
		var r = obj.text();
		for( var i = 0 ; i < table[ e ].b.length ; i ++ ){
				var avant = r.substring( 0 , table[ e ].b[i].index );
				var apres = r.substring( table[ e ].b[i].index );
				
				r = avant + table[ e ].b[i].b + apres;
				
				for( var j = i+1 ; j < table[ e ].b.length ; j ++ )
					if( table[ e ].b[ j ].index >  table[ e ].b[i].index )
						table[ e ].b[j].index += table[ e ].b[i].b.length;	 
		}
		obj.get(0).innerHTML = r;
	}
	
	
	//console.log( log );
	parent.children(":last").remove();
	
	return parent;
	
	
	// share chaine, ( effet de bord )
	function shiftNextBalise(){
		
		// détermine la prochaine occurence d'une balise de type link et de type inser
		if( chart.linkOpenA != chart.inserOpenA ){
			var nlin = chaine.indexOf( chart.linkOpenA , lastIndex );
			var nins = chaine.indexOf( chart.inserOpenA , lastIndex  );
		} else {
			// si les debut de balise sont les mêmes, il faut tester la fin
			// on va faire un bricolage pour rester compatible avec la suite
			var nlin = chaine.indexOf( chart.linkOpenA , lastIndex );
			
			if( nlin == -1 )
				return;
			
			var endlin = chaine.indexOf( chart.linkOpenB , nlin ) ;
			var endins = chaine.indexOf( chart.inserOpenB , nlin ) ;
			
			if( endlin <= -1 || ( endins >= 0 && endins < endlin ) ){
				nins = nlin;
				nlin = -1;
			}else 
				nins = -1;
			
		}
		var i;
		var format;
		
		if( nlin <= -1 && nins <= -1 ) {
			return false;
		}
		
		
		if( nins <= -1 || ( nlin >= 0 && nlin < nins ) ){
			
			// si la balise la plus proche est une link
			format = "link";
			
			var iboA = nlin;
			var iboB = chaine.indexOf( chart.linkOpenB , iboA )+chart.linkOpenB.length;
			
			
			var b = chaine.substring( iboA + chart.linkOpenA.length , iboB - chart.linkOpenB.length );
			i = chart.i.exec( b ) || [ null , null ] ;
			if( !i[1] ){
				console.log( "encounter error parsing the metaText, missing i" );
				return false;
			}
			var reg =  new RegExp( chart.linkCloseA+" *" + i[1] +" *.*"+chart.linkCloseB   );
			var ibfA = chaine.substring( iboA ).search( reg ); 
			if( ibfA < 0 ){
				console.log( "encounter error parsing the metaText, " );
				return false;
			}
			
			ibfA  += iboA;
			
			var ibfB = chaine.indexOf( chart.linkCloseB , ibfA )+chart.linkCloseB.length;
			
			var middle = chaine.substring(  iboB , ibfA );
			
			chaine = chaine.substring( 0 , iboA ) + middle + chaine.substring( ibfB );
			
			keyword = middle.replace( chart.all , "");
			
		} else {
			
			// la balise la plus proche est une inser
			format = "inser";
			
			var iboA = nins;
			
			var keyword = "";
			
			var iboB = chaine.indexOf( chart.inserOpenB , iboA )+chart.inserOpenB.length;
			
			var b = chaine.substring( iboA + chart.inserOpenA.length , iboB - chart.inserOpenB.length );
			
			chaine = chaine.substring( 0 , iboA ) + chaine.substring( iboB );
			
			lastIndex = iboA;
			
			i = chart.i.exec( b ) || [ null , null ] ;
			if ( !i[1] ){
				console.log( "encounter error parsing the metaText, missing i" );
				return false;
			}
		}
		
			
		var id = chart.id.exec( b ) || [ null , null ] ;
		var type = chart.type.exec( b ) || [ null , null ];
		
		return { i:parseInt( i[1] ) , type:type[1] , id:id[1] , index:iboA , keyword : keyword , format:format };
	}
}
*/

	};
}();



// Management of project =====================================

function retrieveLocalInfo(pjsave) {
    // Pages/Layers/Objects
    var obj = null;
    var maxid = 0, id = 0;
    var pageseri = pjsave.pageSeri;
    for(var pname in pageseri) {
        var page = addPage(pname);
        scriptMgr.countScripts(page.attr('id'),"page");
        var steps = 0;
        for(var sname in pageseri[pname]) {
            steps++;
            var step = $(pageseri[pname][sname]);
            page.data('StepManager').addStepWithContent(sname, step);
        }
        if(steps == 0) page.data('StepManager').addStep(pname+'default', null, true);
    }
    
    // Ressources
    var src = pjsave.sources;
    for(var key in src) {
        var type = src[key].type;
        var data = src[key].data;
        if(type == "text" || type == "obj") continue;
        else if(type == "anime") 
            data = objToClass(data, Animation);
		else if(type == "speaker"){
            data = objToClass(data, Speaker);
		}
        else if(type == "wiki") 
            data = objToClass(data, Wiki);
        srcMgr.addSource(type, data, key);
    }
    if(!isNaN(pjsave.srcCurrId)) srcMgr.currId = pjsave.srcCurrId;
    if(!isNaN(pjsave.objCurrId)) curr.objId = pjsave.objCurrId;
    //else if(!isNaN(maxid)) curr.objId = maxid+1;
    
    // Scripts
    if(pjsave.scripts) {
        for(var key in pjsave.scripts)
            pjsave.scripts[key] = objToClass(pjsave.scripts[key], Script);
        scriptMgr.addScripts( pjsave.scripts );
    }
    
    if(isNaN(pjsave.lastModif)) curr.lastModif = lastModServer;
    else curr.lastModif = pjsave.lastModif;
}

function saveToLocalStorage(name, jsonstr){
    // Save to localStorage
    localStorage.setItem(name, jsonstr);
    
    // Local storage saving management, locally store only 5 projects for example, manager all projects with a json array of their name
    var pjs = localStorage.getItem('projects');
    if(!pjs) pjs = [];
    else pjs = JSON.parse(pjs);
    var pjindex = $.inArray(name, pjs);
    // Exist already locally, slice from array and push it at the end
    if(pjindex >= 0) pjs.splice(pjindex, 1);
    pjs.push(name);
    // Too much projects in local, remove the oldest used project
    while(pjs.length > 5) {
        pjs.reverse();
        var pname = pjs.pop();
        pjs.reverse();
        localStorage.removeItem(pname);
    }
    // Restore locally
    localStorage.setItem('projects', JSON.stringify(pjs));
}

// save project
function saveProject() {
    if(!pjName) return;
    loading.show(5000);
    // Clear server ressources
    //$.get('clearSrcs.php', {'pjName':pjName, 'lang':pjLanguage}, function(msg){if(msg != "") alert(msg);});
    // Save ressources
    srcMgr.uploadSrc('upload_src.php', pjName, pjLanguage);
    scriptMgr.upload('upload_src.php', pjName, pjLanguage);

    // Save structure
    var serializer = new XMLSerializer();
    // Replace img src with relative Path on server
    var imgids = srcMgr.getImgSrcIDs();
    for(var i in imgids) {
        $(".scene img[name='"+imgids[i]+"']").attr('src', srcMgr.getSource(imgids[i]));
    }
    // Save Pages
    var struct = {};
    for(var key in pages) {
        struct[key] = {};
        steps = managers[key].steps;
        for(var i in steps) {
            var step = steps[i].clone();
            step.find('.del_container, .ctrl_pt').remove();
			step.find('.selected').removeClass('selected');
            struct[key][step.prop('id')] = serializer.serializeToString(step.get(0));
        }
    }
    var structStr = JSON.stringify(struct);
    
	// Upload structure to server
	$.post("save_project.php", {"pjName":pjName, 
	                            "lang":pjLanguage, 
	                            "struct":structStr, 
	                            "objCurrId":curr.objId, 
	                            "srcCurrId":srcMgr.currId, 
	                            "untranslated":translationTool.untranslated()
	                            }, function(msg){
            var modif = parseInt(msg);
            if(!isNaN(modif)) curr.lastModif = modif;
            else if(msg != ""){
				alert(msg);
			}
	       
            // Save local storage
            if(!localStorage) return;
            var pjsave = {};
            // Save Obj CurrID
            pjsave.objCurrId = curr.objId;
            // Save Pages
            pjsave.pageSeri = struct;
            // Save sources
            pjsave.sources = srcMgr.sources;
            pjsave.srcCurrId = srcMgr.currId;
            // Save scripts
            pjsave.scripts = scriptMgr.saveLocal();
            // Save modify time
            pjsave.lastModif = curr.lastModif;
            var pjsavestr = JSON.stringify(pjsave);
            
            saveToLocalStorage(pjName+' '+pjLanguage, pjsavestr);
            loading.hide();
        });
}
