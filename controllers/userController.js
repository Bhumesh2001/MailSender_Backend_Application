const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');

exports.mailSender = async (req, res) => {
    try {
        const io = req.app.get('io');
        const userId = req.app.get('userId');
        const {
            email, app_pass, hr_emails,
            subject, body, data,
            fileName, fileType
        } = req.body;

        let MailsHr = hr_emails.split('\n').map(line => line.trim()).filter(line => line !== '');
        let FilterMails = MailsHr.filter((value, index) => MailsHr.indexOf(value) === index);
        let attach = data ? [
            {
                filename: fileName,
                content: Buffer.from(data, 'base64'),
                contentType: fileType,
            }
        ] : [];

        let transPorter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            pool: true,
            auth: {
                user: email,
                pass: app_pass,
            },
        });

        let mailCount = 0;
        for (let mail of FilterMails) {
            try {
                let info = await transPorter.sendMail({
                    from: `<${email}>`,
                    to: mail,
                    subject,
                    text: "This is mail by me",
                    html: `<pre style="font-family: Arial, sans-serif; font-size: 13px; color: #333;">${body}</pre>`,
                    attachments: attach,
                    priority: 'high'
                });
                io.to(userId).emit('log',{
                    mesg: info.messageId,
                    success: true,
                });
                mailCount++
            } catch (error) {
                if (error.responseCode === 534) {
                    io.to(userId).emit('log', {
                        mesg: 'Email address not found',
                        success: false,
                    });
                } else if (error.responseCode === 550) {
                    errMesg = '';
                    io.to(userId).emit('log', {
                        mesg: 'Email delivery failed',
                        success: false,
                    });
                } else {
                    io.to(userId).emit('log', {
                        mesg: error.message,
                        success: false,
                    });
                };
            };
        };
        await new Promise(resolve => setTimeout(resolve, 2000));
        res.send(JSON.stringify({ 
            success: true, 
            mailCount,
        }));
    } catch (error) {
        console.log(error);
        res.status(500).send(JSON.stringify({ 
            error, 
            success: false 
        }));
    };
};

exports.signupUser = async (req, res) => {
    try {
        const user_data = req.body;
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!strongPasswordRegex.test(req.body.password)) {
            return res.status(401).send({
                success: false,
                message: 'Password must be strong',
            });
        };
        const user = new User(user_data);
        user.save();
        let token = createJWTtokenAndSave(req, res, user);
        res.status(201).send(JSON.stringify({
            success: true,
            message: 'Account created successfully...',
            token
        }));
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(409).send({
                success: false,
                message: 'Account already exists!',
            });
        };
        res.status(500).send(JSON.stringify({
            success: false,
            error: error.message
        }));
    };
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }, { _id: 0, __v: 0 });
        if (!user) {
            return res.status(401).send(JSON.stringify({
                success: false,
                message: 'Email or Password is wrong!',
            }));
        };
        if (user.password !== password) {
            return res.status(401).send(JSON.stringify({
                success: false,
                message: 'Email or Password is wrong!',
            }));
        };
        let token = createJWTtokenAndSave(req, res, user);
        res.status(200).send(JSON.stringify({
            success: true,
            message: 'Loggedin successful...',
            token
        }));
    } catch (error) {
        res.status(500).send(JSON.stringify({
            error,
            success: false
        }));
    };
};

function createJWTtokenAndSave(req, res, user) {
    const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, { expiresIn: '12h' });
    res.cookie('token', token, {
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000),
        httpOnly: true,
    });
    return token;
};