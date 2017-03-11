import { IDAO } from './../interfaces/IDAO';
import { Workflow } from './../classes/workflow';
import * as WorkflowModel from './../models/workflow.model';
import * as Promise from 'bluebird';

export class WorkflowManager {

    public create(workflow: Workflow): Promise<any> {
        let deferred = Promise.defer();
        let workflowModel = new WorkflowModel(workflow);
        workflowModel.save((err, workflow) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(workflow);
            }
        });

        return deferred.promise;
    }

    public read(id: any): Promise<any> {
        let deferred = Promise.defer();
        WorkflowModel.findById(id, (err, workflow) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(workflow);
            }
        });
        return deferred.promise;
    }

    public update(workflow: Workflow): Promise<any> {
        let deferred = Promise.defer();
        WorkflowModel.findOneAndUpdate({ _id: workflow._id }, workflow, { new: true, upsert: true }, (err, workflow) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(workflow);
            }
        });
        return deferred.promise;
    }
}