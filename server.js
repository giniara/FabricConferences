const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const dbConfig = {
    user: 'tu_usuario',
    password: 'tu_contraseña',
    server: 'tu_servidor.database.windows.net',
    database: 'tu_base_de_datos',
    options: {
      encrypt: true,
      enableArithAbort: true
    }
  };
  
  sql.connect(dbConfig).catch(err => console.error('Error de conexión a la base de datos:', err));

  const schema = buildSchema(`
    type Conferencia {
      id: ID!
      nombre: String!
      fecha: String!
      ubicacion: String!
    }
  
    type Query {
      conferencias: [Conferencia]
    }
  
    type Mutation {
      login(username: String!, password: String!): String
    }
  `);

  const root = {
    conferencias: async (args, context) => {
      if (!context.user) throw new Error('No autorizado');
      try {
        const result = await sql.query`SELECT * FROM Conferencias`;
        return result.recordset;
      } catch (err) {
        console.error('Error en la consulta:', err);
        return [];
      }
    },
    login: ({ username, password }) => {
      if (username === 'admin' && password === 'password') {
        const user = { name: username };
        return jwt.sign(user, 'tu_clave_secreta', { expiresIn: '1h' });
      }
      throw new Error('Usuario o contraseña incorrectos');
    }
  };

  const app = express();

  const authenticateToken = expressJwt({
    secret: 'tu_clave_secreta',
    algorithms: ['HS256']
  });

  app.post('/login', express.json(), (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
      const user = { name: username };
      const token = jwt.sign(user, 'tu_clave_secreta', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Usuario o contraseña incorrectos');
    }
  });

  app.use('/graphql', authenticateToken, graphqlHTTP((req) => ({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: { user: req.user }
  })));

  app.listen(4000, () => {
    console.log('Servidor GraphQL ejecutándose en http://localhost:4000/graphql');
  });