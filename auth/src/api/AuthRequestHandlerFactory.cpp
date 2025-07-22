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
#include <Poco/Net/HTTPServerResponse.h>

using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;

class BaseCORSHandler : public Poco::Net::HTTPRequestHandler {
protected:
  void addCORSHeaders(Poco::Net::HTTPServerResponse& response) {
    response.set("Access-Control-Allow-Origin", "/");
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
    );
    response.set("Access-Control-Max-Age", "86400");
    response.set("Vary", "Origin");
  }
};

class CORSHandler : public BaseCORSHandler {
public:
  void handleRequest(
      Poco::Net::HTTPServerRequest&  request,
      Poco::Net::HTTPServerResponse& response
  ) override {
    addCORSHeaders(response);
    if (request.getMethod() == "OPTIONS") {
      response.setStatus(Poco::Net::HTTPResponse::HTTP_OK);
      response.send();
    } else {
      response.setStatus(Poco::Net::HTTPResponse::HTTP_METHOD_NOT_ALLOWED);
      response.send();
    }
  }
};

class CORSHandlerWrapper : public BaseCORSHandler {
public:
  CORSHandlerWrapper(Poco::Net::HTTPRequestHandler* handler)
      : m_handler(handler) {}

  ~CORSHandlerWrapper() override { delete m_handler; }

  void handleRequest(
      Poco::Net::HTTPServerRequest&  request,
      Poco::Net::HTTPServerResponse& response
  ) override {
    addCORSHeaders(response);
    m_handler->handleRequest(request, response);
  }

private:
  Poco::Net::HTTPRequestHandler* m_handler;
};

class CORSRegistrationHandler : public BaseCORSHandler {
public:
  explicit CORSRegistrationHandler(DBConnector& db)
      : m_handler(db) {}

  void handleRequest(
      Poco::Net::HTTPServerRequest&  request,
      Poco::Net::HTTPServerResponse& response
  ) override {
    addCORSHeaders(response);
    m_handler.handleRequest(request, response);
  }

private:
  RegistrationHandler m_handler;
};

class CORSLoginHandler : public BaseCORSHandler {
public:
  CORSLoginHandler(DBConnector& db, TokenManager& tokenManager)
      : m_handler(db, tokenManager) {}

  void handleRequest(
      Poco::Net::HTTPServerRequest&  request,
      Poco::Net::HTTPServerResponse& response
  ) override {
    addCORSHeaders(response);
    m_handler.handleRequest(request, response);
  }

private:
  LoginHandler m_handler;
};

class CORSVerificationHandler : public BaseCORSHandler {
public:
  explicit CORSVerificationHandler(TokenManager& tokenManager)
      : m_handler(tokenManager) {}

  void handleRequest(
      Poco::Net::HTTPServerRequest&  request,
      Poco::Net::HTTPServerResponse& response
  ) override {
    addCORSHeaders(response);
    m_handler.handleRequest(request, response);
  }

private:
  VerificationHandler m_handler;
};

class CORSRefreshHandler : public BaseCORSHandler {
public:
  explicit CORSRefreshHandler(TokenManager& tokenManager)
      : m_handler(tokenManager) {}

  void handleRequest(
      Poco::Net::HTTPServerRequest&  request,
      Poco::Net::HTTPServerResponse& response
  ) override {
    addCORSHeaders(response);
    m_handler.handleRequest(request, response);
  }

private:
  RefreshHandler m_handler;
};

class CORSNotFoundHandler : public BaseCORSHandler {
public:
  void handleRequest(
      Poco::Net::HTTPServerRequest&  request,
      Poco::Net::HTTPServerResponse& response
  ) override {
    addCORSHeaders(response);
    response.setStatus(Poco::Net::HTTPResponse::HTTP_NOT_FOUND);
    response.send();
  }
};

AuthRequestHandlerFactory::AuthRequestHandlerFactory(
    DBConnector& db, TokenManager& tokenManager
)
    : m_db(db)
    , m_tokenManager(tokenManager) {}

HTTPRequestHandler*
AuthRequestHandlerFactory::createRequestHandler(HTTPServerRequest const& request
) {
  if (request.getMethod() == "OPTIONS") {
    return new CORSHandler();
  }

  if (request.getMethod() == "POST") {
    if (request.getURI() == "/api/auth/register") {
      return new CORSRegistrationHandler(m_db);
    } else if (request.getURI() == "/api/auth/login") {
      return new CORSLoginHandler(m_db, m_tokenManager);
    } else if (request.getURI() == "/api/auth/verify") {
      return new CORSVerificationHandler(m_tokenManager);
    } else if (request.getURI() == "/api/auth/refresh") {
      return new CORSRefreshHandler(m_tokenManager);
    }
  }

  return new CORSNotFoundHandler();
}
