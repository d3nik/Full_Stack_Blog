import { body } from "express-validator";

export const registerValidation = [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('fullName').isLength({ min: 3 }),
    body('avatarUrl').optional().isURL()
];

export const loginValidation = [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
];

export const postCreateValidation = [
    body('title').isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
    body('text').isLength({ min: 3 }).withMessage('Text must be at least 10 characters long'),
    body('tags').optional().isString().withMessage('Tags must be an array'),
    body('imageUrl').optional().isString().withMessage('Image URL must be a valid URL')
];