import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

// Só aceita os campos do professor; os ausentes (undefined) são ignorados pelo Prisma
const dados = ({ nome, email, telefone } = {}) => ({ nome, email, telefone });

// GET /professores
router.get("/", async (req, res) => {
  try {
    const professores = await prisma.professor.findMany({ orderBy: { nome: "asc" } });
    res.json(professores);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar professores" });
  }
});

// GET /professores/:id
router.get("/:id", async (req, res) => {
  try {
    const professor = await prisma.professor.findUnique({ where: { id: Number(req.params.id) } });
    if (!professor) return res.status(404).json({ erro: "Professor não encontrado" });
    res.json(professor);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar professor" });
  }
});

// POST /professores
router.post("/", async (req, res) => {
  try {
    const professor = await prisma.professor.create({ data: dados(req.body) });
    res.status(201).json(professor);
  } catch (erro) {
    res.status(400).json({ erro: "Dados do professor inválidos" });
  }
});

// PUT /professores/:id (aceita atualização parcial)
router.put("/:id", async (req, res) => {
  try {
    const professor = await prisma.professor.update({
      where: { id: Number(req.params.id) },
      data: dados(req.body),
    });
    res.json(professor);
  } catch (erro) {
    res.status(400).json({ erro: "Não foi possível atualizar o professor" });
  }
});

// DELETE /professores/:id (falha se o professor ainda tiver aulas)
router.delete("/:id", async (req, res) => {
  try {
    await prisma.professor.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensagem: "Professor removido com sucesso" });
  } catch (erro) {
    res.status(400).json({ erro: "Não foi possível remover o professor" });
  }
});

export default router;
