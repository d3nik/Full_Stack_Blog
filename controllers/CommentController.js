import CommentModel from '../models/Comment.js';
import PostModel from '../models/Post.js';

export const createComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const newComment = new CommentModel({
            text,
            user: req.userId,
            post: id,
        });

        const comment = await newComment.save();
        await PostModel.findByIdAndUpdate(
            id,
            { $push: { comments: comment._id } },
            { new: true }
        ).exec();

        res.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            message: 'Failed to create comment',
        });
    }
};

export const getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await CommentModel.find({ post: id })
        .populate({ path: 'user', select: '_id fullName avatarUrl' })
        .lean();
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            message: 'Failed to fetch comments',
        });
    }
};

export const removeComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await CommentModel.findById(id);


        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found',
            });
        }

        const isOwner = comment.user.toString() === req.userId;
        const isAdmin = req.userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: 'You are not authorized to delete this comment',
            });
        }

        await CommentModel.findByIdAndDelete(id);
        await PostModel.findByIdAndUpdate(
            comment.post,
            { $pull: { comments: id } },
            { new: true }
         ).exec();

        res.json({
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            message: 'Failed to delete comment',
        });
    }
};
