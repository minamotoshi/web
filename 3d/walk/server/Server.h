/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	 服务端
*	@date	2015-10-12
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	Server.h
******************************************************************************/
#ifndef SERVER_H
#define SERVER_H

#include "Socket.h"

class Server : public Socket
{
	public:
		/**
		 *	构造函数
		 */
		Server();
		/**
		 *	析构函数
		 */
		virtual ~Server();

		/**
		 *	启动
		 *	@param	host	地址
		 *	@param	port	端口
		 */
		bool launch(const char* host,const int port);
		bool launch(const int port);
		bool launch(const char* host);
		bool launch();
		/**
		 *	关闭
		 */
		bool shut();
		
		
};

#endif
