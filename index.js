require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

console.log("Iniciando servidor...");

app.get("/", (req, res) => {
  res.send("API de Liberação de Alunos ONLINE");
});

// Criar liberação
app.post("/liberacoes", async (req, res) => {
  const {
    aluno,
    turma,
    responsavel,
    telefone,
    terceiro,
    documento,
    observacoes
  } = req.body;

  const codigo = uuidv4().slice(0, 6).toUpperCase();

  try {
    await pool.query(
      `INSERT INTO liberacoes
       (codigo, aluno, turma, responsavel, telefone, terceiro, documento, observacoes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [codigo, aluno, turma, responsavel, telefone, terceiro, documento, observacoes]
    );

    res.json({ codigo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao salvar liberação" });
  }
});

// Validar código na portaria
app.post("/validar", async (req, res) => {
  const { codigo } = req.body;

  const result = await pool.query(
    "SELECT * FROM liberacoes WHERE codigo = $1 AND usado = false",
    [codigo]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({ erro: "Código inválido ou já utilizado" });
  }

  await pool.query(
    "UPDATE liberacoes SET usado = true WHERE codigo = $1",
    [codigo]
  );

  res.json({
    sucesso: true,
    aluno: result.rows[0].aluno,
    turma: result.rows[0].turma,
    terceiro: result.rows[0].terceiro
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
