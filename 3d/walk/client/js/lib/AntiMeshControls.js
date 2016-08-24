/**
 * @author minamoto
 */

THREE.AntiMeshControls = function ( object, domElement ) {

	var _this = this;
	
	var TOUCH_UNIT = 0.2;
	
	var _touchParam = {};
	var _lon = -90;
	var _lat = 0;

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	var _movePrev = new THREE.Vector2();
	var _moveCurr = new THREE.Vector2();

	this.update = function () {
		_lat = Math.max( - 85, Math.min( 85, _lat ) );
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
