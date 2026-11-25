import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

// Só aceita os campos do aluno; os ausentes (undefined) são ignorados pelo Prisma
const dados = ({ nome, email, telefone, nivel } = {}) => ({ nome, email, telefone, nivel });

// GET /alunos
router.get("/", async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany({ orderBy: { nome: "asc" } });
    res.json(alunos);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar alunos" });
  }
});

// GET /alunos/:id
router.get("/:id", async (req, res) => {
  try {
    const aluno = await prisma.aluno.findUnique({ where: { id: Number(req.params.id) } });
    if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });
    res.json(aluno);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar aluno" });
  }
});

// POST /alunos
router.post("/", async (req, res) => {
  try {
    const aluno = await prisma.aluno.create({ data: dados(req.body) });
    res.status(201).json(aluno);
  } catch (erro) {
    res.status(400).json({ erro: "Dados do aluno inválidos" });
  }
});

// PUT /alunos/:id (aceita atualização parcial)
router.put("/:id", async (req, res) => {
  try {
    const aluno = await prisma.aluno.update({
      where: { id: Number(req.params.id) },
      data: dados(req.body),
    });
    res.json(aluno);
  } catch (erro) {
    res.status(400).json({ erro: "Não foi possível atualizar o aluno" });
  }
});

// DELETE /alunos/:id (as inscrições do aluno são removidas em cascata)
router.delete("/:id", async (req, res) => {
  try {
    await prisma.aluno.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensagem: "Aluno removido com sucesso" });
  } catch (erro) {
    res.status(404).json({ erro: "Aluno não encontrado" });
  }
});

export default router;
