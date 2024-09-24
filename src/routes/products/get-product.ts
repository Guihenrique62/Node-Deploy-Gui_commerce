import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { authenticate } from "../auth/authenticate";

export async function getProducts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/products', {
      schema: {},
      preHandler: [authenticate],
    },
    async (request, reply) => {
      // Busca os produtos com as avaliações (ratings)
      const products = await prisma.product.findMany({
        include: {
          ratings: {
            select: {
              stars: true,
            },
          },
        },
      });

      // Se a lista de produtos estiver vazia, retorna um erro
      if (products.length === 0) {
        throw new BadRequest('Não existe Produtos na base de dados!');
      }

      // Mapeia os produtos calculando a média e o total de avaliações
      return reply.status(200).send({
        products: products.map((product: any) => {
          const totalRatings = product.ratings.length;
          const averageRating = totalRatings > 0
            ? product.ratings.reduce((acc: number, rating: any) => acc + rating.stars, 0) / totalRatings
            : null; // Se não houver avaliações, retorna null

          return {
            productId: product.id,
            name: product.name,
            price: product.price,
            amount: product.amount,
            description: product.description,
            tag: product.tag,
            img_url: product.img_url,
            averageRating: averageRating,  // Média de avaliações
            totalRatings: totalRatings      // Total de avaliações
          };
        }),
      });
    });
}
