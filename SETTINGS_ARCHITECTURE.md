# Settings Module Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SETTINGS MODULE ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐  │
│  │  test-settings-    │  │   Frontend App      │  │    cURL / Postman    │  │
│  │    api.html        │  │   (React/TS)        │  │                      │  │
│  └────────┬───────────┘  └──────────┬──────────┘  └──────────┬───────────┘  │
└───────────┼──────────────────────────┼────────────────────────┼──────────────┘
            │                          │                        │
            └──────────────────────────┼────────────────────────┘
                                       │
                                       │ HTTP Requests
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              API ENDPOINTS                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  GET    /api/settings                [Public]                          │ │
│  │  PUT    /api/settings                [Admin Only]                      │ │
│  │  PUT    /api/settings/profile        [Authenticated]                   │ │
│  │  PUT    /api/settings/change-password [Authenticated]                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              MIDDLEWARE LAYER                                 │
│  ┌────────────────────┐         ┌──────────────────────┐                    │
│  │   protect          │───────▶ │   authorize('admin') │                    │
│  │   (auth.js)        │         │   (auth.js)          │                    │
│  │                    │         │                      │                    │
│  │ - Verify JWT       │         │ - Check role         │                    │
│  │ - Attach user      │         │ - Grant/Deny access  │                    │
│  └────────────────────┘         └──────────────────────┘                    │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           CONTROLLER LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  settingController.js                                                    ││
│  │  ┌───────────────────┐  ┌──────────────────┐  ┌─────────────────────┐ ││
│  │  │  getSettings      │  │ updateSettings    │  │ updateUserProfile   │ ││
│  │  │                   │  │                   │  │                     │ ││
│  │  │ - Get singleton   │  │ - Validate admin  │  │ - Find user         │ ││
│  │  │ - Return data     │  │ - Update fields   │  │ - Update profile    │ ││
│  │  └───────────────────┘  └──────────────────┘  └─────────────────────┘ ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────────┐  ││
│  │  │  changePassword                                                    │  ││
│  │  │                                                                    │  ││
│  │  │  - Validate input (currentPassword, newPassword, confirmPassword) │  ││
│  │  │  - Verify current password with bcrypt                            │  ││
│  │  │  - Check new password != old password                             │  ││
│  │  │  - Hash & save new password                                       │  ││
│  │  └──────────────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             MODEL LAYER                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Setting.js (Singleton Model)                                         │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │  Schema Fields:                                                 │  │   │
│  │  │  - companyName    : String (required)                           │  │   │
│  │  │  - logoUrl        : String                                      │  │   │
│  │  │  - taxCode        : String (max 20)                             │  │   │
│  │  │  - address        : String                                      │  │   │
│  │  │  - phone          : String (regex validated)                    │  │   │
│  │  │  - email          : String (regex validated)                    │  │   │
│  │  │  - currency       : Enum ['VND', 'USD', 'EUR']                  │  │   │
│  │  │  - isSingleton    : Boolean (immutable)                         │  │   │
│  │  │  - timestamps     : true                                        │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                        │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │  Methods:                                                       │  │   │
│  │  │  - getInstance() : Get or create singleton                     │  │   │
│  │  │  - pre('save')   : Prevent multiple documents                  │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  User.js (Referenced for profile & password)                         │   │
│  │  - fullName, avatar, phone (for updateUserProfile)                   │   │
│  │  - password (for changePassword with bcrypt)                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE (MongoDB)                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Collection: settings                                                   │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  {                                                                │  │ │
│  │  │    "_id": "...",                                                  │  │ │
│  │  │    "companyName": "Công ty TNHH CraftUI",                        │  │ │
│  │  │    "logoUrl": "https://...",                                     │  │ │
│  │  │    "taxCode": "0123456789",                                      │  │ │
│  │  │    "address": "123 Main St",                                     │  │ │
│  │  │    "phone": "0901234567",                                        │  │ │
│  │  │    "email": "contact@company.com",                               │  │ │
│  │  │    "currency": "VND",                                            │  │ │
│  │  │    "isSingleton": true,                                          │  │ │
│  │  │    "createdAt": "2026-01-06T...",                                │  │ │
│  │  │    "updatedAt": "2026-01-06T..."                                 │  │ │
│  │  │  }                                                                │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                          │ │
│  │  ⚠️  SINGLETON: Only ONE document allowed                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Collection: users (Referenced)                                         │ │
│  │  - Used for updateUserProfile & changePassword                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION FLOW                                  │
└──────────────────────────────────────────────────────────────────────────────┘

   Client                    Middleware              Controller
     │                          │                        │
     │  Request + JWT Token     │                        │
     ├─────────────────────────▶│                        │
     │                          │                        │
     │                          │  Verify JWT            │
     │                          │  Extract user ID       │
     │                          │  Attach req.user       │
     │                          │                        │
     │                          │  Check role (if admin) │
     │                          │                        │
     │                          ├───────────────────────▶│
     │                          │                        │
     │                          │                        │  Process request
     │                          │                        │  (getSettings, 
     │                          │                        │   updateSettings,
     │                          │                        │   updateProfile,
     │                          │                        │   changePassword)
     │                          │                        │
     │                          │    Response JSON       │
     │◀─────────────────────────┴────────────────────────┤
     │                                                   │


┌──────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY FEATURES                                    │
└──────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  ✅  Singleton Pattern        - Only 1 settings document in DB              │
│  ✅  JWT Authentication        - Secure token-based auth                    │
│  ✅  Role-based Authorization  - Admin-only for system settings             │
│  ✅  Password Verification     - Check old password before change           │
│  ✅  Bcrypt Hashing            - Secure password storage                    │
│  ✅  Input Validation          - Email, phone, password validation          │
│  ✅  Error Handling            - Try-catch in all controllers               │
│  ✅  Rate Limiting             - Prevent abuse (via express-rate-limit)     │
└────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                             FILES STRUCTURE                                   │
└──────────────────────────────────────────────────────────────────────────────┘

server/
├── models/
│   └── Setting.js ────────────────────────────┐
│                                               │ Singleton Model
├── controllers/                                │ 7 fields + timestamps
│   └── settingController.js ──────────────────┤
│       ├── getSettings()                       │ 4 Controllers
│       ├── updateSettings()                    │ - Get settings
│       ├── updateUserProfile()                 │ - Update settings (Admin)
│       └── changePassword()                    │ - Update profile
│                                               │ - Change password
├── routes/                                     │
│   └── settingRoutes.js ──────────────────────┤
│       ├── GET  /api/settings                  │ 4 Routes
│       ├── PUT  /api/settings                  │ - Public
│       ├── PUT  /api/settings/profile          │ - Admin only
│       └── PUT  /api/settings/change-password  │ - Authenticated
│                                               │
├── seeders/                                    │
│   └── settings.seed.js ──────────────────────┤ Seeder
│                                               │ Initialize default settings
├── middleware/                                 │
│   └── auth.js ───────────────────────────────┤ Existing Middleware
│       ├── protect()                           │ - JWT verification
│       └── authorize(roles)                    │ - Role checking
│                                               │
└── index.js ─────────────────────────────────┘ Integration
    - Import settingRoutes                       - Register routes
    - app.use('/api/settings', settingRoutes)


test-settings-api.html ──────────────────────── Test Tool (HTML/JS)
SETTINGS_MODULE_README.md ───────────────────── Full Documentation
SETTINGS_MODULE_COMPLETE.md ─────────────────── Implementation Summary
SETTINGS_QUICKSTART.md ──────────────────────── Quick Start Guide
```
