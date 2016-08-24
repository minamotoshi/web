/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	服务端
*	@date	2015-10-9
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	Epoll.cpp
******************************************************************************/
#include "Epoll.h"
#include <pthread.h>
#include <iostream>
#include <sstream>
#include <stdlib.h>
#include <stdio.h>
#include "Message.h"

bool Epoll::serviceFlag = true;
std::map<int, Client*> Epoll::_clients; // 按套接字描述符索引
std::map<int, Client*> Epoll::_users; // 按用户id索引
std::map<int, actionFunc> Epoll::_messageFunc; // 按code索引处理message的静态方法
Mysql* Epoll::_dbm = NULL;

Epoll::Epoll(int port)
{
	_server = new Server();
	_server->launch(port);
	create();
	DBConnector* conn = DBConnector::getInstance();
	_dbm = conn->open("main", false, false);
}

Epoll::Epoll()
{
	_server = new Server();
	_server->launch();
	create();
}

Epoll::~Epoll()
{
	delete _server;
}
void Epoll::run()
{
	initFunction();
	wait();
}

bool Epoll::create(){
	int fd = _server->getFileDescripto();
	_evt.events = EPOLLIN | EPOLLET; //对读感兴趣，边沿触发
	_epfd = epoll_create(EPOLL_SIZE); //创建一个epoll描述符，并将监听socket加入epoll
	_evt.data.fd = fd;
	int res = epoll_ctl(_epfd, EPOLL_CTL_ADD, fd, &_evt);
	return res != -1;
}
bool Epoll::wait(){
	while(serviceFlag)
	{
		int num = epoll_wait(_epfd, _events, EPOLL_SIZE, EPOLL_RUN_TIMEOUT);
		for(int i = 0; i < num ; i++)
		{
			if(_events[i].data.fd == _server->getFileDescripto())                    //新的连接到来，将连接添加到epoll中，并发送欢迎消息
			{
				Client* client = new Client();
				if (!client->connect(_server->getFileDescripto())) {
					continue;
				}
				addClient(client);
				_evt.data.fd = client->getFileDescripto();
				epoll_ctl(_epfd, EPOLL_CTL_ADD, client->getFileDescripto(), &_evt);
			}
			else  // 有消息需要读取
			{
				handle(_events[i].data.fd); //注意：这里并没有调用epoll_ctl重新设置socket的事件类型，但还是可以继续收到客户端发送过来的信息
			}
		}
		
	}
	_server->shut();
	::close(_epfd);
	return true;
}
bool Epoll::handle(int fd){
	Client* client = _clients[fd];
	if (client->isNew()) { // 新连接，需要websocket握手协议
		if(client->openHandshake()) {
			std::stringstream msg;
			return true;
		}
	}
	
	std::string msg = client->receive();
	if(msg == "-2" || msg == "-1" || msg == "0"){
		epoll_ctl(_epfd, EPOLL_CTL_DEL, client->getFileDescripto(), &_evt);
		delClient(client);
	}else{
		checkMessage(client, msg);
	}
	return true;
}

void Epoll::checkMessage(Client* client, std::string msg){
	Json::Value obj;
	Json::Reader reader;
	
	std::cout << msg << std::endl;
	if(!reader.parse(msg, obj)){
		std::cout << "json error" << std::endl;
		return;
	}
	if (!obj.isMember("code")) {
		std::cout << "need code!" << std::endl;
		return ;
	}
	if (!obj.isMember("data")) {
		std::cout << "need data!" << std::endl;
		return ;
	}
	callFunction(obj["code"].asInt(), client, obj);
}

void Epoll::callFunction(int code, Client* client, Json::Value &obj) {
	std::map<int, actionFunc>::iterator funcPointer = _messageFunc.find(code);
	if (funcPointer != _messageFunc.end()) {
		actionFunc callFunc = funcPointer->second;
		callFunc(client, obj);
	} else {
		std::cout << "invalid code:" << code << std::endl;
	}
}

void Epoll::initFunction(void) {
	_messageFunc[Message::cEnter]   = actionEnter;
	_messageFunc[Message::cWhisper] = actionWhisper;
	_messageFunc[Message::cOnline]  = actionOnline;
	_messageFunc[Message::cChat]  = actionChat;
	_messageFunc[Message::cMove]  = actionMove;
}

void Epoll::actionEnter(Client *me, Json::Value &obj) {
	int uid = obj["uid"].asInt();
	std::map<int, Client*>::iterator exists_user;
	exists_user = _users.find(uid);
	if (exists_user != _users.end() && exists_user->second != me) {
		std::cout << "uid:" << uid << " exists, take it out!\n";
		takeoutClient(exists_user->second);
	} 
	me->setName(obj["data"].asString());
	me->setUID(uid);
	
	addUser(me);
	std::cout << me->getName() << "上线!" << std::endl;
	Json::Value user;
	user["uid"]  = uid;
	user["id"] = me->getFileDescripto();
	user["name"] = me->getName();
	
	Json::Value data;
	data["user"] = user;
	data["list"] = getJsonClientList();
	
	Json::Value oops;
	oops["code"] = Message::sEnter;
	oops["data"] = data;
	sendToAll(oops.toStyledString());
}

void Epoll::actionWhisper(Client* me, Json::Value &obj) {
	if (
		!obj["data"].isMember("uid") ||
		!obj["data"].isMember("content")
		) {
		return;
	}
	int uid = obj["data"]["uid"].asInt();
	Client *you = getClientByUID(uid);
	if(!you) {
		std::cout << "user uid:" << uid << " not exists!" << std::endl;
		return;
	}
	
	Json::Value target;
	target["uid"] = you->getUID();
	target["name"] = "你";
	
	Json::Value user;
	user["uid"]  = me->getUID();
	user["name"] = me->getName();
	
	Json::Value data;
	data["user"] = user;
	data["content"] = obj["data"]["content"].asString();
	data["target"] = target;
	
	Json::Value oops;
	oops["code"] = Message::sWhisper;
	oops["data"] = data;
	std::cout << user["name"].asString() << "对" << you->getName() << "说：" << data["content"].asString() << std::endl;
	you->send(oops.toStyledString());
}

void Epoll::actionOnline(Client* me, Json::Value &obj)
{
	if (!obj["data"].isMember("uid")) {
		return;
	}
	int uid = obj["data"]["uid"].asInt();
	Client *you = getClientByUID(uid);
	int online = you ? 1 : 0;
	
	Json::Value data;
	data["online"] = online;
	if (you) {
		Json::Value user;
		user["uid"]  = you->getUID();
		user["name"] = you->getName();
		data["user"]   = user;
	}
	
	Json::Value oops;
	oops["code"] = Message::sOnline;
	oops["data"] = data;
	me->send(oops.toStyledString());
}
void Epoll::actionChat(Client* me, Json::Value &obj){
	Json::Value user;
	user["uid"]  = me->getUID();
	user["name"] = me->getName();

	Json::Value data;
	data["user"] = user;
	data["content"] = obj["data"]["content"].asString();

	Json::Value oops;
	oops["code"] = Message::sChat;
	oops["data"] = data;
	sendToAll(oops.toStyledString());
}
void Epoll::actionMove(Client* me, Json::Value &obj){
	Json::Value user;
	user["uid"]  = me->getUID();
	user["name"] = me->getName();

	Json::Value data;
	data = obj["data"];
	data["user"] = user;
	//data['x'] = obj["data"]["x"].asFloat();
	//data['y'] = obj["data"]["y"].asFloat();

	Json::Value oops;
	oops["code"] = Message::sMove;
	oops["data"] = data;
	sendToAll(oops.toStyledString());
}
void Epoll::addUser(Client* client)
{
	_users[client->getUID()] = client;
}

void Epoll::addClient(Client* client)
{
	_clients[client->getFileDescripto()] = client;
}

void Epoll::delClient(Client* client)
{
	Json::Value oops,data,user;
	user["uid"] = client->getUID();
	user["name"] = client->getName();

	if (user["uid"] == 0) {
		oops["code"] = Message::sTakeOut;
		client->send(oops.toStyledString());
	}
	_clients.erase(_clients.find(client->getFileDescripto()));
	delete client;
	
	if (user["uid"] > 0) {
		oops["code"] = Message::sLeave;
		_users.erase(_users.find(user["uid"].asInt()));
		data["user"] = user;
		data["list"] = getJsonClientList();
		oops["data"] = data;
		sendToAll(oops.toStyledString());
	}
}

void Epoll::takeoutClient(Client* client) {
	Json::Value oops;
	oops["code"] = Message::sTakeOut;
	client->send(oops.toStyledString());
	_clients.erase(_clients.find(client->getFileDescripto()));
	delete client;
}

void Epoll::sendToAll(std::string msg){
	for(
		std::map<int, Client*>::iterator item = _clients.begin();
		item != _clients.end(); 
		item++
	){
		Client* client = item->second;
		client->send(msg);
	}
}

void Epoll::sendToOtherAll(int uid, std::string msg){
	for(
		std::map<int, Client*>::iterator item = _clients.begin();
		item != _clients.end(); 
		item++
	){
		Client* client = item->second;
		if (client->getUID() == uid) continue;
		client->send(msg);
	}
}

Client* Epoll::getClientByUID(int uid){
	std::map<int, Client*>::iterator item;
	item = _users.find(uid);
	if (item == _users.end()) {
		return NULL;
	}
	return item->second;
}

Json::Value Epoll::getJsonClientList(){
	Json::Value list;
	for(std::map<int, Client*>::iterator item = _clients.begin();item != _clients.end(); item++){
		Client* client = item->second;
		Json::Value single;
		single["uid"] = client->getUID();
		single["name"] = client->getName();
		list.append(single);
	}
	return list;
}
