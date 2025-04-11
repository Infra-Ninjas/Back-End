# Back-End Microservices

This repository contains the backend microservices for the Infra-Ninjas project. Each microservice is designed to handle specific functionalities and operates independently to ensure a modular and scalable architecture.

## Table of Contents

- [Microservices Overview](#microservices-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)

## Microservices Overview

The repository comprises the following microservices:

- **Admin Service**: The Admin Service provides full administrative control over the system. It acts as a central management layer enabling platform administrators to oversee and moderate all core entities and activities within the ecosystem. Key functionalities include:
  1. Add Doctors
  2. Manage Dashboard to have bird's eye view of appointments, doctors, users and total revenue.
  3. View Doctors list
  4. View All Appointments
- **Authentication Service**: The Authentication micro service provides multi-user authentication, enabling separate and secure login mechanisms for patients, doctors, and administrators. Each user type is authenticated through distinct workflows tailored to their roles and permissions. This ensures that access control is properly enforced, with users only able to perform actions relevant to their role within the platform.
- **Database Service**: The Database micro service manages the core data models appointments, users, and doctors; which are essential to the platform's functionality. It handles all operations, validations, and data relationships between these entities. This microservice serves as the central data layer, ensuring seamless communication and consistency across all other services that rely on user, doctor, or appointment information.
- **Doctor Service**: The Doctor micro service handles all doctor-related functionalities within the platform. Doctors can log in to view their upcoming appointments, mark appointments as completed, or cancel them when necessary.
- **User Service**: The User micro service manages all patient-related operations and information. Patients can browse through the list of available doctors based on their preferences or needs, and conveniently book appointments. The service also maintains user profiles, allowing patients to view, manage, and track their appointments seamlessly.

## Service Port Mapping

| Microservice            | Port (Host:Container) |
|-------------------------|------------------------|
| **admin-service**       | `4001:4001`            |
| **authentication-service** | `4000:4000`        |
| **database-service**    | `5000:5000`            |
| **doctor-service**      | `4003:4003`            |
| **user-service**        | `4002:4002`            |

## Getting Started

To set up and run these microservices locally, follow the steps below.

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/): JavaScript runtime environment
- [Docker](https://www.docker.com/): Containerization platform (if using Docker for deployment)
- [MongoDB](https://www.mongodb.com/): Database used by the services

## 📁 Project Structure

This project is organized into multiple microservices. Each service is containerized and has its own responsibilities, routes, controllers, and configurations.

<details>
<summary><strong>admin-service/</strong></summary>

<pre><code>
admin-service/
├── controllers/
│   ├── adminController.js
│   ├── appointmentController.js
│   └── doctorController.js
├── routes/
│   ├── adminRoute.js
│   └── doctorRoute.js
└── admin-server.js
</code></pre>
</details>

<details>
<summary><strong>authentication-service/</strong></summary>

<pre><code>
authentication-service/
├── controllers/
│   ├── adminController.js
│   ├── doctorController.js
│   └── userController.js
├── middlewares/
│   ├── authAdmin.js
│   └── multer.js
├── routes/
│   ├── adminRoute.js
│   ├── authRoute.js
│   ├── doctorRoute.js
│   └── userRoute.js
└── authentication-server.js
</code></pre>
</details>

<details>
<summary><strong>database-service/</strong></summary>

<pre><code>
database-service/
├── config/
│   ├── cloudinary.js
│   └── mongodb.js
├── middlewares/
│   ├── authAdmin.js
│   └── multer.js
├── models/
│   ├── appointmentModel.js
│   ├── doctorModel.js
│   └── userModel.js
├── routes/
│   ├── appointmentRoute.js
│   ├── doctorRoute.js
│   ├── uploadRoute.js
│   └── userRoute.js
└── database-server.js
</code></pre>
</details>

<details>
<summary><strong>doctor-service/</strong></summary>

<pre><code>
doctor-service/
├── controllers/
│   └── doctorController.js
├── middlewares/
│   └── authDoctor.js
├── routes/
│   └── doctorRoute.js
└── doctor-server.js
</code></pre>
</details>

<details>
<summary><strong>user-service/</strong></summary>

<pre><code>
user-service/
├── controllers/
│   └── userController.js
├── middlewares/
│   └── authUser.js
├── routes/
│   └── userRoute.js
└── user-server.js
</code></pre>
</details>

### Installation
1. **Clone the Repository**:

    ```bash
    git clone https://github.com/Infra-Ninjas/Back-End.git

2. **Install Dependencies**:

   Install for each microservice:
   
    ```bash
    cd <service-name>
    npm install
    
## Repeat for:
  - **admin-service**
  - **authentication-service**
  - **database-service** 
  - **doctor-service**  
  - **user-service**

 ## Usage
### Running Locally
1. Set up environment variables for each microservice by creating a **.env file** in its folder.
2. Start each service:
   ```bash
   npm start

