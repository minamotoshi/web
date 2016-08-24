/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	主程序
*	@date	2015-10-13
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	main.cpp
******************************************************************************/

#include <iostream>
#include <string>
#include "Daemon.h"
#include "Epoll.h"

using namespace std;

int main(int argc, char **argv)
{
	cout<<"Running server..."<<endl;
	Daemon Daemon(argc, argv);
	Epoll epoll;
	epoll.run();
	return 0;
}
