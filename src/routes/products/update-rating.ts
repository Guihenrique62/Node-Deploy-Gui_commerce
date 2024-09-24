import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { authenticate } from "../auth/authenticate";

// Validação dos parâmetros e corpo da requisição
const paramsSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number()), // ID do produto
});

export async function updateRating(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/product/rating/:id', {
      schema: {
        params: paramsSchema,
        preHandler: [authenticate],
        body: z.object({
          rating: z.number().min(0).max(5), // Valor da avaliação entre 0 e 5
          userId: z.string()
        }),
      },
    }, 
    async (request, reply) => {
      const { id } = request.params as z.infer<typeof paramsSchema>;
      const { rating, userId } = request.body;

      // Verifica se o produto existe
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new BadRequest('Produto não encontrado!');
      }

      // Verifica se o usuário existe
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new BadRequest('Usuário não encontrado!');
      }

      // Verifica se o usuário já avaliou o produto
      const existingRating = await prisma.rating.findFirst({
        where: {
          productId: id,
          userId: userId,
        },
      });

      if (!existingRating) {
        throw new BadRequest('Você ainda não avaliou este produto.');
      }

      // Atualiza a avaliação existente
      const updatedRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          stars: rating,
        },
      });

      return reply.status(200).send({
        message: 'Avaliação atualizada com sucesso!',
        rating: {
          id: updatedRating.id,
          stars: updatedRating.stars,
          productId: updatedRating.productId,
          userId: updatedRating.userId,
        },
      });
    });
}
