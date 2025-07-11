const request = require('supertest');
const app = require('../server'); // Adjust path if your Express app is exported from a different file
const Auth = require('../models/auth');
const mongoose = require('mongoose');

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/pocketfiller_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Authentication API Endpoints', () => {
  let testUserEmail = 'testuser@example.com';
  let testUserPassword = 'TestPass123!';
  let verificationCode = null;
  let resetToken = null;

  test('Signup - should create user and send verification code', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        fullName: 'Test User',
        email: testUserEmail,
        password: testUserPassword,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/registration successful/i);
    expect(res.body.user.email).toBe(testUserEmail);

    // Fetch user from DB to get verification code
    const user = await Auth.findOne({ email: testUserEmail });
    expect(user).toBeTruthy();
    expect(user.verificationCode).toHaveLength(4);
    verificationCode = user.verificationCode;
  });

  test('Verify Signup Code - should verify user with correct code', async () => {
    const res = await request(app)
      .post('/verify-signup-code')
      .send({
        email: testUserEmail,
        code: verificationCode,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/account verified successfully/i);

    const user = await Auth.findOne({ email: testUserEmail });
    expect(user.isEmailVerified).toBe(true);
    expect(user.verificationCode).toBeNull();
  });

  test('Login - should login verified user and return token', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: testUserEmail,
        password: testUserPassword,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/login successful/i);
    expect(res.body.token).toBeDefined();
  });

  test('Reset Password Request - should send reset password email', async () => {
    const res = await request(app)
      .post('/reset-password-request')
      .send({ email: testUserEmail });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/password reset link sent/i);

    const user = await Auth.findOne({ email: testUserEmail });
    expect(user.resetPasswordToken).toBeDefined();
    resetToken = user.resetPasswordToken;
  });

  test('Reset Password Confirm - should reset password with valid token', async () => {
    const newPassword = 'NewPass123!';
    const res = await request(app)
      .post(`/reset-password-confirm/${resetToken}`)
      .send({ newPassword });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/password reset successfully/i);

    const user = await Auth.findOne({ email: testUserEmail });
    expect(user.resetPasswordToken).toBeNull();
  });

  test('Login - should login with new password', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: testUserEmail,
        password: 'NewPass123!',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/login successful/i);
  });
});
