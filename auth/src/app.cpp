#include "app.hpp"
#include "api/AuthRequestHandlerFactory.hpp"
#include <Poco/Net/HTTPServerParams.h>
#include <Poco/Types.h>
#include <Poco/Util/ServerApplication.h>
#include <Poco/Net/ServerSocket.h>
#include <Poco/Net/HTTPServer.h>
#include <string>
#include <vector>

using Poco::Net::ServerSocket;
using Poco::Net::HTTPServer;
using Poco::Net::HTTPServerParams;

void AppAuthServer::initialize(Application& self) {
    loadConfiguration();
    ServerApplication::initialize(self);
}

int AppAuthServer::main(const std::vector<std::string>& args) {
    Poco::UInt16 port = config().getUInt16("HTTP.port");

    ServerSocket socket(port);
    HTTPServer httpServer(new AuthRequestHandlerFactory, socket, new HTTPServerParams);

    httpServer.start();
    waitForTerminationRequest();
    httpServer.stopAll();

    return ExitCode::EXIT_OK;
}
