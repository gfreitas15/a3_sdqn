import createError from "http-errors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import logger from "morgan";

import cors from "cors";

import indexRouter from "./routes/index.js";
import { usersRouter } from "./routes/users.js";
import jwtRouter from "./routes/jwt.js";
import aulasRouter from "./routes/aulas.js";
import alunosRouter from "./routes/alunos.js";
import professoresRouter from "./routes/professores.js";
import inscricoesRouter from "./routes/inscricoes.js";
import { TokenMiddleware } from "./utils/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//alterado para habilitar e permitir CORS com options em todas as rotas

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.options(
  "*",
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/login", jwtRouter); // POST /login e GET /login/refreshToken
app.use("/aulas", TokenMiddleware, aulasRouter);
app.use("/alunos", TokenMiddleware, alunosRouter);
app.use("/professores", TokenMiddleware, professoresRouter);
app.use("/inscricoes", TokenMiddleware, inscricoesRouter);

// Rotas de CRUD devem ser protegidas pelo TokenMiddleware, por exemplo:
// app.use("/alunos", TokenMiddleware, alunosRouter);
// Dentro delas, o usuário logado fica disponível em req.usuario (uid, email).

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
