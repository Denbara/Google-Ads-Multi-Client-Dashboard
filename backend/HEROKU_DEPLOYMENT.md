# Google Ads API Server - Heroku Deployment Guide

This guide provides step-by-step instructions for deploying the Google Ads API server to Heroku.

## Prerequisites

- A Heroku account (free tier is sufficient to start)
- Heroku CLI installed locally
- Git installed locally

## Deployment Steps

1. **Create a Heroku App**
   ```bash
   heroku login
   heroku create your-google-ads-api
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set ENCRYPTION_KEY=your-secure-32-character-key
   heroku config:set NODE_ENV=production
   ```

3. **Deploy the Application**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku master
   ```

4. **Verify Deployment**
   ```bash
   heroku open
   ```
   - Access the health check endpoint: `https://your-google-ads-api.herokuapp.com/api/health`
   - Verify that the response includes `{"status":"ok"}`

5. **Update Frontend Configuration**
   - Update the frontend API client to use the new Heroku URL:
   ```typescript
   // In googleAdsApiRealClient.ts
   private getApiBaseUrl(): string {
     // For production deployment with Heroku
     if (window.location.hostname.includes('aqassvhw.manus.space')) {
       return 'https://your-google-ads-api.herokuapp.com/api';
     }
     // ... other environment handling
   }
   ```

## Scaling and Monitoring

- **Basic Monitoring**
  ```bash
  heroku logs --tail
  ```

- **Scaling**
  ```bash
  heroku ps:scale web=1
  ```

- **Add-ons for Enhanced Monitoring**
  ```bash
  heroku addons:create papertrail:choklad
  ```

## Troubleshooting

- **Application Crashes**: Check logs with `heroku logs --tail`
- **Deployment Failures**: Ensure all dependencies are in package.json
- **Connection Issues**: Verify CORS settings include your frontend domain

## Maintenance

- **Updating the Application**
  ```bash
  git add .
  git commit -m "Update application"
  git push heroku master
  ```

- **Restarting the Application**
  ```bash
  heroku restart
  ```

## Cost Considerations

- Heroku's free tier has limitations and will sleep after 30 minutes of inactivity
- For production use, consider upgrading to a paid dyno ($7/month) for always-on service
