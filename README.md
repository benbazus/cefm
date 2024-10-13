# File Manager and Sharing App

A fully functional Google Clone application built with **Vite** for the client side and **Node.js** with **Express** for the server side. The app mimics key features of Google’s search engine, file storage, and sharing functionality. It also includes user authentication, file uploads, and folder management.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Client](#client)
- [Server](#server)
- [Folder Structure](#folder-structure)
- [License](#license)

## Features

- **User Authentication**: Secure login and registration using JWT.
- **File Uploads**: Allows users to upload files and folders.
- **File Sharing**: Generate public and shareable links for files.
- **Folder Management**: Create, update, and delete folders.
- **Search Functionality**: Mimics Google search for files and documents.
- **Two-Factor Authentication (2FA)**: Option for added security.
- **Real-time Progress Tracking**: Track file upload progress with live feedback.

---

## Demo

### Dashboard Page:

 ![image](https://github.com/user-attachments/assets/56bfdf84-f698-41ad-be12-972a920d7e76)

### Home Page:

 ![image](https://github.com/user-attachments/assets/6b2fdca0-9fde-4e83-bdd4-e83cea4d5e95)

### Share file:
![image](https://github.com/user-attachments/assets/9a6fed0f-accf-4974-9ad0-2e25d3bd8d0a)

 ### Document file:
 ![image](https://github.com/user-attachments/assets/8d01a038-b6fb-46ba-9d7c-16cca9697415)

 ### Document file:
![image](https://github.com/user-attachments/assets/ab5de6e3-9d17-4706-b345-3ac0f1409d8c)

## Technologies Used

### Client

- **Vite**: Version 5.4.8
- **React**: For building dynamic UIs
- **shadcn UI**: For building the UI
-- **TypeScript**: For static type checking

### Server

- **Node.js**: Backend framework
- **Express.js**: Web server framework
- **Prisma**: ORM for database interaction
- **PostgreSQL**: Relational database
- **JWT (JSON Web Tokens)**: For user authentication
- **bcrypt**: For hashing passwords
- **Busboy**: Handling large file uploads and file streams

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/en/) (version 18.x or higher)
- [PostgreSQL](https://www.postgresql.org/) for database management

### Steps

1. **Clone the repository**:

```bash
git clone https://github.com/benbazus/cefm.git
cd google-clone
```

2. **Install dependencies**:

For both the client and server sides, navigate to their respective directories and install packages.

```bash
# Client-side
cd client
npm install

# Server-side
cd ../server
npm install
```

3. **Set up environment variables**:

Create a `.env` file for both client and server with the following structure:

#### Server-side `.env`

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-jwt-secret
PORT=5000
```

#### Client-side `.env`

```bash
VITE_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Start the client and server**:

Open two terminal windows or tabs and run the following commands:

```bash
# Server (Backend)
cd server
npm run dev

# Client (Frontend)
cd client
npm run dev
```

5. **Access the app**:

Open your browser and go to `http://localhost:5173` for the client side.

## Client

### Client Folder Structure

```bash
client/
├── components/       # Reusable UI components
├── pages/            # Vite pages (routes)
├── hooks/            # Custom hooks
├── services/         # API service functions
├── public/           # Public static files and images
├── styles/           # Global styles
└── ...
```

### Client Features

- File upload dialog with progress tracking.
- Responsive layout with up to 8 columns.
- Folder navigation and management.

---

## Server

### Server Folder Structure

```bash
server/
├── controllers/      # Business logic for handling routes
├── middleware/       # Auth and error handling middleware
├── models/           # Prisma models for database entities
├── routes/           # Express routes for the API
├── services/         # File upload, email, and other services
└── ...
```

### Server Features

- JWT-based authentication with refresh tokens.
- Role-based access control (admin/user).
- File upload handling with `Busboy`.
- OTP for two-factor authentication.
- API endpoints for file management and sharing.

---

## Folder Structure

### Overview

```bash
google-clone/
├── client/           # Vite frontend code
├── server/           # Node.js backend code
└── ...
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributions

Feel free to submit pull requests and open issues if you find any bugs or have suggestions for improvements!

## Contact

For any inquiries or feedback, please contact me at [info@benhost.net](mailto:benhost.net).


This `README.md` provides a comprehensive guide to understanding and setting up the project. Make sure to replace the placeholder image paths with the actual images and include more details as necessary based on the project’s current status.
