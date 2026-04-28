#!/bin/bash

set -e

echo "Downloading Azure DevOps Agent..."
mkdir -p myagent && cd myagent
curl -O -L https://download.agent.dev.azure.com/agent/4.271.0/vsts-agent-linux-x64-4.271.0.tar.gz
tar zxvf vsts-agent-linux-x64-4.271.0.tar.gz

echo "Updating system..."
sudo apt-get update
sudo apt-get upgrade -y

echo "Installing Docker prerequisites..."
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Installing Docker..."
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Starting Docker..."
sudo systemctl start docker
sudo systemctl enable docker

echo "Adding user to Docker group..."
sudo usermod -aG docker $USER

echo "Applying group changes..."
newgrp docker

echo "Configure Azure DevOps Agent..."
./config.sh

echo "Running Agent..."
./run.sh