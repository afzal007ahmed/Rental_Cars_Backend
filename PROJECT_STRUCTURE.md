# Rental Cars Project Structure

## Tech Stack

### Backend
- NestJS
- Sequelize ORM
- MySQL
- JWT Authentication
- Class Validator
- Transactions
- Row Locking (FOR UPDATE)

### Frontend
- React
- Vite
- React Router
- Shadcn UI
- Axios

---

# Overall Architecture

```
Rental Cars
│
├── Frontend (React)
│
│   ├── Authentication
│   │      ├── Login
│   │      └── Register
│   │
│   ├── Home
│   │      └── Start Rental Journey
│   │
│   ├── Search
│   │      ├── Select Location
│   │      ├── Select Start Date
│   │      └── Select End Date
│   │
│   ├── Search Results
│   │      └── Available Vehicles
│   │
│   ├── Vehicle Booking
│   │      ├── Booking Summary
│   │      └── Confirm Booking
│   │
│   └── My Bookings
│
│
└── Backend (NestJS)
    │
    ├── Auth Module
    │
    ├── Users Module
    │
    ├── Locations Module
    │
    ├── Vehicles Module
    │
    ├── Bookings Module
    │
    └── Database
```

---

# Backend Folder Structure

```
src
│
├── auth
│   ├── dto
│   ├── guards
│   ├── strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users
│   ├── dto
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.model.ts
│   └── users.module.ts
│
├── vehicles
│   ├── dto
│   ├── vehicles.controller.ts
│   ├── vehicles.service.ts
│   ├── vehicles.model.ts
│   └── vehicles.module.ts
│
├── bookings
│   ├── dto
│   ├── bookings.controller.ts
│   ├── bookings.service.ts
│   ├── bookings.model.ts
│   └── bookings.module.ts
│
├── locations
│   ├── dto
│   ├── locations.controller.ts
│   ├── locations.service.ts
│   ├── locations.model.ts
│   └── locations.module.ts
│
├── database
│
├── app.module.ts
└── main.ts
```

---

# Frontend Folder Structure

```
src
│
├── api
│
├── components
│
├── contexts
│
├── hooks
│
├── layouts
│
├── pages
│   ├── Login
│   ├── Home
│   ├── Search
│   ├── SearchResult
│   ├── Bookings
│   └── LocationPage
│
├── protectedRoutes
│
├── routes
│
└── utils
```

---

# Booking Flow

```
User

    │

    ▼

Login

    │

    ▼

Search Location

    │

    ▼

Select Dates

    │

    ▼

Backend

    │

    ▼

Find Vehicles
inside Radius

    │

    ▼

Check Existing
Bookings

    │

    ▼

Available Vehicles

    │

    ▼

Select Vehicle

    │

    ▼

Booking API

    │

    ▼

Begin Transaction

    │

    ▼

Lock Vehicle Booking Rows
(FOR UPDATE)

    │

    ▼

Check Overlapping Bookings

    │

    ▼

Available ?

   ├── No
   │
   │ Rollback
   │ Return Error
   │
   └── Yes
       │
       ▼
Create Booking

       │

Commit Transaction

       │

Return Success
```

---

# Current Database Relationships

```
Users
  │
  │ 1
  │
  ▼
Bookings
  ▲
  │
  │ Many
Vehicles
  │
  │
  ▼
Locations
```

---

# Search Flow

```
Location
      +
Start Date
      +
End Date

        │

        ▼

Get Vehicles

        │

Distance Filter

        │

Booking Overlap Filter

        │

Return Available Vehicles
```

---

# Booking Availability Logic

Two bookings overlap if:

```
existing.to_date >= requested.start_date

AND

existing.start_date <= requested.to_date
```

Equivalent SQL

```
WHERE
to_date >= :startDate
AND
start_date <= :toDate
```

---

# Current Features

- User Authentication
- JWT Authorization
- Vehicle Search
- Radius Search
- Vehicle Availability
- Booking Creation
- Booking Listing
- Transaction Support
- Row Locking
- Overlap Detection

---

