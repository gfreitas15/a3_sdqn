import { firebaseAuth} from './firebase.js';
import {
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
} from "firebase/auth";

function apiKeyMiddleware(req, res, next) {
  let apiKey = req.headers['api_key'];
  if (!apiKey || apiKey !== process.env.API_KEY) { 
    res.status(401).send('API key inválida');
    return;
  }
  next();
}

async function criarUsuarioFirebase(email, senha) {
  const credencial = await createUserWithEmailAndPassword(firebaseAuth, email, senha);
  return credencial.user;
}    

async function loginFirebase(email, senha) {
  const credencial = await signInWithEmailAndPassword(firebaseAuth, email, senha);
  return credencial.user;
}

export { 
    apiKeyMiddleware, 
    criarUsuarioFirebase,
    loginFirebase
};