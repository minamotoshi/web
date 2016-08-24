#include "Daemon.h"

const char* Daemon::VERSION = "v 0.0.1";
const int Daemon::NO_ARGUMENT = 0;
const int Daemon::REQUIRED_ARGUMENT = 1;
const int Daemon::OPTIONAL_ARGUMENT = 2;
int Daemon::_global_pid_file_fd = 0;
std::string* Daemon::_pid_file_path = NULL;

Daemon::~Daemon() {
	delete _pid_file_path;
}

Daemon::Daemon(int argc, char *argv[]) {
	int opt;
	int index;
	char const *optstring="cdhv"; 
	char resolved_path[1024] = {0};
	realpath(argv[0],resolved_path);
	_pid_file_path = new std::string(resolved_path);
	struct option opts[]={
		{"console",NO_ARGUMENT,NULL,'c'}, 
		{"daemon",NO_ARGUMENT,NULL, 'd'}, 
		{"help",NO_ARGUMENT,NULL, 'h'}, 
		{"version",NO_ARGUMENT,NULL,'v'}, 
		{0,0,0,0}
	}; 
	while((opt=getopt_long(argc,argv,optstring,opts,&index))!=-1) {
		switch(opt) {
			case 'c':
				break;
			case 'd':
				create_daemon_process();
				setsignal();
				break;
			case 'h':
				usage();
				exit(0);
				break;
			case 'v':
				std::cout<<"版本号: "<<VERSION<<std::endl;
				exit(0);
				break;
			default:
				break;
		}
	}
}


void Daemon::create_daemon_process() {
	pid_t pid = 0;
	int   fd  = -1;

	pid = fork();
	/* 创建进程错误 */
	if (pid < 0) {
		exit(0);
	}
	/* 父进程 */
	else if (pid > 0) {
		exit(0);
	}
	/* 子进程 */
	else {
		/* 脱离原始会话 */
		if (setsid() == -1) {
			std::cout<<"setsid failed.\n";
			exit(0);
		}
		
		/*是否锁定FID文件*/
		_global_pid_file_fd = open(_pid_file_path->c_str(), O_RDWR|O_CREAT|O_TRUNC);
		if(-1 == _global_pid_file_fd) {
			std::cout<<"open pid file failed.\n";
			exit(0);
		}
		chmod(_pid_file_path->c_str(), S_IRUSR|S_IWUSR|S_IRGRP|S_IROTH);
		struct flock pid_lock;
		pid_lock.l_type = F_WRLCK;
		pid_lock.l_whence = SEEK_SET;

		if(fcntl(_global_pid_file_fd, F_SETLK, &pid_lock) < 0) {
			std::cout<<"warning: process is running\n";
			exit(0);
		}
		char buf[1024];
		sprintf (buf, "%d\n", (int)getpid());
		int pidsize = strlen(buf);
		int write_size = -1;
		if ((write_size = write (_global_pid_file_fd, buf, pidsize)) != (int)pidsize) {
			exit(0);
		}
		
		/* 修改工作目录 */
		// chdir("/");

		/* 重设掩码 */
		// umask(0);
		fd = open("/dev/null", O_RDWR);
		if (fd == -1) {
			std::cout<<"open /dev/null failed.\n";
			exit(0);
		}

		/* 重定向子进程的标准输入到null设备 */
		if (dup2(fd, STDIN_FILENO) == -1) {
			std::cout<<"dup2 STDIN to fd failed.\n";
			exit(0);
		}

		/* 重定向子进程的标准输出到null设备 */
		if (dup2(fd, STDOUT_FILENO) == -1) {
			std::cout<<"dup2 STDOUT to fd failed.\n";
			exit(0);
		}

		/* 重定向子进程的标准错误到null设备 */
		if (dup2(fd, STDERR_FILENO) == -1) {
			std::cout<<"dup2 STDERR to fd failed.\n";
			exit(0);
		}
	}
}

void Daemon::usage()
{
	std::cout<<"Usage:cmd [-d|-v|-h]\n";
	std::cout<<" -c， #调试模式启动\n";
	std::cout<<" -d， #守护进程启动（后台运行）\n";
	std::cout<<" -v， #显示版本号\n";
	std::cout<<" -h， #显示使用方法\n";
}

void Daemon::safe_exit(int signum) {
	close(_global_pid_file_fd);
	unlink(_pid_file_path->c_str());
	exit(0);
}

void Daemon::setsignal(void) {
	 struct sigaction action; 
	 action.sa_handler = (void (*)(int))safe_exit; 
	 sigemptyset(&action.sa_mask); 
	 action.sa_flags = 0; 
	 sigaction(SIGTERM, &action, 0); 
	 sigaction(SIGINT, &action, 0);
	 sigaction(SIGQUIT, &action, 0); 
	 
	 action.sa_handler = SIG_IGN; 
	 sigemptyset(&action.sa_mask); 
	 action.sa_flags = 0; 
	 sigaction(SIGPIPE, &action, 0);
}
