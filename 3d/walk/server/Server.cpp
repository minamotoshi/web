/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	 服务端
*	@date	2015-10-12
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	Server.cpp
******************************************************************************/
#include "Server.h"

Server::Server()
{
}

Server::~Server()
{
	
}

bool Server::launch(const char* host, const int port){
	bool res;
	res = create();
	res = bind(host, port);
	res = listen();
	return true;
}
bool Server::launch(const int port){
	bool res;
	res = create();
	res = bind(port);
	res = listen();
	return true;
}
bool Server::launch(const char* host){
	bool res;
	res = create();
	res = bind(host);
	res = listen();
	return true;
}
bool Server::launch(){
	bool res;
	res = create();
	res = bind();
	res = listen();
	return true;
}
bool Server::shut(){
	bool res;
	res = close();
}

