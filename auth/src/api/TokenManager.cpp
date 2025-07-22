#include "TokenManager.hpp"

#include "PasswordHasher.hpp"
#include "User.hpp"

#include <Poco/JSON/Object.h>
#include <Poco/JSON/Stringifier.h>
#include <Poco/JWT/Token.h>
#include <Poco/Timestamp.h>
#include <Poco/Util/Application.h>
#include <sstream>
#include <string>

using Poco::JSON::Object;
using Poco::JSON::Stringifier;
using Poco::JWT::Token;

TokenManager::TokenManager() {
  PasswordHasher hasher;
  m_signer.setHMACKey(hasher.genSalt());
  Poco::Util::Application::instance().logger().information(
      "JWT key: %s", m_signer.getHMACKey()
  );
}

std::string TokenManager::generate(User const& user) const {
  Token             refresh, access;
  Object            payload;
  Object            ret;
  std::stringstream tmp;

  payload.set("id", user.id);
  payload.set("username", user.username);
  payload.set("email", user.email);
  payload.set("name", user.name);
  payload.set("createdAt", user.createdAt);

  refresh.payload() = payload;
  refresh.setType("JWT");
  refresh.setSubject("VCD JWT Refresh");
  refresh.setIssuedAt(Poco::Timestamp());

  access.payload() = payload;
  access.setType("JWT");
  access.setSubject("VCD JWT Access");
  access.setIssuedAt(Poco::Timestamp());

  ret.set("refresh", m_signer.sign(refresh, Signer::ALGO_HS256));
  ret.set("access", m_signer.sign(access, Signer::ALGO_HS256));

  Stringifier::stringify(ret, tmp);
  return tmp.rdbuf()->str();
}

bool TokenManager::verify(std::string const& token, Type type) const {
  Token decoded;
  return _verify(token, decoded, type);
}

User TokenManager::getUser(std::string const& token) const {
  User  ret;
  Token decoded;

  if (m_signer.tryVerify(token, decoded)) {
    ret.id        = decoded.payload().getValue< int >("id");
    ret.username  = decoded.payload().getValue< std::string >("username");
    ret.email     = decoded.payload().getValue< std::string >("email");
    ret.name      = decoded.payload().getValue< std::string >("name");
    ret.createdAt = decoded.payload().getValue< std::string >("createdAt");
  }

  return ret;
}

std::string TokenManager::refresh(std::string const& token) {
  m_blacklist.insert(token);
  return generate(getUser(token));
}

bool TokenManager::_verify(
    std::string const& token, Poco::JWT::Token& out, Type type
) const {
  if (m_signer.tryVerify(token, out)) {
    Type realType = out.getSubject() == "VCD JWT Access" ? ACCESS : REFRESH;
    if (type != ANY && realType != type) {
      return false;
    }
    switch (realType) {
    case ACCESS: return !out.getIssuedAt().isElapsed(15LL * 60000000LL);
    case REFRESH:
      return !out.getIssuedAt().isElapsed(30LL * 24LL * 60LL * 60000000LL) &&
             (m_blacklist.find(token) == m_blacklist.cend());
    default: return false;
    }
  } else {
    return false;
  }
}
