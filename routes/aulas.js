import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

// Só aceita os campos da aula; os ausentes (undefined) são ignorados pelo Prisma
const dados = ({ dataHora, localidade, nivel, vagas, professorId } = {}) => ({
  dataHora: dataHora && new Date(dataHora),
  localidade,
  nivel,
  vagas,
  professorId,
});

// GET /aulas
router.get("/", async (req, res) => {
  try {
    const aulas = await prisma.aula.findMany({ orderBy: { dataHora: "asc" } });
    res.json(aulas);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar aulas" });
  }
});

// GET /aulas/:id
router.get("/:id", async (req, res) => {
  try {
    const aula = await prisma.aula.findUnique({ where: { id: Number(req.params.id) } });
    if (!aula) return res.status(404).json({ erro: "Aula não encontrada" });
    res.json(aula);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar aula" });
  }
});

// POST /aulas
router.post("/", async (req, res) => {
  try {
    const aula = await prisma.aula.create({ data: dados(req.body) });
    res.status(201).json(aula);
  } catch (erro) {
    res.status(400).json({ erro: "Dados da aula inválidos" });
  }
});

// PUT /aulas/:id (aceita atualização parcial)
router.put("/:id", async (req, res) => {
  try {
    const aula = await prisma.aula.update({
      where: { id: Number(req.params.id) },
      data: dados(req.body),
    });
    res.json(aula);
  } catch (erro) {
    res.status(400).json({ erro: "Não foi possível atualizar a aula" });
  }
});

// DELETE /aulas/:id (as inscrições da aula são removidas em cascata)
router.delete("/:id", async (req, res) => {
  try {
    await prisma.aula.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensagem: "Aula removida com sucesso" });
  } catch (erro) {
    res.status(404).json({ erro: "Aula não encontrada" });
  }
});

export default router;
