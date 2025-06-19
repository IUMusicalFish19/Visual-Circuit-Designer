#include "AuthRequestHandlerFactory.hpp"
#include <Poco/Net/HTTPRequestHandler.h>
#include <Poco/Net/HTTPServerRequest.h>

#include "handlers/NotFoundHandler.hpp"

using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPServerRequest;

HTTPRequestHandler* AuthRequestHandlerFactory::createRequestHandler(const HTTPServerRequest& request) {
    return new NotFoundHandler;
}
