import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';

import { loginValidation, postCreateValidation, registerValidation } from './validations.js';
import { UserController, PostController } from './controllers/index.js';
import { checkAuth, handleValidationError } from './utils/index.js';

mongoose.connect(
    'mongodb+srv://admin:admin211210@cluster0.xyzqtx2.mongodb.net/blog?retryWrites=true&w=majority'
).then(() => console.log('DB connected'))
.catch((err) => console.error('DB connection error:', err));

const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationError, UserController.login);
app.post('/auth/register', registerValidation, handleValidationError, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
});

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationError, PostController.createPost);
app.delete('/posts/:id', checkAuth, PostController.removePost);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationError, PostController.updatePost);

app.listen(3021, (err) => {
    if(err) {
        return console.error('Error starting server:', err);
    }

    console.log('Server is running on http://localhost:3021');
});