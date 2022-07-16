// importing required libraries
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

//load the package defination
const packageDef = protoLoader.loadSync('todo.proto', {});

// now loading the package defination into the grpc object 
const grpcObject = grpc.loadPackageDefinition(packageDef);

// finally getting the todo package
const todoPackage = grpcObject.todoPackage;

// creating the server
const server = new grpc.Server();
// http2 by default need credentials,
// but grpc allow us to bypass that by using createInsecure for now
server.bind('localhost:3000', grpc.ServerCredentials.createInsecure()); 

// giving our server a service
// in first parameter Todo has whole defination of service, 
// and Todo.servce contain actual service object
// second parameter is a json object to map the methods of Todo service
server.addService(todoPackage.Todo.service, {
    "createTodo" : createTodo,
    "readTodos" : readTodos,
    "readTodosStream" : readTodosStream
});

//starting the server
server.start();
console.log("Server started successfully...")

// methods in grpc takes two parameters
// call -> its an object
// callback -> used to send back the response to the client

const todos = [];
function createTodo( call, callback ) {
    const todoItem = {
        "id": todos.length + 1,
        "text": call.request.text
    }
    todos.push(todoItem);
    console.log("Todo item added sucessfully.");

    callback(null, todoItem);
}

//int this method we send the whole todos array in one go
function readTodos( call, callback ) {
    callback(null, {"items":todos});
}

// but what if we have a todos array of very big size
// this is not a good approach to sending the whole array in one go
// let's do the streaming of items of the todos array

function readTodosStream( call, callback ) {
    //writing all items using call.write()
    todos.forEach((item) => call.write(item));

    //to indicate that we have sent all messages
    call.end();
}