#pragma once
#include <Poco/Net/HTTPRequestHandlerFactory.h>

using Poco::Net::HTTPRequestHandlerFactory;
using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPServerRequest;

class AuthRequestHandlerFactory : public HTTPRequestHandlerFactory {
public:
    HTTPRequestHandler * createRequestHandler(const HTTPServerRequest &request) override;
};
