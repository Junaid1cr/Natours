const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Junaid <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.BREVO_USERNAME, // Provided login
          pass: process.env.BREVO_PASSWORD, // Master password
        },
      });
    }
    return nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      secure: false,
      auth: {
        user: '4dacd7a5a4617b',
        pass: '55c5d3f70fa237',
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      { firstName: this.firstname, subject, url: this.url },
    );

    const mailoptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html), // Use htmlToText here
    };

    const transporter = this.newTransport(); // Use the transporter returned by newTransport
    try {
      await transporter.sendMail(mailoptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendWelcome() {
    console.log('Sending welcome email');
    await this.send('welcome', 'Hello Babu, you are welcome');
  }

  async Passwordreset() {
    await this.send(
      'passwordreset',
      'Your password reset token (Valid for 10 minutes)',
    );
  }
};
