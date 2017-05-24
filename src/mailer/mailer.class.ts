import * as emailjs from 'emailjs';
import * as fs from 'fs';

export class Mailer {
    public static sendMail(mails: string[]): void {
        let server = emailjs.server.connect({
            user: 'shobsapir@gmail.com',
            password: 'shob123sap2',
            host: 'smtp.gmail.com',
            ssl: true
        });

        let htmlContent = fs.readFileSync(__dirname + '/view/pending-request.html', 'utf8');

        let message = {
            text: "בקשה חדשה",
            from: "Gate Keeper <shobsapir@gmail.com>",
            to: "shobsapir@hotmail.com",
            subject: "בקשה חדשה ממתינה לאישורך",
            attachment:
            [
                { data: htmlContent, alternative: true }
            ]
        };

        server.send(message, function (err, x) {
            console.log(err || x);
        });
    }
}