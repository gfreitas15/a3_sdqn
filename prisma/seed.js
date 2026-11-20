import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Limpa o banco (precisa ser nessa ordem por causa das relacoes)
  await prisma.inscricao.deleteMany();
  await prisma.aula.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.professor.deleteMany();

  const professores = await prisma.professor.createManyAndReturn({
    data: [
      { nome: "Carlos Silva", email: "carlos.silva@email.com", telefone: "51999990001" },
      { nome: "Mariana Costa", email: "mariana.costa@email.com", telefone: "51999990002" },
      { nome: "Rafael Souza", email: "rafael.souza@email.com", telefone: "51999990003" },
      { nome: "Juliana Lima", email: "juliana.lima@email.com", telefone: "51999990004" },
      { nome: "Pedro Almeida", email: "pedro.almeida@email.com", telefone: "51999990005" },
    ],
  });

  const alunos = await prisma.aluno.createManyAndReturn({
    data: [
      { nome: "Ana Pereira", email: "ana.pereira@email.com", telefone: "51988880001", nivel: "BRANCO" },
      { nome: "Bruno Rocha", email: "bruno.rocha@email.com", telefone: "51988880002", nivel: "AZUL" },
      { nome: "Camila Santos", email: "camila.santos@email.com", telefone: "51988880003", nivel: "ROXO" },
      { nome: "Diego Martins", email: "diego.martins@email.com", telefone: "51988880004", nivel: "BRANCO" },
      { nome: "Elisa Ferreira", email: "elisa.ferreira@email.com", telefone: "51988880005", nivel: "AZUL" },
      { nome: "Felipe Gomes", email: "felipe.gomes@email.com", telefone: "51988880006", nivel: "ROXO" },
    ],
  });

  const aulas = await prisma.aula.createManyAndReturn({
    data: [
      { dataHora: new Date("2026-12-01T09:00:00"), localidade: "Quadra Central", nivel: "BRANCO", vagas: 10, professorId: professores[0].id },
      { dataHora: new Date("2026-12-02T14:00:00"), localidade: "Quadra do Norte", nivel: "AZUL", vagas: 8, professorId: professores[1].id },
      { dataHora: new Date("2026-12-03T08:30:00"), localidade: "Quadra Central", nivel: "ROXO", vagas: 6, professorId: professores[2].id },
      { dataHora: new Date("2026-12-04T10:00:00"), localidade: "Quadra do Sul", nivel: "BRANCO", vagas: 12, professorId: professores[3].id },
      { dataHora: new Date("2026-12-05T16:00:00"), localidade: "Quadra do Norte", nivel: "AZUL", vagas: 8, professorId: professores[4].id },
    ],
  });

  // Cada aluno se inscreve em aulas de acordo com seu nivel
  await prisma.inscricao.createMany({
    data: [
      { alunoId: alunos[0].id, aulaId: aulas[0].id },
      { alunoId: alunos[0].id, aulaId: aulas[3].id },
      { alunoId: alunos[3].id, aulaId: aulas[0].id },
      { alunoId: alunos[3].id, aulaId: aulas[3].id },
      { alunoId: alunos[1].id, aulaId: aulas[1].id },
      { alunoId: alunos[4].id, aulaId: aulas[1].id },
      { alunoId: alunos[4].id, aulaId: aulas[4].id },
      { alunoId: alunos[2].id, aulaId: aulas[2].id },
      { alunoId: alunos[5].id, aulaId: aulas[2].id },
    ],
  });

  console.log(
    `Seed concluído: ${professores.length} professores, ${alunos.length} alunos, ${aulas.length} aulas, 9 inscrições.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
