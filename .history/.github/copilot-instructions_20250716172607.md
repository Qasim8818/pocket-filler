# Pocket-Filler AI Agent Instructions

## Project Architecture
- **Pattern**: Express.js REST API following Controllers → Routes → Models architecture
- **Key Components**:
  - Authentication (`auth.js`): JWT-based with email verification
  - Organizations: Multi-tenant support with org-user relationships
  - Contracts: Document management with file uploads (`uploads/contracts/`)
  - Smart Contracts, Disputes, Subscriptions modules

## Code Conventions

### Database (MongoDB/Mongoose)
- All models include `timestamps: true`
- Use typed schema fields with validation
- Example pattern from `models/auth.js`:
```javascript
const authSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    // ... other fields
}, { timestamps: true });
```

### API Structure
- Routes: `/api/{resource}` prefix (see `routes/*.js`)
- Controllers: Business logic with consistent error handling
- Response Format:
  - Success: `{ success: true, data: {...} }`
  - Error: `{ success: false, message: 'error description' }`
- Status Codes: 200 (success), 400 (validation), 401 (auth), 404 (not found), 409 (conflict)

### Authentication Flow
- JWT tokens for session management
- Email verification required (`isEmailVerified` flag)
- Organization vs User accounts with role-based access
- See `controllers/authController.js` for implementation

## Development Workflow
1. Start server: `npm start` (runs nodemon)
2. Test specific module: `npx jest tests/{module}.test.js`
3. File upload handling:
   - Contracts: `uploads/contracts/`
   - Signatures: `uploads/signatures/`

## External Integrations
- Email: Nodemailer for verification/reset
- Payments: Stripe integration
- File Storage: Local filesystem with multer

## Common Gotchas
- Always await mongoose operations
- Check `isEmailVerified` before sensitive operations
- Handle organization context in routes where needed
- Use try-catch with appropriate error status codes
