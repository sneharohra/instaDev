const express = require('express');
const router = express.Router();
const { check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   POST api/posts
// @desc    Create a post 
// @access  private
router.post('/', [auth, [
    check('text','Text is required').not().isEmpty()
]
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save();
        res.json(post);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Private

router.get('/',auth, async (req,res) =>{
    try {
        const posts = await Post.find().sort({ date: -1});
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private

router.get('/:id', auth, async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.json(post);
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE  api/posts/:id
// @desc    Delete a post
// @access  Private

router.delete('/:id',auth, async (req,res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post not found'});
        }
        //check if the post is getting deleted by the user who made the post
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'User not Authorised'});
        }
        await post.remove();
        res.json({msg:'Post Removed!'});
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  private
router.put('/like/:id', auth, async (req,res) => {
    try {
        // get the post and check if the post exists
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post not found'});
        }

        // check if the user has already liked the post
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post already liked by user'});
        }

        // add user's like 
        post.likes.unshift({user: req.user.id});

        // update database
        await post.save();
        res.json(post.likes);
        
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  private
router.put('/unlike/:id', auth, async (req,res) => {
    try {
        // get the post and check if the post exists
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post not found'});
        }

        // check if the user has a like on the post
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has not yet been liked'});
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        // remove the like of the user from the array 
        post.likes.splice(removeIndex, 1);

        // update database
        await post.save();
        res.json(post.likes);
        
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  private
router.post('/comment/:id', [auth, [
    check('text','Text is required').not().isEmpty()
]
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);

        await post.save();
        res.json(post.comments);
        
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a comment on a post
// @access  private
router.delete('/comment/:id/:comment_id', auth, async (req,res) => {


    try {
        // Find out if post exists
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post not found'});
        }

        // pull out comment from post
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if(!comment){
            return res.status(404).json({ msg: 'Comment not found'});
        }

        // Check if the user trying to delete the comment is owner of the comment
        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized'});
        }

        // find index and delete the comment
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        // remove the like of the user from the array 
        post.comments.splice(removeIndex, 1);

        // save in database 
        await post.save();

        // return all comments
        return res.json(post.comments);
        
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post/Comment not found'});
        }
        res.status(500).send('Server Error');
    }
});


module.exports = router;
