#!/bin/bash

if [ "$DATABASE_DEPLOYMENT" = "local" ]
then
      echo "\$DATABASE_DEPLOYMENT is local, need to run local ${DATABASE_TYPE} container."
      CONTAINERS_TO_RUN="-f  docker-compose.yml"
else
      echo "\$DATABASE_DEPLOYMENT is empty, using DATABASE_URI : ${DATABASE_URL}"
      CONTAINERS_TO_RUN="-f docker-compose.yml"
fi



docker-compose -f docker-compose.yml down

docker-compose $CONTAINERS_TO_RUN up  -d