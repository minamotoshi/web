var Device = {
	/**
	 *	版本
	 */
	VER: "1.0.1",
	/**
	 *	显示参数
	 *	@param	str	设备信息
	 */
	show: function(str){
		if(!str) str = navigator.userAgent;
		var pattern = /(\w+)\/?([a-zA-Z0-9\._]*)\s?(\([^\)]*\))?\s?/g;
		var params = new Object();
		while(arr = pattern.exec(str)){
			params[arr[1]] = arr;
		}
		return params;
	},
	getAndroidVer: function(){
		var pattern = /Android\s?([a-zA-Z0-9\._]){1,}[;]\s/i;
		var arr = pattern.exec("Mozilla/5.0 (Linux; U; Android 4.3; zh-cn; SM-N9008V Build/JSS15J) AppleWebKit/533.1 (KHTML, like Gecko)Version/4.0 MQQBrowser/5.4 TBS/025489 Mobile Safari/533.1 MicroMessenger/6.3.9.48_refecd3e.700 NetType/WIFI Language/zh_CN");
		console.log(arr);
		return arr;
	},
	/**
	 *	是否android设备
	 */
	isAndroid: function(){
		var pattern = /Android/i;
		var flag = pattern.test(navigator.userAgent);
		return flag;
	},
	/**
	 *	是否ios设备
	 */
	isIos: function(){
		var pattern = /ip(?=od|ad|hone)/i;
		var flag = pattern.test(navigator.userAgent);
		return flag;
	}
};