#!/bin/bash
# docker-build-push.sh
# Build Docker image and push to Azure Container Registry

# -----------------------------
# CONFIGURATION
# -----------------------------
IMAGE_NAME="salary-submission-service"
IMAGE_TAG="1.0"
ACR_NAME="zalarycontainerregistry"

# -----------------------------
# BUILD DOCKER IMAGE
# -----------------------------
echo "Building Docker image..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .
if [ $? -ne 0 ]; then
    echo "Docker build failed!"
    exit 1
fi

# -----------------------------
# TAG IMAGE FOR ACR
# -----------------------------
echo "Tagging Docker image for ACR..."
docker tag $IMAGE_NAME:$IMAGE_TAG $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG
if [ $? -ne 0 ]; then
    echo "Docker tag failed!"
    exit 1
fi

# -----------------------------
# LOGIN TO ACR
# -----------------------------
echo "Logging in to Azure Container Registry..."
az acr login --name $ACR_NAME
if [ $? -ne 0 ]; then
    echo "ACR login failed!"
    exit 1
fi

# -----------------------------
# PUSH IMAGE TO ACR
# -----------------------------
echo "Pushing Docker image to ACR..."
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG
if [ $? -ne 0 ]; then
    echo "Docker push failed!"
    exit 1
fi

echo "Docker image pushed successfully: $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG"