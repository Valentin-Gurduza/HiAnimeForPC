#!/bin/bash

echo "Installing HiAnime For PC dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Install dependencies
echo "Installing npm dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Failed to install dependencies"
    exit 1
fi

echo ""
echo "Dependencies installed successfully!"
echo ""
echo "To start the application in development mode:"
echo "npm run dev"
echo ""
echo "To build the application:"
echo "npm run build"
echo ""
