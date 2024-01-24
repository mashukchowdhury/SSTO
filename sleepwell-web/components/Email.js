"use strict";
const nodemailer = require("nodemailer");

// TODO: Register with SMTP service or figure out which one the previous group was using
const transporter = nodemailer.createTransport({
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true,
    auth: {
        user: '',
        pass: ''
    }
});

async function sendMail(smtpCallback) {
    const result = await transporter.sendMail({
        from: '"Alias" <address@email.com>',
        to: "address@email.com",
        subject: "Test Email",
        html: "Test Body",
    });

    smtpCallback(result);
}

export default sendMail();