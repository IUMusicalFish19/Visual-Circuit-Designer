#pragma once
#include <Poco/Util/ServerApplication.h>
#include <string>
#include <vector>

using Poco::Util::ServerApplication;

class AppAuthServer : public ServerApplication {
protected:
    void initialize(Application& self) override;
    int main(const std::vector<std::string>& args) override;
};
