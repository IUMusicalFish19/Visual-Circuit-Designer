#include "VerificationHandler.hpp"

#include <Poco/DateTimeFormat.h>
#include <Poco/Exception.h>
#include <Poco/Logger.h>
#include <Poco/Net/HTTPResponse.h>
#include <Poco/Net/HTTPServerRequest.h>
#include <Poco/Net/HTTPServerResponse.h>
#include <Poco/Util/Application.h>
#include <regex>
#include <string>

using Poco::Logger;
using Poco::Net::HTTPResponse;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

VerificationHandler::VerificationHandler(TokenManager& tokenManager)
    : m_tokenManager(tokenManager) {}

void VerificationHandler::handleRequest(
    HTTPServerRequest& request, HTTPServerResponse& response
) {
  Logger& logger = Poco::Util::Application::instance().logger();
  logger.information(
      "POST /api/auth/verify from %s", request.clientAddress().toString()
  );

  try {
    std::regex  regexp("^Bearer (.*)$");
    std::smatch match;
    std::string bearer = request.get("Authorization");
    if (std::regex_match(bearer, match, regexp)) {
      if (m_tokenManager.verify(match[1].str(), TokenManager::ACCESS)) {
        response.setStatusAndReason(HTTPResponse::HTTP_OK);
        response.send();
      } else {
        response.set("WWW-Authenticate", "Bearer");
        response.setStatusAndReason(HTTPResponse::HTTP_UNAUTHORIZED);
        response.send();
      }
    } else {
      response.set("WWW-Authenticate", "Bearer");
      response.setStatusAndReason(HTTPResponse::HTTP_UNAUTHORIZED);
      response.send();
    }
  } catch (Poco::NotFoundException const& e) {
    response.set("WWW-Authenticate", "Bearer");
    response.setStatusAndReason(HTTPResponse::HTTP_UNAUTHORIZED);
    response.send();
  } catch (Poco::Exception const& e) {
    response.setStatusAndReason(HTTPResponse::HTTP_INTERNAL_SERVER_ERROR);
    response.send();
    logger.error(
        "[ERROR] POST /api/auth/verify: Exception %s:%s",
        std::string(e.className()),
        e.displayText()
    );
  }
}
