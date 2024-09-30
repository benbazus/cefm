"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTwoFactorTokenEmail = exports.sendVerificationEmail1 = exports.sendVerificationEmail = exports.sendSharedLinkEmail1 = exports.sendSharedLinkEmail = exports.sendConfirmationEmail = exports.sendShareDocumentEmail2 = exports.sendShareDocumentEmail1 = exports.sendShareDocumentEmail = exports.sendDocumentShareEmail = void 0;
exports.sendOtpEmail = sendOtpEmail;
exports.sendOtpEmail1 = sendOtpEmail1;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const nodemailer_1 = require("nodemailer");
const logger_1 = __importDefault(require("./logger"));
const transporterLocalhost = (0, nodemailer_1.createTransport)({
    host: 'localhost',
    port: parseInt('25'),
    secure: false,
    auth: {
        user: '',
        pass: '',
    },
});
const transporter = (0, nodemailer_1.createTransport)({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const transporterGmail = (0, nodemailer_1.createTransport)({
    host: process.env.GMAIL_SERVER_HOST,
    port: Number(process.env.GMAIL_SERVER_PORT),
    secure: Boolean(Number(process.env.GMAIL_SERVER_SECURE)),
    auth: {
        user: process.env.GMAIL_SERVER_USER,
        pass: process.env.GMAIL_SERVER_PASSWORD,
    },
});
function sendMail(to, subject, html) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield transporterLocalhost.sendMail({
                from: process.env.SMTP_FROM_EMAIL,
                to,
                subject,
                html,
            });
        }
        catch (e) {
            console.log((e));
        }
    });
}
const sendDocumentShareEmail = (name, senderEmail, recipientEmail, emailMessage, documentUrl, permission, documentName) => __awaiter(void 0, void 0, void 0, function* () {
    let documentPermission;
    if (permission == 'READ') {
        documentPermission = 'view';
    }
    else if (permission == 'WRITE') {
        documentPermission = 'edit';
    }
    const mailOptions = {
        from: senderEmail,
        to: recipientEmail,
        subject: 'You’ve been invited to view a shared document',
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document Share</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f7f9fc;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
            text-align: center;
            font-size: 22px;
          }
          .content {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${senderEmail} shared with You</h1>
          <div class="content">
            <p>Hello, ${recipientEmail}</p>
            <p> ${senderEmail} has invited you to <strong>${documentPermission}</strong> this <strong>${documentName}</strong> document.</p>
            <p>You can access the shared document using the link below:</p>
            <p>${emailMessage}</p>
            <p style="text-align: center;">
              <a href="${documentUrl}" class="button">Open Document</a>
            </p>
            <p>Best regards,<br/>${senderEmail}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Cloud Share</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };
    try {
        yield transporterLocalhost.sendMail(mailOptions);
        console.log(`Email sent successfully to ${recipientEmail}`);
    }
    catch (error) {
        console.error(`Failed to send email to ${recipientEmail}:`, error);
        throw new Error('Unable to send document share email.');
    }
});
exports.sendDocumentShareEmail = sendDocumentShareEmail;
const sendShareDocumentEmail = (from, to, message, title, password, date, permission, currentUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const expiryDate = new Date(date);
    const mailOptions = {
        from: from,
        to: to,
        subject: `You've been invited by ${from} to view: "${title}"`,
        text: `
      Hello ${to},

      You have been granted access to the following document by ${from}:

      Document Title: ${title}
      ${message ? `Message: ${message}` : ""}
      Access Level: ${permission.charAt(0).toUpperCase() + permission.slice(1)}

      To view the document, please click the link below:
      ${currentUrl}

      ${password ? `This document is protected by a password: ${password}` : "No password is required to access this document."}

      Please note, access to this document will expire on ${expiryDate.toDateString()}.

      Best regards,
      The Document Sharing Team
    `,
        html: `
      <p>Hello ${to},</p>
      <p>You have been granted access to the following document by ${from}:</p>
      <ul>
        <li><strong>Document Title:</strong> ${title}</li>
        ${message ? `<li><strong>Message:</strong> ${message}</li>` : ""}
        <li><strong>Access Level:</strong> ${permission.charAt(0).toUpperCase() + permission.slice(1)}</li>
      </ul>
      <p>To view the document, please click the link below:</p>
      <a href="${currentUrl}" style="color: #1a73e8; text-decoration: none;">Open Document</a>
      <p>${password ? `This document is protected by a password: <strong>${password}</strong>` : "No password is required to access this document."}</p>
      <p><em>Please note, access to this document will expire on ${expiryDate.toDateString()}.</em></p>
      <br/>
      <p>Best regards,<br/>Cloud Share</p>
    `,
    };
    yield transporterLocalhost.sendMail(mailOptions);
});
exports.sendShareDocumentEmail = sendShareDocumentEmail;
const sendShareDocumentEmail1 = (from, to, message, title, password, date, permission, currentUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: from,
        to: to,
        subject: `Document Share: ${title}`,
        text: `
      You have been shared a document:

      Title: ${title}
      Message: ${message}
      Permission granted: ${permission}

      Please click on the following URL to access the document:
      ${currentUrl}

          Password: ${password ? password : "No password required"}
    `,
    };
    // Send the email
    yield transporterLocalhost.sendMail(mailOptions);
});
exports.sendShareDocumentEmail1 = sendShareDocumentEmail1;
const sendShareDocumentEmail2 = (from, to, message, title, password, date, permission, currentUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: from,
        to: to,
        subject: `Document Share: ${title}`,
        html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
        <h2>Document Share: ${title}</h2>
        <p>You have been shared a document:</p>
        <ul>
          <li><strong>Title:</strong> ${title}</li>
          <li><strong>Message:</strong> ${message}</li>
          <li><strong>Permission:</strong> ${permission}</li>
          <li><strong>URL:</strong> <a href="${currentUrl}" style="color: blue; text-decoration: underline;">${currentUrl}</a></li>
          <li><strong>Expiry Date:</strong> ${date}</li>
          <li><strong>Password:</strong> ${password ? password : "No password required"}</li>
        </ul>
      </div>
    `,
    };
    // Send the email
    yield transporterLocalhost.sendMail(mailOptions);
});
exports.sendShareDocumentEmail2 = sendShareDocumentEmail2;
const sendConfirmationEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const confirmationLink = `${process.env.APP_URL}/confirm-email/${token}`;
    yield transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Confirm Your Email',
        html: `Please click <a href="${confirmationLink}">here</a> to confirm your email.`,
    });
});
exports.sendConfirmationEmail = sendConfirmationEmail;
const sendSharedLinkEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ toEmail, message = '', fromEmail, shareableLink }) {
    try {
        logger_1.default.info('Sending shareable link email', { toEmail, fromEmail, shareableLink });
        const renderedEmail = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shareable Link</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
            <h1 style="font-size: 24px; margin: 0; color: #333333;">New Item Shared With You</h1>
          </div>
          <div style="margin-top: 20px;">
            <p style="font-size: 16px; line-height: 1.6; color: #555555;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #555555;"><strong>${fromEmail}</strong> has shared an item with you:</p>
            ${message ? `<p style="font-size: 16px; line-height: 1.6; color: #555555; background-color: #f9f9f9; padding: 10px; border-left: 4px solid #1a73e8; margin-left: 0;">${message}</p>` : ''}
            <div style="margin: 30px 0; text-align: center;">
              <a href="${shareableLink}" style="background-color: #1a73e8; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; display: inline-block;">View Shared Content</a>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #888888;">If the button doesn't work, you can copy and paste the following URL into your browser:</p>
            <p style="font-size: 14px; line-height: 1.6; color: #1a73e8; word-break: break-all;">${shareableLink}</p>
          </div>
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p>This email was sent to you by ${fromEmail}.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        yield sendMail(toEmail, `${fromEmail} shared an item with you`, renderedEmail);
        logger_1.default.info('Shareable link email sent successfully', { toEmail, fromEmail });
    }
    catch (error) {
        logger_1.default.error('Error sending shareable link email', { error, toEmail, fromEmail });
        throw new Error('Failed to send shareable link email');
    }
});
exports.sendSharedLinkEmail = sendSharedLinkEmail;
const sendSharedLinkEmail1 = (toEmail, message, fromEmail, shareableLink) => __awaiter(void 0, void 0, void 0, function* () {
    const renderedEmail = `
           <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shareable Link</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 24px;
      margin: 0;
    }
    .content {
      margin-top: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
    }
    .link {
      display: block;
      margin: 20px 0;
      font-size: 18px;
      text-align: center;
    }
    .link a {
      color: #1a73e8;
      text-decoration: none;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New item shared with you</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p><strong> ${fromEmail}  </strong> has shared an item with you:</p>
      <p>${message}  </p>
      <div class="link">
        <a href="${shareableLink}  ">Click here to view the shared content</a>
      </div>
      <p>If the link doesn't work, you can copy and paste the following URL into your browser:</p>
      <p>${shareableLink}  </p>
    </div>
    <div class="footer">
      <p>This email was sent to you by ${fromEmail}  {{fromEmail}}.</p>
    </div>
  </div>
</body>
</html>
        `;
    yield sendMail(toEmail, `${fromEmail} Shared an item with you`, renderedEmail);
});
exports.sendSharedLinkEmail1 = sendSharedLinkEmail1;
const sendVerificationEmail = (email, name, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationLink = `${process.env.PUBLIC_APP_URL}/email-verification/${token}`;
    const renderedEmail = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f7f9fc;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #333;
                    font-size: 24px;
                    margin: 0;
                }
                .content {
                    font-size: 16px;
                    color: #555;
                    line-height: 1.6;
                }
                .button {
                    display: inline-block;
                    margin: 20px 0;
                    padding: 12px 24px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                }
                .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Verify Your Email</h1>
                </div>
                <div class="content">
                    <p>Hi ${name ? name : "there"},</p>
                    <p>Thank you for joining Cloud Share! To complete your registration and start using our services, please verify your email address by clicking the button below:</p>
                    <p style="text-align: center;">
                        <a href="${verificationLink}" class="button">Verify Email</a>
                    </p>
                    <p>If you didn't create an account with us, you can safely ignore this email.</p>
                    <p>Best regards,<br>Cloud Share</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Cloud Share. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    yield sendMail(email, 'Verify Your Email Address', renderedEmail);
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendVerificationEmail1 = (email, name, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationLink = `${process.env.PUBLIC_APP_URL}/email-verification/${token}`;
    const renderedEmail = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #333;
                    }
                    .content {
                        font-size: 16px;
                        color: #555;
                        line-height: 1.5;
                    }
                    .button {
                        display: inline-block;
                        margin: 20px 0;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #aaa;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${name},</p>
                        <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
                        <a href="${verificationLink}" class="button">Verify Email</a>
                        <p>If you did not create an account, you can safely ignore this email.</p>
                        <p>Thank you!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Cloud Share. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    yield sendMail(email, 'Verify Your Email Address', renderedEmail);
});
exports.sendVerificationEmail1 = sendVerificationEmail1;
const sendTwoFactorTokenEmail = (email, name, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const renderedEmail = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Two-Factor Authentication</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #333;
                    }
                    .content {
                        font-size: 16px;
                        color: #555;
                        line-height: 1.5;
                    }
                    .code {
                        font-size: 24px;
                        font-weight: bold;
                        color: #007bff;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #aaa;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Two-Factor Authentication</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${name},</p>
                        <p>We received a request to log into your account. To complete the login process, please use the following verification code:</p>
                        <div class="code">${verificationCode}</div>
                        <p>This code is valid for a limited time. If you did not request this code, please ignore this email.</p>
                        <p>Thank you for keeping your account secure!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Cloud Share. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    yield sendMail(email, 'Two factor authentication', renderedEmail);
});
exports.sendTwoFactorTokenEmail = sendTwoFactorTokenEmail;
function sendOtpEmail(email, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        const renderedEmail = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .header {
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #333;
                    font-size: 24px;
                    margin: 0;
                }
                .content {
                    font-size: 16px;
                    color: #555;
                    line-height: 1.6;
                }
                .otp {
                    font-size: 32px;
                    font-weight: bold;
                    color: #007bff;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 12px;
                    color: #aaa;
                }
                .footer p {
                    margin: 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OTP Verification</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${email}</strong>,</p>
                    <p>Your One-Time Password (OTP) for account verification is:</p>
                    <div class="otp">${otp}</div>
                    <p>Please enter this OTP in the application to proceed.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <p>Thank you!</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Cloud Share. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
        try {
            yield sendMail(email, 'Your OTP Code', renderedEmail);
        }
        catch (error) {
            console.error("Failed to send OTP email:", error);
            throw new Error("Email sending failed.");
        }
    });
}
function sendOtpEmail1(email, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        const renderedEmail = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #333;
                    }
                    .content {
                        font-size: 16px;
                        color: #555;
                        line-height: 1.5;
                    }
                    .otp {
                        font-size: 24px;
                        font-weight: bold;
                        color: #007bff;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #aaa;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>OTP Verification</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${email},</p>
                        <p>Your One-Time Password (OTP) for account verification is:</p>
                        <div class="otp">${otp}</div>
                        <p>Please enter this OTP in the application to proceed.</p>
                        <p>If you did not request this, please ignore this email.</p>
                        <p>Thank you!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Cloud Share. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
       `;
        yield sendMail(email, 'Your OTP Code', renderedEmail);
    });
}
function sendPasswordResetEmail(email, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const resetLink = `${process.env.PUBLIC_APP_URL}/reset-password/${token}`;
        const renderedEmail = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #333;
                    }
                    .content {
                        font-size: 16px;
                        color: #555;
                        line-height: 1.5;
                    }
                    .button {
                        display: inline-block;
                        margin: 20px 0;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #aaa;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${email},</p>
                        <p>We received a request to reset your password. To proceed, please click the button below:</p>
                        <a href="${resetLink}" class="button">Reset Password</a>
                        <p>If you did not request a password reset, you can safely ignore this email.</p>
                        <p>Thank you!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Cloud Share. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
       `;
        yield sendMail(email, 'Reset your password', renderedEmail);
    });
}
