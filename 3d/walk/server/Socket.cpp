/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	 服务端
*	@date	2015-10-15
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	Socket.cpp
******************************************************************************/
#include "Socket.h"
#include <stdlib.h>
#include <memory.h>
#include <iostream>
#include <fcntl.h>

Socket::Socket()
:_fd(-1)
{
}

Socket::~Socket()
{
	::close(_fd);
}

int Socket::create(){
	_fd = ::socket(AF_INET, SOCK_STREAM, 0); //初始化监听socket
	setNonBlocking(true);
	return _fd;
}
int Socket::close(){
	int res = -1;
	if(isValid())
		res = ::close(_fd);
	return res;
}

int Socket::setSocketOption() {
	// 设置端口复用，在TIME_WAIT存在时也可以启动服务器
	int flag=1;
	if( ::setsockopt(_fd, SOL_SOCKET, SO_REUSEADDR, &flag, sizeof(int)) == -1){ 
		return -1; 
	}

	int nRecvBuf = SOCKETBUFFLEN;
	if (-1 == setsockopt(_fd,SOL_SOCKET,SO_RCVBUF,(const char*)&nRecvBuf,sizeof(int))) {
		return -1;
	}
	int nSendBuf = SOCKETBUFFLEN;
	if (setsockopt(_fd,SOL_SOCKET,SO_SNDBUF,(const char*)&nSendBuf,sizeof(int))) {
		return -1;
	}
	
	// 设置服务器主动关闭时TIME_WAIT存在的时限
	struct linger linger;
	linger.l_onoff = 1;
	linger.l_linger = 30;
	if (-1 == setsockopt(_fd, SOL_SOCKET, SO_LINGER, (const char *) &linger, sizeof(linger))) {
		return -1;
	}

	return 0;	
}

int Socket::bind(const char* host, const int port)
{
	int res = -1;
	if(!isValid())
		return res;
	
	if (-1 == setSocketOption()) {
		return -1;
	}
	
	memset(&_address, 0, sizeof _address);
	_address.sin_family = AF_INET;
	_address.sin_addr.s_addr = host ? inet_addr(host) : htonl(INADDR_ANY);//域名
	_address.sin_port = port ? htons(port) : htons(DEFAULT_PORT);//端口
	res = ::bind(_fd, (struct sockaddr*)&_address, sizeof(_address));
	return res;
}

int Socket::bind(const char* host)
{
	return bind(host, DEFAULT_PORT);
}

int Socket::bind(const int port) {
	return bind(NULL, port);
}

int Socket::bind()
{
	return bind(NULL, DEFAULT_PORT);
}

int Socket::listen()const
{
	int res = -1;
	if(!isValid())
		return res;
	res = ::listen(_fd, MAXCONNECTION);
	return res;
}

int Socket::accept(int fd){
	socklen_t len = sizeof(_address);
	_fd = ::accept(fd, (struct sockaddr *) &_address, &len);
	if (_fd == -1) return _fd;
	setNonBlocking(true);
	return _fd;
}

//end server functions




int Socket::getAddress(){
	return _address.sin_addr.s_addr;
}
int Socket::getPort(){
	return _address.sin_port;
}
int Socket::getFileDescripto(){
	return _fd;
}

void Socket::setNonBlocking(const bool flag)
{
	if(isValid())
	{
		int opts;
	
		opts = fcntl ( _fd, F_GETFL );
	
		if ( opts < 0 ){
			return;
		}
	
		if ( flag )
			opts = ( opts | O_NONBLOCK );
		else
			opts = ( opts & ~O_NONBLOCK );
	
		fcntl ( _fd, F_SETFL,opts );
	}
}

bool Socket::isValid() const
{
    //if call function socket fail,it returns -1
	return _fd!=-1;
}
