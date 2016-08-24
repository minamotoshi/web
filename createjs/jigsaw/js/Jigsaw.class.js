/****************************************************************************
*	@Copyright(c)	2016,保定无双软件
*	@desc	拼图
*	@date	2016-7-15
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	js/Jigsaw.class.js
*	@modify	null
******************************************************************************/
Jigsaw = {};
Jigsaw.VER = "1.5.2";

/**
 *	预先加载
 */
Jigsaw.Preload = {
	_queue : null,	//loder
	_images : [	//图片组
		{id:"game", src:"cloth.jpg"}
	],
	/**
	 *	初始化
	 */
	init : function(){
		this._queue = new createjs.LoadQueue(true);
		this._queue.loadManifest(this._images, false, "images/");
	},
	/**
	 *	加载
	 */
	load : function(progress, complete){
		if(progress)this._queue.on("progress", progress, this);//资源载入中
		if(complete)this._queue.on("complete", complete, this);//资源载入完毕
		this._queue.load();
	},
	/**
	 *	获取loader
	 */
	getQueue : function(){
		return this._queue;
	},
	/**
	 *	获取文件实体
	 */
	getResult : function(id){
		return this._queue.getResult(id);
	}
};
/**
 *	主类，继承create.Stage
 *	@param	canvas	主体或者名称
 */
Jigsaw.main = function(canvas){
	var _this = this;
	_this.Stage_constructor(canvas);//继承stage
	
	var FPS = 60;	//帧频
	
	var __game = null;	//游戏载体

	var _data = [],	//数据
		_row = 3,
		_col = 3;
		
	/**
	 *	游戏初始化
	 */
	_this.init = function(){
		createjs.Ticker.setFPS = FPS;	//帧频
		createjs.Ticker.addEventListener('tick', _this);	//按照帧频更新舞台
		createjs.Touch.enable(_this);	//启用tauch
		__game = new createjs.Container();
		_this.addChild(__game);
	};
	/**
	 *	游戏开始
	 */
	_this.start = function(img){
		var width = Math.floor(img.width / _col);
		var height = Math.floor(img.height / _row);
		var bg = new createjs.Bitmap();
		bg.alpha = 0.5;
		bg.image = img;
		__game.addChild(bg);
		var blocks = new createjs.Container();
		blocks.name = "blocks";
		__game.addChild(blocks);
		for(var j = 0; j < _row; j++){
			for(var i = 0; i < _col; i++){
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext("2d").drawImage(img, i*width, j*height, width, height, 0, 0, width, height);
				var block = new Jigsaw.Block(canvas, j, i);
				block.name = "b-" + i + "-" + j;
				block.relocate(true);
				blocks.addChild(block);
			}
		}
		_this.upset();
		var evt = new createjs.Event(Jigsaw.Event.START);
		_this.dispatchEvent(evt);
	};
	/**
	 *	打乱
	 */
	_this.upset = function (){
		var blocks = __game.getChildByName("blocks");
		for(var k in blocks.children){
			if(isNaN(k)) continue;
			var block = blocks.children[k];
			block.borderShow();
			block.on(Jigsaw.Event.BLOCK_DRAG_START, dragStart);
			block.on(Jigsaw.Event.BLOCK_DRAG_END, dragEnd);
			block.on(Jigsaw.Event.BLOCK_BINGO, blockBingo);
		}
		var len = blocks.numChildren;
		for(var n = 0; n< 10; n++){
			var index1 = Math.floor(Math.random() * len);
			var index2 = Math.floor(Math.random() * len);
			swipeMove(blocks.getChildAt(index1), blocks.getChildAt(index2), true);
		}
	};
	/**
	 *	游戏结束
	 */
	_this.over = function(){
		var blocks = __game.getChildByName("blocks");
		for(var k in blocks.children){
			if(isNaN(k)) continue;
			var block = blocks.children[k];
			block.borderHide();
			block.relocate(true);
		}
	}
	/**
	 *	检测
	 */
	_this.check = function(){
		var blocks = __game.getChildByName("blocks");
		var bingo = true;
		for(var k in blocks.children){
			if(isNaN(k)) continue;
			var block = blocks.children[k];
			if(!block.isCorrect()){
				bingo = false;
				break;
			}
		}
		return bingo;
	};
	/**
	 *	拖动开始
	 */
	function dragStart(e){
		var block = e.currentTarget;
		var blocks = __game.getChildByName("blocks");
		blocks.setChildIndex(block, blocks.numChildren - 1);
	}
	/**
	 *	block松开事件，启用交换
	 */
	function dragEnd(e){
		var x = e.data.x,
			y = e.data.y;
		var blockDragged = e.currentTarget;
		var blocks = __game.getChildByName("blocks");
		for(var k in blocks.children){
			if(isNaN(k)) continue;
			var block = blocks.children[k];
			if(block.hit(x, y)){
				swipeMove(blockDragged, block);
				return;
			}
		}
		blockDragged.relocate();
	}
	/**
	 *	交换
	 *	@param	dragged
	 *	@param	stroked
	 */
	function swipeMove(dragged, stroked, strict){
		var row = dragged.getRow();
		var col = dragged.getCol();
		dragged.setRow(stroked.getRow());
		dragged.setCol(stroked.getCol());
		stroked.setRow(row);
		stroked.setCol(col);
		if(strict){
			dragged.relocate(true);
			stroked.relocate(true);
			return;
		}
		var blocks = __game.getChildByName("blocks");
		blocks.setChildIndex(stroked, blocks.numChildren - 1);
		dragged.relocate();
		stroked.relocate(false, 500);
	}
	/**
	 *	block正确
	 */
	function blockBingo(e){
		if(_this.check()){
			_this.over();
			var evt = new createjs.Event(Jigsaw.Event.BINGO);
			_this.dispatchEvent(evt);	
		}
	}
	
	this.init();
};
Jigsaw.main.prototype = createjs.extend(Jigsaw.main, createjs.Stage);
Jigsaw.main = createjs.promote(Jigsaw.main, "Stage");

Jigsaw.Event = {
	START:	"gameStart",
	OVER:	"gameOver",
	BINGO:	"gameBingo",
	BLOCK_DRAG_START:	"blockDragStart",
	BLOCK_DRAG_END:	"blockDragEnd",
	BLOCK_BINGO:	"blockBingo"
};
/**
 *	单独块
 *	@param	image	图片
 *	@param	row	行
 *	@param	col	列
 */
Jigsaw.Block = function(image, row, col){
	var _this = this;
	_this.Container_constructor();	//构造
	
	var _width = 0,	//宽高
		_height = 0;
	var _x = 0,	//元素鼠标位置
		_y = 0;
	var _row = 0,//现在所在行
		_col = 0;//现在所在列
	var _correctRow = 0,//正确的行
		_correctCol = 0;//正确的列
	var _dragging = false;	//正在拖动
	var RELOCATE_DURATION = 100;	//运动间隔
	var INCREASE = 0.1;	//增幅
	/**
	 *	初始化
	 */
	_this.init = function(image, row, col){
		_width = image.width;
		_height = image.height;
		var bit = new createjs.Bitmap();
		bit.image = image;
		_row = _correctRow = row;
		_col = _correctCol = col;
		var shape = new createjs.Shape();
		shape.name = "border";
		shape.graphics.beginStroke("#00ffff").drawRect(0, 0, _width, _height);
		_this.addChild(bit, shape);
		_this.borderShow();
	};
	/**
	 *	边框显示
	 */
	_this.borderShow = function(){
		_this.getChildByName("border").visible = true;
		_this.on("mousedown", mousedown);
		_this.on("pressmove", pressmove);
		_this.on("pressup", pressup);
	};
	/**
	 *	边框隐藏
	 */
	_this.borderHide = function(){
		_this.getChildByName("border").visible = false;
		_this.removeAllEventListeners();
	};
	/**
	 *	根据行列重定位置
	 *	@param	strict	直接变化
	 *	@param	duration	间隔
	 */
	_this.relocate = function(strict, duration){
		if(strict){
			_this.x = _col * _width;
			_this.y = _row * _height;
			_this.scaleX = _this.scaleY = 1.0;
		}else{
			if(!duration) duration = RELOCATE_DURATION;
			createjs.Tween.get(_this, {override:true})
				.to({x:_col * _width, y:_row * _height, scaleX:1.0, scaleY:1.0}, duration, createjs.Ease.sineInOut)
				.call(relocateEnd);
		}
	};
	/**
	 *	定位完毕
	 *	@param	e
	 */
	function relocateEnd(e){
		if(_this.isCorrect()){ 
			var evt = new createjs.Event(Jigsaw.Event.BLOCK_BINGO);
			_this.dispatchEvent(evt);
		}
	}
	/**
	 *	设置行
	 *	@param	row
	 */
	_this.setRow = function(row){
		_row = row;
	};
	/**
	 *	设置列
	 *	@param	col
	 */
	_this.setCol = function(col){
		_col = col;
	};
	/**
	 *	获取行
	 *	@param	row
	 */
	_this.getRow = function(row){
		return _row;
	};
	/**
	 *	设置列
	 *	@param	col
	 */
	_this.getCol = function(col){
		return _col;
	};
	/**
	 *	是否正确
	 */
	_this.isCorrect = function(){
		return _row == _correctRow && _col == _correctCol;
	};
	/**
	 *	是否拖动中
	 */
	_this.isDragging = function(){
		return _dragging;
	};
	/**
	 *	碰撞检测
	 */
	_this.hit = function(x, y){
		if(_dragging) false;
		var p = this.globalToLocal(x, y);
		return _this.hitTest(p.x, p.y);
	};
	/**
	 *	鼠标按下
	 */
	function mousedown(e){
		e.preventDefault();
		e.stopPropagation();
		_this.scaleX = _this.scaleY = 1 + INCREASE;
		var offsetX = _width * INCREASE / 4;
		var offsetY = _height * INCREASE / 4;
		_this.x -= offsetX;
		_this.y -= offsetY;
		_dragging = true;
		var p = _this.globalToLocal(e.stageX, e.stageY);
		_x = p.x + offsetX;
		_y = p.y + offsetY;
		var evt = new createjs.Event(Jigsaw.Event.BLOCK_DRAG_START);
		evt.data = {x:e.stageX, y:e.stageY};
		_this.dispatchEvent(evt);
	}
	/**
	 *	按下拖动
	 */
	function pressmove(e){
		e.preventDefault();
		e.stopPropagation();
		_this.x = e.stageX - _x;
		_this.y = e.stageY - _y;
	}
	/**
	 *	鼠标抬起
	 */
	function pressup(e){
		_dragging = false;
		var evt = new createjs.Event(Jigsaw.Event.BLOCK_DRAG_END);
		evt.data = {x:e.stageX, y:e.stageY};
		this.dispatchEvent(evt);
	}
	_this.init(image, row, col);
};
Jigsaw.Block.prototype = createjs.extend(Jigsaw.Block, createjs.Container);
Jigsaw.Block = createjs.promote(Jigsaw.Block, "Container");


(function(){
	"use strict";
	var _this = null;
	/**
	 *	单独小块
	 */
	function Block(image){
		this.Container_constructor();
		this.init(image);
	}
	var p = createjs.extend(Block, createjs.Container);
	p.width = 0;//宽
	p.height = 0;//高
	p._x = 0;//元素鼠标x位置
	p._y = 0;//元素鼠标y位置
	p.row = 0;//现在所在行
	p.col = 0;//现在所在列
	p.correctRow = 0;//正确的行
	p.correctCol = 0;//正确的列
	p._dragging = false;
	/**
	 *	初始化
	 *	@param	image	图片数据
	 */
	p.init = function(image){
		this.width = image.width;
		this.height = image.height;
		var bit = new createjs.Bitmap();
		bit.image = image;
		var shape = new createjs.Shape();
		shape.name = "border";
		shape.graphics.beginStroke("#00ffff").drawRect(0, 0, this.width, this.height);
		this.addChild(bit, shape);
		this.borderShow();
	};
	/**
	 *	边框显示
	 */
	p.borderShow = function(){
		this.getChildByName("border").visible = true;
		this.on("mousedown", mousedown);
		this.on("pressmove", pressmove);
		this.on("pressup", pressup);
	};
	/**
	 *	边框隐藏
	 */
	p.borderHide = function(){
		this.getChildByName("border").visible = false;
		this.removeAllEventListeners();
	};
	/**
	 *	根据行列重定位置
	 */
	p.relocate = function(strict, duration){
		if(strict){
			this.x = this.col * this.width;
			this.y = this.row * this.height;
			this.scaleX = this.scaleY = 1.0;
		}else{
			if(!duration) duration = 100;
			createjs.Tween.get(this, {override:true}).to({x:this.col * this.width, y:this.row * this.height, scaleX:1.0, scaleY:1.0}, duration, createjs.Ease.sineInOut);
		}
	};
	/**
	 *	是否拖动中
	 */
	p.isDragging = function(){
		return this._dragging;
	};
	/**
	 *	碰撞检测
	 */
	p.hit = function(x, y){
		var point = this.globalToLocal(x, y);
		return this.hitTest(point.x, point.y);
	};
	/**
	 *	鼠标按下
	 */
	function mousedown(e){
		e.preventDefault();
		e.stopPropagation();
		var block = e.currentTarget;
		block.scaleX = block.scaleY = 1.1;
		block.x -= block.width * 0.05;
		block.y -= block.height * 0.05;
		block._dragging = true;
		var pt = block.globalToLocal(e.stageX, e.stageY);
		block._x = pt.x;
		block._y = pt.y;
		var evt = new createjs.Event(Jigsaw.Event.BLOCK_DRAG_START);
		evt.data = {x:e.stageX, y:e.stageY};
		this.dispatchEvent(evt);
	}
	/**
	 *	按下拖动
	 */
	function pressmove(e){
		e.preventDefault();
		e.stopPropagation();
		var block = e.currentTarget;
		block.x = e.stageX - block._x;
		block.y = e.stageY - block._y;
	}
	/**
	 *	鼠标抬起
	 */
	function pressup(e){
		var block = e.currentTarget;
		block._dragging = false;
		var evt = new createjs.Event(Jigsaw.Event.BLOCK_DRAG_END);
		evt.data = {x:e.stageX, y:e.stageY};
		this.dispatchEvent(evt);
	}
	//Jigsaw.Block = createjs.promote(Block, "Container");
})();
