import express from 'express';
import mongoose from 'mongoose';

import { loginValidation, postCreateValidation, registerValidation } from './validations.js';
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';
import * as PostController from './controllers/PostController.js';

mongoose.connect(
    'mongodb+srv://admin:admin211210@cluster0.xyzqtx2.mongodb.net/blog?retryWrites=true&w=majority'
).then(() => console.log('DB connected'))
.catch((err) => console.error('DB connection error:', err));

const app = express();

app.use(express.json());

app.post('/auth/login', loginValidation, UserController.login);
app.post('/auth/register', registerValidation, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, PostController.createPost);
app.delete('/posts/:id', checkAuth, PostController.removePost);
app.patch('/posts/:id', checkAuth, PostController.updatePost);

app.listen(3021, (err) => {
    if(err) {
        return console.error('Error starting server:', err);
    }

    console.log('Server is running on http://localhost:3021');
});