#pragma once
#include <string>

struct User {
public:
  int         id        = -1;
  std::string username  = "";
  std::string email     = "";
  std::string name      = "";
  std::string createdAt = "";
};
