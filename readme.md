# Green Nest Nursery

Welcome to **Green Nest Nursery**, your ultimate online destination for premium plants and gardening essentials. Our platform simplifies the process of discovering, selecting, and purchasing the best plants and gardening supplies for your home or business.

## Overview

**Green Nest Nursery** is a comprehensive web application designed to bring the joy of gardening right to your doorstep. Whether you're a seasoned gardener, a plant enthusiast, or someone just starting out, Green Nest Nursery offers an intuitive platform to cater to all your gardening needs.

## Table of Contents

- [Green Nest Nursery](#green-nest-nursery)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Technology Stack](#technology-stack)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Scripts](#scripts)
  - [Contributing](#contributing)

## Technology Stack

- **Frontend**: `React.js`, `Redux` with `Tailwind CSS` and `Ant Design` for a seamless and attractive user interface.
- **Backend**: `Node.js` and `Express.js` for a robust server-side application.
- **Database**: `MongoDB` with `Mongoose` for efficient data storage and retrieval.
- **Authentication**: `JSON Web Tokens (JWT)` for secure user authentication and authorization.
- **TypeScript**: Enhancing codebase maintainability and scalability with statically typed `JavaScript`.

## Installation

1. **Clone the repository**:

   ```sh
   https://github.com/antudaa/green_nest_nursery.git
   ```

2. **Install dependencies**:

   ```sh
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory of your project and add the following environment variables:

```sh
PORT = 5000
MONGODB_URI = your-mongodburi
JWT_SECRET = your-jwt-secret
```

## Scripts

Start the development server:

```sh
npm run start:dev
```


## Contributing

Contributions are welcome.! If you'd like to contribute to this project, please follow these steps:

- Fork the repository.
- Create your feature branch: `git checkout -b feature-name`.
- Commit your changes: `git commit -m 'Add some feature'`.
- Push to the branch: `git push origin feature-name`.
- Submit a pull request.