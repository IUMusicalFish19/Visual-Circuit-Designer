#pragma once
#include <Poco/Random.h>
#include <string>

class PasswordHasher {
public:
  std::string genSalt();
  std::string
       encryptPassword(std::string const& password, std::string const& salt);
  bool verifyPassword(
      std::string const& password,
      std::string const& hash,
      std::string const& salt
  );

private:
  Poco::Random m_prng;
};
