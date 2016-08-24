/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	数据连接
*	@date	2015-11-5
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	core/db/DBConnector.h
*	@modify	null
******************************************************************************/

#ifndef __DB_CONNECTOR_H__
#define __DB_CONNECTOR_H__

#include "Mysql.h"


typedef struct dbPoolTag{
	std::vector<std::string> key;
	std::vector<Mysql*> value;
	Mysql* operator[](int k){
		return value.at(k);
	};
	Mysql* operator[](std::string k){
		int i, size = (int)key.size();
		for (i = 0; i < size; i++){
			if (key.at(i) == k){
				return value.at(i);
			}
		}
		return NULL;
	};
	void add(std::string k, Mysql* v){
		int i, size = (int)key.size();
		for (i = 0; i < size; i++){
			if (key.at(i) == k){
				value.at(i) = v;
				return;
			}
		}
		key.push_back(k);
		value.push_back(v);
	}
	bool existKey(std::string k){
		int i, size = (int)key.size();
		for (i = 0; i < size; i++){
			if (key.at(i) == k){
				return true;
			}
		}
		return false;
	}
}DBPool;

class DBConnector {
public:
	/**
	 *	初始化
	 */
	DBConnector();
	/**
	 *	析构函数，要清除有指针的内容
	 */
	virtual ~DBConnector();
	/**
	 *	初始化
	 */
	void init();
	/**
	 * 建立数据库连接
	 *
	 * @param string $name 	数据库类别名: fmworlds, ssmatch, league,bbs
	 * @param string $type	主从库标志, 'm'主库, 's'丛库
	 * @param bool	$new_link 新连接标志
	 * @param object	$oTeam	Team对象，若要访问league数据库分区必须设置该参数
	 */
	Mysql* open(std::string name = "", bool new_link = false, bool oTeam = false);
	/**
	 *	获取key
	 */
	std::string getKey(std::string);
	/**
	 *	获取配置
	 *	@param	name 配置名称
	 *	@return	配置
	 */
	std::map<std::string, std::string> getConfig(std::string name = "");
	/**
	 *	获取实例
	 */
	static DBConnector* getInstance();
	/**
	 *	销毁实例
	 */
	static void destroyInstance();
	
private:
	/**
	 *	自身
	 */
	static DBConnector* _instance;
	/**
	 *	连接池
	 */
	DBPool _dbPool;
	/**
	 *	默认key
	 */
	static std::string DEFAULT_KEY;
};

#endif // __DB_CONNECTOR_H__
