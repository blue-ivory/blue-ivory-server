let env = process.env.NODE_ENV;

export let config = {
    environment: env || 'dev',
    database: {
        host: 'localhost:27017',
        db: 'blue-ivory-2' + (env === 'prod' ? '' : env || 'dev')
    },
    server: {
        host: 'localhost',
        port: 80
    },
    client: {
        allowedOrigins: ['http://localhost:4200'],
        host: 'localhost',
        port: 80
    },
    redis: {
        host: 'localhost',
        port: 6379
    },
    auth: {
        saml: {
            entryPoint: 'https://SAML_ENDPOINT/adfs/ls/',
            issuer: 'https://localhost/metadata.xml',
            callbackUrl: 'https://localhost/metadata.xml/callback',
            authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/windows',
            identifierFormat: null,
            signatureAlgorithm: 'sha1',
            acceptedClockSkewMs: -1,
        }
    },
    sessionSecret: 'blue-ivory-2017-by-Ron-Borysovski'
}