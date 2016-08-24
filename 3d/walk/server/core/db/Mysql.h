/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	数据库
*	@date	2015-11-4
*	@author	minamoto
*	@E-mail	minamoto@sina.com
*	@file	core/db/Mysql.h
*	@modify	null
*	@detail
*	1.2增加了更新csv数据表的功能
*	@exmple	
*	Mysql* db = new Mysql(name);
*	bool res = db->query(sql);
******************************************************************************/
#ifndef __DB_MYSQL_H__
#define __DB_MYSQL_H__

#include <map>
#include <mysql++/mysql++.h>

class Mysql {
public:
	/**
	 *	构造
	 */
	Mysql();
	Mysql(std::string database, std::string host, std::string user, std::string passwd, unsigned int port);
	/**
	 *	析构函数，要清除有指针的内容
	 */
	virtual ~Mysql();
	/**
	 *	初始化
	 */
	void init();
	/**
	 *	链接
	 *	@param	database	数据库
	 *	@param	host	域名
	 *	@param	user	用户名
	 *	@param	passwd	密码
	 *	@param	port	端口
	 *	@return	结果
	 */
	bool connection();
	bool connection(std::string database, std::string host, std::string user, std::string passwd, unsigned int port);
	/**
	 *	执行sql
	 *	@param	sql
	 *	@return	执行结果
	 */
	int query(std::string sql);
	/**
	 *	获取刚刚插入的id
	 */
	int insertID();
	/**
	 *	获取单独数据
	 *	@param	sql	
	 *	@return	返回数据
	 */
	std::string getOne(std::string sql);
	/**
	 *	获取一行数据
	 *	@param	sql
	 *	@return	返回数据
	 */
	mysqlpp::Row getRow(std::string sql);
	/**
	 *	获取数组数据
	 *	@param	sql
	 *	@return	返回数据
	 */
	mysqlpp::StoreQueryResult getAll(std::string sql);
private:
	/**
	 *	链接
	 */
	mysqlpp::Connection _con;
	/**
	 *	数据库
	 */
	std::string _database;
	/**
	 *	链接
	 */
	std::string _host;
	/**
	 *	用户
	 */
	std::string _user;
	/**
	 *	密码
	 */
	std::string _passwd;
	/**
	 *	端口
	 */
	unsigned int _port;	
};

#endif // __DB_SQLITE_H__
