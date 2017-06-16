import * as emailjs from 'emailjs';
import * as fs from 'fs';
import * as bluebird from 'bluebird';
import * as moment from 'moment';
import { IRequest, CarType } from "../request/request.interface";

export class Mailer {

    private static Server = emailjs.server.connect({
        user: 'shobsapir@gmail.com',
        password: 'shob123sap2',
        host: 'smtp.gmail.com',
        ssl: true
    });

    public static sendMail(mails: string[], request: IRequest): Promise<void> {


        let htmlContent = fs.readFileSync(__dirname + '/view/pending-request.html', 'utf8');

        // Fill visitor details
        htmlContent = htmlContent.replace('VISITOR_ID', request.visitor._id);
        htmlContent = htmlContent.replace('VISITOR_NAME', request.visitor.name);
        htmlContent = htmlContent.replace('VISITOR_COMPANY', request.visitor.company);
        htmlContent = htmlContent.replace('VISITOR_CAR', (request.car !== CarType.NONE && request.carNumber) ? request.carNumber.toString() : 'ללא');

        // Fill request details
        htmlContent = htmlContent.replace('REQUEST_ID', request._id.toHexString());
        htmlContent = htmlContent.replace('ORGANIZATION_NAME', request.organization.name);
        htmlContent = htmlContent
            .replace('DATE_RANGE',
            moment(request.startDate).format('DD/MM/YYYY') + ' - ' +
            moment(request.endDate).format('DD/MM/YYYY'));



        let message = {
            text: "בקשה חדשה",
            from: "Gate Keeper <shobsapir@gmail.com>",
            to: mails.join(','),
            subject: "בקשה חדשה ממתינה לאישורך",
            attachment:
            [
                { data: htmlContent, alternative: true }
            ]
        };

        return new Promise<void>((resolve, reject) => {
            Mailer.Server.send(message, function (err, message) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}