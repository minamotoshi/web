#ifndef DAEMON_H
#define DAEMON_H

#include <iostream>
#include <cstdlib>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <signal.h> 
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <getopt.h> //getopt_long()头文件位置

class Daemon {
	public: 
		Daemon(int argc, char *argv[]);
		virtual ~Daemon();
	private:
		static const char *VERSION;
		static const int NO_ARGUMENT;
		static const int REQUIRED_ARGUMENT;
		static const int OPTIONAL_ARGUMENT;
		static std::string *_pid_file_path;

		static int _global_pid_file_fd;
		static void safe_exit(int signum);

		void create_daemon_process();
		void setsignal(void);
		void usage();
};

#endif
