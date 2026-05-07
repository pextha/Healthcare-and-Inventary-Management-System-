# SafeMother

> [!IMPORTANT]
> **Database Migration:** The entire project has been migrated from MongoDB to **Microsoft SQL Server**. 
> Please refer to the [ADBMS_Assignment_Guide.txt](./ADBMS_Assignment_Guide.txt) for detailed setup instructions and all changes made.

SafeMother is a prenatal care management web application built for the SE3040 module. It provides role-based access for mothers, doctors, midwives, and admins to manage pregnancy records, appointments, chats, and health tips.

**Tech Stack:** Node.js, Express 5, **Microsoft SQL Server**

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/) (the sole database for the entire project)
- A [Resend](https://resend.com/) account (for password reset emails)
- A [Google Gemini](https://ai.google.dev/) API key (for AI-powered appointment quick checks)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/SafeMother-SE3040.git
cd SafeMother-SE3040
```

### 2. Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=SafeMother <onboarding@resend.dev>
PREGNANCY_API_BASE_URL=pregnancy_base_url
TIP_API_BASE_URL=tip_base_url
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models
CLIENT_URL=http://localhost:5173

# Microsoft SQL Server Configuration
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourStrongPassword123!
DB_NAME=SafeMotherInventory
```

| Variable                 | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `PORT`                   | Port the server runs on (default `3000`)       |
| `JWT_SECRET`             | Secret key used to sign JWT tokens             |
| `JWT_EXPIRY`             | Token expiry duration (e.g. `24h`)             |
| `RESEND_API_KEY`         | API key from Resend for sending emails         |
| `FROM_EMAIL`             | Sender address for outgoing emails             |
| `PREGNANCY_API_BASE_URL` | Base URL for the Pregnancy external API        |
| `TIP_API_BASE_URL`       | Base URL for the Tips external API             |
| `GEMINI_API_KEY`         | Google Gemini API key for AI features          |
| `GEMINI_MODEL`           | Gemini model name (default `gemini-1.5-flash`) |
| `GEMINI_BASE_URL`        | Gemini API base URL (has a default)            |
| `CLIENT_URL`             | Frontend origin URL used for CORS  |
| `DB_SERVER`              | MS SQL Server address (e.g., `localhost`) |
| `DB_USER`                | MS SQL Server username (e.g., `sa`) |
| `DB_PASSWORD`            | MS SQL Server password |
| `DB_NAME`                | MS SQL Server database name (`SafeMotherInventory`) |

### 3. Install Dependencies & Run

```bash
cd server
npm install
npm run dev
```

The server starts at `http://localhost:3000`. You should see:

```
MSSQL connected successfully
Server is running on port 3000
```

---

## Inventory Management Module (ADBMS Assignment)

This module is built using **Microsoft SQL Server** to satisfy advanced relational database requirements.

### Key Features:
- **3NF Relational Design**: Tables for Categories, Medicines, Batches, and Dispense Logs.
- **Business Intelligence**: Smart demand forecasting using moving averages.
- **Advanced SQL Objects**: Includes Triggers for stock automation, UDFs for financial calculations, and complex Views for critical stock monitoring.
- **Smart Reorder Dashboard**: A dedicated React interface at `/admin/inventory` for real-time stock forecasting.

For detailed setup, database schema execution, and internal logic, please refer to the [ADBMS Assignment Guide](./ADBMS_Assignment_Guide.txt).


### 4. Verify

```
GET http://localhost:3000/
```

Returns:

```json
{ "success": true, "message": "SafeMother API Server" }
```

---

## Project Structure

```
server/
├── src/
│   ├── index.js                  # Express app entry point
│   ├── config/
│   │   ├── database.js           # MongoDB connection
│   │   └── env.js                # dotenv loader
│   ├── controllers/              # Request handlers
│   ├── services/                 # Business logic
│   ├── repositories/             # Database queries (data access layer)
│   ├── models/                   # Mongoose schemas
│   ├── middlewares/               # Auth & access control
│   ├── routes/                   # Route definitions
│   ├── utils/                    # Email service, external API clients
│   └── validators/               # Request validation
```

## User Roles

| Role      | Description                                                             |
| --------- | ----------------------------------------------------------------------- |
| `MOTHER`  | Pregnant women. Active immediately upon registration.                   |
| `DOCTOR`  | Medical professionals. Created as **inactive**, require admin approval. |
| `MIDWIFE` | Healthcare worker. Created as **inactive**, require admin approval.     |
| `ADMIN`   | System administrators. Cannot be created via the registration endpoint. |

---

## Middleware Reference

| Middleware                   | Purpose                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `authenticate`               | Verifies the user is logged in with a valid token.                               |
| `authorize(...roles)`        | Restricts access to specific user roles.                                         |
| `requireActiveDoctorMidwife` | Ensures doctor/midwife accounts are approved by admin before accessing features. |
| `requireOwner`               | Ensures users can only access their own data.                                    |

All protected routes require authentication. The server uses **HttpOnly cookie-based authentication** (cookie name: `token`) as the primary mechanism, set automatically on login and cleared on logout. For API clients such as Postman, a `Bearer` token in the `Authorization` header is also accepted as a fallback:

```

Authorization: Bearer <token>

```

---

## Feature: User Management

### Functional Requirements

- **FR-01:** User Registration
- **FR-02:** User Login
- **FR-03:** Forgot Password
- **FR-04:** Reset Password
- **FR-05:** View Own Profile
- **FR-06:** Update Own Profile
- **FR-07:** Change Password
- **FR-08:** Delete Own Account (Soft Delete)
- **FR-09:** List All Users (Admin)
- **FR-10:** View Pending Validations (Admin)
- **FR-11:** Activate User (Admin)
- **FR-39:** Get Current Authenticated User (`/me`)
- **FR-40:** Logout
- **FR-41:** Deactivate User (Admin)
- **FR-42:** Admin Delete Any User (Admin)
- **FR-43:** Search Active Doctors (Mother, Admin)
- **FR-44:** Search Active Midwives (Doctor, Admin)

---

### API Documentation — Authentication (`/api/auth`)

#### POST `/api/auth/register`

Register a new user account.

**Auth:** None

**Request Body:**

```json
{
  "fullName": "Jane Perera",
  "email": "jane@example.com",
  "contactNumber": "0771234567",
  "address": "123 Main St, Colombo",
  "dateOfBirth": "1995-06-15",
  "password": "secret123",
  "role": "MOTHER"
}
```

| Field           | Type   | Required | Notes                                                            |
| --------------- | ------ | -------- | ---------------------------------------------------------------- |
| `fullName`      | string | Yes      | Letters, spaces, hyphens, and apostrophes only (no numbers)      |
| `email`         | string | Yes      | Must be unique                                                   |
| `contactNumber` | string | Yes      | 10 digits, starts with `0`                                       |
| `address`       | string | Yes      |                                                                  |
| `dateOfBirth`   | string | Yes      | ISO date format, must be in the past; user must be at least 18   |
| `password`      | string | Yes      | Minimum 6 characters                                             |
| `role`          | string | No       | `MOTHER` (default), `DOCTOR`, `MIDWIFE`. `ADMIN` is not allowed. |

**Success Response:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "fullName": "Jane Perera",
    "email": "jane@example.com",
    "contactNumber": "0771234567",
    "address": "123 Main St, Colombo",
    "dateOfBirth": "1995-06-15T00:00:00.000Z",
    "role": "MOTHER",
    "isActive": true,
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                                              |
| ------ | ------------------------------------------------------ |
| `400`  | Missing required fields, invalid format, weak password |
| `403`  | Attempting to register as ADMIN                        |
| `409`  | Email already exists                                   |

---

#### POST `/api/auth/login`

Authenticate and receive a JWT token.

**Auth:** None

**Request Body:**

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Success Response:** `200 OK`

> On a successful login the server sets an **HttpOnly cookie** named `token` containing the signed JWT. The token is **not** returned in the response body. Subsequent requests from a browser client will include this cookie automatically.

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "fullName": "Jane Perera",
      "email": "jane@example.com",
      "role": "MOTHER"
    }
  }
}
```

**Error Responses:**

| Status | Condition                 |
| ------ | ------------------------- |
| `400`  | Missing email or password |
| `401`  | Invalid email or password |
| `403`  | Account has been deleted  |

---

#### POST `/api/auth/forgot-password`

Request a password reset token sent via email.

**Auth:** None

**Request Body:**

```json
{
  "email": "jane@example.com"
}
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset token sent to email"
}
```

**Error Responses:**

| Status | Condition                  |
| ------ | -------------------------- |
| `400`  | Missing email              |
| `403`  | Account is deleted         |
| `404`  | No account with that email |

---

#### POST `/api/auth/reset-password`

Reset password using the token received via email.

**Auth:** None

**Request Body:**

```json
{
  "email": "jane@example.com",
  "token": "482913",
  "newPassword": "newSecret456"
}
```

| Field         | Type   | Required | Notes                   |
| ------------- | ------ | -------- | ----------------------- |
| `email`       | string | Yes      |                         |
| `token`       | string | Yes      | 6-digit code from email |
| `newPassword` | string | Yes      | Minimum 6 characters    |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Error Responses:**

| Status | Condition                                            |
| ------ | ---------------------------------------------------- |
| `400`  | Missing fields, invalid/expired token, weak password |

---

#### GET `/api/auth/me`

Returns the currently authenticated user's identity decoded from the session cookie. Intended for re-hydrating client auth state on page load.

**Auth:** Required (any authenticated user)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "userId": "...",
    "fullName": "Jane Perera",
    "email": "jane@example.com",
    "role": "MOTHER"
  }
}
```

**Error Responses:**

| Status | Condition                             |
| ------ | ------------------------------------- |
| `401`  | Missing or invalid authentication token |

---

#### POST `/api/auth/logout`

Clears the HttpOnly authentication cookie, effectively ending the session.

**Auth:** None required

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### API Documentation — User Management (`/api/users`)

> All routes below require `Authorization: Bearer <token>` header.

#### GET `/api/users`

Retrieve all users. Supports optional filters, full-text search, and pagination.

**Auth:** ADMIN only

**Query Parameters (optional):**

| Param      | Type    | Default | Example           |
| ---------- | ------- | ------- | ----------------- |
| `role`     | string  |         | `?role=DOCTOR`    |
| `isActive` | boolean |         | `?isActive=true`  |
| `search`   | string  |         | `?search=jane`    |
| `page`     | integer | `1`     | `?page=2`         |
| `limit`    | integer | `10`    | `?limit=20`       |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [ { ... }, { ... } ],
  "pagination": {
    "total": 85,
    "page": 1,
    "limit": 10,
    "totalPages": 9
  }
}
```

---

#### GET `/api/users/pending-validation`

Retrieve all inactive DOCTOR/MIDWIFE accounts awaiting admin approval. Supports search, role filter, and pagination.

**Auth:** ADMIN only

**Query Parameters (optional):**

| Param    | Type    | Default | Example         |
| -------- | ------- | ------- | --------------- |
| `role`   | string  |         | `?role=DOCTOR`  |
| `search` | string  |         | `?search=silva` |
| `page`   | integer | `1`     | `?page=1`       |
| `limit`  | integer | `10`    | `?limit=10`     |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Pending validation users retrieved successfully",
  "data": [ { ... } ],
  "pagination": {
    "total": 4,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

#### PATCH `/api/users/:userId/activate`

Activate (approve) an inactive DOCTOR or MIDWIFE account.

**Auth:** ADMIN only

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "User activated successfully",
  "data": { "_id": "...", "fullName": "...", "isActive": true, ... }
}
```

**Error Responses:**

| Status | Condition              |
| ------ | ---------------------- |
| `400`  | User is already active |
| `404`  | User not found         |

---

#### PATCH `/api/users/:userId/deactivate`

Deactivate a previously active DOCTOR or MIDWIFE account. ADMIN and MOTHER accounts cannot be deactivated.

**Auth:** ADMIN only

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": { "_id": "...", "fullName": "...", "isActive": false, ... }
}
```

**Error Responses:**

| Status | Condition                                           |
| ------ | --------------------------------------------------- |
| `400`  | User is already inactive                            |
| `403`  | Target user is ADMIN (cannot be deactivated)        |
| `403`  | Target user is not a DOCTOR or MIDWIFE              |
| `404`  | User not found                                      |

---

#### GET `/api/users/:userId`

Retrieve the authenticated user's own profile.

**Auth:** Owner only (authenticated user's ID must match `:userId`)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "...",
    "fullName": "Jane Perera",
    "email": "jane@example.com",
    "contactNumber": "0771234567",
    "address": "123 Main St, Colombo",
    "dateOfBirth": "1995-06-15T00:00:00.000Z",
    "role": "MOTHER",
    "isActive": true,
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                               |
| ------ | --------------------------------------- |
| `403`  | Trying to access another user's profile |
| `404`  | User not found                          |

---

#### PATCH `/api/users/:userId`

Update the authenticated user's own profile details.

**Auth:** Owner only

**Request Body (all fields optional, at least one required):**

```json
{
  "fullName": "Jane Silva",
  "contactNumber": "0779876543",
  "address": "456 New Rd, Kandy"
}
```

| Field           | Type   | Notes                      |
| --------------- | ------ | -------------------------- |
| `fullName`      | string | Cannot be empty            |
| `contactNumber` | string | 10 digits, starts with `0` |
| `address`       | string | Cannot be empty            |

> Only `fullName`, `contactNumber`, and `address` are accepted. All other fields in the request body are silently ignored.

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "User details updated successfully",
  "data": { ... }
}
```

**Error Responses:**

| Status | Condition                                       |
| ------ | ----------------------------------------------- |
| `400`  | No valid fields provided, or validation failure |
| `403`  | Not the resource owner                          |
| `404`  | User not found                                  |

---

#### PATCH `/api/users/:userId/change-password`

Change the authenticated user's password.

**Auth:** Owner only

**Request Body:**

```json
{
  "currentPassword": "secret123",
  "newPassword": "newSecret456"
}
```

| Field             | Type   | Required | Notes                                 |
| ----------------- | ------ | -------- | ------------------------------------- |
| `currentPassword` | string | Yes      | Must match the existing password      |
| `newPassword`     | string | Yes      | Min 6 chars, must differ from current |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**

| Status | Condition                                  |
| ------ | ------------------------------------------ |
| `400`  | Missing fields, weak password, same as old |
| `401`  | Current password is incorrect              |
| `404`  | User not found                             |

---

#### DELETE `/api/users/:userId`

Soft-delete the authenticated user's own account.

**Auth:** Owner only

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": { "_id": "...", "isDeleted": true, "isActive": false, ... }
}
```

**Error Responses:**

| Status | Condition      |
| ------ | -------------- |
| `403`  | Not the owner  |
| `404`  | User not found |

---

#### DELETE `/api/users/:userId/admin-delete`

Admin soft-deletes any non-admin user account. This is a privileged version of the delete operation that bypasses the owner check. ADMIN accounts cannot be deleted.

**Auth:** ADMIN only

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": { "_id": "...", "isDeleted": true, "isActive": false, ... }
}
```

**Error Responses:**

| Status | Condition                                             |
| ------ | ----------------------------------------------------- |
| `403`  | Target user is an ADMIN account (cannot be deleted)   |
| `404`  | User not found                                        |

---

#### GET `/api/users/doctors/search`

Search for active doctors by name. Used when a mother assigns a doctor to her pregnancy.

**Auth:** MOTHER or ADMIN

**Query Parameters (optional):**

| Param   | Type    | Default | Example          |
| ------- | ------- | ------- | ---------------- |
| `query` | string  | `""`    | `?query=smith`   |
| `limit` | integer | `10`    | `?limit=5`       |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Doctors retrieved successfully",
  "data": [
    {
      "_id": "...",
      "fullName": "Dr. Smith",
      "email": "dr.smith@example.com",
      "contactNumber": "0771234567",
      "role": "DOCTOR",
      "isActive": true
    }
  ]
}
```

**Error Responses:**

| Status | Condition                         |
| ------ | --------------------------------- |
| `403`  | User is not a MOTHER or ADMIN     |

---

#### GET `/api/users/midwives/search`

Search for active midwives by name. Used when an assigned doctor assigns a midwife to a pregnancy.

**Auth:** DOCTOR or ADMIN

**Query Parameters (optional):**

| Param   | Type    | Default | Example          |
| ------- | ------- | ------- | ---------------- |
| `query` | string  | `""`    | `?query=silva`   |
| `limit` | integer | `10`    | `?limit=5`       |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Midwives retrieved successfully",
  "data": [
    {
      "_id": "...",
      "fullName": "Nurse Silva",
      "email": "nurse@example.com",
      "contactNumber": "0779876543",
      "role": "MIDWIFE",
      "isActive": true
    }
  ]
}
```

**Error Responses:**

| Status | Condition                         |
| ------ | --------------------------------- |
| `403`  | User is not a DOCTOR or ADMIN     |

---

## Feature: Chat

### Functional Requirements

- **FR-12:** Automated Chat Creation (Mother ↔ Doctor and Mother ↔ Midwife, triggered on pregnancy assignment)
- **FR-13:** View My Chats
- **FR-14:** View a Single Chat
- **FR-15:** Send a Message (blocked on read-only chats)
- **FR-16:** Get Paginated Messages
- **FR-17:** Mark Message as Read
- **FR-18:** Delete Message (Soft Delete)

---

### API Documentation — Chats (`/api/chats`)

> All routes require `Authorization: Bearer <token>` header.
> Allowed roles: **MOTHER**, **DOCTOR**, **MIDWIFE** (doctor and midwife must be active).

#### GET `/api/chats/my`

Retrieve all chats the authenticated user participates in, sorted by most recent message. Chats are created automatically on pregnancy assignment and become read-only when the pregnancy ends or a participant is removed.

**Auth:** MOTHER, DOCTOR, or MIDWIFE (active)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Chats retrieved successfully",
  "data": [
    {
      "_id": "...",
      "pregnancyId": "...",
      "participants": [
        {
          "_id": "...",
          "fullName": "Jane Perera",
          "email": "jane@example.com",
          "role": "MOTHER",
          "isActive": true
        },
        {
          "_id": "...",
          "fullName": "Nurse Silva",
          "email": "nurse@example.com",
          "role": "MIDWIFE",
          "isActive": true
        }
      ],
      "isReadOnly": false,
      "lastMessage": "Thank you!",
      "lastMessageAt": "2026-02-25T10:30:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

#### GET `/api/chats/:id`

Retrieve a single chat by its ID. Only participants of the chat can access it.

**Auth:** MOTHER, DOCTOR, or MIDWIFE (active), must be a participant

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Chat retrieved successfully",
  "data": {
    "_id": "...",
    "pregnancyId": "...",
    "participants": [ ... ],
    "isReadOnly": false,
    "lastMessage": "See you tomorrow",
    "lastMessageAt": "2026-02-25T14:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                      |
| ------ | ------------------------------ |
| `403`  | Requester is not a participant |
| `404`  | Chat not found                 |

---

### API Documentation — Messages (`/api/messages`)

> All routes require `Authorization: Bearer <token>` header.
> Allowed roles: **MOTHER**, **DOCTOR**, **MIDWIFE** (doctor and midwife must be active).

#### POST `/api/messages`

Send a message in an existing chat. The sender must be a participant of the chat. Sending is blocked if the chat is read-only (pregnancy ended or participant removed).

**Auth:** MOTHER, DOCTOR, or MIDWIFE (active), must be a chat participant

**Request Body:**

```json
{
  "chatId": "664f1b2e8a1c2d3e4f5a6b7c",
  "text": "Hello, how are you feeling today?"
}
```

| Field    | Type   | Required | Notes                            |
| -------- | ------ | -------- | -------------------------------- |
| `chatId` | string | Yes      | Must be a valid MongoDB ObjectId |
| `text`   | string | Yes      | 1–2000 characters                |

**Success Response:** `201 Created`

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "...",
    "chatId": "...",
    "senderId": "...",
    "text": "Hello, how are you feeling today?",
    "isRead": false,
    "readAt": null,
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                                                        |
| ------ | ---------------------------------------------------------------- |
| `400`  | Missing or invalid `chatId` or `text`                            |
| `403`  | Sender is not a participant of the chat                          |
| `403`  | Chat is read-only (pregnancy ended or participant was removed)   |
| `403`  | Midwife's account is not active                                  |
| `404`  | Chat not found                                                   |

---

#### GET `/api/messages/:chatId`

Retrieve paginated messages for a chat. Only participants can access messages. Messages are sorted oldest-first. Soft-deleted messages are excluded.

**Auth:** MOTHER, DOCTOR, or MIDWIFE (active), must be a chat participant

**Query Parameters (optional):**

| Param   | Type | Default | Notes                     |
| ------- | ---- | ------- | ------------------------- |
| `page`  | int  | `1`     | Must be ≥ 1               |
| `limit` | int  | `20`    | Must be between 1 and 100 |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "...",
        "chatId": "...",
        "senderId": {
          "_id": "...",
          "fullName": "Jane Perera",
          "email": "jane@example.com",
          "role": "MOTHER"
        },
        "text": "Hello!",
        "isRead": true,
        "readAt": "2026-02-25T10:31:00.000Z",
        "isDeleted": false,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "total": 42,
    "page": 1,
    "totalPages": 3
  }
}
```

**Error Responses:**

| Status | Condition                            |
| ------ | ------------------------------------ |
| `400`  | Invalid `chatId`, `page`, or `limit` |
| `403`  | Requester is not a participant       |
| `404`  | Chat not found                       |

---

#### PUT `/api/messages/read/:id`

Mark a single message as read. Only the **recipient** (not the sender) can mark a message as read.

**Auth:** MOTHER, DOCTOR, or MIDWIFE (active)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "_id": "...",
    "chatId": "...",
    "senderId": "...",
    "text": "Hello!",
    "isRead": true,
    "readAt": "2026-02-25T10:31:00.000Z",
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                                    |
| ------ | -------------------------------------------- |
| `400`  | Invalid message ID                           |
| `400`  | Sender trying to mark their own message read |
| `404`  | Message not found                            |

---

#### DELETE `/api/messages/:id`

Soft-delete a message. Only the **sender** of the message can delete it. If the deleted message was the chat's `lastMessage`, the snapshot rolls back to the previous non-deleted message.

**Auth:** MOTHER, DOCTOR, or MIDWIFE (active)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "_id": "...",
    "chatId": "...",
    "senderId": "...",
    "text": "Hello!",
    "isRead": false,
    "readAt": null,
    "isDeleted": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                               |
| ------ | --------------------------------------- |
| `400`  | Invalid message ID                      |
| `400`  | Message already deleted                 |
| `403`  | Trying to delete another user's message |
| `404`  | Message not found                       |

---

## Feature: Pregnancy Tips

### Functional Requirements

- **FR-19:** Get Pregnancy Tips for the Current Week

---

### API Documentation — Tips (`/api/tips`)

> All routes require `Authorization: Bearer <token>` header.
> Allowed role: **MOTHER** only.

#### GET `/api/tips/current-week`

Retrieve pregnancy tips for the mother's current pregnancy week (1–42). The week is derived from the active pregnancy record; clamped to the nearest boundary if out of range; defaults to week 1 with `showWeekBadge: false` when no active pregnancy exists.

**Auth:** MOTHER only

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Pregnancy tips for week 12 retrieved successfully",
  "week": 12,
  "showWeekBadge": true,
  "data": [
    {
      "week": 12,
      "tip": "Your baby is now the size of a lime. You may start to feel more energetic as the first trimester ends.",
      "advice": "Continue taking folic acid and stay hydrated."
    }
  ]
}
```

**Error Responses:**

| Status | Condition                                             |
| ------ | ----------------------------------------------------- |
| `403`  | User role is not MOTHER                               |
| `502`  | External tips API is unreachable or returned bad data |

---

## Feature: Appointments

### Functional Requirements

- **FR-20:** Create Appointment Request (Mother)
- **FR-21:** List My Appointments (Mother/Midwife/Doctor)
- **FR-22:** View Appointment by ID
- **FR-23:** Midwife Approve or Reject Appointment
- **FR-24:** Mother Confirm or Request Reschedule
- **FR-25:** Midwife Fill Appointment Information
- **FR-26:** Midwife View Upcoming Appointments
- **FR-27:** Midwife View Completed Appointments
- **FR-28:** View Appointments by Pregnancy
- **FR-29:** Cancel Appointment
- **FR-30:** Delete Appointment (Mother)
- **FR-31:** AI Quick Check for Appointment

---

### API Documentation — Appointments (`/api/appointments`)

> All routes require `Authorization: Bearer <token>` header.
> Allowed roles: **MOTHER**, **MIDWIFE** (midwife must be active).

#### POST `/api/appointments`

Create an appointment request for a pregnancy. The pregnancy must be active and have an assigned midwife. Only one active appointment workflow can exist per pregnancy at a time.

**Auth:** MOTHER only

**Request Body:**

```json
{
  "pregnancyId": "664f1b2e8a1c2d3e4f5a6b7c",
  "preferredDateTime": "2026-03-15T10:00:00.000Z"
}
```

| Field               | Type   | Required | Notes                            |
| ------------------- | ------ | -------- | -------------------------------- |
| `pregnancyId`       | string | Yes      | Must be a valid MongoDB ObjectId |
| `preferredDateTime` | string | Yes      | ISO datetime format              |

**Success Response:** `201 Created`

```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "...",
    "pregnancy": "...",
    "mother": "...",
    "midwife": "...",
    "appointmentDate": "2026-03-15T10:00:00.000Z",
    "preferredDateTime": "2026-03-15T10:00:00.000Z",
    "confirmedDateTime": null,
    "status": "PENDING",
    "rejectionReason": null,
    "rescheduleReason": null,
    "isCompleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                                                     |
| ------ | ------------------------------------------------------------- |
| `400`  | Missing `pregnancyId` or `preferredDateTime`                  |
| `400`  | `preferredDateTime` is not a valid datetime                   |
| `400`  | Pregnancy is not active                                       |
| `400`  | No midwife assigned to the pregnancy                          |
| `400`  | Active appointment workflow already exists for this pregnancy |
| `400`  | Assigned midwife is not available                             |
| `403`  | User is not MOTHER                                            |
| `403`  | Pregnancy does not belong to the requester                    |
| `404`  | Pregnancy not found                                           |

---

#### GET `/api/appointments`

List all appointments for the authenticated user. Mothers see their own appointments; midwives see appointments assigned to them; doctors see appointments for all pregnancies assigned to them.

**Auth:** MOTHER, MIDWIFE, or DOCTOR

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": [
    {
      "_id": "...",
      "pregnancy": { ... },
      "mother": { "_id": "...", "fullName": "Jane Perera", "email": "jane@example.com", "contactNumber": "0771234567" },
      "midwife": { "_id": "...", "fullName": "Nurse Silva", "email": "nurse@example.com", "contactNumber": "0779876543" },
      "appointmentDate": "2026-03-15T10:00:00.000Z",
      "status": "PENDING",
      "isCompleted": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Error Responses:**

| Status | Condition                          |
| ------ | ---------------------------------- |
| `403`  | Invalid user role for appointments |

---

#### GET `/api/appointments/:id`

Retrieve a single appointment by ID. Access is restricted to the mother (owner) or the assigned midwife.

**Auth:** MOTHER or MIDWIFE with access to the record

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Appointment retrieved successfully",
  "data": {
    "_id": "...",
    "pregnancy": { ... },
    "mother": { "_id": "...", "fullName": "Jane Perera", "email": "jane@example.com", "contactNumber": "0771234567" },
    "midwife": { "_id": "...", "fullName": "Nurse Silva", "email": "nurse@example.com", "contactNumber": "0779876543" },
    "appointmentDate": "2026-03-15T10:00:00.000Z",
    "preferredDateTime": "2026-03-15T10:00:00.000Z",
    "confirmedDateTime": null,
    "status": "PENDING",
    "rejectionReason": null,
    "rescheduleReason": null,
    "isCompleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                         |
| ------ | --------------------------------- |
| `403`  | Access denied to this appointment |
| `404`  | Appointment not found             |

---

#### PATCH `/api/appointments/:id/respond`

Midwife reviews a mother's appointment request and either approves or rejects it. Can respond to `PENDING` or `RESCHEDULE_REQUESTED` appointments.

**Auth:** MIDWIFE only (assigned midwife)

**Request Body:**

```json
{
  "status": "APPROVED",
  "confirmedDateTime": "2026-03-15T10:00:00.000Z"
}
```

_or_

```json
{
  "status": "REJECTED",
  "rejectionReason": "Midwife is unavailable on this date"
}
```

| Field               | Type   | Required | Notes                              |
| ------------------- | ------ | -------- | ---------------------------------- |
| `status`            | string | Yes      | `APPROVED` or `REJECTED`           |
| `confirmedDateTime` | string | Cond.    | Required when status is `APPROVED` |
| `rejectionReason`   | string | Cond.    | Required when status is `REJECTED` |

**Success Response (approved):** `200 OK`

```json
{
  "success": true,
  "message": "Appointment approved by midwife",
  "data": {
    "_id": "...",
    "status": "APPROVED",
    "confirmedDateTime": "2026-03-15T10:00:00.000Z",
    "rejectionReason": null,
    ...
  }
}
```

**Success Response (rejected):** `200 OK`

```json
{
  "success": true,
  "message": "Appointment rejected successfully",
  "data": {
    "_id": "...",
    "status": "REJECTED",
    "rejectionReason": "Midwife is unavailable on this date",
    "confirmedDateTime": null,
    ...
  }
}
```

**Error Responses:**

| Status | Condition                                                     |
| ------ | ------------------------------------------------------------- |
| `400`  | Missing `status`                                              |
| `400`  | Invalid status (not `APPROVED` or `REJECTED`)                 |
| `400`  | Missing `confirmedDateTime` when approving                    |
| `400`  | Invalid `confirmedDateTime` format                            |
| `400`  | Missing `rejectionReason` when rejecting                      |
| `400`  | Appointment status is not `PENDING` or `RESCHEDULE_REQUESTED` |
| `403`  | User is not a midwife                                         |
| `403`  | Appointment is not assigned to this midwife                   |
| `404`  | Appointment not found                                         |

---

#### PATCH `/api/appointments/:id/mother-response`

Mother confirms the approved appointment slot or requests a reschedule. Can only respond when appointment status is `APPROVED`.

**Auth:** MOTHER only (appointment owner)

**Request Body (confirm):**

```json
{
  "status": "CONFIRMED"
}
```

**Request Body (reschedule):**

```json
{
  "status": "RESCHEDULE_REQUESTED",
  "preferredDateTime": "2026-03-20T14:00:00.000Z",
  "rescheduleReason": "I have a conflict on the original date"
}
```

| Field               | Type   | Required | Notes                                          |
| ------------------- | ------ | -------- | ---------------------------------------------- |
| `status`            | string | Yes      | `CONFIRMED` or `RESCHEDULE_REQUESTED`          |
| `preferredDateTime` | string | Cond.    | Required when status is `RESCHEDULE_REQUESTED` |
| `rescheduleReason`  | string | No       | Optional reason for requesting reschedule      |

**Success Response (confirmed):** `200 OK`

```json
{
  "success": true,
  "message": "Appointment confirmed successfully",
  "data": {
    "_id": "...",
    "status": "CONFIRMED",
    ...
  }
}
```

**Success Response (reschedule requested):** `200 OK`

```json
{
  "success": true,
  "message": "Reschedule request submitted successfully",
  "data": {
    "_id": "...",
    "status": "RESCHEDULE_REQUESTED",
    "preferredDateTime": "2026-03-20T14:00:00.000Z",
    "rescheduleReason": "I have a conflict on the original date",
    ...
  }
}
```

**Error Responses:**

| Status | Condition                                                  |
| ------ | ---------------------------------------------------------- |
| `400`  | Missing `status`                                           |
| `400`  | Invalid status (not `CONFIRMED` or `RESCHEDULE_REQUESTED`) |
| `400`  | Missing `preferredDateTime` when requesting reschedule     |
| `400`  | Invalid `preferredDateTime` format                         |
| `400`  | Appointment status is not `APPROVED`                       |
| `403`  | User is not a mother                                       |
| `403`  | Appointment does not belong to this mother                 |
| `404`  | Appointment not found                                      |

---

#### PATCH `/api/appointments/:id/fill-info`

Midwife fills post-visit details and marks the appointment as completed. Can only be done when appointment status is `CONFIRMED`.

**Auth:** MIDWIFE only (assigned midwife)

**Request Body:**

```json
{
  "pulseRate": 78,
  "temperature": 36.8,
  "bloodPressure": "120/80",
  "specialMedicalConditions": ["Gestational diabetes"],
  "appointmentNotes": "Mother is healthy. Recommended regular exercise."
}
```

| Field                      | Type     | Required | Notes                           |
| -------------------------- | -------- | -------- | ------------------------------- |
| `pulseRate`                | number   | Yes      | Pulse rate in bpm               |
| `temperature`              | number   | No       | Body temperature                |
| `bloodPressure`            | string   | No       | e.g., `120/80`                  |
| `specialMedicalConditions` | string[] | No       | Array of conditions noted       |
| `appointmentNotes`         | string   | No       | Additional notes from the visit |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Appointment information filled successfully",
  "data": {
    "_id": "...",
    "pulseRate": 78,
    "temperature": 36.8,
    "bloodPressure": "120/80",
    "specialMedicalConditions": ["Gestational diabetes"],
    "appointmentNotes": "Mother is healthy. Recommended regular exercise.",
    "isCompleted": true,
    "completedAt": "2026-03-15T11:30:00.000Z",
    ...
  }
}
```

**Error Responses:**

| Status | Condition                                   |
| ------ | ------------------------------------------- |
| `400`  | Missing `pulseRate`                         |
| `400`  | Appointment is not `CONFIRMED`              |
| `403`  | User is not a midwife                       |
| `403`  | Appointment is not assigned to this midwife |
| `404`  | Appointment not found                       |

---

#### GET `/api/appointments/upcoming/mine`

Retrieve upcoming confirmed appointments for the logged-in midwife. Returns appointments where the appointment date is in the future, status is `CONFIRMED`, and not yet completed.

**Auth:** MIDWIFE only (active)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Upcoming appointments retrieved successfully",
  "data": [
    {
      "_id": "...",
      "pregnancy": { ... },
      "mother": { "_id": "...", "fullName": "Jane Perera", "email": "jane@example.com", "contactNumber": "0771234567" },
      "midwife": { "_id": "...", "fullName": "Nurse Silva", "email": "nurse@example.com", "contactNumber": "0779876543" },
      "appointmentDate": "2026-03-20T10:00:00.000Z",
      "status": "CONFIRMED",
      "isCompleted": false,
      ...
    }
  ]
}
```

**Error Responses:**

| Status | Condition             |
| ------ | --------------------- |
| `403`  | User is not a midwife |

---

#### GET `/api/appointments/completed/mine`

Retrieve completed appointments for the logged-in midwife, sorted by completion date (newest first).

**Auth:** MIDWIFE only (active)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Completed appointments retrieved successfully",
  "data": [
    {
      "_id": "...",
      "pregnancy": { ... },
      "mother": { "_id": "...", "fullName": "Jane Perera", "email": "jane@example.com", "contactNumber": "0771234567" },
      "midwife": { "_id": "...", "fullName": "Nurse Silva", "email": "nurse@example.com", "contactNumber": "0779876543" },
      "appointmentDate": "2026-03-10T10:00:00.000Z",
      "pulseRate": 78,
      "temperature": 36.8,
      "bloodPressure": "120/80",
      "isCompleted": true,
      "completedAt": "2026-03-10T11:30:00.000Z",
      ...
    }
  ]
}
```

**Error Responses:**

| Status | Condition             |
| ------ | --------------------- |
| `403`  | User is not a midwife |

---

#### GET `/api/appointments/pregnancy/:pregnancyId`

Retrieve all appointments for a specific pregnancy, sorted by appointment date (ascending).

**Auth:** MOTHER (owner) or assigned MIDWIFE

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Appointments for pregnancy retrieved successfully",
  "data": [
    {
      "_id": "...",
      "mother": { "_id": "...", "fullName": "Jane Perera", "email": "jane@example.com", "contactNumber": "0771234567" },
      "midwife": { "_id": "...", "fullName": "Nurse Silva", "email": "nurse@example.com", "contactNumber": "0779876543" },
      "appointmentDate": "2026-03-10T10:00:00.000Z",
      "status": "CONFIRMED",
      ...
    }
  ]
}
```

**Error Responses:**

| Status | Condition                       |
| ------ | ------------------------------- |
| `403`  | Access denied to this pregnancy |
| `404`  | Pregnancy not found             |

---

#### PATCH `/api/appointments/:id/cancel`

Cancel an appointment. Mother can cancel only her own `PENDING` appointments. Midwife can cancel only her own non-completed appointments.

**Auth:** MOTHER or MIDWIFE

**Request Body (optional):**

```json
{
  "cancelReason": "No longer needed"
}
```

| Field          | Type   | Required | Notes                        |
| -------------- | ------ | -------- | ---------------------------- |
| `cancelReason` | string | No       | Optional cancellation reason |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "_id": "...",
    "status": "CANCELLED",
    "rejectionReason": "No longer needed",
    ...
  }
}
```

**Error Responses:**

| Status | Condition                                       |
| ------ | ----------------------------------------------- |
| `400`  | Mother trying to cancel non-pending appointment |
| `400`  | Midwife trying to cancel completed appointment  |
| `403`  | Appointment does not belong to this user        |
| `403`  | Invalid user role for cancelling                |
| `404`  | Appointment not found                           |

---

#### DELETE `/api/appointments/:id`

Delete an appointment. Only the mother who created the appointment can delete it. Completed appointments cannot be deleted.

**Auth:** MOTHER only (owner)

**Success Response:** `204 No Content`

**Error Responses:**

| Status | Condition                            |
| ------ | ------------------------------------ |
| `400`  | Cannot delete completed appointments |
| `403`  | User is not a mother                 |
| `403`  | Appointment does not belong to you   |
| `404`  | Appointment not found                |

---

#### POST `/api/appointments/:id/ai-check`

Generate an AI quick-check result for a specific appointment using Gemini. Returns AI-generated health insights based on appointment data.

**Auth:** MOTHER or MIDWIFE with access to the appointment

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Appointment AI check generated successfully",
  "data": {
    "appointmentId": "...",
    "status": "CONFIRMED",
    "aiCheck": {
      "riskLevel": "LOW | MEDIUM | HIGH",
      "missingInfo": [ "pulseRate", ... ],
      "followUpAdvice": "Practical advice string...",
      "patientFriendlySummary": "Reassuring summary for mother..."
    },
    "generatedAt": "2026-03-15T12:00:00.000Z"
  }
}
```

**Fields Analysis:**

| Field | Type | Description |
| --- | --- | --- |
| `riskLevel` | string | Informational triage level based on vitals. |
| `missingInfo` | string[] | Vitals or metrics missing from the visit record. |
| `followUpAdvice` | string | Immediate next steps for healthcare providers. |
| `patientFriendlySummary`| string | Reassuring explanation for the mother. |

**Error Responses:**

| Status | Condition                         |
| ------ | --------------------------------- |
| `403`  | Access denied to this appointment |
| `404`  | Appointment not found             |

---

## Feature: Pregnancy Profile

### Functional Requirements

- **FR-32:** Create Pregnancy Profile (Mother only)
- **FR-33:** List Pregnancies (filtered by user role)
- **FR-34:** View Single Pregnancy Details
- **FR-35:** Assign Doctor (Mother only)
- **FR-36:** Assign Midwife (Assigned Doctor only)
- **FR-37:** Update Pregnancy Profile (Mother only)
- **FR-38:** Cancel Pregnancy (Mother only)

---

### External API Integration

Pregnancy metrics (EDD, gestational age, trimester) are calculated using an external API with local fallback:

| Priority | Source            | Condition                             |
| -------- | ----------------- | ------------------------------------- |
| 1        | External API      | `PREGNANCY_API_BASE_URL` is reachable |
| 2        | Local Calculation | External API fails or times out       |

**External API Endpoint:** `POST {PREGNANCY_API_BASE_URL}/api/calculate-pregnancy`

---

### API Documentation — Pregnancies (`/api/pregnancies`)

> All routes require `Authorization: Bearer <token>` header.

#### POST `/api/pregnancies`

Create a new pregnancy profile. Only mothers can create pregnancies. Each mother can have only one active pregnancy at a time.

LMP validation is enforced server-side: `lmpDate` must be within the last 9 months (inclusive) and cannot be in the future.

**Auth:** MOTHER only

**Request Body:**

```json
{
  "lmpDate": "2025-12-01",
  "cycleLength": 28,
  "isFirstPregnancy": true,
  "bloodGroup": "O+",
  "medicalConditions": ["Diabetes"],
  "allergies": ["Penicillin"],
  "previousComplications": [],
  "complicationNotes": ""
}
```

| Field                   | Type     | Required | Notes                                                                     |
| ----------------------- | -------- | -------- | ------------------------------------------------------------------------- |
| `lmpDate`               | string   | Yes      | ISO date format (last menstrual period), must be within the last 9 months |
| `cycleLength`           | number   | No       | Default: `28`. Range: 21–35 days                                          |
| `isFirstPregnancy`      | boolean  | No       | Default: `false`                                                          |
| `bloodGroup`            | string   | No       | e.g., `A+`, `O-`, `B+`                                                    |
| `medicalConditions`     | string[] | No       | Array of existing conditions                                              |
| `allergies`             | string[] | No       | Array of known allergies                                                  |
| `previousComplications` | string[] | No       | Array of past pregnancy complications                                     |
| `complicationNotes`     | string   | No       | Additional notes                                                          |

**Success Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": "...",
    "lmpDate": "2025-12-01T00:00:00.000Z",
    "cycleLength": 28,
    "isFirstPregnancy": true,
    "bloodGroup": "O+",
    "medicalConditions": ["Diabetes"],
    "allergies": ["Penicillin"],
    "previousComplications": [],
    "complicationNotes": "",
    "eddDate": "2026-09-07T00:00:00.000Z",
    "gestationalAgeWeeks": 12,
    "gestationalAgeDays": 2,
    "trimester": "FIRST",
    "pregnancyWeekNumber": 13,
    "percentageComplete": 31,
    "status": "ACTIVE",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                                                                     |
| ------ | ----------------------------------------------------------------------------- |
| `400`  | Missing/invalid `lmpDate`, invalid cycle length, or LMP outside last 9 months |
| `400`  | Active pregnancy already exists for this user                                 |
| `403`  | User is not a MOTHER                                                          |

---

#### GET `/api/pregnancies`

List pregnancies for the authenticated user. Results vary by role.

When pregnancies are listed, the service automatically marks a pregnancy as `COMPLETED` if its due date (`eddDate`) has already passed and it is not cancelled.

**Auth:** MOTHER, DOCTOR, or MIDWIFE

| Role    | Returns                                  |
| ------- | ---------------------------------------- |
| MOTHER  | All her own pregnancies                  |
| DOCTOR  | All pregnancies assigned to this doctor  |
| MIDWIFE | All pregnancies assigned to this midwife |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": [ { ... }, { ... } ]
}
```

_Returns empty array if no pregnancies found:_

```json
{
  "success": true,
  "message": "No pregnancies found for this user",
  "data": []
}
```

---

#### GET `/api/pregnancies/:id`

Retrieve a single pregnancy by ID. Access is restricted to the mother (owner), assigned doctor, or assigned midwife.

When a pregnancy is retrieved, the service automatically marks it as `COMPLETED` if its due date (`eddDate`) has already passed and it is not cancelled.

**Auth:** MOTHER (owner), assigned DOCTOR, or assigned MIDWIFE

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": {
      "_id": "...",
      "fullName": "Jane Perera",
      "email": "jane@example.com"
    },
    "lmpDate": "2025-12-01T00:00:00.000Z",
    "cycleLength": 28,
    "isFirstPregnancy": true,
    "bloodGroup": "O+",
    "medicalConditions": ["Diabetes"],
    "allergies": ["Penicillin"],
    "previousComplications": [],
    "eddDate": "2026-09-07T00:00:00.000Z",
    "gestationalAgeWeeks": 12,
    "gestationalAgeDays": 2,
    "trimester": "FIRST",
    "pregnancyWeekNumber": 13,
    "percentageComplete": 31,
    "status": "ACTIVE",
    "doctor": {
      "_id": "...",
      "fullName": "Dr. Smith",
      "email": "dr.smith@example.com"
    },
    "midwife": {
      "_id": "...",
      "fullName": "Nurse Silva",
      "email": "nurse@example.com"
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**

| Status | Condition                                                   |
| ------ | ----------------------------------------------------------- |
| `403`  | User is not the owner, assigned doctor, or assigned midwife |
| `404`  | Pregnancy not found or cancelled                            |

---

#### POST `/api/pregnancies/:id/assign-doctor`

Assign a doctor to the pregnancy. Only the mother (owner) can assign a doctor.

This route also manages pregnancy chat lifecycle:

- Deactivates the previous mother-doctor chat if a different doctor is reassigned
- Creates (or reuses idempotently) the mother-doctor chat for the newly assigned doctor

**Auth:** MOTHER (owner) only

**Request Body:**

```json
{
  "doctorId": "664f1b2e8a1c2d3e4f5a6b7c"
}
```

| Field      | Type   | Required | Notes                                 |
| ---------- | ------ | -------- | ------------------------------------- |
| `doctorId` | string | Yes      | Must be a valid user with role DOCTOR |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "doctor": "664f1b2e8a1c2d3e4f5a6b7c", ... }
}
```

**Error Responses:**

| Status | Condition                                    |
| ------ | -------------------------------------------- |
| `400`  | Missing `doctorId`                           |
| `400`  | Pregnancy is not active                      |
| `400`  | User is not a doctor                         |
| `400`  | Doctor is already assigned to this pregnancy |
| `403`  | Only the mother can assign a doctor          |
| `404`  | Pregnancy not found                          |
| `404`  | Doctor not found                             |

---

#### POST `/api/pregnancies/:id/assign-midwife`

Assign a midwife to the pregnancy. Only the assigned doctor can assign a midwife.

This route also manages pregnancy chat lifecycle:

- Deactivates the previous mother-midwife chat if a different midwife is reassigned
- Creates (or reuses idempotently) the mother-midwife chat for the newly assigned midwife

**Auth:** DOCTOR (must be the assigned doctor)

**Request Body:**

```json
{
  "midwifeId": "664f1b2e8a1c2d3e4f5a6b7c"
}
```

| Field       | Type   | Required | Notes                                  |
| ----------- | ------ | -------- | -------------------------------------- |
| `midwifeId` | string | Yes      | Must be a valid user with role MIDWIFE |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "midwife": "664f1b2e8a1c2d3e4f5a6b7c", ... }
}
```

**Error Responses:**

| Status | Condition                                     |
| ------ | --------------------------------------------- |
| `400`  | Missing `midwifeId`                           |
| `400`  | No doctor assigned yet                        |
| `400`  | Pregnancy is not active                       |
| `400`  | User is not a midwife                         |
| `400`  | Midwife is already assigned to this pregnancy |
| `403`  | Only the assigned doctor can assign a midwife |
| `404`  | Pregnancy not found                           |
| `404`  | Midwife not found                             |

---

#### PATCH `/api/pregnancies/:id`

Update pregnancy details. Only the mother (owner) can update. If `lmpDate` or `cycleLength` is changed, metrics are recalculated.

If `lmpDate` is updated, the same create validation is enforced server-side: it must be within the last 9 months and not in the future.

**Auth:** MOTHER (owner) only

**Request Body (all fields optional, at least one required):**

```json
{
  "lmpDate": "2025-11-15",
  "cycleLength": 30,
  "isFirstPregnancy": false,
  "bloodGroup": "A+",
  "medicalConditions": ["Hypertension", "Diabetes"],
  "allergies": ["Sulfa drugs"],
  "previousComplications": ["Gestational diabetes"],
  "complicationNotes": "Monitoring blood sugar levels"
}
```

| Field                   | Type     | Notes                                             |
| ----------------------- | -------- | ------------------------------------------------- |
| `lmpDate`               | string   | ISO date format, must be within the last 9 months |
| `cycleLength`           | number   | Range: 21–35 days                                 |
| `isFirstPregnancy`      | boolean  |                                                   |
| `bloodGroup`            | string   |                                                   |
| `medicalConditions`     | string[] | Replaces existing array                           |
| `allergies`             | string[] | Replaces existing array                           |
| `previousComplications` | string[] | Replaces existing array                           |
| `complicationNotes`     | string   |                                                   |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "bloodGroup": "A+", ... }
}
```

**Error Responses:**

| Status | Condition                                  |
| ------ | ------------------------------------------ |
| `400`  | No valid fields provided for update        |
| `400`  | Updated `lmpDate` is outside last 9 months |
| `400`  | Pregnancy is not active                    |
| `403`  | Only the mother can update her pregnancy   |
| `404`  | Pregnancy not found                        |

---

#### PATCH `/api/pregnancies/:id/cancel`

Cancel a pregnancy. Sets status to `CANCELLED`. Only the mother (owner) can cancel.

This route also deactivates all chats associated with that pregnancy.

**Auth:** MOTHER (owner) only

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "status": "CANCELLED", ... }
}
```

**Error Responses:**

| Status | Condition                                                |
| ------ | -------------------------------------------------------- |
| `400`  | Pregnancy is not active (already cancelled or completed) |
| `403`  | Only the mother can cancel her pregnancy                 |
| `404`  | Pregnancy not found                                      |

---

## Feature: Analytics

### Functional Requirements

- **FR-45:** Get System Statistics Dashboard (Admin)

---

### API Documentation — Analytics (`/api/analytics`)

> All routes require `Authorization: Bearer <token>` header (or session cookie).
> Allowed role: **ADMIN** only.

#### GET `/api/analytics`

Returns a comprehensive system-wide statistics snapshot. Data is aggregated in real time across users, pregnancies, appointments, and chats.

**Auth:** ADMIN only

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Analytics data retrieved successfully",
  "data": {
    "userStats": {
      "total": 85,
      "byRole": {
        "MOTHER": 60,
        "DOCTOR": 10,
        "MIDWIFE": 12,
        "ADMIN": 3
      },
      "activeByRole": {
        "MOTHER": 60,
        "DOCTOR": 8,
        "MIDWIFE": 10,
        "ADMIN": 3
      },
      "totalActive": 81,
      "totalInactive": 4,
      "pendingValidation": 4,
      "newUsersLast30Days": 12
    },
    "pregnancyStats": {
      "total": 72,
      "byStatus": {
        "ACTIVE": 55,
        "COMPLETED": 12,
        "CANCELLED": 5
      },
      "byTrimester": {
        "FIRST": 18,
        "SECOND": 22,
        "THIRD": 15
      },
      "unassignedDoctor": 7
    },
    "appointmentStats": {
      "total": 143,
      "byStatus": {
        "PENDING": 20,
        "APPROVED": 15,
        "REJECTED": 8,
        "CONFIRMED": 45,
        "RESCHEDULE_REQUESTED": 5,
        "CANCELLED": 10
      },
      "completed": 40
    },
    "chatStats": {
      "totalChats": 38
    }
  }
}
```

**Response Fields:**

| Field                                   | Description                                                          |
| --------------------------------------- | -------------------------------------------------------------------- |
| `userStats.total`                       | Total non-deleted users across all roles                             |
| `userStats.byRole`                      | Total user count broken down by role                                 |
| `userStats.activeByRole`                | Active user count broken down by role                                |
| `userStats.totalActive`                 | Total active users                                                   |
| `userStats.totalInactive`               | Total inactive users (includes all pending validations)              |
| `userStats.pendingValidation`           | Inactive DOCTOR and MIDWIFE accounts awaiting admin approval         |
| `userStats.newUsersLast30Days`          | Users registered in the last 30 days                                 |
| `pregnancyStats.total`                  | Total pregnancy records                                              |
| `pregnancyStats.byStatus`              | Pregnancy count by status (`ACTIVE`, `COMPLETED`, `CANCELLED`)      |
| `pregnancyStats.byTrimester`           | Active pregnancy count by trimester (`FIRST`, `SECOND`, `THIRD`)    |
| `pregnancyStats.unassignedDoctor`      | Active pregnancies with no doctor assigned                           |
| `appointmentStats.total`               | Total appointment records                                            |
| `appointmentStats.byStatus`            | Appointment count by status                                          |
| `appointmentStats.completed`           | Appointments marked as completed (`isCompleted: true`)               |
| `chatStats.totalChats`                 | Total chat threads created across all users                          |

**Error Responses:**

| Status | Condition                         |
| ------ | --------------------------------- |
| `401`  | Missing or invalid authentication |
| `403`  | User is not ADMIN                 |
