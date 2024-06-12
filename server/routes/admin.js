const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const adminLayout = '../views/layouts/admin';
const bcrypt = require('bcrypt'); // encrypt and decrypt password
const jwt = require('jsonwebtoken'); //create token for cookies
const jwtSecret = process.env.JWT_SECRET;


/**
 * 
 * Check Login
*/
const authMiddleware = (req, res, next ) => {
    const token = req.cookies.token;
  
    if(!token) {
      return res.status(401).json( { message: 'Unauthorized'} );
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch(error) {
      res.status(401).json( { message: 'Unauthorized'} );
    }
}

/**
* GET/
* Admin - Login page
*/

router.get('/admin', async(req,res)=>{
    try{
        const locals = {
            title: "Admin",
            description: "Blog to read different books"
        }

        res.render('admin/index',{locals,layout: adminLayout});
    }catch(error){
        console.log(error);
    }
});

/**
* Post/
* Admin - check login
*/

router.post('/admin', async(req,res)=>{
    try{
        const {username,password} = req.body;
        const user = await User.findOne({ username});

        if(!user){
            return res.status(401).json({message:'Invalid credentials'});
        }

        const isPasswordValid  = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(401).json({message:'Invalid credentials'});
        }

        const token = jwt.sign({userId: user._id},jwtSecret);
        res.cookie('token',token,{httpOnly:true});
        res.redirect('/dashboard');

    }catch(error){
        console.log(error);
    }
});

/**
* GET/
* Admin - Dashboard
*/

router.get('/dashboard', authMiddleware ,async(req,res)=>{
    try{
        const locals = {
            title: "Dashboard",
            description: "Blog to read different books"
        }
        const data = await Post.find();
        res.render('admin/dashboard',{
            locals,
            layout: adminLayout,
            data
        });
    }catch(error){
        console.log(error);
    }
});

/**
* GET/
* Admin - add new post
*/
router.get('/add-post', authMiddleware ,async(req,res)=>{
    try{
        const locals = {
            title: "Add Post",
            description: "Blog to read different books"
        }
        const data = await Post.find();
        res.render('admin/add-post',{
            locals,
            layout: adminLayout
        });
    }catch(error){
        console.log(error);
    }
});

/**
* POST/
* Admin - add new post to get content
*/
router.post('/add-post', authMiddleware ,async(req,res)=>{
    try{
        try{
            let imageUploadFile;
            let uploadPath;
            let newImageName;
            if(!req.files || Object.keys(req.files).length === 0){
                console.log('No files were uploaded');
            } else {
                imageUploadFile = req.files.image;
                newImageName = Date.now() + imageUploadFile.name;
    
                uploadPath = require('path').resolve('./') + '/public/img/' + newImageName;
    
                imageUploadFile.mv(uploadPath,function(err) {
                    if(err) return res.status(500).send(err);
                } );
            }
            const newPost = new Post({
                    title: req.body.title,
                    body: req.body.body,
                    author: req.body.author,
                    image: newImageName,
                    createdAt: Date.now()
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        }catch(error){
            console.log(error);
        }
    }catch(error){
        console.log(error);
    }
});

/**
 * GET /
 * Admin - edit post to get content
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      const locals = {
        title: "Edit Post",
        description: "Blog to read different books",
      };
  
      const data = await Post.findOne({ _id: req.params.id });
  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });

/**
* PUT/
* Admin - add new post to get content
*/
router.put('/edit-post/:id', authMiddleware ,async(req,res)=>{
    try{
        try{
            let imageUploadFile;
            let uploadPath;
            let newImageName;
            if(!req.files || Object.keys(req.files).length === 0){
                console.log('No files were uploaded');
            } else {
                imageUploadFile = req.files.image;
                newImageName = Date.now() + imageUploadFile.name;
    
                uploadPath = require('path').resolve('./') + '/public/img/' + newImageName;
    
                imageUploadFile.mv(uploadPath,function(err) {
                    if(err) return res.status(500).send(err);
                } );
            }
            await Post.findByIdAndUpdate(req.params.id, {
                    title: req.body.title,
                    body: req.body.body,
                    author: req.body.author,
                    image: newImageName,
                    updatedAt: Date.now()
            });
            res.redirect(`/edit-post/${req.params.id}`);
        } catch(error){
            console.log(error);
        }
    }catch(error){
        console.log(error);
    }
});

/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
});

/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    // res.json({ message: 'Logout successful.'});
    res.redirect('/');
});




/**
* Post/
* Register
*/

router.post('/register', async(req,res)=>{
    try{
        const {username,password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // 10 speciefies the sort number

        try {
        const user = await User.create({ username, password:hashedPassword });
        res.status(201).json({ message: 'User Created', user });
        } catch (error) {
        if(error.code === 11000) {
            res.status(409).json({ message: 'User already in use'});
        }
        res.status(500).json({ message: 'Internal server error'})
        }
        
    }catch(error){
        console.log(error);
    }
});


module.exports = router;