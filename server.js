const express = require('express');
const connectDB = require('./config/db')
const path = require('path')

const app = express();

//connect to mongoDb
connectDB();

//init middleware to convert request body to json
app.use(express.json({ extended: false}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});



// define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));


//Serve static assets in production 
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'));

    app.get('*', (req,res) =>{
       res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')) 
    })
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
