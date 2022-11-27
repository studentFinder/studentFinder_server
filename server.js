const express = require('express')
const expSession = require('express-session')
const path = require('path');
const jwt = require('jsonwebtoken')
var bodyParser = require('body-parser');
const app = express()
const port = 3000

//FAKE DATABASE
var userNum = 0;
var users = [];

var departments = [null,"COSC","PSYO"]
var courses = [{name: "COSC 101", studentsIn: []},
                {name: "COSC 111", studentsIn: []},{name: "COSC 222", studentsIn: []},{name: "COSC 305", studentsIn: []},
                {name: "COSC 320", studentsIn: []},{name: "COSC 304", studentsIn: []},{name: "COSC 404", studentsIn: []},{name: "COSC 444", studentsIn: []},
                {name: "PSYO 111", studentsIn: []},{name: "PSYO 121", studentsIn: []},{name: "PSYO 220", studentsIn: []},{name: "PSYO 271", studentsIn: []},
                {name: "PSYO 334", studentsIn: []}]


function createJwtToken(id) {
    return jwt.sign({ id }, "hard_coded_secret_key_do_not_do_this_normally", {
        expiresIn: 10000000,
    });
}

function getCourses(courseSearch, deptId){

    var courseList = courses.slice(); //duplicate array
    console.log(courseSearch,deptId)
    if(courseSearch === null  && deptId === null) return [];
    console.log(courseList)
    if(deptId != null && deptId.length > 0){
        var deptName = departments[deptId]
        for(var i = courseList.length - 1; i >= 0; i--){
            if(!((courseList[i].name).includes(deptName))){
                courseList.splice(i, 1);
            }
        }
    }

    if(courseSearch != null && courseSearch.length > 0){
        for(var i = courseList.length - 1; i >= 0; i--){
            if(!((courseList[i].name).includes(courseSearch.toUpperCase()))){
                courseList.splice(i, 1);
            }
        }
    }

    return courseList;
    //if we had a database this returns the sql command
    /*
    if(courseSearch == null  && deptId == null) return;

    var sqlstr = "SELECT FROM courses WHERE"
    var appendAnd = false;


    if(courseSearch != null && courseSearch.length > 0){
        sqlstr += " coursename LIKE %" + courseSearch + "%"
        appendAnd = true
    }

    if(deptId != null && deptId.length > 0){
        if(appendAnd){
            sqlstr += " AND"
        }
        if(deptId == 0){
            sqlstr += " deptId > 0"
        } else {
            sqlstr += " deptID =" + deptId
        }
    }
    return sqlstr;
    */
}

function getUsersInCourse(courseId){
    return courses[courseId].studentsIn
}

function signup(username,password,res){
    //SELECT * FROM users WHERE username = usernameparam AND password = passwordpaaram
    //if user exists then dont make new user act
    //INSERT INTO users (username,password) VALUES (username, password)
    var generatedId = userNum; // get from database
    userNum++
    var token = createJwtToken(generatedId)
    users.push([username,password])
    res.status(201).json({ token, username, userId: generatedId });
}

function findAccount(email,password){
    var userid = -1;
    for(var i = 0; i < users.length; i++){
        var useremail = users[i][0]
        var userpassword = users[i][1]
        if(email === useremail && userpassword === password){
            userid = i
        }
    }
    return userid;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/home', (req, res) => {
  res.send('this is the main page')
})

app.post('/signup', (req,res) => {
    console.log(req.body)
    let email = req.body.email;
	let password = req.body.password;
    var valid = false;

    if(email.length > 1 && password.length > 1){
        if(email.includes('ubc')){
            valid = true;
        }
    }

    if(valid){
        signup(email,password,res)
    } else {
        res.send("Invalid email or password")
    }
})

//search by coursename and/or deptId
app.get('/courses', (req, res) => {
    var out = "";
    var courses = getCourses(req.query.search,req.query.deptId)
    for(var i = 0; i < courses.length; i++){
        out += courses[i].name + " "
    }
    res.send(out);
  })


app.get('/departments/:deptId', (req,res) => {
    var deptId = req.params.deptId;
    var search = req.query.search
    var out = "";
    var courses = getCourses(search,deptId)
    for(var i = 0; i < courses.length; i++){
        out += courses[i].name + " "
    }
    res.send(out)
})

app.get('/course/:courseId', (req,res) => {
    var courseId = req.params.courseId;
    var users = getUsersInCourse(courseId)
    //SELECT * FROM users WHERE courseId = courseId
    var usersString = ""
    if(courseId){
        for (let index = 0; index < courses[courseId].studentsIn.length; index++) {
            const user = courses[courseId].studentsIn[index];
            usersString += user[0] + " "
            
        }
        res.send("people in: " + courses[courseId].name + ", " + usersString)
    }
    res.end()
})

app.post('/join', (req,res) => {
    console.log(req.body)
    let courseId = req.body.courseId;
	let userId = req.body.userId;
    var course = courses[courseId]
    var user = users[userId]
    if(course != null && user != null){
        course.studentsIn.push(user)
        res.send("success")
    } else {
        res.send("invalid course or user");
    }
    //SELECT * FROM users WHERE courseId = courseId
    res.end()
})

app.post('/login', (req, res) => {
    console.log(req.body)
    var {email,password} = req.body;
    var userId = findAccount(email,password)
    if(userId === -1){
        res.status(401).json({ message: 'Invalid user or password' });
    } else {
        const token = createJwtToken(userId);
        res.status(200).json({ token, userId: userId});
    }
  })

app.get('/me', (req, res) => {
    res.status(200).json(req.params);
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});