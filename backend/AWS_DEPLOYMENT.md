# Google Ads API Server - AWS Deployment Guide

This guide provides step-by-step instructions for deploying the Google Ads API server to AWS Elastic Beanstalk.

## Prerequisites

- An AWS account
- AWS CLI installed locally
- EB CLI installed locally
- Git installed locally

## Deployment Steps

1. **Initialize Elastic Beanstalk Application**
   ```bash
   eb init google-ads-api --platform node.js --region us-east-1
   ```

2. **Create an Environment**
   ```bash
   eb create google-ads-api-production
   ```

3. **Set Environment Variables**
   - Go to AWS Console > Elastic Beanstalk > Environments > your-environment
   - Navigate to Configuration > Software
   - Add environment properties:
     - ENCRYPTION_KEY=your-secure-32-character-key
     - NODE_ENV=production

4. **Deploy the Application**
   ```bash
   eb deploy
   ```

5. **Verify Deployment**
   - Get your environment URL from the AWS Console or using `eb status`
   - Access the health check endpoint: `https://your-environment-url.elasticbeanstalk.com/api/health`
   - Verify that the response includes `{"status":"ok"}`

6. **Update Frontend Configuration**
   - Update the frontend API client to use the new AWS URL:
   ```typescript
   // In googleAdsApiRealClient.ts
   private getApiBaseUrl(): string {
     // For production deployment with AWS
     if (window.location.hostname.includes('aqassvhw.manus.space')) {
       return 'https://your-environment-url.elasticbeanstalk.com/api';
     }
     // ... other environment handling
   }
   ```

## Scaling and Monitoring

- **Monitoring**
  - AWS Elastic Beanstalk provides built-in monitoring through CloudWatch
  - Access logs via AWS Console or `eb logs`

- **Scaling**
  - Configure auto-scaling in the Elastic Beanstalk environment settings
  - Set minimum and maximum instance counts based on your traffic needs

## Troubleshooting

- **Deployment Issues**: Check logs with `eb logs`
- **Connection Problems**: Verify security groups allow inbound traffic on port 80/443
- **CORS Issues**: Ensure your CORS configuration includes all frontend domains

## Maintenance

- **Updating the Application**
  ```bash
  git add .
  git commit -m "Update application"
  eb deploy
  ```

- **Restarting the Application**
  ```bash
  eb restart
  ```

## Cost Considerations

- AWS Free Tier includes 750 hours of t2.micro instances per month
- For production use, consider t3.small or larger instances
- Set up CloudWatch alarms to monitor costs
