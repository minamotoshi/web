/****************************************************************************
*	@Copyright(c)	2016,保定无双软件
*	@desc	步行
*	@date	2016-8-10
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	js/Walk.class.js
*	@modify	null
******************************************************************************/
var Walk = {};
Walk.VER = "1.0.0";
/**
 *	枚举，类型
 */
Walk.kType = {
	DRAG: 0,
	GRAVITY: 1
};
Walk.kGeometry = {
	BOX: 0,	//方块
	CONE: 1,	//圆锥
	CYLINDER: 2,	//圆柱
	OCTAHEDRON: 3,	//八面体
	SPHERE: 4	//球体
};
/**
 *	预先加载
 */
Walk.Preload = {
	_queue : null,	//loder
	_images : [	//图片组
		//
		{id:"bg", src:"grasslight-big.jpg"},
		{id:"caoshuai", src:"caoshuai.jpg"},
		{id:"yalei", src:"yalei.jpg"},
		{id:"weisen", src:"weisen.jpg"},
		{id:"ruixiang", src:"ruixiang.jpg"},
		{id:"dandan", src:"dandan.jpg"},
		{id:"yarong", src:"yarong.jpg"},
		{id:"huxing", src:"huxing.jpg"},
		{id:"zhangzhen", src:"zhangzhen.jpg"},
		{id:"yajiao", src:"yajiao.jpg"},
		{id:"yufei", src:"yufei.jpg"}
	],
	_sounds : [	//声音
	],
	/**
	 *	初始化
	 */
	init : function(){
		this._queue = new createjs.LoadQueue(true);
		this._queue.loadManifest(this._images, false, "images/");
		//this._queue.loadManifest(this._sounds, false, "sounds/");
		createjs.Sound.registerSounds(this._sounds);
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

Walk.main = function(container){
	var _this = this;
	
	var __stats = null,//	状态
		__camera = null,	//摄像头
		__scene = null,	//场景
		__renderer = null;	//渲染器
	var __my = null,	//自己
		__personRoom = null,	//人员空间
		__light = null,	//灯光
		__bg = null;	//背景
	var _persons = [];	//人员
	var _casters = [];	//碰撞物体
	var _controls = null;//控制器
	
	var _socket = null;	//socket
	var HOST = "121.40.39.51",
		PORT = "8843";
		
	/**
	 *	初始化
	 */
	_this.init = function(container){
		__camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		
		__scene = new THREE.Scene();
		__scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
		__personRoom = new THREE.Object3D();
		__scene.add(__personRoom);
		
		__light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
		__light.position.set( 0.5, 1, 0.75 );
		__scene.add( __light );
		
		__renderer = new THREE.WebGLRenderer();
		__renderer.setClearColor( 0xffffff );
		__renderer.setPixelRatio( window.devicePixelRatio );
		__renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( __renderer.domElement );//渲染元素放入需要的位置
		__stats = new Stats();
		container.appendChild( __stats.dom );
		window.addEventListener( 'resize', onWindowResize, false );
		animate();
	};
	/**
	 *	连接
	 */
	_this.socketConnect = function(host, port){
		try{
			_socket = new WebSocket("ws://" + host + ":" + port);
		}catch(e){
			alert("Error while connect:" + e);
			return;
		}
		_socket.addEventListener("open", socketConnected);
		_socket.addEventListener("close", socketDisconnected);
		_socket.addEventListener("error", socketError);
		_socket.addEventListener("message", socketMessage);
	};
	/**
	 *	连接
	 */
	function socketConnected(e){
		console.log(e);
		var obj = new Object();
		obj.code = 110101;
		obj.data = __my.getName();
		obj.uid  = __my.getUid();
		_socket.send(JSON.stringify(obj));
	}
	/**
	 *	断开
	 */
	function socketDisconnected(e){
		console.log(e);
	}
	/**
	 *	错误
	 */
	function socketError(e){
		console.log(e);
	}
	/**
	 *	消息
	 */
	function socketMessage(e){
		console.log(e);
		var str = e.data;
		var obj = JSON.parse(str);
		var msg = "";
		var code = parseInt(obj["code"]);
		switch (code) {
			case 120101:
				otherEnter(obj["data"]);
			break;
			case 120301:
				otherTalk(obj["data"]);
			break;
			case 120401:
				otherMove(obj["data"]);
			break;
		}
	}
	/**
	 *	别人进入
	 */
	function otherEnter(obj){
		var user = obj["user"];
		var content = obj["content"];
		if(user["uid"] == __my.getUid()){
			for(var k in obj.list){
				if(isNaN(k)) continue;
				if(obj.list[k]["uid"] == __my.getUid())continue;
				addPerson(obj.list[k]["uid"], obj.list[k]["name"]);
			}
			return;
		}
		addPerson(obj["user"]["uid"], obj["user"]["name"]);
	}
	/**
	 *	别人说话
	 */
	function otherTalk(obj){
		var user = obj["user"];
		var content = obj["content"];
		var person = getPersonByUid(user["uid"]);
		if(person){
			person.talk(content);
		}
	}
	/**
	 *	别人移动
	 */
	function otherMove(obj){
		var user = obj["user"];
		var x = obj["x"];
		var y = obj["y"];
		if(user["uid"] == __my.getUid()){
			return;
		}
		var person = getPersonByUid(user["uid"]);
		if(person){
			console.log(person.getName(), x, y);
			person.move(x, y);
		}
	}
	/**
	 *	开始
	 */
	_this.start = function(name, geometry, head){
		__camera.position.y = 20;
		__bg = new Walk.Background();
		_casters = __bg.getCaster();
		__scene.add(__bg);
		__my = new Walk.Person();
		__my.setUid(Math.floor(new Date().getTime() % 100000));
		__personRoom.add(__my);
		if(head)__my.setHead(head);
		if(name)__my.setName(name);
		if(geometry)__my.setGeometry(geometry);
		//_this.control();
		__renderer.domElement.addEventListener("click", bgLocation);
		__renderer.domElement.addEventListener("touchend", bgLocation);
		_this.socketConnect(HOST, PORT);
	};
	_this.getPerson = function(){
		return __personRoom.children;
	}
	/**
	 *	通过uid获取人员
	 */
	function getPersonByUid(uid){
		for(var k in __personRoom.children){
			if(isNaN(k)) continue;
			var person = __personRoom.children[k];
			if(person.getUid() == uid){
				return person;
			}
		}
		return false;
	}
	/**
	 *	添加人员
	 */
	function addPerson(uid, name, geometry, head){
		var person = new Walk.Person();
		__personRoom.add(person);
		person.setUid(uid);
		person.setName(name);
		//person.setGeometry(geometry);
	}
	/**
	 *	说话
	 */
	_this.talk = function(str){
		var obj = new Object();
		obj.code = 110301;
		obj.data = {
			content : str
		};
		_socket.send(JSON.stringify(obj));
		__my.talk(str);
	}
	/**
	 *	控制
	 */
	_this.control = function(type, limit){
		if (type == Walk.kType.GRAVITY) {
			_controls = new THREE.DeviceOrientationControls( __camera);
		}else {
			_controls = new THREE.AntiMeshControls( __camera, __renderer.domElement, limit );
		}
	};
	/**
	 *	背景定位
	 */
	function bgLocation(e){
		var x = e.clientX||e.changedTouches[0].clientX;
		var y = e.clientY||e.changedTouches[0].clientY;
		var intersect = hitTest(x, y);
		if(intersect){
			__my.move(intersect.point.x, intersect.point.z);
			var obj = new Object();
			obj.code = 110401;
			obj.data = {
				x : intersect.point.x,
				y : intersect.point.z
			};
			_socket.send(JSON.stringify(obj));
		}
	}
	/**
	 *	碰撞检测
	 */
	function hitTest(x, y){
		// update the mouse variable
		var mouse = { x: 0, y: 0 };
		mouse.x = ( x / __renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( y / __renderer.domElement.clientHeight ) * 2 + 1;
		var raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( mouse, __camera );
		var intersects = raycaster.intersectObjects( _casters, false);
		if ( intersects.length > 0 ){
			return intersects[0];
		}
		return false;
	}
	/**
	 *	页面重置
	 */
	function onWindowResize() {
		__camera.aspect = window.innerWidth / window.innerHeight;
		__camera.updateProjectionMatrix();
		__renderer.setSize( window.innerWidth, window.innerHeight );
	}
	/**
	 *	动画
	 */
	function animate() {
		requestAnimationFrame( animate );
		if(__stats)__stats.update();
		if(_controls)_controls.update();
		if(__my){
			for(var k in __personRoom.children){
				if(isNaN(k)) continue;
				__personRoom.children[k].update();
			}
			__camera.lookAt(__my.position);
		}
		__renderer.render( __scene, __camera );
	}
	_this.init(container);
};

Walk.main.prototype.constructor = Walk.main;


/**
 *	背景
 *	@param
 */
Walk.Background = function(){
	var _this = this;
	var _caster = [];
	/**
	 *	初始化
	 */
	_this.init = function(){
		THREE.Object3D.call(_this);
		var floor = createFloor();
		_caster.push(floor);
		_this.add(floor);
	};
	/**
	 *	获取点击物体
	 */
	_this.getCaster = function(){
		return _caster;
	};
	/**
	 *	创造地板
	 */
	function createFloor(){
		var geometry = new THREE.PlaneGeometry( 200, 200, 1, 1 );
		geometry.rotateX( - Math.PI / 2 );	
		var material = new THREE.MeshBasicMaterial();
		var texture = new THREE.Texture( Walk.Preload.getResult("bg"));
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 20, 20 );
		texture.needsUpdate = true;
		material.map = texture;
		var mesh = new THREE.Mesh( geometry, material );
		return mesh;	
	}
	_this.init();
};
Walk.Background.prototype = Object.create( THREE.Object3D.prototype );
Walk.Background.prototype.constructor = Walk.Background;



/**
 *	人物
 *	@param
 */
Walk.Person = function(){
	var _this = this;
	var _uid = 0,	//用户id
		_name = '游客';	//姓名
	var _body = null;//身体
	var LENGTH = 10,	//长宽高
		WIDTH = 10,
		HEIGHT = 10,
		SEGMENTS = 30;	//横截面
	var FONT_SIZE = 12,
		FONT_FAMILY = "Georgia";
	var NAME_Y = 15,
		TALK_Y = 20;
	var _targetX = 0,	//目标位置
		_targetY = 0;
	var SPEED = 1;	//速度
	/**
	 *	初始化
	 */
	_this.init = function(){
		THREE.Object3D.call(_this);
		var geometry = new THREE.BoxGeometry( LENGTH, WIDTH, HEIGHT );
		var material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
		_body = new THREE.Mesh( geometry, material );
		_body.position.y = HEIGHT/2;
		_this.add(_body);
		_targetX = _this.position.x;
		_targetY = _this.position.z;
		//if(image) _this.setHead(image);
		//_this.setName("源尼玛");
		//_this.setGeometry(1);
	};
	/**
	 *	设置uid
	 */
	_this.setUid = function(uid){
		_uid = uid;
	};
	/**
	 *	获取uid
	 */
	_this.getUid = function(){
		return _uid;
	};
	/**
	 *	设置姓名
	 */
	_this.setName = function(name){
		_name = name;
		var c = document.createElement('canvas');
		c.width = FONT_SIZE * (name.length + 1);
		c.height = FONT_SIZE * 3/2;
		var ctx=c.getContext("2d");
		ctx.fillStyle="#ffffff";
		ctx.fillRect(0,0,c.width,c.height);
		ctx.font = FONT_SIZE + "px " + FONT_FAMILY;
		ctx.fillStyle="#000000";
		ctx.fillText(name,FONT_SIZE*0.5,FONT_SIZE);
		var data = c.toDataURL("image/png", 1);
		var img = new Image();
		img.src = data;
		var texture = new THREE.Texture( img);
		texture.needsUpdate = true;
		var material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: true } );
		var sprite = new THREE.Sprite( material );
		sprite.scale.x = c.width /5;
		sprite.scale.y = c.height / 5;
		sprite.position.y = NAME_Y;
		_this.add(sprite);
	};
	_this.getName = function(){
		return _name;
	};
	/**
	 *	设置头像
	 */
	_this.setHead = function(image){
		var texture = new THREE.Texture( image);
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;
		texture.needsUpdate = true;
		_body.material.map = texture;
	};
	/**
	 *	设置几何体
	 */
	_this.setGeometry = function(type){
		type = parseInt(type);
		console.log(type);
		var geometry = null;
		switch (type) {
			case Walk.kGeometry.BOX:
				geometry = new THREE.BoxGeometry( LENGTH, WIDTH, HEIGHT );
			break;
			case Walk.kGeometry.CONE:
				geometry = new THREE.ConeGeometry( WIDTH/2, HEIGHT, SEGMENTS);
			break;
			case Walk.kGeometry.CYLINDER:
				geometry = new THREE.CylinderGeometry( WIDTH/2, WIDTH/2, HEIGHT, SEGMENTS );
			break;
			case Walk.kGeometry.OCTAHEDRON:
				geometry = new THREE.OctahedronGeometry( WIDTH/2, 0 );
			break;
			case Walk.kGeometry.SPHERE:
				geometry = new THREE.SphereGeometry( WIDTH/2, SEGMENTS, SEGMENTS );
			break;
			default:
				geometry = new THREE.BoxGeometry( LENGTH, WIDTH, HEIGHT );
			break;
		}
		_body.geometry = geometry;
	}
	/**
	 *	说话
	 */
	_this.talk = function(str){
		var old = _this.getObjectByName("talk");
		if(old)_this.remove(old);
		var c = document.createElement('canvas');
		c.width = FONT_SIZE * (str.length + 1);
		c.height = FONT_SIZE * 3/2;
		var ctx=c.getContext("2d");
		ctx.fillStyle="#0000ff";
		ctx.fillRect(0,0,c.width,c.height);
		ctx.font = FONT_SIZE + "px " + FONT_FAMILY;
		ctx.fillStyle="#ff0000";
		ctx.fillText(str,FONT_SIZE*0.5,FONT_SIZE);
		var data = c.toDataURL("image/png", 1);
		var img = new Image();
		img.src = data;
		var texture = new THREE.Texture( img);
		texture.needsUpdate = true;
		var material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: true } );
		var sprite = new THREE.Sprite( material );
		sprite.scale.x = c.width /5;
		sprite.scale.y = c.height / 5;
		sprite.position.y = TALK_Y;
		sprite.name = "talk";
		_this.add(sprite);
	};
	/**
	 *	改变位置
	 */
	_this.move = function(x, y, strick){
		if(strick){
			_this.position.x = x;
			_this.position.z = y;
		}else{
			_targetX = x;
			_targetY = y;
		}
	};
	/**
	 *	更新
	 */
	_this.update = function(){
		var x = _this.position.x;
		var y = _this.position.z;
		if(Math.abs(_targetX - x) < 1 && Math.abs(_targetY - y) < 1){
			_this.position.x = _targetX;
			_this.position.z = _targetY;
		}else{
			var radian = Math.atan2(_targetY - y, _targetX - x);
			_this.position.x = x + SPEED * Math.cos(radian);
			_this.position.z = y + SPEED * Math.sin(radian);
		}
	};
	_this.init();
};
Walk.Person.prototype = Object.create( THREE.Object3D.prototype );
Walk.Person.prototype.constructor = Walk.Person;
