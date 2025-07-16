//8.0 Objects store key-value pairs

const person = {
   name: "Alice",
   age: 25,
   greet: function(){
    console.log("Hello, " + this.name, this.age);
   }

};

person.greet();

//8.1 Accessing and Modifying Porperties

console.log(person.name);
person.age = 26;
person.city = "New York";

console.log(person.age);
console.log(person.city);

//8.2 Object Methods and this


const person2 = {
   name: "Bob",
   greet2: function(){
    console.log('Hi, I am ' + this.name);
   }

};

person2.greet2();