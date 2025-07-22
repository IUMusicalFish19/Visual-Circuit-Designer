#include "app.hpp"

#include "api/AuthRequestHandlerFactory.hpp"
#include "api/DBConnector.hpp"
#include "api/TokenManager.hpp"

#include <Poco/Data/PostgreSQL/Connector.h>
#include <Poco/Data/Session.h>
#include <Poco/Environment.h>
#include <Poco/Exception.h>
#include <Poco/Net/HTTPServer.h>
#include <Poco/Net/HTTPServerParams.h>
#include <Poco/Net/ServerSocket.h>
#include <Poco/Types.h>
#include <Poco/Util/ServerApplication.h>
#include <cstdio>
#include <string>
#include <vector>

using Poco::Environment;
using Poco::Data::Session;
using Poco::Net::HTTPServer;
using Poco::Net::HTTPServerParams;
using Poco::Net::ServerSocket;

void AppAuthServer::initialize(Application& self) {
  loadConfiguration();
  ServerApplication::initialize(self);
}

int AppAuthServer::main(std::vector< std::string > const& args) {
  char         connectionString[256];
  Poco::UInt16 port;
  std::string  db_host;
  Poco::UInt16 db_port;
  std::string  db_user;
  std::string  db_password;
  std::string  db_name;

  try {
    db_host     = config().getString("PostgreSQL.host");
    db_port     = config().getUInt16("PostgreSQL.port");
    db_user     = config().getString("PostgreSQL.user");
    db_password = config().getString("PostgreSQL.password");
    db_name     = config().getString("PostgreSQL.db");
  } catch (Poco::NotFoundException& e) {
    db_host     = Environment::get("POSTGRES_HOST");
    db_port     = std::stoi(Environment::get("POSTGRES_PORT"));
    db_user     = Environment::get("POSTGRES_USER");
    db_password = Environment::get("POSTGRES_PASSWORD");
    db_name     = Environment::get("POSTGRES_DB");
  }
  snprintf(
      connectionString,
      256,
      "host=%s port=%hu user=%s password=%s dbname=%s",
      db_host.c_str(),
      db_port,
      db_user.c_str(),
      db_password.c_str(),
      db_name.c_str()
  );

  Poco::Data::PostgreSQL::Connector::registerConnector();

  Session     dbSession("PostgreSQL", connectionString);
  DBConnector db(dbSession);

  TokenManager tokenManager;

  ServerSocket socket(8080);
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
