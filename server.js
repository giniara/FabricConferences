const express = require('express');
console.log('Express cargado correctamente');

const { graphqlHTTP } = require('express-graphql');
console.log('express-graphql cargado correctamente');


const { buildSchema } = require('graphql');

// Definir el esquema GraphQL
const schema = buildSchema(`
  type Query {
    hello: String!
  }
`);

// Definir los resolvers
const root = {
  hello: () => {
    return 'Hello, world!';
  },
};

const app = express();

// Ruta para la raíz
app.get('/', (req,res) => {
        res.send('Bienvenido al servidor GraphQL. Visita /graphql para usar GraphQL.');
});

// Configurar la ruta /graphql
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(4000, () => {
  console.log('Servidor GraphQL ejecutándose en http://localhost:4000/graphql');
});