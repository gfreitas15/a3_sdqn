import { jwtVerify, decodeJwt, SignJWT } from "jose";
import { createSecretKey } from "crypto";
import { v4 as uuidv4 } from "uuid";
//import logger from "./logger.js";
import { version } from "../versao.js";

const corsOptions = {
  origin: ["http://localhost:8080", "https://meuservidor.com.br"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

const validadeToken = 900; // 15 minutos (em segundos)

const api_key = process.env.api_key;
const tokenSecret = process.env.tokenSecret;
if (!tokenSecret) {
  throw new Error("Variável de ambiente tokenSecret não definida no .env");
}
const secret = createSecretKey(tokenSecret, "utf-8");

//Middleware para testar API Key
const APIKeyMiddleware = (req, res, next) => {
  if (req.get("ApiKey") != api_key) {
    res.sendStatus(401);
    return false;
  } else {
    next();
  }
};

//Descriptador de Token JWT
const openTokenJWT = (jwt) => {
  return new Promise((resolve, reject) => {
    jwtVerify(jwt, secret, { algorithms: ["HS256"] })
      .then((result) => {
        resolve(result.payload);
      })
      .catch((error) => {
        if (error.code == "ERR_JWT_EXPIRED") {
          reject("Token de acesso expirado " + error.code);
        } else {
          reject("Token de acesso inválido " + error.code);
        }
      });
  });
};
/* outra forma de escrever a mesma função
function openTokenJWT(jwt) {
  return new Promise((resolve, reject) => {
    jwtVerify(jwt, secret, { algorithms: ["HS256"] })
      .then((result) => {
        resolve(result.payload);
      })
      .catch((error) => {
        if (error.code == "ERR_JWT_EXPIRED") {
          reject("Token de acesso expirado " + error.code);
        } else {
          reject("Token de acesso inválido " + error.code);
        }
      });
  });
};
*/

//Extrai o token do header "Authorization: Bearer <token>" ou do cookie BackendToken
const extrairToken = (req) => {
  const authorization = req.get("Authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.split(" ")[1];
  }
  return req.cookies?.BackendToken ?? null;
};

//Middleware para testar presença e validade do Token JWT
// - sem token      -> 401
// - token expirado -> 401 (o cliente deve fazer refresh ou login novamente)
// - token inválido -> 403
// - token válido   -> req.usuario = payload; next();
const TokenMiddleware = async (req, res, next) => {
  const token = extrairToken(req);

  if (!token) {
    return res.status(401).json({ erro: "Token não enviado" });
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    req.usuario = payload;
    next();
  } catch (error) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return res
        .status(401)
        .json({ erro: "Token de acesso expirado", codigo: error.code });
    }
    return res
      .status(403)
      .json({ erro: "Token de acesso inválido", codigo: error.code });
  }
};

//Middleware para verificar se o usuário do token é admin
//(usar DEPOIS do TokenMiddleware, pois depende de req.usuario)
const TokenIsAdminMiddleware = (req, res, next) => {
  const usuario = req.usuario;
  if (usuario?.isAdmin && usuario.nivelAdmin > 0) {
    next();
  } else {
    res.status(403).json({ erro: "Usuário não é Admin" });
  }
};

//Cria um token JWT
const createToken = async (dados) => {
  // copia os dados para não alterar o objeto original e descarta as claims
  // de um token antigo (no refresh, iat/exp/jti precisam ser gerados de novo)
  const { iat, exp, nbf, jti, ...data } = { ...dados };
  let jwt = undefined;
  if (!data.jti) {
    data.jti = uuidv4();
  }
  if (!data.sub) {
    data.sub =
      "Login dia " +
      new Date().toLocaleDateString() +
      " " +
      new Date().toLocaleTimeString();
  }
  try {
    jwt = await new SignJWT(data)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setSubject(data.sub)
      .setJti(data.jti)
      .setExpirationTime(validadeToken + "s")
      .sign(secret);
  } catch (error) {
    console.error("Erro ao criar o token JWT", error);
  }
  return { jwt: jwt, jti: data.jti };
};

// converte um array de object Javascript em CSV
function toCSV(objectsArray) {
  let attr = Object.keys(objectsArray[0]);
  let ret = attr.join(";") + "\n";
  objectsArray.forEach((item) => {
    let values = [];
    attr.forEach((key) => {
      values.push(item[key] ? item[key] : "");
    });
    ret += values.join(";") + "\n";
  });
  return ret;
}
//Middleware para adicionar a versão no header da resposta
function versionMiddleware(req, res, next) {
  res.setHeader("X-Powered-By", `Nossa API v${version}`);
  res.setHeader("X-API-Version", version);
  next();
}

export {
  corsOptions,
  api_key,
  tokenSecret,
  validadeToken,
  createToken,
  APIKeyMiddleware,
  TokenMiddleware,
  TokenIsAdminMiddleware,
  openTokenJWT,
  toCSV,
  versionMiddleware,
};
