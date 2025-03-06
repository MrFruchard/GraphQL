const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(() => {
  console.log(`API READY at : ${url}`);
});
