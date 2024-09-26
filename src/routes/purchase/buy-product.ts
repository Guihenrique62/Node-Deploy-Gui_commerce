import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"; // Corrigido: deve usar 'z' aqui
import { prisma } from "../../lib/prisma";
import { authenticate } from "../auth/authenticate";

const paramsSchema = z.object({
  id: z.preprocess((val) => Number(val), z.number()), // ID do produto
});

const bodySchema = z.object({
  quantity: z.number()
});

export async function buyProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/product/buy/:id', {
      schema: {
        params: paramsSchema,
        body: bodySchema,
        
      },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;
      const { quantity } = request.body;

      const product = await prisma.product.findUnique({
        where: { id }, 
        select: {
          amount: true
        }
      });

      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ message: "Usuário não autenticado." });
      }

      if (!product) {
        return reply.status(404).send({ message: 'Produto não encontrado.' });
      }

      if (quantity <= 1){
        return reply.status(404).send({ message: 'Quantidade deve ser pelo menos 1' });
      }

      if (product.amount < 1) {
        return reply.status(404).send({ message: 'Estoque do Produto zerado!' });
      }

      if (product.amount < quantity) {
        return reply.status(404).send({ message: 'Estoque Insuficiente!' });
      }

      

      const updatedProduct = await prisma.product.update({
        where: { id }, // Certifique-se de que id seja um número
        data: {
          amount: product.amount - quantity,
        },
      });

      // Registre a compra na tabela Purchase
      const newPurchase = await prisma.purchase.create({
        data: {
          userId, // O ID do usuário autenticado
          productId: id, // ID do produto comprado
          status: "Comprado", // Status inicial da compra (pode ser alterado conforme necessário)
        },
      });

      return reply.status(200).send({
        message: "Produto comprado com sucesso.",
        product: {
          productID: updatedProduct.id,
          name: updatedProduct.name,
          amount: updatedProduct.amount,
        },
        purchase: {
          purchaseID: newPurchase.id,
          status: newPurchase.status,
          userId: newPurchase.userId,
          productId: newPurchase.productId,
        },
      });
    }
  );
}
