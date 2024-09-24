import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function loginRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/login', {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      // Verifica se o usuário existe
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.status(400).send({ message: 'E-mail não cadastrado!.' });
      }

      // Verifica se a senha está correta
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return reply.status(400).send({ message: 'Credenciais inválidas.' });
      }

      // Gera o token JWT com o ID do usuário e nível de acesso (acess)
      const token = jwt.sign(
        { id: user.id, acess: user.acess },
        process.env.JWT_SECRET as string,
        { expiresIn: '3h' }
      );

      // Retorna o token JWT para o usuário
      return reply.status(200).send({
        message: 'Login bem-sucedido!',
        token,
      });
    });
}
