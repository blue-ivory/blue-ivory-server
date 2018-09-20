import * as fs from 'fs';
import * as moment from 'moment';
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import { CarType, IRequest } from "../request/request.interface";

export class Mailer {

    private static options = {
        service: 'SMTP',
        host: 'MAILER_ENDPOINT',
        port: 25,
        secure: false,
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: 'MAILER_USER',
            pass: 'MAILER_PASSWORD'
        }
    }

    public static send(mailOptions) {
        let options = smtpTransport(Mailer.options);

        let transport = nodemailer.createTransport(options);

        transport.sendMail(mailOptions, function (err, response) {
            if (err) return err;
            return response;
        });
    }

    public static sendMail(mails: string[], request: IRequest) {
        let htmlContent = fs.readFileSync(__dirname + '/view/pending-request.html', 'utf8');

        // Fill visitor details
        htmlContent = htmlContent.replace('VISITOR_ID', request.visitor._id);
        htmlContent = htmlContent.replace('VISITOR_NAME', request.visitor.name);
        htmlContent = htmlContent.replace('VISITOR_COMPANY', request.visitor.company);
        htmlContent = htmlContent.replace('VISITOR_CAR', (request.car !== CarType.NONE && request.carNumber) ? request.carNumber.toString() : 'ללא');

        // Fill request details
        htmlContent = htmlContent.replace(/REQUEST_ID/g, request._id.toHexString());
        htmlContent = htmlContent.replace('ORGANIZATION_NAME', request.organization.name);
        htmlContent = htmlContent
            .replace('DATE_RANGE',
                moment(request.startDate).format('DD/MM/YYYY') + ' - ' +
                moment(request.endDate).format('DD/MM/YYYY'));
        mails.forEach(function (mail) {
            var mailOptions = {
                from: 'MAILER_USER',
                to: mail,
                subject: 'בקשה חדשה ממתינה לאישורך במערכת עומד בשער',
                html: htmlContent
            };

            Mailer.send(mailOptions);
        });
    }
}