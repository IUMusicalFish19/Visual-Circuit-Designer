#include "RefreshHandler.hpp"

#include <Poco/Logger.h>
#include <Poco/Net/HTTPResponse.h>
#include <Poco/Net/HTTPServerRequest.h>
#include <Poco/Net/HTTPServerResponse.h>
#include <Poco/Util/Application.h>
#include <regex>

using Poco::Logger;
using Poco::Net::HTTPResponse;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

RefreshHandler::RefreshHandler(TokenManager& tokenManager)
    : m_tokenManager(tokenManager) {}

void RefreshHandler::handleRequest(
    HTTPServerRequest& request, HTTPServerResponse& response
) {
  Logger& logger = Poco::Util::Application::instance().logger();
  logger.information(
      "POST /api/auth/refresh from %s", request.clientAddress().toString()
  );

  try {
    std::regex  regexp("^Bearer (.*)$");
    std::smatch match;
    std::string bearer = request.get("Authorization");
    if (std::regex_match(bearer, match, regexp)) {
      if (m_tokenManager.verify(match[1].str(), TokenManager::REFRESH)) {
        std::string tokens = m_tokenManager.refresh(match[1]);
        response.setContentType("application/json");
        response.setContentLength(tokens.length());
        response.setStatusAndReason(HTTPResponse::HTTP_OK);
        response.send() << tokens;
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
        "[ERROR] POST /api/auth/refresh: Exception %s:%s",
        std::string(e.className()),
        e.displayText()
    );
  }
}
