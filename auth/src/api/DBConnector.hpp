#pragma once

#include "UserCredentials.hpp"

#include <Poco/Data/Session.h>
#include <Poco/Exception.h>

using Poco::Data::Session;

class DBConnector {
public:
  explicit DBConnector(Session& dbSession);

  void createUser(UserCredentials user);

  UserCredentials findUserWithCredentials(std::string const& login);

private:
  Session& m_db;
};

class UsernameExistsException : public Poco::DataException {};

class EmailExistsException : public Poco::DataException {};

class UserNotFoundException : public Poco::DataException {};
