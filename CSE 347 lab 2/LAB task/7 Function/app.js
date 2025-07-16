//7.1 Function Declaration
function greet(name) {
    return "Hello " + name;
}

console.log(greet("Alice"));

//7.2 Function Expression

const greet2 = function (name) {
    return "Hi " + name;
}

console.log(greet2("Bob"));

//7.3 Arrow Funtions

const greet3 = name => "Hey " + name;

console.log(greet3("Charlie"));

//7.4 Parameters and Default Values

function multiply(a, b = 1) {
    return a * b;
} 

console.log(a * b);

