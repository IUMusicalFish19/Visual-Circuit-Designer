#pragma once

#include <Poco/Net/HTTPRequestHandler.h>

using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

class NotFoundHandler : public HTTPRequestHandler {
public:
  void handleRequest(HTTPServerRequest& request, HTTPServerResponse& response)
      override;
};
