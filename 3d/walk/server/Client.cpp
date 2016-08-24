/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	主程序
*	@date	2015-9-30
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	Socket.cpp
******************************************************************************/
#include "Client.h"
#include <errno.h>
#include <stdlib.h>
#include <memory.h>
#include <iostream>
#include <sstream>
#include <fcntl.h>

#include "json/json.h"

#include "lib/sha1.c"
#include "lib/base64.c"

using namespace std;

Client::Client():_newFD(true){
	_uid  = 0;
	_name = "";
}

Client::~Client(){
	disconnect();
}

bool Client::connect(int fd){
	int res = accept(fd);
	return res != -1;
}
bool Client::disconnect(){
	int res = close();
	return res != -1;
}

// Data Transmission
bool Client::send(std::string msg)
{
	std::string buf = outgoingPokect(msg);
	const char *sendBuf = buf.c_str();
	int len = buf.length();
	int sendLen;
	while(len > 0) {
		sendLen = len > SOCKETBUFFLEN ? SOCKETBUFFLEN : len;
		sendLen = ::send(getFileDescripto(), sendBuf, sendLen, MSG_NOSIGNAL);
		if (sendLen == -1) {
			return false;
		}
		sendBuf += sendLen;
		len -= sendLen;
	}
	return true;
}

std::string Client::receive()
{
	char buf[SOCKETBUFFLEN];
	int bufLen = 0, readLen = 0;
	int readFlag = 1;
	char *msgBuf = NULL;
	string msg;
	int noError = 1;
	while (readFlag) {
		readLen = ::recv(getFileDescripto(), buf, SOCKETBUFFLEN, 0);
		if (readLen < 0) {
			if(errno == EAGAIN) {
				break;
			} else {
				std::cout<<"error in Socket::Receive"<<std::endl;
				msg = "-1";
				noError = 0;
				break;
			}
		} else if (readLen == 0) {
			std::cout<<"client disconnect!"<<std::endl;
			msg = "-2";
			noError = 0;
			break;
		} else if (readLen < sizeof buf) {
			readFlag = 0;
		} 
		if (msgBuf == NULL) {
			msgBuf = (char *) malloc(readLen);
		} else {
			msgBuf = (char *) realloc(msgBuf, bufLen+readLen);
		}
		memcpy(msgBuf+bufLen, buf, readLen);
		bufLen += readLen;
	}
	
	if (msgBuf) {
		if (noError) {
			int opcode = incomePocket(msgBuf, msg);
			if (opcode == 0x8) { // 客户端调用close
				std::cout<<"client closed!"<<std::endl;
				msg = "0";
				send(msgBuf);
			}
		}
		free(msgBuf);
	}
	
	return msg;
}

void Client::setName(std::string name){
	_name = name;
}

std::string Client::getName(){
	std::stringstream sstr;
	sstr << "uid:" << _uid;
	if(_name == "") {
		_name = sstr.str();
	}
	return _name;
}

void Client::setUID(int uid){
	_uid = uid;
}
int Client::getUID(){
	return _uid;
}

bool Client::openHandshake(){
	if(!_newFD) return false;
	websocketHandshake();
	_newFD = false;
	return true;
}

bool Client::isNew(){
	return _newFD;
}

std::string Client::fetchSecKey(const char* buf){
	std::string key = "";
	char *keyBegin;
	const char *flag="Sec-WebSocket-Key: ";
	int i=0, bufLen=0;
	if(!buf) {
		return "";
	}
	keyBegin=(char*)strstr(buf,flag);
	if(!keyBegin) {
		return "";
	}
	keyBegin+=strlen(flag);
	bufLen=strlen(buf);
	for(i=0; i<bufLen; i++) {
		if(keyBegin[i]==0x0A||keyBegin[i]==0x0D) {
			break;
		}
		key += keyBegin[i];
	}
	return key;
}

void Client::websocketHandshake(){
	std::string rev = receive();
	
	const char *GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
	std::string clientKey = fetchSecKey(rev.c_str());
	if(clientKey == "") return;
	clientKey.append(GUID);
	char result[SHA1_LEN];
	char serverKey[4096];
	sha1_buffer (clientKey.c_str(), strlen(clientKey.c_str()), result);
	base64_encode (result, SHA1_LEN, serverKey, 4096);
	
	//Return first part of the HTTP response
	std::string header = "HTTP/1.1 101 Switching Protocols\r\n";
	header.append("Upgrade: websocket\r\n");
	header.append("Connection: Upgrade\r\n");
	//header.append("Access-Control-Allow-Credentials: true\r\n");
	//header.append("Access-Control-Allow-Headers: content-type\r\n");
	//header.append("Sec-WebSocket-Protocol: superchat\r\n");
	header.append("Sec-WebSocket-Accept: ");
	header.append(serverKey);
	header.append("\r\n\r\n");
	send(header);
}

int Client::incomePocket(const char* buf, std::string &msg){
	int i=0, j;
	int FIN = ((unsigned char)(buf[i])) >> 7;
	int opcode = (unsigned char)buf[i++] & 0x0F;
	int mask = (unsigned char)buf[i] >> 7;
	int payloadLength = (unsigned char)buf[i++] & 0x7F;
	if(payloadLength == 126) { // 如果这个值为126，则时候后面的两个字节来储存储存数据长度
		payloadLength = ((unsigned char)buf[i++]<<8)+buf[i++];
	} else if(payloadLength == 127) { // 如果为127则用后面八个字节来储存数据长度
		payloadLength = ((unsigned char)buf[i++]<<24)+((unsigned char)buf[i++]<<16)+((unsigned char)buf[i++]<<8)+buf[i++];
	}
	if(mask){ // MaskingKey，它占四个字节，储存掩码的实体部分。但是只有在前面的MASK被设置为1时候才存在这个数据
		int maskingKey[4] = {buf[i++],buf[i++],buf[i++],buf[i++]};
		for(j=0; j<payloadLength; j++){ // 如果掩码存在，那么所有数据都需要与掩码做一次异或运算
			msg.push_back(buf[i+j] ^ maskingKey[j%4]);
		}
	}else{
		msg = buf;
	}
	return opcode;
}

std::string Client::outgoingPokect(std::string msg){
	if(_newFD) return msg;
	std::string buf;
	unsigned long long payloadSize = msg.size();
	char payloadFlags = 129;
	buf.append(&payloadFlags, 1);
	if (payloadSize <= 125){
		char basicSize = payloadSize;
		buf.append(&basicSize, 1);
	}else if (payloadSize > 125 & payloadSize <= 65535){
		char basicSize = 126;
		buf.append(&basicSize, 1);

		char len[2];
		len[0] = ( payloadSize >> 8 ) & 255;
		len[1] = ( payloadSize ) & 255;
		buf.append(len, 2);
	}else{
		char basicSize = 127;
		buf.append(&basicSize, 1);

		char len[8];
		len[0] = ( payloadSize >> 56 ) & 255;
		len[1] = ( payloadSize >> 48  ) & 255;
		len[2] = ( payloadSize >> 40 ) & 255;
		len[3] = ( payloadSize >> 32  ) & 255;
		len[4] = ( payloadSize >> 24 ) & 255;
		len[5] = ( payloadSize >> 16  ) & 255;
		len[6] = ( payloadSize >> 8 ) & 255;
		len[7] = ( payloadSize ) & 255;
		buf.append(len, 8);
	}
	buf.append(msg.c_str(), msg.size());
	return buf;
}
