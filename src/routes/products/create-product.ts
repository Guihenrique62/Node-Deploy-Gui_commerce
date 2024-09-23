import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { generateRandomString } from "../../untils/randomString";

export async function createProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/product', {
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

      //Puxa os dados vindo do body
      const { name, price, amount, description, img_url } = request.body;

      //Verifica se o e-mail existe e retorna erro caso exista
      const productName = await prisma.product.findFirst({
        where: {name}
      })
      if(productName){throw new BadRequest('Produto já cadastrado!');}

      const tag = generateRandomString(8)

      //Cria o usuario
      const product = await prisma.product.create({
        data: { name, price, amount, description, img_url, tag },
      });
      
      //Retorna 201 e o id do usuario
      return reply.status(201).send({ productId: product.id });
    });
}
