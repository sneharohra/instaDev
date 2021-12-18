const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar')
const User = require('../../models/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   POST api/users
// @desc    Registration route
// @access  Public
router.post('/', 
[
    check('name','Name is required').not().isEmpty(),
    check('email', 'Please provide a valid email').isEmail(),
    check('password', 'Please enter a password of minimum 6 characters').isLength({min:6})
],
async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    const { name, email, password} = req.body;

    try{
        let user = await User.findOne({email});
        //check if user exists
        if(user){
            return res.status(400).json({errors: [{msg: 'User already exists'}]});
        }

        //return gravatar if it does
        const avatar = gravatar.url(email,{
            s: '200',
            r: 'pg',
            d: 'mm'
        });
        
        //create instance of user
        user = new User({
            name, email, avatar, password
        });

        //encrypt the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        //insert user into db
        await user.save();

        //return json web token
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, config.get('jwtSecret'),
        { expiresIn: 3600000},
        (err, token) => {
            if (err) throw err;
            res.json({token});
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');

    }

});

module.exports = router;

