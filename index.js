const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Banco em memória
let liberacoes = [];

// Rota teste
app.get("/", (req, res) => {
  res.send("API ONLINE 🚀");
});

// =============================
// CRIAR LIBERAÇÃO (SECRETARIA)
// =============================
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

  const codigo = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const qrCode = await QRCode.toDataURL(codigo);

  const liberacao = {
    codigo,
    aluno,
    turma,
    responsavel,
    telefone,
    terceiro,
    documento,
    observacoes,
    qrCode
  };

  liberacoes.push(liberacao);

  // ⚠️ AQUI está o ponto-chave
  res.json({
    codigo,
    qrCode
  });
});

// =============================
// BUSCAR LIBERAÇÃO (PORTARIA)
// =============================
app.get("/liberacoes/:codigo", (req, res) => {
  const liberacao = liberacoes.find(
    l => l.codigo === req.params.codigo
  );

  if (!liberacao) {
    return res.status(404).json({ erro: "Código não encontrado" });
  }

  res.json(liberacao);
});

// =============================
// GERAR PDF
// =============================
app.get("/pdf/:codigo", (req, res) => {
  const liberacao = liberacoes.find(
    l => l.codigo === req.params.codigo
  );

  if (!liberacao) {
    return res.status(404).send("Liberação não encontrada");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=liberacao-${liberacao.codigo}.pdf`
  );

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(18).text("LIBERAÇÃO DE ALUNO", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Aluno: ${liberacao.aluno}`);
  doc.text(`Turma: ${liberacao.turma}`);
  doc.text(`Responsável: ${liberacao.responsavel}`);
  doc.text(`Telefone: ${liberacao.telefone}`);
  doc.text(`Autorizado: ${liberacao.terceiro}`);
  doc.text(`Documento: ${liberacao.documento}`);
  doc.moveDown();
  doc.text(`Código: ${liberacao.codigo}`);

  doc.image(
    Buffer.from(liberacao.qrCode.split(",")[1], "base64"),
    { width: 120 }
  );

  doc.end();
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
