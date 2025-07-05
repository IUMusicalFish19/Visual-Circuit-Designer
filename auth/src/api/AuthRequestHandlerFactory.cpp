#include "AuthRequestHandlerFactory.hpp"

#include "DBConnector.hpp"
#include "TokenManager.hpp"
#include "handlers/LoginHandler.hpp"
#include "handlers/NotFoundHandler.hpp"
#include "handlers/RefreshHandler.hpp"
#include "handlers/RegistrationHandler.hpp"
#include "handlers/VerificationHandler.hpp"

#include <Poco/Net/HTTPRequestHandler.h>
#include <Poco/Net/HTTPServerRequest.h>

using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPServerRequest;

AuthRequestHandlerFactory::AuthRequestHandlerFactory(
    DBConnector& db, TokenManager& tokenManager
)
    : m_db(db)
    , m_tokenManager(tokenManager) {}

HTTPRequestHandler*
AuthRequestHandlerFactory::createRequestHandler(HTTPServerRequest const& request
) {
  if (request.getMethod() == "POST") {
    if (request.getURI() == "/api/auth/register") {
      return new RegistrationHandler(m_db);
    } else if (request.getURI() == "/api/auth/login") {
      return new LoginHandler(m_db, m_tokenManager);
    } else if (request.getURI() == "/api/auth/verify") {
      return new VerificationHandler(m_tokenManager);
    } else if (request.getURI() == "/api/auth/refresh") {
      return new RefreshHandler(m_tokenManager);
    }
  }
  return new NotFoundHandler;
}
