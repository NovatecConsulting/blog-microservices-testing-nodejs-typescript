# Microservices testing with Node.js and TypeScript

This demo repository corresponds to [this blog post](https://blog.novatec-gmbh.de/modern-microservice-testing-concept-real-world-example). It shows a real world example for realization of the testing pyramid with TypeScript and Node.js in combination with Microsoft Azure.

Basically the project is serving a RESTful API for dealing with vehicles. The idea behind it, is that a vehicle can be created and retrieved. Moreover a list of all vehicles can be retrieved.

In order to demonstrate a RESTful microservice communication, the vehicle service can get more detailed information on the damage status from another service in this example. This looks like the following:

<img>

## Prerequisites

Setup an Microsoft Azure CosmosDB Acoount with SQL API and set the following environment variables to the corresponding values of your created DB in order to be able to run the application:

- ```DATABASE_URL```
- ```DATABASE_MASTER_KEY```

## Commands / scripts

Following npm scripts can be used to run, test and build the project:

- ```start``` starts the compiled js output of the TypeScript compiler inside of an Azure App Service instance (do not use locally).
- ```build``` compiles and lints the project.
- ```serve``` starts the compiled js output of the TypeScript compiler locally.
- ```serve-sim``` starts the compiled js output of the TypeScript compiler locally and connect to the simulation server (use this in combination with the simulation script in order to run the app locally).
- ```ts:build``` compiles the project.
- ```ts:doc``` creates the TypeDoc.
- ```test``` runs all tests.
- ```test:unit``` runs all unit tests.
- ```test:int``` runs all integration tests.
- ```simulation``` starts the simulation server.
  