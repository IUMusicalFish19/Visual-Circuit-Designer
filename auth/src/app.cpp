#include "app.hpp"

#include "api/AuthRequestHandlerFactory.hpp"
#include "api/DBConnector.hpp"
#include "api/TokenManager.hpp"

#include <Poco/Data/PostgreSQL/Connector.h>
#include <Poco/Data/Session.h>
#include <Poco/Net/HTTPServer.h>
#include <Poco/Net/HTTPServerParams.h>
#include <Poco/Net/ServerSocket.h>
#include <Poco/Types.h>
#include <Poco/Util/ServerApplication.h>
#include <string>
#include <vector>

using Poco::Data::Session;
using Poco::Net::HTTPServer;
using Poco::Net::HTTPServerParams;
using Poco::Net::ServerSocket;

void AppAuthServer::initialize(Application& self) {
  loadConfiguration();
  ServerApplication::initialize(self);
}

int AppAuthServer::main(std::vector< std::string > const& args) {
  Poco::Data::PostgreSQL::Connector::registerConnector();

  Session dbSession(
      "PostgreSQL",
      "host=localhost port=5432 user=VCD password=12345 dbname=VCD"
  );
  DBConnector db(dbSession);

  TokenManager tokenManager;

  Poco::UInt16 port = config().getUInt16("HTTP.port");

  ServerSocket socket(port);
  HTTPServer   httpServer(
      new AuthRequestHandlerFactory(db, tokenManager),
      socket,
      new HTTPServerParams
  );

  httpServer.start();
  waitForTerminationRequest();
  httpServer.stopAll();

  return ExitCode::EXIT_OK;
}
