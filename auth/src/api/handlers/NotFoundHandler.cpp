#include "NotFoundHandler.hpp"
#include <Poco/Net/HTTPResponse.h>
#include <Poco/Net/HTTPServerResponse.h>
#include <Poco/Net/HTTPServerRequest.h>

using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;
using Poco::Net::HTTPResponse;

void NotFoundHandler::handleRequest(HTTPServerRequest &request, HTTPServerResponse &response) {
    response.setStatusAndReason(HTTPResponse::HTTP_NOT_FOUND);
    response.send();
}
