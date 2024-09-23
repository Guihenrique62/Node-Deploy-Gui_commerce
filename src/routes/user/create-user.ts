import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../_errors/bad-request";
import bcrypt from "bcrypt";

export async function createUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/user', {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string(),
          acess: z.number(),
          wallet: z.number()
        }),
        
      },
    },
    async (request, reply) => {

      //Puxa os dados vindo do body
      const { name, email, password, acess, wallet } = request.body;

      //Verifica se o e-mail existe e retorna erro caso exista
      const userEmail = await prisma.user.findFirst({
        where: {email: email}
      })
      if(userEmail){throw new BadRequest('E-mail já cadastrado!');}

      //criptografa a senha
      const hashedPassword = await bcrypt.hash(password, 10)

      //Cria o usuario
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, acess, wallet },
      });
      
      //Retorna 201 e o id do usuario
      return reply.status(201).send({ userId: user.id });
    });
}
