#pragma once

#include "../DBConnector.hpp"
#include "../TokenManager.hpp"

#include <Poco/Net/HTTPRequestHandler.h>

using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

class VerificationHandler : public HTTPRequestHandler {
public:
  VerificationHandler(TokenManager& tokenManager);

public:
  void handleRequest(HTTPServerRequest& request, HTTPServerResponse& response)
      override;

private:
  TokenManager& m_tokenManager;
};
