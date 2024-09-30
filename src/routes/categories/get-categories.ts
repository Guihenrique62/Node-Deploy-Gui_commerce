import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { authenticate } from "../auth/authenticate";
import {z} from "zod";


export async function getCategories(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/categories', {
      schema: {
        
      },
      preHandler: [authenticate],
    },
    async (request, reply) => {

      const categories= await prisma.category.findMany({
        
      });


      return reply.status(200).send({
        categories,
      });
    });
}
