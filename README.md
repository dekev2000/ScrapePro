# ScrapePro - Business Information Scraping Dashboard

ScrapePro is a custom administrative dashboard application built with NodeJS/VueJS for internal use by a small team to scrape, store, and manage business information from French companies. This dashboard is non-SaaS, secured, and designed to be installed on a private Infomaniak server.

## Project Structure

The project is divided into two main parts:

- **Backend**: NodeJS/Express API with MongoDB
- **Frontend**: VueJS 3 with TypeScript, Vue Router

## Features

- **Authentication & Security**: Secure login for admins and collaborators.
- **Scraping Module**: Define and manage scraping jobs.
- **Data Management**: View, search, and filter scraped business information.
- **Integration with Site Generation APIs**: Generate website previews using external APIs.
- **Email Outreach Automation**: Manage email templates and send communications.
- **Analytics & Reporting**: View dashboards and reports on system activity.
- **Task Management**: Organize work with a kanban board for tasks.
- **Global Search**: Search across all data with a unified search interface.
- **Dark/Light Mode**: Toggle between dark and light themes.
- **Notification System**: Toast notifications with history in notification center.

## Prerequisites

- Node.js (v16+)
- MongoDB
- npm or yarn

## Installation & Setup

### Backend

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:

   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/scrapepro
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRE=30d
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   INSEE_API_KEY=your_insee_api_key
   DEEPSITE_API_KEY=your_deepsite_api_key
   BOLT_API_KEY=your_bolt_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:

   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Production Build

#### Backend

```
cd backend
npm run build
npm start
```

#### Frontend

```
cd frontend
npm run build
```

The frontend build will create a `dist` directory that can be served by any static file server, or by the backend in production mode.

### Infomaniak Deployment

1. Set up an SSH key for your Infomaniak hosting account
2. Configure the MongoDB database on Infomaniak
3. Deploy using the provided scripts or via SSH

## Project Customization

- Update branding and styling in the frontend code
- Configure API keys and integrations in the backend

## Security Considerations

- The dashboard is not publicly accessible
- All routes are protected with JWT authentication
- User permissions are enforced via role-based access control

## License

This is a proprietary project. All rights reserved.

## Support

For questions or support, please contact the project administrator.
