module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    serveAdminPanel: false,
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'd4c5d1f1889ae6c492e907f46c17a6ff'),
    },
  },
});
