# pocket-filler Agent Guide

## Commands
- **Start Dev**: `npm start` (runs nodemon server.js)
- **Test**: `npm test` (currently not configured)
- **Single Test**: `npx jest tests/auth.test.js` (example for auth tests)
- **Test Watch**: `npx jest --watch tests/auth.test.js`

## Architecture
- **Type**: Node.js/Express REST API with MongoDB
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT tokens with bcrypt password hashing
- **Structure**: Controllers → Routes → Models pattern
- **Key Features**: User/Organization auth, contracts, disputes, subscriptions, smart contracts

## Code Style
- **Modules**: CommonJS (`require`/`module.exports`)
- **Async**: async/await pattern with try/catch error handling
- **Validation**: Manual input validation with early returns
- **HTTP Status**: 200 (success), 400 (validation), 401 (auth), 404 (not found), 409 (conflict), 500 (server error)
- **Logging**: Console.log for debugging, console.error for errors
- **Models**: Mongoose schemas with timestamps
- **Routes**: RESTful endpoints with `/api/` prefix
