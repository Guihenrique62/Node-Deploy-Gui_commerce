import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "../auth/authenticate";
import { prisma } from "../../lib/prisma";



export async function getPurchases(app: FastifyInstance) {
  
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/purchases',{
      preHandler: [authenticate]
    },
      
    async(request, reply)=> {
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não autenticado." });
      }

      // Busque todas as compras 
      const purchases = await prisma.purchase.findMany({
        include: {
          product: true, // Inclui os detalhes do produto relacionado
        },
      });

      // Retorne as compras
      return reply.status(200).send({
        message: "Compras obtidas com sucesso.",
        purchases,
      });
    })
}