# CSE 341 Final Project — Restaurant Management API

## Team

- Davi Ferreira do Vale
- Sthephani Yamileth Platero
- Diego Ledesma
- Sebastian Camilo Plazas
- Juan Diego Sebastian Sosa

## What the API Does

The API will help manage a restaurant. It will allow users to see menu items and categories, and it will also help manage orders and user information. The system will make it easier to organize the restaurant's information in one place and keep the data updated.

## Login System

The API will use **OAuth 2.0** for the login system. Each customer will be able to sign in with their own account. Customers will need to be logged in to place and manage their orders, while general information such as the menu and categories can be viewed without logging in. Restaurant staff will also be able to log in to manage restaurant information.

## Database

We will use **MongoDB** to store all the information. The data will be stored in four main collections:

- users
- categories
- menu items
- orders

Each collection will keep the information related to that part of the restaurant.

## Authentication State

The frontend will be able to know if the user is logged in and what type of user they are. Each user will have a role, such as **customer**, **staff**, or **admin**. This will help control what each user can see or do in the application. For example, customers can place orders, while staff and admins can manage restaurant information.

## Security

Some information will need to be protected, especially user information, order details, and anything related to staff or admin access. We will use login authentication and user roles to control who can access or change certain information. We will also keep sensitive information, such as database credentials, outside of the code and make sure users only have access to the parts of the application they are allowed to use.

## Project Structure

The project is organized into separate folders for:

- routes
- controllers
- models
- middleware
- database connection
- tests

This keeps the code organized and makes it easier for different team members to work on separate parts of the project at the same time. We use Git branches and pull requests so changes can be reviewed before being added to the main project.

## API Endpoints

### Users
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Categories
- `GET /categories`
- `GET /categories/:id`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

### Menu Items
- `GET /menu-items`
- `GET /menu-items/:id`
- `POST /menu-items`
- `PUT /menu-items/:id`
- `DELETE /menu-items/:id`

### Orders
- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PUT /orders/:id`
- `DELETE /orders/:id`

API documentation is available at the route `/api-docs`.

## Project Schedule

### Week 04
- Project Proposal

### Week 05
- Create Git Repo
- Push to Render
- API documentation complete and available at route `/api-docs` — Diego Ledesma
- MongoDB setup and database structure — Davi Ferreira do Vale
- Node.js project setup and MongoDB connection — Davi Ferreira do Vale
- Users CRUD (routes, controllers) — Juan Sosa
- Categories CRUD (routes, controllers) — Sthephani Platero
- Validation and error handling for Categories — Sebastian Plazas
- Validation and error handling for Users — Sebastian Plazas
- Deploy project to Render — Davi Ferreira do Vale

### Week 06
- Menu Items CRUD — Diego Ledesma
- Orders CRUD — Sebastian Camilo Plazas
- Orders CRUD — Juan Diego Sebastian Sosa
- Menu CRUD — Sthephani Yamileth Platero
- Validation and error handling for Menu — Davi Ferreira do Vale
- Validation and error handling for Orders — Davi Ferreira do Vale
- Video Presentation
- OAuth authentication for Users — Davi Ferreira do Vale
- OAuth authentication for Categories
- OAuth authentication for Orders
- OAuth authentication for Menu
- GET unit tests for Users — Juan Diego Sebastian Sosa
- GET unit tests for Categories — Sthephani Yamileth Platero
- GET unit tests for Menu Items — Diego Ledesma
- GET unit tests for Orders — Sebastian Camilo Plazas

### Week 07
- Final database and backend integration — Davi Ferreira do Vale
- Final OAuth and access control testing — Juan Diego Sebastian Sosa
- Categories routes and tests review — Sthephani Yamileth Platero
- Menu Items routes and tests review — Diego Ledesma
- Orders routes and tests review — Sebastian Camilo Plazas
- Swagger documentation review — Sebastian Camilo Plazas
- Final API testing — Entire Team
- Render deploy

## Work Division

- **HTTP GET (all, single), POST, PUT, DELETE** — Each team member for their assigned collection
- **Node.js project creation** — Davi Ferreira do Vale
- **Create git repo and share with group** — Davi Ferreira do Vale
- **MongoDB setup** — Davi Ferreira do Vale
- **API Swagger documentation for all API routes** — Sebastian Camilo Plazas
- **Video presentation** of node project, all routes functioning, MongoDB data being modified, and API documentation — Entire Team

## Stretch Challenges

- Table reservations
- Order history for customers
- Estimated preparation time
- A way for staff to mark tables as available or occupied
- A simple dashboard for staff to see current orders and their status

## Risks and Mitigation

**Risks:** synchronizing individual work with the group project, resolving connection errors, and validating all tests to ensure the code functions correctly.

**Mitigation:** We will use GitHub to organize the work and keep everyone updated on the project. We will test each part before adding it to the main project, communicate when problems happen, and review the code and tests together before the final submission. We will also meet every week and stay in touch daily.