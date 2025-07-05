#include "NotFoundHandler.hpp"

#include <Poco/Net/HTTPResponse.h>
#include <Poco/Net/HTTPServerRequest.h>
#include <Poco/Net/HTTPServerResponse.h>

using Poco::Net::HTTPResponse;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

void NotFoundHandler::handleRequest(
    HTTPServerRequest& request, HTTPServerResponse& response
) {
  response.setStatusAndReason(HTTPResponse::HTTP_NOT_FOUND);
  response.send();
}
