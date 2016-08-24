C_FLAGS = -I /usr/include/mysql/
main: Daemon.o Socket.o Client.o Server.o Message.o Epoll.o base64.o sha1.o Mysql.o DBConnector.o
	g++ ${C_FLAGS} -g Mysql.o DBConnector.o Daemon.o Socket.o Client.o Server.o Message.o Epoll.o main.cpp -I. -lmysqlpp -lpthread -ljson -o appServer
Daemon.o: Daemon.cpp
	g++ -c Daemon.cpp
Epoll.o: Epoll.cpp
	g++ -c ${C_FLAGS} -Wall Epoll.cpp
Message.o: Message.cpp
	g++ -c Message.cpp
Server.o: Server.cpp
	g++ -c Server.cpp
Client.o: Client.cpp
	g++ -c Client.cpp
DBConnector.o: core/db/DBConnector.cpp
	g++ -c ${C_FLAGS} core/db/DBConnector.cpp
Mysql.o: core/db/Mysql.cpp
	g++ -c ${C_FLAGS} core/db/Mysql.cpp
sha1.o: lib/sha1.c
	gcc -c lib/sha1.c
base64.o: lib/base64.c
	gcc -c lib/base64.c
Socket.o: Socket.cpp
	g++ -c Socket.cpp
clean:
	@rm -f appServer *.o
	@echo 'clean'
