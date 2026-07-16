# Rental Cars Backend

Backend API for the Rental Cars application.

## Overview

The backend provides APIs for searching rental locations, checking vehicle availability, creating bookings, updating bookings, and managing rental inventory.

---

## Features

### Authentication

- User authentication using JWT

### Vehicle Search

- Search locations within a specified radius
- Find available vehicles for a selected date range
- Calculate distance between user and rental locations

### Availability

- Manage vehicle inventory
- Calculate available units based on overlapping bookings

### Bookings

- Create bookings
- Update bookings
- Retrieve booking details
- Calculate rental pricing

### Checkout

- Validate booking information before confirmation

### Images

- Retrieve vehicle images

---

## Project Structure

```
src/
├── auth/
├── availability/
├── bookings/
├── checkout/
├── images/
├── location/
├── user/
├── vehicle/
├── middleware/
├── utils/
```

---

## Tech Stack

- NestJS
- TypeScript
- Sequelize
- PostgreSQL
- JWT
- class-validator

---

## Run

```bash
npm install

npm run start:dev
```
