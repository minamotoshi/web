/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	服务端
*	@date	2015-10-9
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	Epoll.h
******************************************************************************/
#ifndef EPOLL_H
#define EPOLL_H

#include <vector>
#include <map>
#include <sys/epoll.h>
#include <semaphore.h>
#include "Server.h"
#include "core/db/DBConnector.h"
#include "Client.h"

#include "json/json.h"

typedef void (*actionFunc)(Client*, Json::Value&);

class Epoll
{
	public:
		/**
		 *	构造函数
		 *	@param	port	端口
		 */
		Epoll(int port);
		Epoll();
		/**
		 *	析构函数
		 */
		virtual ~Epoll();
		/**
		 *	运行
		 */
		void run();
		/**
		 *	epoll客户端最大数目
		 */
		static const int EPOLL_SIZE = 10000;
		/**
		 *	epoll的超时时间
		 */
		static const int EPOLL_RUN_TIMEOUT = -1;
	private:
		static Mysql *_dbm;
		/**
		 *	服务端
		 */
		Server* _server;
		/**
		 *	客户端列表
		 */
		static std::map<int, Client*> _clients;
		/**
		 *	用户列表
		 */
		static std::map<int, Client*> _users;
		/**
		 *	epoll描述符
		 */
		int _epfd;
		/**
		 *	地址
		 */
		struct sockaddr_in _address;
		/**
		 *	事件
		 */
		struct epoll_event _evt;
		/**
		 *	事件集合
		 */
		struct epoll_event _events[EPOLL_SIZE];
		/**
		 *	创建
		 */
		bool create();
		/**
		 *	等待
		 */
		bool wait();
		/**
		 *	事件
		 */
		bool handle(int id);
		/**
		 *	检验消息
		 *	@param	client	消息源
		 *	@param	msg	接收的消息
		 */
		static void checkMessage(Client* client, std::string msg);
		/**
		 *	添加客户端，按套接字fd索引
		 *	@param	clientSocket	客户端
		 */
		static void addClient(Client* client);
		/**
		 *	添加用户，按用户uid索引
		 *	@param	clientSocket	客户端
		 */
		static void addUser(Client* client);
		/**
		 *	客户端关闭时删除客户端
		 *	@param	clientSocket	客户端
		 */
		static void delClient(Client* client);
		/**
		 * 主动清理客户端
		 */
		static void takeoutClient(Client* client);
		/**
		 *	给所有人发消息
		 *	@param	msg	  发送的消息
		 */
		static void sendToAll(std::string msg);
		/**
		 *	给其它所有人发消息
		 *	@param	msg	  发送的消息
		 */
		static void sendToOtherAll(int uid, std::string msg);
		/**
		 *	获取链接列表
		 *	@return	客户端列表
		 */
		static Json::Value getJsonClientList();
		/**
		 *	通过id获取客户端
		 *	@param	id	客户端id
		 *	@return	客户端
		 */
		static Client* getClientByUID(int id);
		/**
		 *	服务器状态
		 */
		static bool serviceFlag;
		
		static std::map<int, actionFunc> _messageFunc;
		static void initFunction(void);
		static void callFunction(int code, Client *client, Json::Value &obj);
		static void actionEnter(Client *client, Json::Value &obj);
		static void actionWhisper(Client *client, Json::Value &obj);
		static void actionOnline(Client *client, Json::Value &obj);
		static void actionChat(Client *client, Json::Value &obj);
		static void actionMove(Client *client, Json::Value &obj);
};

#endif
