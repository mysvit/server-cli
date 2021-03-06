#!/bin/sh
source $(pwd)/scripts/config.sh

# how to use
# run from root folder
# sudo bash scripts/1-start-db.sh docker  - it run MariaDB docker container and create database, import data and schema from db/whatreasondb-schema-data.sql
# bash scripts/1-start-db.sh local        - in local running MariaDB create database, import data and schema from db/whatreasondb-schema-data.sql

if [ $# -eq 0 ]; then
  echo
  echo "Use parameter: [docker] or [local]"
  echo "Example: sudo bash scripts/1-start-db.sh docker"
  exit 1
fi

initDB() {
  if [[ -z "`mariadb -h 127.0.0.1 -u root -proot -qfsBe "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='$DBNAME'" 2>&1`" ]];
  then
    echo "DATABASE DOES NOT EXIST"
    mariadb -h 127.0.0.1 -u root -proot -e "CREATE DATABASE $DBNAME CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;"
    mariadb -h 127.0.0.1 -u root -proot -D $DBNAME < $DBNAME-schema-data.sql
  else
    echo "DATABASE ALREADY EXISTS"
  fi
}

initDBinDocker() {
  [ ! -d "$(pwd)/mariadb" ] && mkdir $(pwd)/mariadb
  docker network create dev-net || true

  docker run --rm \
            --name server-db \
            --net dev-net \
             -v $(pwd)/db:/docker-entrypoint-initdb.d \
             -v $(pwd)/mariadb:/var/lib/mysql \
             -p 3306:3306 \
             -e MARIADB_DATABASE=$DBNAME \
             -e MARIADB_ROOT_PASSWORD=root \
             --pull missing mariadb:10.8.3-jammy
}

if [ $1 = "local" ]; then
  initDB
elif [ $1 = "docker" ]; then
  initDBinDocker
fi
