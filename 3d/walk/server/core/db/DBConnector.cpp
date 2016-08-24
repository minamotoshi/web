/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	数据连接
*	@date	2015-11-5
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	db/DBConnector.cpp
*	@modify	null
******************************************************************************/

#include "DBConnector.h"

std::string DBConnector::DEFAULT_KEY = "main";

DBConnector* DBConnector::_instance = NULL;

DBConnector::DBConnector(){
}
DBConnector::~DBConnector(){
}

DBConnector* DBConnector::getInstance(){
	if (!_instance){
		_instance = new DBConnector();
		_instance->init();
	}
	return _instance;
}
void DBConnector::destroyInstance(){
    if (_instance)
    {
        delete(_instance);
    }
}

void DBConnector::init(){
	
}
std::string DBConnector::getKey(std::string key){
	return key;
}
std::map<std::string, std::string> DBConnector::getConfig(std::string name){
	std::map<std::string, std::string> map;
	map["database"] = "rentme_db";
	map["host"] = "127.0.0.1";
	map["user"] = "rentme";
	map["passwd"] = "wushuang";
	map["port"] = "3306";
	return map;
}
Mysql* DBConnector::open(std::string name, bool new_link, bool oTeam){
	if (name == "") name = DEFAULT_KEY;
	Mysql* db;
	if(!new_link){
		//使用连接池
		std::string key = this->getKey(name);
		if (_dbPool.existKey(name)) {
			db = _dbPool[name];
			return db;
		}
	}
	std::map<std::string, std::string> config = getConfig(name);
	db = new Mysql(config["database"], config["host"], config["user"], config["passwd"], atoi(config["port"].c_str()));
	_dbPool.add(name, db);
	return db;
}
