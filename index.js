import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { validationResult } from 'express-validator';
import { registerValidation } from './validations/auth.js';

import UserModel from './models/User.js';
import checkAuth from './utils/checkAuth.js';

mongoose.connect(
    'mongodb+srv://admin:admin211210@cluster0.xyzqtx2.mongodb.net/blog?retryWrites=true&w=majority'
).then(() => console.log('DB connected'))
.catch((err) => console.error('DB connection error:', err));

const app = express();

app.use(express.json());

app.post('/auth/login', async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Invalid login or password',
            });
        }   

        const token = jwt.sign(
            {
                _id: user._id, 
            },
                'secret321',
            {
                expiresIn: '30d',
            },
        );

        const { passwordHash, ...userData } = user._doc;
 
        res.json(
            {
                ...userData,
                token,
            }
        );  
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Failed to login',
        });
    }
});

app.post('/auth/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }
 
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
 
    const doc = new UserModel({
     email: req.body.email,
     fullName: req.body.fullName,
     avatarUrl: req.body.avatarUrl,
     passwordHash: hash,
    });
 
    const user = await doc.save();

    const token = jwt.sign({
        _id: user._id, 
    },
    'secret321',
    {
        expiresIn: '30d',
    },
    );

    const { passwordHash, ...userData } = user._doc;
 
    res.json(
        {
            ...userData,
            token,
        }
    );  
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
        message: 'Failed to register user',
     });
  }
});

app.get('/auth/me', checkAuth, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json(userData);
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({
            message: 'No access',
        });
    }
});

app.listen(3021, (err) => {
    if(err) {
        return console.error('Error starting server:', err);
    }

    console.log('Server is running on http://localhost:3021');
});