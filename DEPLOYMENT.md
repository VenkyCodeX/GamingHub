# Gaming Rental Hub - Deployment Guide

This guide will help you deploy your Gaming Rental Hub application to the internet using the domain gamingrentalhub.com.

## Prerequisites

1. **GitHub Account**: Create a repository for your code
2. **MongoDB Atlas Account**: For the database
3. **Render Account**: For hosting (free tier available)
4. **Domain**: gamingrentalhub.com (registered and accessible)

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up
2. Create a new cluster (free tier is fine)
3. Create a database user
4. Get your connection string (it should look like: `mongodb+srv://<db_username>:<db_password>@cluster0.ctlackv.mongodb.net/?appName=Cluster0`)
   - Replace `<db_username>` and `<db_password>` with your actual credentials
   - Optionally, add the database name: `mongodb+srv://username:password@cluster0.ctlackv.mongodb.net/gamingrentalhub?appName=Cluster0`
5. Whitelist your IP (or 0.0.0.0/0 for all)

## Step 2: Push Code to GitHub

1. Create a new repository on GitHub
2. Add the remote origin:
   ```bash
   git remote add origin https://github.com/yourusername/yourrepo.git
   git push -u origin master
   ```

## Step 3: Deploy to Render

1. Go to [Render](https://render.com) and sign up
2. Connect your GitHub account
3. Create a new Web Service
4. Select your repository
5. Configure the service:
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `MONGO_URI`: Your MongoDB connection string
     - `PORT`: 10000 (or whatever Render assigns)
     - `NODE_ENV`: production
     - Add any other secrets (JWT secret, etc.)

## Step 4: Configure Custom Domain

1. In your Render dashboard, go to your service settings
2. Add custom domain: gamingrentalhub.com
3. Render will provide DNS records to add to your domain registrar
4. Update your domain's DNS settings with the provided records

## Step 5: Seed the Database (Optional)

If you have seed data, run the seed script in production or locally.

## Environment Variables Needed

Create a `.env` file in the backend directory with:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gamingrentalhub
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

For production, set these in Render's environment variables.

## Notes

- The app serves static files from the root directory
- API routes are under `/api/`
- Make sure your domain points to Render's servers
- For HTTPS, Render provides it automatically

## Troubleshooting

- Check Render logs for errors
- Ensure MongoDB connection string is correct
- Verify environment variables are set
- Test locally first: `cd backend && npm install && npm start`</content>
<parameter name="filePath">c:\Users\Asus\OneDrive\Desktop\Gamingweb\DEPLOYMENT.md