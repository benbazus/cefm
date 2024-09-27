#!/bin/bash

# Exit on any error
set -e

# Update and upgrade the system packages
sudo apt update && sudo apt upgrade -y

# Install necessary dependencies if not already installed
sudo apt install -y curl gnupg build-essential

# Check if Node.js is installed, install if not
if ! command -v node &> /dev/null
then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Check if PM2 is installed, install if not
if ! command -v pm2 &> /dev/null
then
    sudo npm install -g pm2
fi

# Install Git if not already installed
sudo apt install -y git

# Install PostgreSQL if not already installed
if ! command -v psql &> /dev/null
then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Create a PostgreSQL user and database (replace 'yourusername', 'yourpassword', and 'yourdatabase' with your credentials)
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'yourusername') THEN CREATE ROLE yourusername WITH LOGIN PASSWORD 'yourpassword'; END IF; END \$\$;"
sudo -u postgres psql -c "CREATE DATABASE yourdatabase OWNER yourusername;"

# Clone your Next.js project from the repository
git clone https://github.com/yourusername/your-nextjs-project.git /var/www/your-nextjs-project
cd /var/www/your-nextjs-project

# Install project dependencies
npm install

# Build the Next.js application
npm run build

# Start the application using PM2
pm2 start npm --name "your-nextjs-app" -- start

# Save the PM2 process list and configure it to start on boot
pm2 save
pm2 startup

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null
then
    sudo apt install -y nginx
fi

# Remove default Nginx site configuration if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# Create a new Nginx server block for your Next.js app
sudo tee /etc/nginx/sites-available/your-nextjs-app > /dev/null <<EOL
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable the Nginx server block configuration
sudo ln -s /etc/nginx/sites-available/your-nextjs-app /etc/nginx/sites-enabled/

# Test Nginx configuration and restart Nginx
sudo nginx -t && sudo systemctl restart nginx

# Setup a firewall to allow traffic on HTTP and HTTPS if not already configured
sudo ufw allow 'Nginx Full'

# Deployment complete
echo "Deployment complete! Your Next.js app is now running on your Ubuntu server."
