import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import { authenticate } from "../auth/authenticate";

// Defina o esquema Zod para os parâmetros
const paramsSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number())
});


export async function updateProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/product/:id', {
      schema: {
        params: paramsSchema,
        preHandler: [authenticate],
        body: z.object({
          name: z.string().optional(),
          price: z.number().optional(),
          amount: z.number().optional(),
          description: z.string().optional(),
          img_url: z.string().optional(),
        }), 
      },
    },
    async (request, reply) => {
      const { id } = request.params as z.infer<typeof paramsSchema>;
      const updateData = request.body

      // Pega o id do usuário autenticado do token
      const { id: userId, acess } = request.user;
      // Verifica se o usuário é admin
      if (acess !== 0) {
        return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem Modificar produtos.' });
      }

      // Verifica se o usuário existe
      const product = await prisma.product.findUnique({
        where: { id }, // Usar email para buscar o usuário
      });

      if (!product) {
        throw new BadRequest('Produto não encontrado!');
      }      

      // Atualiza os dados do usuário
      const updatedProduct = await prisma.product.update({
        where: { id }, // Usar email para identificar o usuário
        data: {
          name: updateData.name,
          price: updateData.price,
          amount: updateData.amount,
          description: updateData.description,
          img_url: updateData.img_url

        }, // Dados a serem atualizados
      });

      return reply.status(200).send({
        message: 'Usuário atualizado com sucesso',
        product: {
          productID: updatedProduct.id,
          name: updatedProduct.name,
          price: updatedProduct.price,
          amount: updatedProduct.amount,
          description: updatedProduct.description,
          tag: updatedProduct.tag,
        },
      });
    });
}
