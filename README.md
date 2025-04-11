# Back-End Microservices

This repository contains the backend microservices for the Infra-Ninjas project. Each microservice is designed to handle specific functionalities and operates independently to ensure a modular and scalable architecture.

## Table of Contents

- [Microservices Overview](#microservices-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Microservices Overview

The repository comprises the following microservices:

- **Admin Service**: The Admin Service provides full administrative control over the system. It acts as a central management layer enabling platform administrators to oversee and moderate all core entities and activities within the ecosystem. Key functionalities include:
  1. Add Doctors
  2. Manage Dashboard to have bird's eye view of appointments, doctors, users and total revenue.
  3. View Doctors list
  4. View All Appointments
- **Authentication Service**: The Authentication micro service provides multi-user authentication, enabling separate and secure login mechanisms for patients, doctors, and administrators. Each user type is authenticated through distinct workflows tailored to their roles and permissions. This ensures that access control is properly enforced, with users only able to perform actions relevant to their role within the platform.
- **Database Service**: Provides database management and operations.
- **Doctor Service**: Manages doctor-related functionalities and data.
- **User Service**: Handles user-related operations and information.

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

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Infra-Ninjas/Back-End.git




