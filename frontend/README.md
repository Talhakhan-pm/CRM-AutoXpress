# AutoXpress CRM Frontend

Frontend application for AutoXpress CRM, a modern CRM for auto parts resellers.

## Setup

1. Clone the repository and navigate to the frontend directory:
```bash
cd AutoXpress_CRM/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit the `.env` file if necessary to configure the API URL

## Running the Application

Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000

## Features

- Modern, responsive UI built with React and Tailwind CSS
- Editable grid layout similar to Airtable
- Filtering capability for Follow-up Date, Status, and Agent
- Modal forms for creating and editing callbacks
- Search functionality for finding specific callbacks

## Available Scripts

- `npm start` - Run the development server
- `npm run build` - Build the production application
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

- `/components` - Reusable UI components
- `/pages` - Page components that represent routes
- `/services` - API and other service integrations
- `/utils` - Utility functions and helpers