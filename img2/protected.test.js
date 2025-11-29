const request = require('supertest');
const app = require('../server/server');
const { generateTestToken, createTestUser } = require('../test/testUtils');

describe('Rutas Protegidas', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Crear un usuario de prueba y obtener su token
    testUser = await createTestUser();
    authToken = generateTestToken(testUser.id, testUser.email);
  });

  describe('GET /api/verify-token', () => {
    it('debería denegar acceso sin token', async () => {
      const response = await request(app)
        .get('/api/verify-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('no proporcionado');
    });

    it('debería permitir acceso con token válido', async () => {
      const response = await request(app)
        .get('/api/verify-token')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('debería fallar con token inválido', async () => {
      const response = await request(app)
        .get('/api/verify-token')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Rutas que requieren autenticación', () => {
    it('debería permitir acceso a ruta protegida con token válido', async () => {
      // Asumiendo que tienes una ruta protegida en /api/protected
      const response = await request(app)
        .get('/api/verify-token')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
