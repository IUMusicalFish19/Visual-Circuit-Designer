#include "PasswordHasher.hpp"

#include <Poco/DigestEngine.h>
#include <Poco/HMACEngine.h>
#include <Poco/PBKDF2Engine.h>
#include <Poco/SHA1Engine.h>
#include <cstddef>

using Poco::DigestEngine;
using Poco::HMACEngine;
using Poco::PBKDF2Engine;
using Poco::SHA1Engine;

std::string PasswordHasher::genSalt() {
  DigestEngine::Digest ret(32);

  for (size_t i = 0; i < ret.size(); ++i) { ret[i] = m_prng.nextChar(); }

  return DigestEngine::digestToHex(ret);
}

std::string PasswordHasher::encryptPassword(
    std::string const& password, std::string const& salt
) {
  PBKDF2Engine< HMACEngine< SHA1Engine > > pbkdf2(salt);
  pbkdf2.update(password);
  return DigestEngine::digestToHex(pbkdf2.digest());
}

bool PasswordHasher::verifyPassword(
    std::string const& password,
    std::string const& hash,
    std::string const& salt
) {
  return hash == encryptPassword(password, salt);
}
