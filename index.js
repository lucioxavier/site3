const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const db = require('./banco');
const session = require('express-session');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(session({
  secret: 'segredo',
  resave: false,
  saveUninitialized: false
}));

// ROTA DE CADASTRO
app.post('/cadastro', async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    await db.query('INSERT INTO usuarios (usuario, senha) VALUES ($1, $2)', [usuario, senha]);

    // Envia o e-mail de confirmação
    enviarEmailConfirmacao(usuario, usuario); // aqui, usuário é o e-mail

    res.redirect('/login.html');
  } catch (err) {
    if (err.code === '23505') { // usuário já existe
      res.send('Usuário já existe. <a href="/cadastro.html">Tentar novamente</a>');
    } else {
      res.send('Erro ao cadastrar. <a href="/cadastro.html">Tentar novamente</a>');
    }
  }
});

// ROTA DE LOGIN
app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE usuario = $1 AND senha = $2', [usuario, senha]);
    if (result.rows.length > 0) {
      req.session.usuario = usuario;
      res.redirect('/home');
    } else {
      res.send('Login inválido. <a href="/login.html">Tentar novamente</a>');
    }
  } catch (err) {
    res.send('Erro no login. <a href="/login.html">Tentar novamente</a>');
  }
});

// ROTA HOME PROTEGIDA
app.get('/home', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login.html');
  }

  res.sendFile(path.join(__dirname, 'home.html'));
});

// ROTA ADMIN
app.get('/admin', async (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/admin-login.html');
  }

  try {
    const result = await db.query('SELECT id, usuario FROM usuarios');
    let html = '<h2>Usuários cadastrados:</h2><ul><a href="/logout">Sair</a>';
    result.rows.forEach(user => {
      html += `
        <li>
          ID: ${user.id} | Usuário: ${user.usuario}
          <a href="/deletar?id=${user.id}" onclick="return confirm('Tem certeza que deseja excluir este usuário?')">❌ Excluir</a>
        </li>`;
    });
    html += '</ul><a href="/">Voltar</a>';
    res.send(html);
  } catch (err) {
    res.send('Erro ao listar usuários.');
  }
});

// EXCLUSÃO DE USUÁRIOS
app.get('/deletar', async (req, res) => {
  if (!req.session.admin) {
    return res.send('Acesso não autorizado.');
  }

  const id = req.query.id;

  if (!id) {
    return res.send('ID inválido.');
  }

  try {
    await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.redirect('/admin');
  } catch (err) {
    res.send('Erro ao excluir usuário.');
  }
});

// LOGIN DO ADMIN
app.post('/admin-login', (req, res) => {
  const { senha } = req.body;
  if (senha === 'admin123') {
    req.session.admin = true;
    res.redirect('/admin');
  } else {
    res.send('Senha incorreta. <a href="/admin-login.html">Tentar novamente</a>');
  }
});

// LOGOUT GERAL
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Erro ao sair.');
    res.redirect('/login.html');
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
