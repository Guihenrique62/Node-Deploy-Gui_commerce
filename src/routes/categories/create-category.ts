import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { generateRandomString } from "../../untils/randomString";
import { authenticate } from "../auth/authenticate";

export async function createCategory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/category', {
      preHandler: [authenticate], // Middleware para validar o token
      schema: {
        body: z.object({
          name: z.string()
        }),
      },
    },
    async (request, reply) => {
      const { name } = request.body;

      // Pega o id do usuário autenticado do token
      const { id: userId, acess } = request.user;

      // Verifica se o usuário é admin
      if (acess !== 0) {
        return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem criar produtos.' });
      }

      // Verifica se o nome do produto já existe
      const categoryName = await prisma.category.findFirst({
        where: { name }
      });
      if (categoryName) {
        throw new BadRequest('Categoria já cadastrado!');
      }
      // Cria o produto
      const category = await prisma.category.create({
        data: { name },
      });

      return reply.status(201).send({ categoryId: category.id });
    });
}

