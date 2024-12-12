#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Store the original directory
ORIGINAL_DIR=$(pwd)

# Check if frontend and backend directories exist
if [ ! -d "frontend" ]; then
    error "Frontend directory not found!"
    exit 1
fi

if [ ! -d "backend" ]; then
    error "Backend directory not found!"
    exit 1
fi

# Function to check if node_modules exists
check_node_modules() {
    local dir=$1
    if [ ! -d "$dir/node_modules" ]; then
        warn "node_modules not found in $dir. Running npm install..."
        (cd "$dir" && npm install) || {
            error "Failed to install dependencies in $dir"
            exit 1
        }
    fi
}

# Check for node_modules in both directories
check_node_modules "frontend"
check_node_modules "backend"

# Start backend
log "Starting backend server..."
cd backend || exit 1
npm run dev &
BACKEND_PID=$!

# Start frontend
log "Starting frontend server..."
cd ../frontend || exit 1
npm start &
FRONTEND_PID=$!

# Return to original directory
cd "$ORIGINAL_DIR" || exit 1

# Handle script termination
trap 'log "Shutting down services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' SIGINT SIGTERM

log "Both services are starting up!"
log "Frontend is running at: ${GREEN}http://localhost:3000${NC}"
log "Backend is running at:  ${GREEN}http://localhost:3001${NC}"
log "Press Ctrl+C to stop both servers."

# Wait for both processes
wait