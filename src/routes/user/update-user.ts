import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import bcrypt from "bcrypt";
import { authenticate } from "../auth/authenticate";

// Defina o esquema Zod para os parâmetros
const paramsSchema = z.object({
  email: z.string().email(),
});


export async function updateUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put('/user/:email', {
      schema: {
        params: paramsSchema, // Validação do e-mail como parâmetro
        body: z.object({
          name: z.string().optional(),
          acess: z.number().optional(),
          wallet: z.number().optional(),
          password: z.string().optional(),
          email: z.string().optional()
        }), 
      },
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { email } = request.params as z.infer<typeof paramsSchema>;
      const updateData = request.body

      // Verifica se o usuário existe
      const user = await prisma.user.findUnique({
        where: { email }, // Usar email para buscar o usuário
      });

      if (!user) {
        throw new BadRequest('Usuário não encontrado com o e-mail fornecido!');
      }

      //criptografa a senha
      let hashedPassword = updateData.password
      if (updateData.password){
        hashedPassword = await bcrypt.hash(updateData.password, 10)
      }
      

      // Atualiza os dados do usuário
      const updatedUser = await prisma.user.update({
        where: { email }, // Usar email para identificar o usuário
        data: {
          name: updateData.name,
          acess: updateData.acess,
          email: updateData.email,
          password: hashedPassword,
          wallet: updateData.wallet

        }, // Dados a serem atualizados
      });

      return reply.status(200).send({
        message: 'Usuário atualizado com sucesso',
        user: {
          userId: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          acess: updatedUser.acess,
          wallet: updatedUser.wallet,
        },
      });
    });
}
