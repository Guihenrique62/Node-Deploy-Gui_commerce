import jwt, { JwtPayload } from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.split(' ')[1]; // Espera "Bearer <token>"

  if (!token) {
    return reply.status(401).send({ message: 'Token não fornecido' });
  }

  try {
    // Decodifica o token JWT e usa 'unknown' para converter
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as unknown;

    // Converte o 'decoded' para o tipo esperado
    const user = decoded as JwtPayload & { id: string; acess: number };

    // Adiciona os dados do usuário à requisição
    request.user = user;  // Agora, request.user pode ser acessado em outras rotas
  } catch (error) {
    return reply.status(401).send({ message: 'Token inválido' });
  }
}
