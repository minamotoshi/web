/****************************************************************************
*	@Copyright(c)	2016,保定无双软件
*	@desc	全景，webgl
*	@date	2016-7-22
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	js/Panorama.class.js
*	@modify	null
******************************************************************************/

var Panorama = {};
Panorama.VER = "1.0.0";
/**
 *	预先加载
 */
Panorama.Preload = {
	_queue : null,	//loder
	_images : [	//图片组
		{"src": "xima.jpg", id:"xima"}
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
 *	事件
 */
Panorama.Event = {
	ITEM_EXPIRE: "itemExpire"
};
/**
 *	枚举，类型
 */
Panorama.kType = {
	DRAG: 0,
	GRAVITY: 1
}
/**
 *	主函数
 *	@param	container	载体
 *	@param	width	宽
 *	@param	height	高
 */
Panorama.main = function(container, width, height){
	var _this = this;
	
	var __stats = null,	//	状态
		__container = null,	//html载体
		__camera = null,	//摄像头
		__scene = null,	//场景
		__renderer = null,	//渲染器
		__room = null;	//运动空间
	var _controls = null;	//控制器
	
	/**
	 *	初始化
	 */
	_this.init = function(container, width, height){
		__container = container;
		if(isNaN(width)) width = window.innerWidth;
		if(isNaN(height)) height = window.innerHeight;
		__camera = new THREE.PerspectiveCamera( 70, width / height, 1, 1000 );
		__scene = new THREE.Scene();
		__room = new THREE.Object3D();//空间
		__scene.add(__room);
		__renderer = new THREE.WebGLRenderer();
		//__renderer = new THREE.CanvasRenderer();
		__renderer.setPixelRatio( window.devicePixelRatio );
		__renderer.setSize( width, height );
		container.appendChild( __renderer.domElement );//渲染元素放入需要的位置
		animate();
	};
	/**
	 *	获取运动场mesh
	 */
	_this.setView = function(image){
		var view = new Panorama.View(image);
		__room.add(view);
	};
	/**
	 *	控制
	 */
	_this.control = function(type, limit){
		if (type == Panorama.kType.GRAVITY) {
			_controls = new THREE.DeviceOrientationControls( __camera);
		}else {
			_controls = new THREE.AntiMeshControls( __camera, __renderer.domElement, limit );
		}
	};
	/**
	 *	重定义尺寸
	 */
	_this.resize = function(width, height) {
		__camera.aspect = width / height;
		__camera.updateProjectionMatrix();
		__renderer.setSize( width, height );
	}
	/**
	 *	动画
	 */
	function animate() {
		requestAnimationFrame( animate );
		if(__stats)__stats.update();
		if(_controls)_controls.update();
		__renderer.render( __scene, __camera );
	}
	
	_this.init(container, width, height);
};

/**
 *	全景
 *	@param	image	应用的图片，720全景
 */
Panorama.View = function(image){
	var _this = this;
	
	_this.init = function(image){
		THREE.Mesh.call(_this);
		var texture = new THREE.Texture( image);
		texture.needsUpdate = true;
		var geometry = new THREE.SphereGeometry( 500, 60, 40 );
		
		var material = new THREE.MeshBasicMaterial();
		//material.side = THREE.DoubleSide;	//双面
		material.side = THREE.BackSide;	//背面
		material.map = texture;	//图片
		
		
		_this.name = "view";
		_this.geometry = geometry;
		_this.material = material;
	}
	_this.init(image);
};
Panorama.View.prototype = Object.create( THREE.Mesh.prototype );
Panorama.View.prototype.constructor = Panorama.View;

/**
 *	@desc	运动物体
 *	@author minamoto
 *	@param	object	控制的物体
 *	@param	domElement	应用事件的承载
 *	@param	limit	限制上限位置
 */

THREE.AntiMeshControls = function ( object, domElement, limit ) {

	var _this = this;
	
	var TOUCH_UNIT = 0.2;
	
	var _touchParam = {};
	var _lon = -90;
	var _lat = 0;
	var _limit = limit || 85;

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	var _movePrev = new THREE.Vector2();
	var _moveCurr = new THREE.Vector2();

	this.update = function () {
		_lat = Math.max( - _limit, Math.min( _limit, _lat ) );
		var phi = THREE.Math.degToRad( 90 - _lat );
		var theta = THREE.Math.degToRad( _lon );

		var target = new THREE.Vector3();
		target.x = Math.sin( phi ) * Math.cos( theta );
		target.y = Math.cos( phi );
		target.z = Math.sin( phi ) * Math.sin( theta );
		//this.object.rotation.y = -theta;
		this.object.lookAt( target );
	};

	this.reset = function () {

	};
	function touchstart ( e ) {
		e.preventDefault();
		var touch = e.touches[ 0 ];
		_touchParam.x = touch.screenX;
		_touchParam.y = touch.screenY;
	}
	function touchend( e ) {
		e.preventDefault();
	}
	function touchmove ( e ) {
		e.preventDefault();
		var touch = e.touches[ 0 ];
		_lon -= ( touch.screenX - _touchParam.x ) * TOUCH_UNIT;
		_lat += ( touch.screenY - _touchParam.y ) * TOUCH_UNIT;
		_touchParam.x = touch.screenX;
		_touchParam.y = touch.screenY;
	}
	function mousewheel ( event ) {
		console.log(event);
	}
	function mousedown ( event ) {
		event.preventDefault();
		event.stopPropagation();
		document.addEventListener( 'mousemove', mousemove, false );
		document.addEventListener( 'mouseup', mouseup, false );
	}
	function mousemove ( event ) {
		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		_lon -= movementX * TOUCH_UNIT;
		_lat += movementY * TOUCH_UNIT;
	}
	function mouseup ( event ) {
		document.removeEventListener( 'mousemove', mousemove );
		document.removeEventListener( 'mouseup', mouseup );
	}
	function contextmenu( event ) {
		event.preventDefault();
	}
	
	this.dispose = function() {
		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', mousedown, false );
		this.domElement.removeEventListener( 'mousewheel', mousewheel, false );

		this.domElement.removeEventListener( 'touchstart', touchstart, false );
		this.domElement.removeEventListener( 'touchend', touchend, false );
		this.domElement.removeEventListener( 'touchmove', touchmove, false );

		document.removeEventListener( 'mousemove', mousemove, false );
		document.removeEventListener( 'mouseup', mouseup, false );

	};
	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
	this.domElement.addEventListener( 'mousedown', mousedown, false );
	this.domElement.addEventListener( 'mousewheel', mousewheel, false );

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );
	
	this.update();

};

THREE.AntiMeshControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.AntiMeshControls.prototype.constructor = THREE.AntiMeshControls;

/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( object ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	this.alpha = 0;
	this.alphaOffsetAngle = 0;


	var onDeviceOrientationChangeEvent = function( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function() {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function() {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler ); // orient the device

			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};

	this.update = function() {

		if ( scope.enabled === false ) return;

		var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffsetAngle : 0; // Z
		var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
		var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
		this.alpha = alpha;

	};

	this.updateAlphaOffsetAngle = function( angle ) {

		this.alphaOffsetAngle = angle;
		this.update();

	};

	this.dispose = function() {

		this.disconnect();

	};

	this.connect();

};
