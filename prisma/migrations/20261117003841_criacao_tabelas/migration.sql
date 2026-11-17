-- CreateTable
CREATE TABLE "aluno" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "nivel" VARCHAR(20) NOT NULL,

    CONSTRAINT "aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professor" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,

    CONSTRAINT "professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aula" (
    "id" SERIAL NOT NULL,
    "data_hora" TIMESTAMP NOT NULL,
    "localidade" VARCHAR(255) NOT NULL,
    "nivel" VARCHAR(20) NOT NULL,
    "vagas" INTEGER NOT NULL,
    "professor_id" INTEGER NOT NULL,

    CONSTRAINT "aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscricao" (
    "aluno_id" INTEGER NOT NULL,
    "aula_id" INTEGER NOT NULL,
    "data_inscricao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscricao_pkey" PRIMARY KEY ("aluno_id","aula_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aluno_email_key" ON "aluno"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professor_email_key" ON "professor"("email");

-- AddForeignKey
ALTER TABLE "aula" ADD CONSTRAINT "aula_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricao" ADD CONSTRAINT "inscricao_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricao" ADD CONSTRAINT "inscricao_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "aluno" ADD CONSTRAINT "aluno_nivel_check"
  CHECK (nivel IN ('BRANCO','CINZA','AZUL','AMARELO','LARANJA','VERMELHO','VERDE','ROXO','MARROM','PRETO'));

ALTER TABLE "aula" ADD CONSTRAINT "aula_nivel_check"
  CHECK (nivel IN ('BRANCO','CINZA','AZUL','AMARELO','LARANJA','VERMELHO','VERDE','ROXO','MARROM','PRETO'));

ALTER TABLE "aula" ADD CONSTRAINT "aula_vagas_check" CHECK (vagas > 0);