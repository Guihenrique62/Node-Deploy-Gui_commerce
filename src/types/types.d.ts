import 'fastify';

// Defina a interface de usuário que será adicionada ao request
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      acess: number;
    };
  }
}
