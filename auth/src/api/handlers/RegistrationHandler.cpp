#include "RegistrationHandler.hpp"

#include "../PasswordHasher.hpp"

#include <Poco/Data/PostgreSQL/PostgreSQLException.h>
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
using Poco::Util::Application;

RegistrationHandler::RegistrationHandler(DBConnector& db)
    : m_db(db) {}

void RegistrationHandler::handleRequest(
    HTTPServerRequest& request, HTTPServerResponse& response
) {
  Logger& logger = Application::instance().logger();
  logger.information(
      "POST /api/auth/register from %s", request.clientAddress().toString()
  );

  if (!request.hasContentLength()) {
    response.setStatusAndReason(HTTPResponse::HTTP_LENGTH_REQUIRED);
    response.send();
  } else if (request.getContentType() != "application/json") {
    response.set("Accept-Post", "application/json; charset=UTF-8");
    response.setStatusAndReason(HTTPResponse::HTTP_UNSUPPORTED_MEDIA_TYPE);
    response.send();
  } else {
    try {
      Parser          parser;
      PasswordHasher  hasher;
      UserCredentials newUser;
      Var             result     = parser.parse(request.stream());
      Object::Ptr     JSONObject = result.extract< Object::Ptr >();

      newUser.name         = JSONObject->getValue< std::string >("name");
      newUser.username     = JSONObject->getValue< std::string >("username");
      newUser.email        = JSONObject->getValue< std::string >("email");
      newUser.salt         = hasher.genSalt();
      newUser.passwordHash = hasher.encryptPassword(
          JSONObject->getValue< std::string >("password"), newUser.salt
      );

      m_db.createUser(newUser);

      response.setStatusAndReason(HTTPResponse::HTTP_CREATED);
      response.send();
    } catch (UsernameExistsException const& e) {
      std::string error = "username exists";
      response.setContentLength(error.length());
      response.setStatusAndReason(HTTPResponse::HTTP_CONFLICT);
      response.send() << error;
    } catch (EmailExistsException const& e) {
      std::string error = "email exists";
      response.setContentLength(error.length());
      response.setStatusAndReason(HTTPResponse::HTTP_CONFLICT);
      response.send() << error;
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
          "[ERROR] POST /api/auth/register: Exception %s:\n%s\n",
          std::string(e.className()),
          e.displayText()
      );
    }
  }
}
