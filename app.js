require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cors = require('cors')
const Menu = require('./model/menu')
const User = require('./model/user')
const secretKey = "secret123"

const app = express();
const port = process.env.PORT;
const url =process.env.MONGODB_URL


// Middleware to parse JSON
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "https://e-commerce-food-lolj.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  

// Home route
app.get('/', (req, res) => {
  res.send('From the server');
});


// MongoDB connection
async function main() {
    console.log(url)
  await mongoose.connect(url);
}

main()
  .then(() => console.log('DB Connected'))
  .catch((error) => console.log(error));

//Token authenticate
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) return res.status(401).json({ error: "Token not provided" });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token", err: err });
        req.user = user;
        next();
    })
}

// Get all the menu items
app.get('/menus', async (req, res) => {
  try {
    const menus = await Menu.find();
        res.status(200).json(menus);
  } catch (error) {
        res.status(400).json({ message: 'Error fetching menus', error: error.message });
  }
});

// Create a menu item
app.post('/menus', async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    res.status(201).json(menu);
  } catch (error) {
        res.status(400).json({ message: 'Error creating menu', error: error.message });
  }
});

//Get menu item by Id
app.get('/menus/:id', async(req,res)=>{
    try {
        const menuId = req.params.id
        const menu = await Menu.findById(menuId)
        if(!menu){
            return res.status(404).json({message:"Menu item not found"})
        }else{
            res.status(200).json(menu)
        }
    } catch (error) {
        res.status(400).json({ message: 'Error fetching menus', error: error.message });
    }
})

//Update a menu item
app.patch('/menus/:id',async (req,res)=>{
    try {
        const menuId = req.params.id
        const menu = await Menu.findByIdAndUpdate(menuId,req.body,{new:true})
        res.status(200).json(menu)
    } catch (error) {
        res.status(400).json({ message: 'Error fetching menus', error: error.message });
    }
})

//Delete menu item
app.delete('/menus/:id',async(req,res)=>{
    try {
        const menuId = req.params.id
        const menu = await Menu.findByIdAndDelete(menuId)
        if(!menu){
            return res.status(404).json({message:"Menu item not found"})
        }else{
            res.status(200).json({message:"Menu item deleted successfully"})
        }
    } catch (error) {
        res.status(400).json({ message: 'Error fetching menus', error: error.message });
    }
})





app.post('/users',async (req,res)=>{
    try {

        const saltRounds=10
        bcrypt.hash(req.body.password, saltRounds, async function(err,hash){
            if(err){
                console.log("Error occured while hashing",err)
                res.status(500).json({error:"Internal Server error"})
            }
            var userItem = {
                name:req.body.name,
                email:req.body.email,
                password:hash,
                createdAt:new Date()
            }
            var user = new User(userItem)
            await user.save()
            res.status(201).json({message:"Signup Successfull",user:user})
        })

    } catch (error) {
        res.status(400).json(error)
    }
})


//Login route
app.post('/login',async(req,res)=>{
    try {
        const {email,password} = req.body
        const user = await User.findOne({email:email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const isValid = await bcrypt.compare(password,user.password)
        if(!isValid){
            return res.status(401).json({message:"Invalid credentials"})
        }

        //Token creation
        let payload = {user:email}  
        
        let token = jwt.sign(payload,secretKey,{ expiresIn: "1h" })
        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: { email: user.email, name: user.name }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Start the server
app.listen(port, () => {
  console.log('Server started');
});
