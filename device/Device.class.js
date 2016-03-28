var Device = {
	/**
	 *	版本
	 */
	VER: "1.0.1",
	/**
	 *	显示参数
	 *	@param	str	设备信息
	 */
	show : function(str){
		if(!str) str = navigator.userAgent;
		var pattern = /(\w+)\/?([a-zA-Z0-9\._]*)\s?(\([^\)]*\))?\s?/g;
		var params = new Object();
		while(arr = pattern.exec(str)){
			params[arr[1]] = arr;
		}
		return params;
	},
	/**
	 *	是否android设备
	 */
	isAndroid : function(){
		var pattern = /Android/i;
		var flag = pattern.test(navigator.userAgent);
		return flag;
	},
	/**
	 *	是否ios设备
	 */
	isIos : function(){
		var pattern = /ip(?=od|ad|hone)/i;
		var flag = pattern.test(navigator.userAgent);
		return flag;
	}
};