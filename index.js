const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Banco em memória (simples)
let liberacoes = [];

// Rota inicial (teste)
app.get("/", (req, res) => {
  res.send("API de Liberação de Alunos está funcionando!");
});

// =============================
// CRIAR LIBERAÇÃO (SECRETARIA)
// =============================
app.post("/liberacoes", (req, res) => {
  const {
    aluno,
    turma,
    responsavel,
    telefone,
    terceiro,
    documento,
    observacoes
  } = req.body;

  if (!aluno || !turma) {
    return res.status(400).json({ erro: "Aluno e turma são obrigatórios" });
  }

  const codigo = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const novaLiberacao = {
    codigo,
    aluno,
    turma,
    responsavel,
    telefone,
    terceiro,
    documento,
    observacoes,
    data: new Date()
  };

  liberacoes.push(novaLiberacao);

  res.json({
    sucesso: true,
    codigo
  });
});

// =============================
// VALIDAR LIBERAÇÃO (PORTARIA)
// =============================
app.post("/validar", (req, res) => {
  const { codigo } = req.body;

  const liberacao = liberacoes.find(l => l.codigo === codigo);

  if (!liberacao) {
    return res.status(404).json({
      sucesso: false,
      mensagem: "Código não encontrado"
    });
  }

  res.json({
    sucesso: true,
    aluno: liberacao.aluno,
    turma: liberacao.turma,
    terceiro: liberacao.terceiro,
    responsavel: liberacao.responsavel
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
