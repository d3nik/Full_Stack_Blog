import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';

import { loginValidation, registerValidation, profileUpdateValidation, postCreateValidation } from './validations.js';
import { UserController, PostController, CommentController } from './controllers/index.js';
import { checkAuth, checkRole, handleValidationError } from './utils/index.js';

mongoose.connect(
    'mongodb+srv://admin:admin211210@cluster0.xyzqtx2.mongodb.net/blog?retryWrites=true&w=majority'
).then(() => console.log('DB connected'))
.catch((err) => console.error('DB connection error:', err));

const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Authentication routes
app.post('/auth/login', loginValidation, handleValidationError, UserController.login);
app.post('/auth/register', registerValidation, handleValidationError, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

// Profile routes
app.get('/users/:id', UserController.getUserProfile);
app.patch('/users/profile/me', checkAuth, profileUpdateValidation, handleValidationError, UserController.updateProfile);

// Admin routes
app.delete('/posts/:id', checkAuth, checkRole('admin'), PostController.removePost);
app.delete('/comments/:id', checkAuth, checkRole('admin'), (req, res) => {
    // Implement comment deletion for admin
    res.json({ message: 'Comment deleted' });
});

// Admin only - assign admin role (super-admin function)
app.post('/admin/assign', checkAuth, checkRole('admin'), UserController.assignAdmin);

// File upload route
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
});

// Tags route
app.get('/tags', PostController.getLastTags);

// Posts routes
app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationError, PostController.createPost);
app.delete('/posts/:id', checkAuth, PostController.removePost);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationError, PostController.updatePost);

// Comments routes
app.post('/posts/:id/comments', checkAuth, CommentController.createComment);
app.get('/posts/:id/comments', CommentController.getComments);
app.delete('/comments/:id', checkAuth, CommentController.removeComment);

// Start the server
app.listen(4021, (err) => {
    if(err) {
        return console.error('Error starting server:', err);
    }

    console.log('Server is running on http://localhost:4021');
});