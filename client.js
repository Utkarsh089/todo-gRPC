// importing required libraries
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

//load the package defination
const packageDef = protoLoader.loadSync('todo.proto', {});

//now loading the package defination into the grpc object 
const grpcObject = grpc.loadPackageDefinition(packageDef);

// finally getting the todo package
const todoPackage = grpcObject.todoPackage;

// creating client object of Todo service
const client = new todoPackage.Todo("localhost:3000", 
grpc.credentials.createInsecure());

// now client can call methods

client.createTodo({
    "id" : "-1",
    "text" : "Do Homework"
    }, (err, res) => {
        console.log("Recieved from server " + JSON.stringify(res));
});

//simple rpc
client.readTodos({}, (err, res)=> {
    console.log("Read the todos from server " + JSON.stringify(res));
});

// instead of passing the method a request and callback
// we pass it a request and get a readable stream object back.
const call = client.readTodosStream();

// data event to read the server’s responses
call.on("data", item => {
    console.log("Recieved item from server " + JSON.stringify(item));
})

// the server has finished sending
call.on("end", ()=>{
    console.log("Server Done!")
})