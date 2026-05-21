import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';

export const register = async (req, res) => {
    try {   
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
          role: user.role,
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
};

export const login = async (req, res) => {
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
                role: user.role,
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
};

export const getMe = async (req, res) => {
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
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { fullName, email, password } = req.body;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        if (fullName) {
            user.fullName = fullName;
        }

        // Check if email is being changed and if new email already exists
        if (email && email !== user.email) {
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    message: 'Email already in use',
                });
            }
            user.email = email;
        }


        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(password, salt);
        }

        if (req.body.avatarUrl) {
            user.avatarUrl = req.body.avatarUrl;
        }

        const updatedUser = await user.save();
        const { passwordHash, ...userData } = updatedUser._doc;

        res.json(userData);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            message: 'Failed to update profile',
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.userId;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json(userData);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            message: 'Failed to retrieve profile',
        });
    }
};

export const assignAdmin = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required',
            });
        }

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { role: 'admin' },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json({
            message: 'User promoted to admin',
            user: userData,
        });
    } catch (error) {
        console.error('Admin assignment error:', error);
        res.status(500).json({
            message: 'Failed to assign admin role',
        });
    }
};