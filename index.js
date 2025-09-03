import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import mongoose from 'mongoose';

mongoose.connect(
    'mongodb+srv://admin:admin211210@cluster0.xyzqtx2.mongodb.net/'
).then(() => console.log('DB connected'))
.catch((err) => console.error('DB connection error:', err));

const app = express();

app.use(express.json());

app.get('/', (req, res) => { 
    res.send('Hello World!');
});

app.post('/auth/login', (req, res) => {
    console.log('Login request received:', req.body);

    const token = jsonwebtoken.sign({
        email: req.body.email,
        fullName: 'John Doe'
    }, '211210' );

    res.json({ 
        message: 'Login endpoint',
        token
    });
});

app.listen(3021, (err) => {
    if(err) {
        return console.error('Error starting server:', err);
    }

    console.log('Server is running on http://localhost:3021');
});