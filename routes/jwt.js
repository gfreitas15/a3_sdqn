import express from "express";
import cors from "cors";
import { corsOptions, createToken, validadeToken, TokenMiddleware } from "../utils/index.js";
import { loginFirebase } from "../tools/index.js";

const router = express.Router();

// Erros do Firebase que significam "credenciais erradas" -> 401
const errosDeCredencial = [
  "auth/invalid-credential",
  "auth/invalid-email",
  "auth/user-not-found",
  "auth/wrong-password",
  "auth/user-disabled",
];

// Envia o token no corpo, no header JWT_Token e no cookie BackendToken
function enviarToken(res, jwt) {
  res.set("JWT_Token", jwt);
  res.cookie("BackendToken", jwt, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: validadeToken * 1000,
  });
  res.status(200).json({ token: jwt, expiraEm: validadeToken });
}

/*
  POST /login
  body: { "email": "...", "senha": "..." }
  Valida o usuário no Firebase e devolve um JWT assinado pelo backend.
*/
router.post("/", cors(corsOptions), async (req, res) => {
  const email = req.body?.email ?? req.body?.user;
  const senha = req.body?.senha ?? req.body?.password;

  if (!email || !senha) {
    return res.status(400).json({ erro: "email e senha são obrigatórios" });
  }

  try {
    const usuarioFirebase = await loginFirebase(email, senha);

    const { jwt } = await createToken({
      sub: usuarioFirebase.uid, // dono do token (uid do Firebase)
      uid: usuarioFirebase.uid,
      email: usuarioFirebase.email,
    });

    if (!jwt) {
      return res.status(500).json({ erro: "Falha ao gerar o token" });
    }
    enviarToken(res, jwt);
  } catch (erro) {
    if (errosDeCredencial.includes(erro.code)) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }
    if (erro.code === "auth/too-many-requests") {
      return res.status(429).json({ erro: "Muitas tentativas, tente mais tarde" });
    }
    console.error("Erro no login", erro);
    res.status(500).json({ erro: "Erro ao realizar login" });
  }
});

/*
  GET /login/refreshToken
  header: Authorization: Bearer <token>  (ou cookie BackendToken)
  Recebe um token ainda válido e devolve um novo, com nova validade.
*/
router.get("/refreshToken", cors(corsOptions), TokenMiddleware, async (req, res) => {
  const { jwt } = await createToken(req.usuario);
  if (!jwt) {
    return res.status(500).json({ erro: "Falha ao gerar o token" });
  }
  enviarToken(res, jwt);
});

export default router;
