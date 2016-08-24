/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	数据库
*	@date	2015-11-4
*	@author	minamoto
*	@E-mail	minamoto@sina.com
*	@file	core/db/Mysql.cpp
*	@modify	null
*	@detail
*	1.2增加了更新csv数据表的功能
*	@exmple	
*	Mysql* db = new Mysql(name);
*	bool res = db->query(sql);
******************************************************************************/

#include "Mysql.h"
using namespace mysqlpp;

Mysql::Mysql(){
	_con = new 	Connection(true);
	_con.set_option( new mysqlpp::SetCharsetNameOption("utf8") );
}

Mysql::Mysql(std::string database, std::string host, std::string user, std::string passwd, unsigned int port){
	_database = database;
	_host = host;
	_user = user;
	_passwd = passwd;
	_port = port;
	Mysql();
	connection();
}

Mysql::~Mysql(){
}

bool Mysql::connection(){
	_con.connect(_database.c_str(), _host.c_str(), _user.c_str(), _passwd.c_str(), _port);
}
bool Mysql::connection(std::string database, std::string host, std::string user, std::string passwd, unsigned int port){
	_database = database;
	_host = host;
	_user = user;
	_passwd = passwd;
	_port = port;
	connection();
}


int Mysql::query(std::string sql){
	Query query = _con.query(sql.c_str());
	query.exec();
	unsigned long long id = query.insert_id();
	return (int)id;
}
StoreQueryResult Mysql::getAll(std::string sql){
	Query query = _con.query(sql);
	return query.store();
}
Row Mysql::getRow(std::string sql){
	Query query = _con.query(sql);
	Row row;
	StoreQueryResult res = query.store();
	if (res) {
		row = *res.begin();
	}
	return row;
}
std::string Mysql::getOne(std::string sql){
	Query query = _con.query(sql);
	std::string str = "";
	UseQueryResult res = query.use();
	mysqlpp::Row row = res.fetch_row();
	str = (std::string)row[0];
	return str;
}
