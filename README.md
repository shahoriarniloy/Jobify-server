# Jobify

Jobify is a job search and networking platform designed to connect job seekers with potential employers. With features like a personalized job feed, career roadmap generator, networking, and company updates, Jobify aims to make the job search process seamless and engaging for users.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

---

## Features

- **Advanced Job Search**: Allows users to filter job listings by location, industry, salary range, job type, and experience level, making job searches flexible and highly targeted.

- **Company Search**: Enables job seekers to explore detailed company profiles and use customizable filters, helping them make informed decisions about potential employers.

- **Resume Builder**: A guided tool for job seekers to create and format professional resumes, which can be downloaded for applications.

- **Job Alerts**: Notifies users of relevant job opportunities as soon as they are posted.

- **User Profiles**: 
  - **Job Seekers**: Comprehensive profiles include personal information, skills, work history, and career preferences.
  - **Companies**: Profiles showcase company information, values, and job openings to attract qualified candidates.

- **Application Tracking System (ATS)**: Helps employers manage hiring by tracking applications, scheduling interviews, shortlisting candidates, and enabling direct communication with applicants.

- **Multilingual Support**: Offers the platform in multiple languages, making it accessible to a diverse user base.

- **In-App Messaging**: Facilitates real-time communication between job seekers and employers for faster responses and interview coordination.

- **Career Roadmap Generator**: Provides personalized career paths based on user skills and desired roles, suggesting necessary skills and estimated timelines for career goals.

- **Favorite Companies**: Users can mark preferred companies as favorites to receive updates about new job postings and announcements directly in their feed.

- **Favorite Jobs**: Allows users to save job listings by marking them as favorites for easy access and application at a later time.


## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/shahoriarniloy/Jobify.git
    cd jobify
    ```

2. Install dependencies for the backend and frontend:
    ```bash
    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    ```

3. Set up your environment variables for the backend. Create a `.env` file in the `backend` folder with the following variables:
    ```plaintext
    MONGO_URI=your_mongodb_uri
    PORT=5000
    JWT_SECRET=your_jwt_secret
    ```

## Configuration

1. **Database**: Jobify uses MongoDB for storing data. Make sure you have your MongoDB URI set in the `.env` file as `MONGO_URI`.
2. **Environment**: Ensure the `PORT` and `JWT_SECRET` are set up in the `.env` file for the backend.

## Usage

1. Run the backend server:
    ```bash
    cd backend
    npm start
    ```

2. Run the frontend development server:
    ```bash
    cd ../frontend
    npm start
    ```

3. Run on localhost to view the application in your browser.



## Technologies Used

- **Frontend**: React, Redux, Tailwind CSS, Leaflet.js
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Real-Time Updates**: Socket.IO (for job alerts)
- **Other Libraries**: React Query, Axios

## Contribution Guidelines

We welcome contributions! If you’d like to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeatureName`).
5. Open a Pull Request.

### Development Notes

- Use meaningful commit messages.
- For UI-related changes, consider both light and dark themes.
- Ensure any new routes or features are documented in the `/docs` folder.




