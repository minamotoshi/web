var Cookie = {
	_prefix : "custom_",
	/**
	 *	设置前缀
	 *	@param	prefix	前缀
	 */
	setPrefix : function(prefix){
		this._prefix = prefix;
	},
	/**
	 *	设置cookie
	 *	@param	name	名称
	 *	@param	value	值
	 *	@param	expires	过期
	 */
	set : function(name, value, expires){
		var d = new Date();
		d.setTime(d.getTime() + expires * 1000);
		var str = this._prefix + name + "="+ escape (value);
		if(expires != null) str += ";expires=" + d.toGMTString();
		document.cookie = str;
	},
	/**
	 *	读取cookie
	 *	@param	name	名称
	 *	@return	值
	 */
	get : function(name){
		var arr;
		var reg = new RegExp("(^| )"+ this._prefix +name+"=([^;]*)(;|$)");
		if(arr = document.cookie.match(reg))
			return unescape(arr[2]);
		else
			return null;
	},
	/**
	 *	删除cookie
	 *	@param	name	名称
	 */
	del : function(name){
		this.set(name, null, -1);
	}
};