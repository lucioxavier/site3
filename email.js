const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tanagoshiii@gmail.com',
    pass: 'xkkt yhrg vvxq thig'
  }
});

function enviarEmailConfirmacao(destinatario, usuario) {
  const mailOptions = {
    from: 'tanagoshiii@gmail.com',
    to: destinatario,
    subject: 'Cadastro realizado com sucesso!',
    html: `
      <h3>Olá, ${usuario}!</h3>
      <p>Seu cadastro foi realizado com sucesso.</p>
      <p>Se você não fez esse cadastro, ignore este e-mail.</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail:', error);
    } else {
      console.log('E-mail enviado:', info.response);
    }
  });
}

module.exports = enviarEmailConfirmacao;
