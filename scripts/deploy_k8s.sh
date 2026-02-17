#!/bin/bash

# Deployment Script for Haircut Salon
# Enforces order: MySQL -> Backend -> Frontend

set -e # Exit immediately if a command exits with a non-zero status.

echo "🚀 Starting Deployment..."

# 1. Database
echo "------------------------------------------------"
echo "📦 Step 1: Deploying MySQL Database..."
kubectl apply -f k8s/db-secret.yaml
kubectl apply -f k8s/mysql-deployment.yaml

echo "⏳ Waiting for MySQL to be fully ready..."
# Wait for the pod to be running and ready
kubectl wait --for=condition=ready pod -l app=mysql --timeout=120s

echo "✅ MySQL is up and running!"

# 2. Backend
echo "------------------------------------------------"
echo "📦 Step 2: Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml

echo "⏳ Waiting for Backend to be ready..."
# The backend has an initContainer that waits for MySQL's port
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s

echo "✅ Backend is ready!"

# 3. Frontend
echo "------------------------------------------------"
echo "📦 Step 3: Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml

echo "⏳ Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend --timeout=60s

echo "✅ Frontend is ready!"

# Summary
echo "------------------------------------------------"
echo "🎉 Deployment Complete Successfully!"
echo "Here are your services:"
kubectl get svc
