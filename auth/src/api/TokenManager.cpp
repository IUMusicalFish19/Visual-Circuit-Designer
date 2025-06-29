#include "TokenManager.hpp"

#include "PasswordHasher.hpp"
#include "User.hpp"

#include <Poco/JSON/Object.h>
#include <Poco/JSON/Stringifier.h>
#include <Poco/JWT/Token.h>
#include <Poco/Timestamp.h>
#include <sstream>

using Poco::JSON::Object;
using Poco::JSON::Stringifier;
using Poco::JWT::Token;

TokenManager::TokenManager() {
  PasswordHasher hasher;
  m_signer.setHMACKey(hasher.genSalt());
}

std::string TokenManager::generate(User const& user) {
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
  refresh.setSubject("VCD JWT Refresh");
  refresh.setIssuedAt(Poco::Timestamp());

  access.payload() = payload;
  access.setSubject("VCD JWT Access");
  access.setIssuedAt(Poco::Timestamp());

  ret.set("refresh", m_signer.sign(refresh, Signer::ALGO_HS256));
  ret.set("access", m_signer.sign(access, Signer::ALGO_HS256));

  Stringifier::stringify(ret, tmp);
  return tmp.rdbuf()->str();
}
