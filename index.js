const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const db = require('./banco');
//aqui vou adicionar um comentario

let usuarios = []; // Lista de usuários

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // serve os arquivos HTML

app.post('/cadastro', (req, res) => {
  const { usuario, senha } = req.body;

  const sql = `INSERT INTO usuarios (usuario, senha) VALUES (?, ?)`;
  db.run(sql, [usuario, senha], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.send('Usuário já existe. <a href="/cadastro.html">Tentar novamente</a>');
      } else {
        res.send('Erro ao cadastrar. <a href="/cadastro.html">Tentar novamente</a>');
      }
    } else {
      res.redirect('/login.html');
    }
  });
});

app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  const sql = `SELECT * FROM usuarios WHERE usuario = ? AND senha = ?`;
  db.get(sql, [usuario, senha], (err, row) => {
    if (err) {
      res.send('Erro no login. <a href="/login.html">Tentar novamente</a>');
    } else if (row) {
      res.redirect('/home.html');
    } else {
      res.send('Login inválido. <a href="/login.html">Tentar novamente</a>');
    }
  });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
