# Stock Manager V1 - Production Deployment

## Quick Start

1. Upload all files to your cPanel public_html directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update .env.production with your actual values
4. Start the application:
   ```bash
   npm start
   ```

## Files Included

- `dist/` - Built application files
- `server.js` - Express server
- `package.json` - Production dependencies
- `.htaccess` - Apache configuration
- `.env.production` - Environment variables template

## Important Notes

1. Update Google API credentials in .env.production
2. Configure your domain in OAuth settings
3. Ensure Node.js is enabled in cPanel
4. Set up SSL certificate for HTTPS

## Support

For deployment issues, check the CPANEL_DEPLOYMENT_GUIDE.md
