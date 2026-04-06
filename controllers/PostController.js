import PostModel from '../models/Post.js';

export const getLastTags = async (req, res) => {
    try {
        const posts = await PostModel.find().limit(5).exec();

        const tags = posts
            .map((obj) => obj.tags)
            .flat()
            .slice(0, 5);

        res.json(tags);        
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve posts',
         });
        
    }
}

export const getAll = async (req, res) => {
    try {
        const { sortBy = 'createdAt', order = 'desc' } = req.query;
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortOptions = { [sortBy]: sortOrder };
        const posts = await PostModel
        .find()
        .populate({ path: 'user', select: ['fullName', 'avatarUrl'] })
        .sort(sortOptions)
        .exec();
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
        const userId = req.userId;

        const post = await PostModel.findOneAndDelete({
            _id: postId,
            user: userId,
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.user.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
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
        const userId = req.userId;

        const post = await PostModel.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.user.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this post' });
        }

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