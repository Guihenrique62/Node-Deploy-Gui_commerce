import { ZodTypeProvider } from "fastify-type-provider-zod";
import { number, z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";

// Defina o esquema Zod para os parâmetros
const paramsSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number())
});

export async function delProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/product/:id', {
      schema: {
        params: paramsSchema
      },
    },
    async (request, reply) => {
      const { id } = request.params 

      // Verifica se o usuário existe
      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        throw new BadRequest(`Produto não encontrado!`);
      }

      // Exclui o usuário
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
