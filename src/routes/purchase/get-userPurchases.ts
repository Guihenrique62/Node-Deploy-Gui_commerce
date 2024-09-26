import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../auth/authenticate";

export async function getUserPurchases(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/user/purchases', {
      preHandler: [authenticate],
    }, 
    async (request, reply) => {
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não autenticado." });
      }

      // Busque todas as compras relacionadas ao usuário autenticado
      const purchases = await prisma.purchase.findMany({
        where: { userId }, // Filtra por compras do usuário
        include: {
          product: true, // Inclui os detalhes do produto relacionado
        },
      });

      // Retorne as compras
      return reply.status(200).send({
        message: "Compras do usuário obtidas com sucesso.",
        purchases,
      });
    });
}
