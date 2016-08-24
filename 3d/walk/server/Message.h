/****************************************************************************
*	@Copyright(c)	2015,Vogso
*	@desc	消息
*	@date	2015-10-26
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	Message.h
******************************************************************************/
#ifndef MESSAGE_H
#define MESSAGE_H


class Message
{
	public:
		/**
		 *	构造函数
		 */
		Message();
		/**
		 *	析构函数
		 */
		virtual ~Message();
		/**
		 *	消息码
		 *	c客户端
		 *	s服务端
		 */
		enum MessageCodeTag {
			cEnter = 110101,//进入
			sEnter = 120101,//进入
				
			sLeave = 120102,//离开
			sTakeOut = 120103, // 服务器主动关闭
			
			cHeartBeat = 110104,//心跳
			sHeartBeat = 120104,//心跳
			
			cOnline = 110202, // 查询是否在线
			sOnline = 120202, // 回答是否在线
		
			cChat = 110301,//聊天
			sChat = 120301,//聊天
			cWhisper = 110302,//悄悄话
			sWhisper = 120302,//悄悄话

			cMove = 110401,//移动
			sMove = 120401//移动
		} MessageCode;
};

#endif
