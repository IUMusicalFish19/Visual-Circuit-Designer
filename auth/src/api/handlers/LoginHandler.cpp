#include "LoginHandler.hpp"

#include "../PasswordHasher.hpp"
#include "../TokenManager.hpp"

#include <Poco/Dynamic/Var.h>
#include <Poco/Exception.h>
#include <Poco/JSON/JSONException.h>
#include <Poco/JSON/Object.h>
#include <Poco/JSON/Parser.h>
#include <Poco/Logger.h>
#include <Poco/Net/HTTPResponse.h>
#include <Poco/Net/HTTPServerRequest.h>
#include <Poco/Net/HTTPServerResponse.h>
#include <Poco/Util/Application.h>
#include <string>

using Poco::Logger;
using Poco::Dynamic::Var;
using Poco::JSON::Object;
using Poco::JSON::Parser;
using Poco::Net::HTTPResponse;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

LoginHandler::LoginHandler(DBConnector& db, TokenManager& tokenManager)
    : m_db(db)
    , m_tokenManager(tokenManager) {}

void LoginHandler::handleRequest(
    HTTPServerRequest& request, HTTPServerResponse& response
) {
  Logger& logger = Poco::Util::Application::instance().logger();
  logger.information(
      "POST /api/auth/login from %s", request.clientAddress().toString()
  );

  if (request.getContentType() != "application/json") {
    response.set("Accept-Post", "application/json; charset=UTF-8");
    response.setStatusAndReason(HTTPResponse::HTTP_UNSUPPORTED_MEDIA_TYPE);
    response.send();
  } else if (!request.hasContentLength()) {
    response.setStatusAndReason(HTTPResponse::HTTP_LENGTH_REQUIRED);
    response.send();
  } else {
    try {
      std::string     login;
      std::string     password;
      UserCredentials user;

      PasswordHasher hasher;

      Parser      parser;
      Var         result     = parser.parse(request.stream());
      Object::Ptr JSONObject = result.extract< Object::Ptr >();
      login                  = JSONObject->getValue< std::string >("login");
      password               = JSONObject->getValue< std::string >("password");

      user = m_db.findUserWithCredentials(login);

      if (hasher.verifyPassword(password, user.passwordHash, user.salt)) {
        std::string tokens = m_tokenManager.generate(user);
        response.setContentType("application/json");
        response.setContentLength(tokens.length());
        response.setStatusAndReason(HTTPResponse::HTTP_OK);
        response.send() << tokens;
      } else {
        response.set("WWW-Authenticate", "Bearer");
        response.setStatusAndReason(HTTPResponse::HTTP_UNAUTHORIZED);
        response.send();
      }
    } catch (UserNotFoundException const& e) {
      response.set("WWW-Authenticate", "Bearer");
      response.setStatusAndReason(HTTPResponse::HTTP_UNAUTHORIZED);
      response.send();
    } catch (Poco::LogicException const& e) {
      response.setContentLength(e.message().length());
      response.setStatusAndReason(HTTPResponse::HTTP_BAD_REQUEST);
      response.send() << e.message();
    } catch (Poco::JSON::JSONException const& e) {
      response.setContentLength(e.message().length());
      response.setStatusAndReason(HTTPResponse::HTTP_BAD_REQUEST);
      response.send() << e.message();
    } catch (Poco::Exception const& e) {
      response.setStatusAndReason(HTTPResponse::HTTP_INTERNAL_SERVER_ERROR);
      response.send();
      logger.error(
          "[ERROR] POST /api/auth/login: Exception %s:\n%s",
          std::string(e.className()),
          e.displayText()
      );
    }
  }
}
