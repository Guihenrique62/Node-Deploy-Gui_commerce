import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";

// Defina o esquema Zod para os parâmetros
const paramsSchema = z.object({
  email: z.string()
});

export async function delUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete('/user/:email', {
      schema: {
        params: paramsSchema
      },
    },
    async (request, reply) => {
      const { email } = request.params 

      // Verifica se o usuário existe
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new BadRequest(`Usuário não encontrado com o e-mail fornecido! ${email}`);
      }

      // Exclui o usuário
      await prisma.user.delete({
        where: { email }
      });

      return reply.status(200).send({
        message: 'Usuário excluído com sucesso',
        user: {
          userId: user.id,
          name: user.name,
          email: user.email,
          acess: user.acess,
          wallet: user.wallet,
        },
      });
    });
}
