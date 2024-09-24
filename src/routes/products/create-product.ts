import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { generateRandomString } from "../../untils/randomString";
import { authenticate } from "../auth/authenticate";

export async function createProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/product', {
      preHandler: [authenticate], // Middleware para validar o token
      schema: {
        body: z.object({
          name: z.string(),
          price: z.number(),
          amount: z.number(),
          description: z.string(),
          img_url: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { name, price, amount, description, img_url } = request.body;

      // Pega o id do usuário autenticado do token
      const { id: userId, acess } = request.user;

      // Verifica se o usuário é admin
      if (acess !== 0) {
        return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem criar produtos.' });
      }

      // Verifica se o nome do produto já existe
      const productName = await prisma.product.findFirst({
        where: { name }
      });
      if (productName) {
        throw new BadRequest('Produto já cadastrado!');
      }

      const tag = generateRandomString(8);

      // Cria o produto
      const product = await prisma.product.create({
        data: { name, price, amount, description, img_url, tag },
      });

      return reply.status(201).send({ productId: product.id });
    });
}

