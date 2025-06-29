# Infrastructure, Hosting & Deployment

## Hosting Strategy

### Backend Hosting (Serverless API on AWS)
- **Compute**: AWS Lambda.
- **API Layer**: Amazon API Gateway.
- **Database**: Amazon RDS Serverless v2 (PostgreSQL).

### Frontend PWA Hosting
- **Platform**: Vercel.

## Infrastructure as Code (IaC)
- **Technology Choice**: AWS Cloud Development Kit (CDK). All AWS resources (Lambda, API Gateway, RDS, IAM Roles) will be defined as code for automated and reproducible deployments.

## CI/CD & Deployment Strategy
- **Backend CI/CD Pipeline (AWS)**: Triggers on a push to main, runs tests, and uses the AWS CDK and EF Migrations to deploy infrastructure, schema, and application updates to AWS.
- **Frontend CI/CD Pipeline (Vercel)**: Vercel provides an integrated CI/CD system that will automatically build, test, and deploy the PWA from our Git repository.
- **Google Play Store Deployment**: Use PWABuilder to generate an Android App Bundle (AAB) and upload it to the Google Play Console.
