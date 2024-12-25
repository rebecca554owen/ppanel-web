#!/bin/bash

# Set up directories
OUT_DIR="out"

# Clean up any existing build artifacts
rm -rf $OUT_DIR
mkdir -p $OUT_DIR

# Declare an array of projects to build
PROJECTS=(
  "ppanel-admin-web:apps/admin:3001"
  "ppanel-user-web:apps/user:3002"
)

# Step 1: Install dependencies
bun install || {
  echo "Dependency installation failed"
  exit 1
}

# Function to extract variables from .env.template
extract_env_variables() {
  local TEMPLATE_PATH=$1
  local DEFAULT_PORT=$2
  local ENV_VARS="        NODE_ENV: 'production',"   # Start with NODE_ENV
  ENV_VARS="$ENV_VARS\n        PORT: $DEFAULT_PORT," # Add default port

  if [[ -f $TEMPLATE_PATH ]]; then
    while IFS= read -r line; do
      # Ignore empty lines and comments
      if [[ ! -z "$line" && ! $line =~ ^# ]]; then
        VAR_NAME=$(echo $line | cut -d'=' -f1)
        VAR_VALUE=$(echo $line | cut -d'=' -f2-)
        ENV_VARS="$ENV_VARS\n        $VAR_NAME: '$VAR_VALUE'," # Add new line for each variable
      fi
    done < "$TEMPLATE_PATH"
  fi

  # Remove the trailing comma
  ENV_VARS=${ENV_VARS%,}
  echo -e "$ENV_VARS"
}

# Step 2: Build each project using Turbo
for ITEM in "${PROJECTS[@]}"; do
  IFS=":" read -r PROJECT PROJECT_PATH DEFAULT_PORT <<< "$ITEM"
  echo "Building project: $PROJECT (Path: $PROJECT_PATH)"
  bun run build --filter=$PROJECT || {
    echo "Build failed for $PROJECT"
    exit 1
  }

  # Extract environment variables
  ENV_TEMPLATE_PATH="$PROJECT_PATH/.env.template"
  ENV_VARS=$(extract_env_variables "$ENV_TEMPLATE_PATH" "$DEFAULT_PORT")

  # Copy build output and static resources to the build directory
  PROJECT_BUILD_DIR=$OUT_DIR/$PROJECT
  mkdir -p $PROJECT_BUILD_DIR
  cp -r $PROJECT_PATH/.next/standalone/. $PROJECT_BUILD_DIR/
  mkdir -p $PROJECT_BUILD_DIR/$PROJECT_PATH/.next/static
  cp -r $PROJECT_PATH/.next/static/ $PROJECT_BUILD_DIR/$PROJECT_PATH/.next/static
  mkdir -p $PROJECT_BUILD_DIR/$PROJECT_PATH/public
  cp -r $PROJECT_PATH/public/ $PROJECT_BUILD_DIR/$PROJECT_PATH/public

  # Generate ecosystem.config.js for the project
  ECOSYSTEM_CONFIG="$PROJECT_BUILD_DIR/ecosystem.config.js"
  cat > $ECOSYSTEM_CONFIG << EOL
module.exports = {
  apps: [
    {
      name: "$PROJECT",
      script: "$PROJECT_PATH/server.js",
      env: {
$ENV_VARS
      }
    }
  ]
};
EOL
  echo "PM2 configuration created: $ECOSYSTEM_CONFIG"

  # Create a tar.gz archive for each project
  ARCHIVE_NAME="$OUT_DIR/$PROJECT.tar.gz"
  tar -czvf $ARCHIVE_NAME -C $PROJECT_BUILD_DIR . || {
    echo "Archiving failed for $PROJECT"
    exit 1
  }
  echo "Archive created: $ARCHIVE_NAME"
done

# Final output
echo "All projects have been built, archived, and individual PM2 configuration files generated in their respective directories."