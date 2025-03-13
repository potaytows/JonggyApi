const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "ntptv2545@gmail.com",
                pass: "oryb tdxn ybom yudx",
            },
        });

        const emailOptions = {
            from: 'Jonggy Support <noreply.ntptv2545@gmail.com>',
            to: option.email,
            subject: option.subject,
            text: option.message,
            html: '<p>' + option.message + '<p>',
        };
        await transporter.sendMail(emailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};


module.exports = sendEmail;
