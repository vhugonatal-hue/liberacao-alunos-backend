require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("Iniciando servidor...");

// Rota raiz
app.get("/", (req, res) => {
  res.send("API ONLINE");
});

// Rota de teste
app.get("/teste", (req, res) => {
  res.json({
    status: "ok",
    mensagem: "Backend online e funcionando"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

