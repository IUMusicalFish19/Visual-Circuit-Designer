#include "DBConnector.hpp"

#include "UserCredentials.hpp"

#include <Poco/Data/AbstractBinder.h>
#include <Poco/Data/AbstractExtractor.h>
#include <Poco/Data/AbstractPreparator.h>
#include <Poco/Data/PostgreSQL/PostgreSQLException.h>
#include <Poco/Data/Statement.h>
#include <Poco/Data/TypeHandler.h>
#include <Poco/Exception.h>
#include <Poco/Util/Application.h>
#include <cstring>
#include <regex>
#include <string>

using Poco::Data::Statement;
using namespace Poco::Data::Keywords;

DBConnector::DBConnector(Session& dbSession)
    : m_db(dbSession) {}

void DBConnector::createUser(UserCredentials user) {
  Statement sql(m_db);

  try {
    sql << "INSERT INTO users (name, username, email, salt, password_hash) "
           "VALUES ($1, $2, $3, $4, $5)",
        use(user.name), use(user.username), use(user.email), use(user.salt),
        use(user.passwordHash);

    sql.execute();
  } catch (Poco::Data::PostgreSQL::StatementException const& e) {
    if (strcmp(e.sqlState(), "23505") == 0) {
      std::regex  regexp("Constraint: users_(username|email)_key");
      std::smatch match;
      if (std::regex_search(e.message(), match, regexp)) {
        if (match[1] == "username") {
          throw UsernameExistsException();
        } else if (match[1] == "email") {
          throw EmailExistsException();
        }
      }
    }
    throw;
  } catch (Poco::Exception const& e) {
    Poco::Util::Application::instance().logger().error(
        "[ERROR] DBConnector::createUser: Exception %s:\n%s\n",
        std::string(e.className()),
        e.displayText()
    );
    throw;
  }
}

UserCredentials DBConnector::findUserWithCredentials(std::string const& login) {
  Statement       sql(m_db);
  std::string     clogin = login;
  UserCredentials user;

  try {
    sql << "SELECT id, username, email, name, created_at, password_hash, salt "
           "FROM users WHERE username = $1 OR email = $1",
        into(user), use(clogin);

    sql.execute();
  } catch (Poco::Exception const& e) {
    Poco::Util::Application::instance().logger().error(
        "[ERROR] DBConnector::findUser: Exception %s:\n%s",
        std::string(e.className()),
        e.displayText()
    );
    throw;
  }

  if (user.id == -1) {
    throw UserNotFoundException();
  }

  return user;
}

namespace Poco::Data {
  template<>
  class TypeHandler< struct User > {
  public:
    static void bind(
        size_t                    pos,
        User const&               obj,
        AbstractBinder::Ptr       pBinder,
        AbstractBinder::Direction dir
    ) {
      TypeHandler< int >::bind(pos++, obj.id, pBinder, dir);
      TypeHandler< std::string >::bind(pos++, obj.username, pBinder, dir);
      TypeHandler< std::string >::bind(pos++, obj.email, pBinder, dir);
      TypeHandler< std::string >::bind(pos++, obj.name, pBinder, dir);
      TypeHandler< std::string >::bind(pos++, obj.createdAt, pBinder, dir);
    }

    static size_t size() { return 5; }

    static void
    prepare(size_t pos, User const& obj, AbstractPreparator::Ptr pPrepare) {
      TypeHandler< int >::prepare(pos++, obj.id, pPrepare);
      TypeHandler< std::string >::prepare(pos++, obj.username, pPrepare);
      TypeHandler< std::string >::prepare(pos++, obj.email, pPrepare);
      TypeHandler< std::string >::prepare(pos++, obj.name, pPrepare);
      TypeHandler< std::string >::prepare(pos++, obj.createdAt, pPrepare);
    }

    static void extract(
        size_t pos, User& obj, User const& defVal, AbstractExtractor::Ptr pExt
    ) {
      int         id;
      std::string username;
      std::string email;
      std::string name;
      std::string createdAt;
      TypeHandler< int >::extract(pos++, id, defVal.id, pExt);
      TypeHandler< std::string >::extract(
          pos++, username, defVal.username, pExt
      );
      TypeHandler< std::string >::extract(pos++, email, defVal.email, pExt);
      TypeHandler< std::string >::extract(pos++, name, defVal.name, pExt);
      TypeHandler< std::string >::extract(
          pos++, createdAt, defVal.createdAt, pExt
      );
      obj.id        = id;
      obj.username  = username;
      obj.email     = email;
      obj.name      = name;
      obj.createdAt = createdAt;
    }
  };

  template<>
  class TypeHandler< struct UserCredentials > {
  public:
    static void bind(
        size_t                    pos,
        UserCredentials const&    obj,
        AbstractBinder::Ptr       pBinder,
        AbstractBinder::Direction dir
    ) {
      TypeHandler< User >::bind(pos, obj, pBinder, dir);
      pos += TypeHandler< User >::size();
      TypeHandler< std::string >::bind(pos++, obj.passwordHash, pBinder, dir);
      TypeHandler< std::string >::bind(pos++, obj.salt, pBinder, dir);
    }

    static size_t size() { return TypeHandler< User >::size() + 2; }

    static void prepare(
        size_t pos, UserCredentials const& obj, AbstractPreparator::Ptr pPrepare
    ) {
      TypeHandler< User >::prepare(pos, obj, pPrepare);
      pos += TypeHandler< User >::size();
      TypeHandler< std::string >::prepare(pos++, obj.passwordHash, pPrepare);
      TypeHandler< std::string >::prepare(pos++, obj.salt, pPrepare);
    }

    static void extract(
        size_t                 pos,
        UserCredentials&       obj,
        UserCredentials const& defVal,
        AbstractExtractor::Ptr pExt
    ) {
      TypeHandler< User >::extract(pos, obj, defVal, pExt);
      pos += TypeHandler< User >::size();
      TypeHandler< std::string >::extract(
          pos++, obj.passwordHash, defVal.passwordHash, pExt
      );
      TypeHandler< std::string >::extract(pos++, obj.salt, defVal.salt, pExt);
    }
  };
} // namespace Poco::Data
