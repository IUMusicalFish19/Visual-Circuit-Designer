#pragma once

#include "../DBConnector.hpp"
#include "../TokenManager.hpp"

#include <Poco/Net/HTTPRequestHandler.h>

using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

class LoginHandler : public HTTPRequestHandler {
public:
  LoginHandler(DBConnector& m_db, TokenManager& tokenManager);

public:
  void handleRequest(HTTPServerRequest& request, HTTPServerResponse& response)
      override;

private:
  DBConnector&  m_db;
  TokenManager& m_tokenManager;
};
