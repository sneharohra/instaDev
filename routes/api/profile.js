const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const User = require('../../models/User');
const {check, validationResult} = require('express-validator');
// bring in normalize to give us a proper url, regardless of what user entered
const normalize = require('normalize-url');
const request = require('request');
const config = require('config');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req,res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.json(profile);
    }

    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/',[ auth , 
[
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty()
]
],
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array() });
        }
        // destructure the request
        const {
            website,
            skills,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook,
            // spread the rest of the fields we don't need to check
            ...rest
        } = req.body;

        // build a profile
        const profileFields = {
            user: req.user.id,
            website:
                website && website !== ''
                ? normalize(website, { forceHttps: true })
                : '',
            skills: Array.isArray(skills)
                ? skills
                : skills.split(',').map((skill) => ' ' + skill.trim()),
            ...rest
        };

        // Build socialFields object
        const socialFields = { youtube, twitter, instagram, linkedin, facebook };

        // normalize social fields to ensure valid url
        for (const [key, value] of Object.entries(socialFields)) {
            if (value && value.length > 0)
                socialFields[key] = normalize(value, { forceHttps: true });
        }
        // add to profileFields
        profileFields.social = socialFields;

        try {
            // Using upsert option (creates new doc if no match is found):
            let profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        return res.json(profile);
        } catch (err) {
            console.error(err.message);
                return res.status(500).send('Server Error');
        }

});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get('/', async (req, res) => {
    try{
        const profiles = await Profile.find().populate('user', ['name','avatar']);
        res.json(profiles);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

})

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public

router.get('/user/:user_id', async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name','avatar']);
        if (!profile) return res.status(400).json({msg: 'There is no profile for this user'});
        
        res.json(profile);

    } catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId') return res.status(400).json({msg: 'There is no profile for this user'});
        

        res.status(500).send('Server Error');
    }

})
// @route   DELETE api/profile
// @desc    Delete profile,  user and posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try{
        // Remove user posts
        await Post.deleteMany({user: req.user.id});
        await Profile.findOneAndRemove({user: req.user.id});
        await User.findOneAndRemove({_id: req.user.id});
        
        res.json({msg: 'User deleted'});
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route   PUT api/profile/experience
// @desc    Add experience
// @access  Private
router.put('/experience', [auth, 
[
    check('title','Title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','Start date is required').not().isEmpty()
]
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    const {
        title,
        company, 
        location,
        from,
        to,
        current, 
        description
    } = req.body;

    // Create experience object
    const newExp = {
        title,
        company, 
        location,
        from,
        to,
        current, 
        description
    }

    try{
        // Profile present or not
        const profile = await Profile.findOne({ user: req.user.id});
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        profile.experience.unshift(newExp);

        // Add experience to the database
        await profile.save();

        // Send success response
        res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    delete experience
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {

    try{
        // Profile present or not
        const profile = await Profile.findOne({ user: req.user.id});
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        // Delete experience from profile
        profile.experience.splice(removeIndex, 1);
        
        // Update database
        await profile.save();

        // Send success response
        res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/education
// @desc    Add education
// @access  Private
router.put('/education', [auth, 
[
    check('school','School is required').not().isEmpty(),
    check('degree','Degree is required').not().isEmpty(),
    check('fieldofstudy','Field of study is required').not().isEmpty(),
    check('from','Start date is required').not().isEmpty()
]
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    const {
        school,
        degree, 
        fieldofstudy,
        from, 
        to, 
        current,
        description
    } = req.body;

    // Create education object
    const newEdu = {
        school,
        degree, 
        fieldofstudy,
        from, 
        to, 
        current,
        description
    }

    try{
        // Profile present or not
        const profile = await Profile.findOne({ user: req.user.id});
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        profile.education.unshift(newEdu);

        // Add education to the database
        await profile.save();

        // Send success response
        res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/education/:edu_id
// @desc    delete education
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {

    try{
        // Profile present or not
        const profile = await Profile.findOne({ user: req.user.id});
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        // Delete education from profile
        profile.education.splice(removeIndex, 1);
        
        // Update database
        await profile.save();

        // Send success response
        res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  GET api/profile/github/:username
// @desc   get user repos from github
// @access  public

router.get('/github/:username', (req,res) => {
    try {
        const options = {
            uri :`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent' : 'node.js'}

        }

        request(options, (error, response, body) => {
            if(error) console.error(error);

            if(response.statusCode !=200){
                return res.status(404).json({msg: 'No github profile'});
            }
            res.json(JSON.parse(body));
        })
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
        
    }


})

module.exports = router;
