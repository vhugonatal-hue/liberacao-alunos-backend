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

// HTML e arquivos públicos
app.use(express.static(path.join(__dirname, "public")));

// ======================
// BANCO EM MEMÓRIA
// ======================
let liberacoes = [];

// ======================
// ROTA TESTE
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

  // QR Code com o código
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
// PDF PROFISSIONAL
// ======================
app.get("/pdf/:codigo", async (req, res) => {
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

  // ======================
  // LOGO
  // ======================
  const logoPath = path.join(__dirname, "public", "logo.png");
  if (logoPath) {
    doc.image(logoPath, 50, 40, { width: 80 });
  }

  // ======================
  // CABEÇALHO
  // ======================
  doc
    .fontSize(18)
    .fillColor("#1f3c88")
    .text("ESCOLA CEUS", 0, 50, { align: "center" });

  doc
    .moveDown(0.5)
    .fontSize(14)
    .fillColor("black")
    .text("LIBERAÇÃO DE ALUNO", { align: "center" });

  doc.moveDown(2);

  // ======================
  // CÓDIGO EM DESTAQUE
  // ======================
  doc
    .rect(150, doc.y, 300, 35)
    .stroke("#1f3c88");

  doc
    .fontSize(14)
    .fillColor("#1f3c88")
    .text(`CÓDIGO: ${liberacao.codigo}`, 150, doc.y + 10, {
      align: "center",
      width: 300
    });

  doc.moveDown(3);

  // ======================
  // DADOS
  // ======================
  doc.fontSize(12).fillColor("black");

  doc.text(`Aluno: ${liberacao.aluno}`);
  doc.text(`Turma: ${liberacao.turma}`);
  doc.text(`Responsável: ${liberacao.responsavel}`);
  doc.text(`Telefone: ${liberacao.telefone}`);
  doc.text(`Pessoa autorizada: ${liberacao.terceiro}`);
  doc.text(`Documento: ${liberacao.documento}`);

  doc.moveDown();
  doc.text(`Observações: ${liberacao.observacoes || "-"}`);

  doc.moveDown(2);

  // ======================
  // QR CODE NO PDF
  // ======================
  const qrCode = await QRCode.toDataURL(liberacao.codigo);
  doc.image(qrCode, 400, doc.y - 100, { width: 100 });

  // ======================
  // ASSINATURA
  // ======================
  doc.moveDown(4);
  doc.text("________________________________________");
  doc.text("Assinatura da Secretaria");

  doc.moveDown(2);

  // ======================
  // RODAPÉ
  // ======================
  doc
    .fontSize(9)
    .fillColor("gray")
    .text(
      `Emitido em ${new Date(liberacao.data).toLocaleString("pt-BR")}`,
      { align: "center" }
    );

  doc.end();
});

// ======================
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
