#pragma once

#include "../TokenManager.hpp"

#include <Poco/Net/HTTPRequestHandler.h>
using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

class RefreshHandler : public HTTPRequestHandler {
public:
  RefreshHandler(TokenManager& tokenManager);

public:
  void handleRequest(HTTPServerRequest& request, HTTPServerResponse& response)
      override;

private:
  TokenManager& m_tokenManager;
};
