import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

// A inscrição é identificada pelo par aluno + aula
const chave = (params) => ({
  alunoId_aulaId: { alunoId: Number(params.alunoId), aulaId: Number(params.aulaId) },
});

// GET /inscricoes
router.get("/", async (req, res) => {
  try {
    const inscricoes = await prisma.inscricao.findMany({ orderBy: { dataInscricao: "asc" } });
    res.json(inscricoes);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar inscrições" });
  }
});

// GET /inscricoes/:alunoId/:aulaId
router.get("/:alunoId/:aulaId", async (req, res) => {
  try {
    const inscricao = await prisma.inscricao.findUnique({ where: chave(req.params) });
    if (!inscricao) return res.status(404).json({ erro: "Inscrição não encontrada" });
    res.json(inscricao);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar inscrição" });
  }
});

// POST /inscricoes
router.post("/", async (req, res) => {
  try {
    const { alunoId, aulaId } = req.body ?? {};
    const inscricao = await prisma.inscricao.create({ data: { alunoId, aulaId } });
    res.status(201).json(inscricao);
  } catch (erro) {
    res.status(400).json({ erro: "Não foi possível realizar a inscrição" });
  }
});

// DELETE /inscricoes/:alunoId/:aulaId
router.delete("/:alunoId/:aulaId", async (req, res) => {
  try {
    await prisma.inscricao.delete({ where: chave(req.params) });
    res.json({ mensagem: "Inscrição cancelada com sucesso" });
  } catch (erro) {
    res.status(404).json({ erro: "Inscrição não encontrada" });
  }
});

export default router;
