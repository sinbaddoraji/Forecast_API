#!/bin/bash

# Entity Framework Migration Script for Forecast Budget API
# This script creates and applies database migrations with proper initial migration handling

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "Forecast_API.csproj" ]; then
    print_error "Please run this script from the Forecast_API project directory"
    exit 1
fi

# Ensure EF Core tools are available
if ! command -v dotnet-ef &> /dev/null; then
    print_warning "dotnet-ef not found. Installing..."
    dotnet tool install --global dotnet-ef
    
    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$HOME/.dotnet/tools:"* ]]; then
        export PATH="$PATH:$HOME/.dotnet/tools"
        print_status "Added .NET tools to PATH for this session"
        print_warning "To make this permanent, add the following to your shell profile:"
        echo "export PATH=\"\$PATH:\$HOME/.dotnet/tools\""
    fi
fi

# Build the project first
print_status "Building project..."
if ! dotnet build; then
    print_error "Build failed. Please fix compilation errors first."
    exit 1
fi

# Check if Migrations directory exists and has any migrations
MIGRATIONS_DIR="./Migrations"
IS_INITIAL_MIGRATION=false

if [ ! -d "$MIGRATIONS_DIR" ] || [ -z "$(ls -A "$MIGRATIONS_DIR" 2>/dev/null)" ]; then
    IS_INITIAL_MIGRATION=true
    print_info "No existing migrations found. This will be the initial migration."
fi

# Determine migration name
if [ "$IS_INITIAL_MIGRATION" = true ]; then
    MIGRATION_NAME="InitialCreate"
    print_status "Using default name for initial migration: $MIGRATION_NAME"
else
    # For subsequent migrations, require a descriptive name
    if [ -z "$1" ]; then
        print_error "Please provide a descriptive name for your migration"
        print_info "Example: ./create-migration.sh AddUserProfileTable"
        print_info "Example: ./create-migration.sh UpdateAccountConstraints"
        exit 1
    fi
    MIGRATION_NAME="$1"
    
    # Validate migration name (no spaces, reasonable length)
    if [[ "$MIGRATION_NAME" =~ [[:space:]] ]]; then
        print_error "Migration name cannot contain spaces. Use PascalCase instead."
        exit 1
    fi
    
    if [ ${#MIGRATION_NAME} -gt 50 ]; then
        print_error "Migration name is too long (max 50 characters)"
        exit 1
    fi
fi

print_status "Creating migration: $MIGRATION_NAME"

# Create migration
print_status "Generating migration files..."
if dotnet ef migrations add "$MIGRATION_NAME"; then
    print_status "Migration '$MIGRATION_NAME' created successfully"
    
    # Show the generated files
    if [ "$IS_INITIAL_MIGRATION" = true ]; then
        print_info "Initial migration files created:"
        ls -la "$MIGRATIONS_DIR"/ | grep -E "(\.cs$|\.Designer\.cs$)" || true
    fi
else
    print_error "Failed to create migration"
    exit 1
fi

# For initial migration, emphasize database creation
if [ "$IS_INITIAL_MIGRATION" = true ]; then
    print_warning "This is your initial migration - it will create all tables from scratch"
    print_info "Make sure your database server is running and connection string is correct"
fi

# Ask if user wants to apply the migration
read -p "Do you want to apply this migration to the database? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Applying migration to database..."
    
    if [ "$IS_INITIAL_MIGRATION" = true ]; then
        print_status "Creating database and initial schema..."
    else
        print_status "Updating database schema..."
    fi
    
    if dotnet ef database update; then
        print_status "Database updated successfully"
        
        if [ "$IS_INITIAL_MIGRATION" = true ]; then
            print_status "Initial database schema created with all tables"
            print_info "Your database is now ready for the Forecast Budget API"
        fi
    else
        print_error "Failed to update database"
        print_warning "Migration files were created but database was not updated"
        print_info "To apply later, run: dotnet ef database update"
        exit 1
    fi
else
    print_warning "Migration created but not applied to database"
    print_info "To apply later, run: dotnet ef database update"
    
    if [ "$IS_INITIAL_MIGRATION" = true ]; then
        print_warning "Remember: Your database tables won't exist until you apply this migration"
    fi
fi

print_status "Migration script completed!"

# Show next steps
if [ "$IS_INITIAL_MIGRATION" = true ]; then
    echo
    print_info "Next steps:"
    echo "1. Verify your database connection string in appsettings.json"
    echo "2. Consider seeding initial data (categories, default user, etc.)"
    echo "3. Test your API endpoints with the new database"
fi