const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// MIDDLEWARES
// ======================
app.use(cors());
app.use(express.json());

// SERVIR ARQUIVOS HTML (secretaria.html / portaria.html)
app.use(express.static(path.join(__dirname, "public")));

// ======================
// BANCO EM MEMÓRIA
// ======================
let liberacoes = [];

// ======================
// ROTA RAIZ (TESTE)
// ======================
app.get("/", (req, res) => {
  res.send("API DE LIBERAÇÃO ONLINE 🚀");
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

  if (!aluno || !turma || !responsavel) {
    return res.status(400).json({
      erro: "Campos obrigatórios não preenchidos"
    });
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

  // GERAR QR CODE (aponta para validação na portaria)
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
    return res.status(404).json({
      erro: "Código não encontrado"
    });
  }

  res.json(liberacao);
});

// ======================
// GERAR PDF PROFISSIONAL
// ======================
app.get("/pdf/:codigo", (req, res) => {
  const liberacao = liberacoes.find(
    l => l.codigo === req.params.codigo
  );

  if (!liberacao) {
    return res.status(404).send("Código não encontrado");
  }

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=liberacao-${liberacao.codigo}.pdf`
  );

  doc.pipe(res);

  // CABEÇALHO
  doc
    .fontSize(20)
    .fillColor("#1f3c88")
    .text("ESCOLA CEUS", { align: "center" });

  doc
    .moveDown(0.5)
    .fontSize(14)
    .fillColor("black")
    .text("LIBERAÇÃO DE ALUNO", { align: "center" });

  doc.moveDown(2);

  // DADOS
  doc.fontSize(12);
  doc.text(`Código: ${liberacao.codigo}`);
  doc.text(`Aluno: ${liberacao.aluno}`);
  doc.text(`Turma: ${liberacao.turma}`);
  doc.text(`Responsável: ${liberacao.responsavel}`);
  doc.text(`Telefone: ${liberacao.telefone}`);
  doc.text(`Pessoa autorizada: ${liberacao.terceiro}`);
  doc.text(`Documento: ${liberacao.documento}`);
  doc.moveDown();
  doc.text(`Observações: ${liberacao.observacoes || "-"}`);

  doc.moveDown(2);

  // RODAPÉ
  doc
    .fontSize(10)
    .fillColor("gray")
    .text(
      `Emitido em ${new Date(liberacao.data).toLocaleString()}`,
      { align: "right" }
    );

  doc.end();
});

// ======================
// START SERVIDOR
// ======================
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
