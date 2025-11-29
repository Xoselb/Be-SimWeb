const request = require('supertest');
const app = require('../server/server');
const { createTestUser, generateTestToken, getUserById } = require('../test/testUtils');

describe('Auth API', () => {
  let testUser;
  let testUserToken;

  beforeAll(async () => {
    // Crear un usuario de prueba
    testUser = await createTestUser({
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User'
    });
    
    testUserToken = testUser.token;
  });

  describe('POST /api/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'NewPass123!',
        firstName: 'New',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('debería fallar con correo duplicado', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('ya está registrado');
    });
  });

  describe('POST /api/login', () => {
    it('debería iniciar sesión con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('debería fallar con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/logout', () => {
    it('debería cerrar la sesión correctamente', async () => {
      const token = generateTestToken(1, 'test@example.com');
      
      const response = await request(app)
        .post('/api/logout')
        .set('Cookie', [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.headers['set-cookie'][0]).toContain('token=;');
    });
  });
});
