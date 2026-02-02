const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔴 ESSENCIAL — SERVIR HTML
app.use(express.static(path.join(__dirname, "public")));

// ======================
// BANCO EM MEMÓRIA
// ======================
let liberacoes = [];

// ======================
// ROTA TESTE
// ======================
app.get("/", (req, res) => {
  res.send("API ONLINE 🚀");
});

// ======================
// CRIAR LIBERAÇÃO
// ======================
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

  if (!aluno || !turma) {
    return res.status(400).json({ erro: "Aluno e turma obrigatórios" });
  }

  const codigo = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const liberacao = {
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

  liberacoes.push(liberacao);

  // GERAR QR CODE
  const qrCode = await QRCode.toDataURL(codigo);

  res.json({
    codigo,
    qrCode
  });
});

// ======================
// BUSCAR LIBERAÇÃO (PORTARIA)
// ======================
app.get("/liberacoes/:codigo", (req, res) => {
  const liberacao = liberacoes.find(
    l => l.codigo === req.params.codigo
  );

  if (!liberacao) {
    return res.status(404).json({ erro: "Código não encontrado" });
  }

  res.json(liberacao);
});

// ======================
// GERAR PDF
// ======================
app.get("/pdf/:codigo", async (req, res) => {
  const liberacao = liberacoes.find(
    l => l.codigo === req.params.codigo
  );

  if (!liberacao) {
    return res.status(404).send("Código não encontrado");
  }

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=liberacao-${liberacao.codigo}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(18).text("LIBERAÇÃO DE ALUNO", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Código: ${liberacao.codigo}`);
  doc.text(`Aluno: ${liberacao.aluno}`);
  doc.text(`Turma: ${liberacao.turma}`);
  doc.text(`Responsável: ${liberacao.responsavel}`);
  doc.text(`Telefone: ${liberacao.telefone}`);
  doc.text(`Autorizado: ${liberacao.terceiro}`);
  doc.text(`Documento: ${liberacao.documento}`);
  doc.moveDown();
  doc.text(`Observações: ${liberacao.observacoes || "-"}`);
  doc.moveDown();
  doc.text(`Data: ${new Date(liberacao.data).toLocaleString()}`);

  doc.end();
});

// ======================
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
