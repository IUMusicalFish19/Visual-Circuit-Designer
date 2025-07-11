#pragma once

#include "../DBConnector.hpp"

#include <Poco/Net/HTTPRequestHandler.h>

using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

class RegistrationHandler : public HTTPRequestHandler {
public:
  RegistrationHandler(DBConnector& db);

public:
  void handleRequest(HTTPServerRequest& request, HTTPServerResponse& response)
      override;

private:
  DBConnector& m_db;
};
