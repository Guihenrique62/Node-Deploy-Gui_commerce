import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { authenticate } from "../auth/authenticate";

export async function getUsers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/users', {
      schema: {
        
      },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const users = await prisma.user.findMany();

      // Se a lista de usuários estiver vazia, retorna um erro
      if (users.length === 0) {
        throw new BadRequest('Não existe usuários na base de dados!');
      }

      return reply.status(200).send({
        users: users.map((user: any) => ({
          userId: user.id,
          name: user.name,
          email: user.email,
          acess: user.acess,
          wallet: user.wallet,
        })),
      });
    });
}
