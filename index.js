const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Banco em memória
let liberacoes = [];

// =============================
// ROTA INICIAL
// =============================
app.get("/", (req, res) => {
  res.send("API ONLINE 🚀");
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
    return res.status(400).json({
      erro: "Aluno e turma são obrigatórios"
    });
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
// CONSULTAR LIBERAÇÃO (PORTARIA)
// =============================
app.get("/liberacoes/:codigo", (req, res) => {
  const { codigo } = req.params;

  const liberacao = liberacoes.find(
    l => l.codigo.toUpperCase() === codigo.toUpperCase()
  );

  if (!liberacao) {
    return res.status(404).json({
      erro: "Código não encontrado"
    });
  }

  res.json(liberacao);
});

// =============================
// INICIAR SERVIDOR
// =============================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
