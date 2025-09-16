import express from 'express';
import mongoose from 'mongoose';

import { registerValidation } from './validations/auth.js';
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/userController.js';

mongoose.connect(
    'mongodb+srv://admin:admin211210@cluster0.xyzqtx2.mongodb.net/blog?retryWrites=true&w=majority'
).then(() => console.log('DB connected'))
.catch((err) => console.error('DB connection error:', err));

const app = express();

app.use(express.json());

app.post('/auth/login', UserController.login);
app.post('/auth/register', registerValidation, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.listen(3021, (err) => {
    if(err) {
        return console.error('Error starting server:', err);
    }

    console.log('Server is running on http://localhost:3021');
});