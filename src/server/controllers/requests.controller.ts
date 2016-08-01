/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';

var router: express.Router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    
    res.send({
        requests: [
            {
                name: 'Ron',
                number: 123
            },
             {
                name: 'John',
                number: 321
            }
        ]
    })
});

export = router;