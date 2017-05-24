import * as nodemailer from 'nodemailer';
import * as emailjs from 'emailjs';
import * as fs from 'fs';

const smtpOptions = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'shopsapir@gmail.com',
        pass: 'shob1223sap2'
    },

}

const transporter = nodemailer.createTransport(smtpOptions);

export class Mailer {
    public static sendMail(mails: string[]): void {
        let server = emailjs.server.connect({
            user: 'shobsapir@gmail.com',
            password: 'shob123sap2',
            host: 'smtp.gmail.com',
            ssl: true
        });

        let htmlContent = fs.readFileSync(__dirname + '/view/pending-request.html', 'utf8');
        console.log(htmlContent);

        let message = {
            text: "i hope this works",
            from: "Gate Keeper <shobsapir@gmail.com>",
            to: "shobsapir@hotmail.com, shobsapir@gmail.com",
            subject: "testing emailjs",
            attachment:
            [
                { data: "<html>i <i>hope</i> this works!</html>", alternative: true }
            ]
        };

        server.send(message, function (err, x) {
            console.log(err || x);
        });

        // let mailOptions: nodemailer.SendMailOptions = {
        //     from: '"Gate Keeper <shopsapir@gmail.com>',
        //     to: mails.join(','),
        //     subject: 'Test subject',
        //     text: 'test text',
        //     html: '<b>BOLD</b> not bold'
        // };

        // transporter.sendMail(mailOptions).then(console.log).catch(console.error);
    }
}