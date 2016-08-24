/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	 服务端
*	@date	2015-10-15
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	Socket.h
******************************************************************************/
#ifndef SOCKET_H
#define SOCKET_H

#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <string>

class Socket
{
	public:
		/**
		 *	构造函数
		 */
		Socket();
		/**
		 *	析构函数
		 */
		virtual ~Socket();
		//-------------------- socket base -------------------
		/**
		 *	创建
		 *	@return socket fd
		 */
		int create();
		/**
		 *	关闭
		 */
		int close();
		/**
		 *	绑定
		 *	@param	host	地址
		 *	@param	port	端口
		 */
		int bind(const char* host, const int port);
		int bind(const char* host);
		int bind(const int port);
		int bind();
		/**
		 *	侦听
		 */
		int listen() const;
		/**
		 *	接受
		 *	@param	fd	链接的socket
		 *	@return socket fd
		 */
		int accept(int fd);
		
		//-------------------- method -------------------
		/**
		 *	获取地址
		 */
		int getAddress();
		/**
		 *	获取端口
		 */
		int getPort();
		/**
		 *	获取socket描述符
		 */
		int getFileDescripto();
		/**
		 * 设置socket套接字的选项
		 */
		int setSocketOption();
		/**
		 *	阻挡
		 */
		void setNonBlocking(const bool flag);
		/**
		 *	是否有效
		 */
		bool isValid() const;
		/**
		 *	链接总数
		 */
		static const int MAXCONNECTION = 5;
		/**
		 *	默认端口
		 */
		static const int DEFAULT_PORT = 8843;
		// socket发送/接收缓冲区大小
		static const int SOCKETBUFFLEN = 8192;
	private:
		/**
		 *	file descripto
		 */
		int _fd;
		/**
		 *	地址
		 */
		struct sockaddr_in _address;
};

#endif

