#pragma once

#include "User.hpp"

#include <Poco/JWT/Signer.h>
#include <Poco/JWT/Token.h>
#include <string>
#include <unordered_set>

using Poco::JWT::Signer;

namespace Poco::JWT {}

class TokenManager {
public:
  enum Type { ACCESS, REFRESH, ANY };

public:
  TokenManager();

public:
  std::string generate(User const& user) const;

  bool verify(std::string const& token, Type type = ANY) const;

  User getUser(std::string const& token) const;

  std::string refresh(std::string const& token);

private:
  bool _verify(std::string const& token, Poco::JWT::Token& out, Type type = ANY)
      const;

private:
  Signer                            m_signer;
  std::unordered_set< std::string > m_blacklist;
};
