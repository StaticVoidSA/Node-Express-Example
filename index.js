const Express = require('express');
const Joi = require('joi');
const app = Express();
const logger = require('./logger');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');

// Express middleware functions:
// To parse the body of requests with a JSON payload
app.use(Express.json());
// To parse the body of the request with the URL-encoded payload
app.use(Express.urlencoded({ extended: true })); 
// To serve static files
app.use(Express.static('public'));
app.use(helmet());

// Configuration
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server: ' + config.get('mail.host'));

// Check Enviroment for Developer Mode
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    console.log('Morgan enabled...');
}

// Custom middleware function in seperate file
app.use(logger);


// Custom middleware applied on routes starting with /api/admin
app.use('/api/admin', (req, res, next) => {
    // ...
    res.send('Custom URL middleware <br /><br />URL: /api/admin');
    next();
});

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' },
    { id: 4, name: 'course4' }
];

app.get('/', (req, res) => {
    res.send('Hello World! from <br /><br /> http://localhost:3000/');
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));

    if (!course)
    {
        // 404 Error
        res.status(404).send("Course with the given id was not found");
        return;
    }
    res.send(course);
});

app.post('/api/courses', (req, res) => {
    // Validate
    // If invalid, return 400 - Bad request
    const { error } = validateCourse(req.body); // result.error
   
    if (error) {
        // 400 Bad request
        res.status(400).send(error.details[0].message);
        return;
    }
    
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };

    courses.push(course);
    res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
    // Look up course
    // Return 404 if not found
    const course = courses.find(c => c.id === parseInt(req.params.id));

    if (!course)
    {
        // 404 Error
        res.status(404).send("Course with the given id was not found");
        return;
    }


    // Validate
    // If invalid, return 400 - Bad request
    const { error } = validateCourse(req.body); // result.error
   
    if (error) {
        // 400 Bad request
        res.status(400).send(error.details[0].message);
        return;
    }


    // Update course
    // Return the updated course
    course.name = req.body.name;
    res.send(course);
});

app.delete('/api/courses/:id', (req, res) => {
    // Look up the course
    // Not existing return 404
    const course = courses.find(c => c.id === parseInt(req.params.id));

    if (!course)
    {
        // 404 Error
        res.status(404).send("Course with the given id was not found");
        return;
    }

    // Delete
    const index = courses.indexOf(course);
    courses.splice(index, 1);

    // Return the same course
    res.send(course);
});

function validateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(course, schema);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
