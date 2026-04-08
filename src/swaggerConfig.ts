import swaggerJsDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Web App API',
            version: '1.0.0',
            description: 'API documentation for the Web Application',
        },
        servers: [
            {
                url: 'https://localhost:443',
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJsDoc(options);

export default specs;
