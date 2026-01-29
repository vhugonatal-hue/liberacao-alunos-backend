const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Banco em memória
let liberacoes = [];

// Rota inicial
app.get("/", (req, res) => {
  res.send("API ONLINE 🚀");
});

// =============================
// CRIAR LIBERAÇÃO (SECRETARIA)
// =============================
app.post("/liberacoes", async (req, res) => {
  try {
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

    // Gerar código único
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

    // 🔥 GERA QR CODE
    const qrCode = await QRCode.toDataURL(codigo);

    res.json({
      sucesso: true,
      codigo,
      qrCode
    });

  } catch (erro) {
    console.error("Erro ao gerar liberação:", erro);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// =============================
// BUSCAR LIBERAÇÃO (PORTARIA)
// =============================
app.get("/liberacoes/:codigo", (req, res) => {
  const { codigo } = req.params;

  const liberacao = liberacoes.find(
    l => l.codigo === codigo.toUpperCase()
  );

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

// =============================
// INICIAR SERVIDOR
// =============================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
