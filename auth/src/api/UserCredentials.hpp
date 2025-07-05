#pragma once

#include "User.hpp"

struct UserCredentials : public User {
public:
  std::string passwordHash = "";
  std::string salt         = "";
};
