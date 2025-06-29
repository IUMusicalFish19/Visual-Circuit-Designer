cmake_minimum_required(VERSION 3.30)
project(VCDAuth CXX)

file(GLOB_RECURSE SRCS "src/*.cpp")

find_package(PostgreSQL REQUIRED)
find_package(Poco REQUIRED COMPONENTS Net JWT Util Data DataPostgreSQL)

add_executable(${PROJECT_NAME} ${SRCS})
target_link_libraries(${PROJECT_NAME} Poco::Util Poco::Net Poco::JWT Poco::Data Poco::DataPostgreSQL)
