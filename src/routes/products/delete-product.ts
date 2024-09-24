import { ZodTypeProvider } from "fastify-type-provider-zod";
import { number, z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { authenticate } from "../auth/authenticate";

// Defina o esquema Zod para os parâmetros
const paramsSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number())
});

export async function delProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/product/:id', {
      schema: {
        params: paramsSchema,
        
      },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { id } = request.params 

      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' });
      }
      // Pega o id do usuário autenticado do token
      const { id: userId, acess } = request.user;

      // Verifica se o usuário é admin
      if (acess !== 0) {
        return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem deletar produtos.' });
      }

      // Verifica se o produto existe
      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        throw new BadRequest(`Produto não encontrado!`);
      }

      // Remove todas as avaliações associadas ao produto
      await prisma.rating.deleteMany({
        where: { productId: id }
      });

      // Exclui o produto
      await prisma.product.delete({
        where: { id }
      });

      return reply.status(200).send({
        message: 'Produto excluído com sucesso',
        user: {
          productId: product.id,
          name: product.name,
        },
      });
    });
}
