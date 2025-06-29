#pragma once

#include "User.hpp"

#include <Poco/JWT/Signer.h>
#include <string>

using Poco::JWT::Signer;

class TokenManager {
public:
  TokenManager();

public:
  std::string generate(User const& user);

private:
  Signer m_signer;
};
