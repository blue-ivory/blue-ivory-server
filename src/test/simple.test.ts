/// <reference path="../../typings/index.d.ts" />
import { expect } from 'chai';

describe('Unit test', ()=>{
    describe('2+4',()=>{
        it('Should equal 6', (done)=>{
            expect(2+4).to.equals(6);
            done();
        });
    });
});