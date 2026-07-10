# Database Schema

This document describes the current database schema for the Rental Cars Backend.

---

# Entity Relationship Diagram

```text
                    +----------------+
                    |     Users      |
                    +----------------+
                    | PK id          |
                    | name           |
                    | email          |
                    | password       |
                    | guest          |
                    +-------+--------+
                            |
                       1    |    *
                            |
                            |
                    +-------v--------+
                    |    Bookings    |
                    +----------------+
                    | PK id          |
                    | total_price    |
                    | start_date     |
                    | to_date        |
                    | status         |
                    | guest_name     |
                    | guest_email    |
                    | FK vehicle_id  |
                    | FK user_id     |
                    | FK location_id |
                    +---+--------+---+
                        |        |
                *       |        |       *
                        |        |
                        |        |
             +----------v-+    +-v-----------+
             |  Vehicles  |    |  Locations  |
             +------------+    +-------------+
             | PK id      |    | PK id       |
             | name       |    | name        |
             | brand      |    | city        |
             | price      |    | state       |
             | description|    | lat         |
             +------+-----+    | long        |
                    |          +------+------+
          1         |                 |
                    |                 |
               +----v-----+      +----v---------+
               | Images   |      | Availability |
               +----------+      +--------------+
               | PK id    |      | FK vehicle_id|
               | image    |      | FK location_id
               |vehicle_id|      | units        |
               +----------+      +--------------+
```

---

# Tables

## Users

Stores registered users and guest users.

| Column | Type | Constraints |
|---------|------|-------------|
| id | UUID | Primary Key |
| name | STRING | NOT NULL |
| email | STRING | Nullable |
| password | STRING | Nullable |
| guest | BOOLEAN | Default false |

### Relationships

- One User → Many Bookings

---

## Vehicles

Stores vehicle information.

| Column | Type | Constraints |
|---------|------|-------------|
| id | UUID | Primary Key |
| name | STRING | NOT NULL |
| brand | STRING | NOT NULL |
| price | INTEGER | NOT NULL |
| description | TEXT | NOT NULL |

### Relationships

- One Vehicle → Many Bookings
- One Vehicle → Many Images
- One Vehicle → Many Availability Records

---

## Locations

Stores rental locations.

| Column | Type | Constraints |
|---------|------|-------------|
| id | UUID | Primary Key |
| name | STRING | NOT NULL |
| city | STRING | NOT NULL |
| state | STRING | NOT NULL |
| lat | DECIMAL | NOT NULL |
| long | DECIMAL | NOT NULL |

### Relationships

- One Location → Many Bookings
- One Location → Many Availability Records

---

## Bookings

Stores every vehicle booking.

| Column | Type | Constraints |
|---------|------|-------------|
| id | UUID | Primary Key |
| total_price | INTEGER | |
| vehicle_id | UUID | FK Vehicles |
| user_id | UUID | FK Users (nullable) |
| location_id | UUID | FK Locations |
| start_date | DATE | NOT NULL |
| to_date | DATE | NOT NULL |
| status | ENUM | inprogress / completed / cancelled |
| guest_name | STRING | Nullable |
| guest_email | STRING | Nullable |

### Relationships

- Many Bookings → One User
- Many Bookings → One Vehicle
- Many Bookings → One Location

---

## Availability

Represents how many units of a vehicle are available at a location.

| Column | Type | Constraints |
|---------|------|-------------|
| vehicle_id | UUID | FK Vehicles |
| location_id | UUID | FK Locations |
| units | INTEGER | Default 0 |

### Relationships

- Many Availability → One Vehicle
- Many Availability → One Location

---

## VehicleImages

Stores images for vehicles.

| Column | Type | Constraints |
|---------|------|-------------|
| id | UUID | Primary Key |
| vehicle_id | UUID | FK Vehicles |
| image | STRING | Nullable |

### Relationships

- Many Images → One Vehicle

---

# Current Relationships

```
Users
 └───< Bookings

Vehicles
 ├───< Bookings
 ├───< Images
 └───< Availability

Locations
 ├───< Bookings
 └───< Availability
```

---

# Booking Availability Logic

A booking overlaps another booking when:

```sql
existing.to_date >= requested.start_date
AND
existing.start_date <= requested.to_date
```

This condition is used to prevent multiple users from booking the same vehicle during overlapping time periods.

---

# Notes

## Guest Booking

A booking can belong to:

- Registered User (`user_id`)
- Guest User (`guest_name`, `guest_email`)

---

## Availability

Availability stores the number of units of a vehicle available at a specific location.

Example:

| Vehicle | Location | Units |
|----------|----------|------:|
| Swift | Bangalore Airport | 5 |
| Swift | Whitefield | 2 |

---

## Images

A vehicle can have multiple images stored in the `VehicleImages` table.

---

# Suggested Future Improvements

- Add `createdAt` and `updatedAt` explicitly to documentation.
- Add indexes:
  - `(vehicle_id, start_date)`
  - `(vehicle_id, to_date)`
  - `(location_id)`
  - `(status)`
- Add foreign key cascade rules.
- Add payment-related tables.
- Add owner/fleet management tables.
- Add reviews and ratings.
- Add pricing rules and seasonal pricing.
