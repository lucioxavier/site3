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

app.get('/admin', (req, res) => {
  const sql = 'SELECT id, usuario FROM usuarios';

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.send('Erro ao listar usuários.');
    } else {
      let html = '<h2>Usuários cadastrados:</h2><ul>';
      rows.forEach(user => {
        html += `
          <li>
            ID: ${user.id} | Usuário: ${user.usuario}
            <a href="/deletar?id=${user.id}" onclick="return confirm('Tem certeza que deseja excluir este usuário?')">❌ Excluir</a>
          </li>`;
      });
      html += '</ul><a href="/">Voltar</a>';
      res.send(html);
    }
  });
});

app.get('/deletar', (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.send('ID inválido.');
  }

  const sql = 'DELETE FROM usuarios WHERE id = ?';

  db.run(sql, [id], function(err) {
    if (err) {
      res.send('Erro ao excluir usuário.');
    } else {
      res.redirect('/admin');
    }
  });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
