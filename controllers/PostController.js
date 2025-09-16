import PostModel from '../models/Post.js';

export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate('user').exec();
        res.json(posts);        
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve posts',
         });
        
    }
};

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await PostModel.findByIdAndUpdate(
            {
                _id: postId,
            },
            {
                $inc: { viewsCount: 1 },
            },
            {
                returnDocument: 'after',
            }
        ).populate('user').exec();

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve post',
         });
    }
};

export const createPost = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            tags: req.body.tags,
            imageUrl: req.body.imageUrl,
            user: req.userId,
        });

        const post = await doc.save();

        res.json(post);
    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).json({ 
            message: 'Failed to create post',
         });
    }
}

export const removePost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await PostModel.findOneAndDelete({
            _id: postId,
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ 
            message: 'Failed to delete post',
         });
    }
};

export const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;

        await PostModel.updateOne(
            {
                _id: postId,
            },
            {
                title: req.body.title,
                text: req.body.text,
                tags: req.body.tags,
                imageUrl: req.body.imageUrl,
                user: req.userId,
            }
        );

        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ 
            message: 'Failed to update post',
         });
    }
};