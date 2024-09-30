import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { authenticate } from "../auth/authenticate";
import {z} from "zod";

const paramsSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number())
});

export async function getProductsOfCategory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/product/category/:id', {
      schema: {
        params: paramsSchema
      },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      const category = await prisma.category.findUnique({
        where: {id: id},
        select: {
          name: true,
          products : true
        }
      });


      return reply.status(200).send({
        category,
      });
    });
}
