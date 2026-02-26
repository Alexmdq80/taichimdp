#!/bin/bash

# Script to run database migrations on Linux
# Usage: ./run-migration.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Running database migrations ===${NC}"

# Check if mysql client is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}ERROR: mysql command not found. Please install MySQL client.${NC}"
    exit 1
fi

# Load configuration from .env
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Copying from env.example...${NC}"
    cp env.example .env
fi

# Function to get value from .env
get_env_val() {
    grep "^$1=" "$ENV_FILE" | cut -d'=' -f2-
}

DB_USER=$(get_env_val "DB_USER")
DB_PASSWORD=$(get_env_val "DB_PASSWORD")
DB_NAME=$(get_env_val "DB_NAME")
DB_HOST=$(get_env_val "DB_HOST")
DB_PORT=$(get_env_val "DB_PORT")

# Set defaults if not provided
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-tai_chi_management}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}

echo -e "${YELLOW}Detected configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Build connection command
MYSQL_CMD="mysql -h $DB_HOST -P $DB_PORT -u $DB_USER"
if [ -n "$DB_PASSWORD" ]; then
    MYSQL_CMD="$MYSQL_CMD -p$DB_PASSWORD"
fi

# Create database
echo -e "${YELLOW}Creating database (if not exists)...${NC}"
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Could not connect to MySQL. Is it running?${NC}"
    echo -e "${YELLOW}On Ubuntu/Kubuntu, try: sudo systemctl start mysql${NC}"
    exit 1
fi

echo -e "${GREEN}Database created/verified.${NC}"

# Run migrations in order
MIGRATIONS_DIR="migrations"
for migration in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
    echo -e "${YELLOW}Executing $(basename "$migration")...${NC}"
    $MYSQL_CMD "$DB_NAME" < "$migration"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Migration $(basename "$migration") failed.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Completed.$(basename "$migration")${NC}"
done

# Verify tables
echo -e "
${YELLOW}Verifying created tables:${NC}"
$MYSQL_CMD -e "USE $DB_NAME; SHOW TABLES;"

echo -e "
${CYAN}=== Migration completed successfully ===${NC}"
