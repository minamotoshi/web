/****************************************************************************
*	@Copyright(c)	2016,保定无双软件
*	@desc	公共类
*	@date	2016-7-15
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	Vogso.class.js
*	@modify	null
******************************************************************************/
var Vogso = {};
Vogso.VER = "1.1.0";
/**
 *	事件
 */
Vogso.Event = function(type){
	this.type = type;
};
/**
 *	事件触发器
 */
Vogso.EventDispatcher = function(){};
/**
 *	侦听事件
 */
Vogso.EventDispatcher.prototype.addEventListener = function ( type, listener ) {
	if ( this._listeners === undefined ) this._listeners = {};
	var listeners = this._listeners;
	if ( listeners[ type ] === undefined ) {
		listeners[ type ] = [];
	}
	if ( listeners[ type ].indexOf( listener ) === - 1 ) {
		listeners[ type ].push( listener );
	}
};
Vogso.EventDispatcher.prototype.on = Vogso.EventDispatcher.prototype.addEventListener;
/**
 *	存在事件
 */
Vogso.EventDispatcher.prototype.hasEventListener = function ( type, listener ) {
	if ( this._listeners === undefined ) return false;
	var listeners = this._listeners;
	if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {
		return true;
	}
	return false;
};
/**
 *	删除事件
 */
Vogso.EventDispatcher.prototype.removeEventListener = function ( type, listener ) {
	if ( this._listeners === undefined ) return;
	var listeners = this._listeners;
	var listenerArray = listeners[ type ];
	if ( listenerArray !== undefined ) {
		var index = listenerArray.indexOf( listener );
		if ( index !== - 1 ) {
			listenerArray.splice( index, 1 );
		}
	}
};
Vogso.EventDispatcher.prototype.off = Vogso.EventDispatcher.prototype.removeEventListener;
/**
 *	发送事件
 */
Vogso.EventDispatcher.prototype.dispatchEvent = function ( event ) {
	if ( this._listeners === undefined ) return;
	var listeners = this._listeners;
	var listenerArray = listeners[ event.type ];
	if ( listenerArray !== undefined ) {
		event.target = this;
		var array = [], i = 0;
		var length = listenerArray.length;
		for ( i = 0; i < length; i ++ ) {
			array[ i ] = listenerArray[ i ];
		}
		for ( i = 0; i < length; i ++ ) {
			array[ i ].call( this, event );
		}
	}
};

