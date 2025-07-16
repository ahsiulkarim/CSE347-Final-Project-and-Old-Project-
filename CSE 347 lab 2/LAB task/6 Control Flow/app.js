//showing alert message
alert("Hello from  external file!");
//6.1 Conditional statement
let a = 10;

if (a % 2 == 0){
  console.log("Conditon is true");
} else{
   console.log("Condition is false");
}

//6.2 Switch case

let dayOfWeek = 3;
let dayName;

switch(dayOfWeek){
  
    case 1:
        dayName = "Staturday"; // if the case value is 1.
        break;
    case 2:
        dayName = "Sunday"; // if the case value is 2.
        break;
    case 3:
        dayName = "Monday"; // if the case value is 3.
        break;    
    
    case 4:
        dayName = "Tuesday"; // if the case value is 4.
        break;
    
    case 5:
        dayName = "Wednesday"; // if the case value is 5.
        break;
     
    case 6:
         dayName = "Thursday"; // if the case value is 6.
         break; 
    
   case 7:
        dayName = "Friday"; // if the case value is 7.
        break;
    
    default:
        dayName = "Invalid day";
        break;

}

// printing the output.
console.log(" The day is "+ dayName); 

//6.3 Loop:
// for loop 
for(let i = 0; i<5; i++){
  console.table(i);//printing the output.
}

// while loop
let i = 0;

while(i<5){
    console.table(i);
    i++;
}

//Do-while loop
 
let j = 0;
do {
    console.log(j);
    j++;
} while(j < 5);