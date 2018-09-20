import { expect } from 'chai';
import { Types } from 'mongoose';
import { Organization } from "../../organization/organization.class";
import { IOrganization } from "../../organization/organization.interface";
import { User } from "../../user/user.class";
import { IUser } from "../../user/user.interface";
import { IVisitor } from "../../visitor/visitor.interface";
import { TaskType } from "../../workflow/task-type.enum";
import { ITask } from "../../workflow/task.interface";
import { Request } from '../request.class';
import { CarType, IRequest } from "../request.interface";
import { Comment } from './comment.class';
import { IComment } from "./comment.interface";

describe('Comment', () => {
    describe('#addComment', () => {
        let user = <IUser>null;
        let organization = <IOrganization>null;
        let request = <IRequest>null;

        beforeEach(async () => {
            try {
                user = <IUser>await User.createUser('fName', 'Name', '12345', 'mail');
                organization = <IOrganization>await Organization.createOrganization('org');
                await Organization.setWorkflow(organization._id, <ITask[]>[{ order: 1, organization: organization, type: TaskType.HUMAN }]);

                request = <IRequest>await Request.createRequest(
                    new Date(),
                    new Date(),
                    <IVisitor>{ name: 'vName', company: 'cName', _id: '12111111' },
                    user, 'desc', CarType.NONE, '', organization, 'SOLDIER');

            } catch (err) {
                console.log(err);
            }
        });

        it('Should return null when request not found', async () => {
            let request = await Comment.addComment(new Types.ObjectId(), <IComment>{
                creator: user,
                content: 'test content'
            });

            expect(request).to.be.null;
        });

        it('Should throw an error when comment is missing data', async () => {
            try {
                let req = <IRequest>await Comment.addComment(request._id, <IComment>{ content: 'test' });
                expect.fail();
            } catch (err) {
                expect(err).to.exist;
            }
        })

        it('Should add comment to a request', async () => {
            let req = await Comment.addComment(request._id, <IComment>{ content: 'test content', creator: user })
            expect(req).to.exist;
            expect(req).to.have.property('comments').to.be.an('array').with.length(1);
        });
    })
});