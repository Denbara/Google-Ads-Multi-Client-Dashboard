# Google Ads API Server Deployment Guide

This document provides instructions for deploying the Google Ads API server to a permanent production environment.

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- A cloud hosting provider with Node.js support (Heroku, AWS, Google Cloud, etc.)

## Deployment Steps

1. **Prepare the Server Package**
   - The server code is located in the `server-deploy` directory
   - All necessary files are included: `server.js`, `package.json`, and `.env`

2. **Environment Variables**
   - Set the following environment variables in your hosting provider:
     - `PORT`: The port on which the server will run (default: 3001)
     - `ENCRYPTION_KEY`: A secure key for encrypting API credentials
     - `NODE_ENV`: Set to "production" for production deployment

3. **Deploy to Cloud Provider**
   - Upload the server package to your chosen cloud provider
   - Follow the provider's instructions for deploying a Node.js application
   - Ensure the server is accessible via HTTPS

4. **Update Frontend Configuration**
   - After deployment, update the frontend API client to use the new permanent backend URL
   - The URL should be in the format: `https://your-api-domain.com/api`

## Testing the Deployment

1. **Health Check**
   - Access the health check endpoint: `https://your-api-domain.com/api/health`
   - Verify that the response includes `{"status":"ok"}`

2. **API Connection Test**
   - Use the dashboard's API Settings page to test the connection
   - Enter valid Google Ads API credentials and click "Test Connection"
   - Verify that real accounts are returned

## Troubleshooting

- **CORS Issues**: Ensure the server's CORS configuration includes all frontend domains
- **Connection Errors**: Check that the server is accessible from the internet
- **Encryption Errors**: Verify that the ENCRYPTION_KEY is exactly 32 bytes long

## Maintenance

- Regularly check server logs for errors
- Update dependencies as needed
- Monitor server performance and scale as required
