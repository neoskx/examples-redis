#!/bin/bash

# Script to start Redis Stack using Docker

# Set Docker image name and container name
IMAGE_NAME="redis/redis-stack:latest"
CONTAINER_NAME="redis-stack-chat"

# Set the port mappings (adjust as needed)
REDIS_PORT=6379
REDIS_WEB_UI_PORT=8001

# Check if the Docker image is available locally, if not pull it
if [[ "$(docker images -q $IMAGE_NAME 2>/dev/null)" == "" ]]; then
  echo "Docker image not found locally. Pulling $IMAGE_NAME..."
  docker pull $IMAGE_NAME
fi

# Check if a container with the same name is already running
if [[ "$(docker ps -q -f name=$CONTAINER_NAME)" ]]; then
  echo "Stopping and removing existing container $CONTAINER_NAME..."
  docker stop $CONTAINER_NAME
  docker rm $CONTAINER_NAME
fi

# Start the Redis Stack container
echo "Starting Redis Stack container..."
docker run -d --name $CONTAINER_NAME \
  -p $REDIS_PORT:6379 \
  -p $REDIS_WEB_UI_PORT:8001 \
  $IMAGE_NAME

# Check if the container started successfully
if [[ "$(docker ps -q -f name=$CONTAINER_NAME)" ]]; then
  echo "Redis Stack is running on ports:"
  echo "  - Redis: $REDIS_PORT"
  echo "  - Redis Web UI: http://localhost:$REDIS_WEB_UI_PORT"

  # Open Redis Insight URL in the default web browser
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:$REDIS_WEB_UI_PORT"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:$REDIS_WEB_UI_PORT"
  elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    start "http://localhost:$REDIS_WEB_UI_PORT"
  else
    echo "Please open your browser and navigate to http://localhost:$REDIS_WEB_UI_PORT"
  fi

else
  echo "Failed to start Redis Stack container."
fi
