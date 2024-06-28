const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library')
const UserModel = require('../Models/UserModel');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const translate = require('google-translate-api');


const login = async(req,res)=>{
    try {
        const {email , password} = req.body;
        console.log('Request sent to backend')

        if(!email || !password){
            return res.status(400).json({errorMessage : "Please Enter the all fields"});
        }
        
        const user = await UserModel.findOne({email});


        if(!user){
            return res.status(401).json({errorMessage : "Wrong email or password"});
        }

        const passwordCorrect = await bcrypt.compare(password , user.password);

        if(!passwordCorrect){
            
            return res.status(401).json({errorMessage : "Wrong email or password"});

        }
        const token = jwt.sign({
            user : user._id , 
            email : user.email,
        } , process.env.JWT_Secret,{
            expiresIn: '30d'
        })

        //send the token in cookie

        console.log(token)
        return res.cookie("Token" , token , {
            httpOnly : true , 
            secure : true,
            expiresIn : 30 * 24 * 60 *60
        }).status(200).send({
            message : "User Logged in Successfully",
            email : user.email,
            token : token
        });
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                errorMessage : error
            })
        }
}

const logout = async(req,res)=>{
    res.cookie("Token" , "" ,{
        httpOnly : true , 
        expires : new Date(0)
    }).send({
        message : "User Logged out successfully"
    });
}

async function getUserData(access_token) {

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    
    //console.log('response',response);
    const data = await response.json();
    
    return data;
}
const oauth = async(req,res)=>{
    const code = req.query.code;
  
 
      try {
          const redirectURL = "http://127.0.0.1:5000/api/user/oauth"
          const oAuth2Client = new OAuth2Client(
              process.env.Client_ID,
              process.env.client_Secret,
              redirectURL
            );
          const r =  await oAuth2Client.getToken(code);
          // Make sure to set the credentials on the OAuth2 client.
          await oAuth2Client.setCredentials(r.tokens);
          const user = oAuth2Client.credentials;
          console.log("I am here")
          const data = await getUserData(oAuth2Client.credentials.access_token);
            const email = data.email;
            const users = await UserModel.findOne({email});
            
            if(users){
                throw new Error("This email already exists.Please use another email")
            }
            const newUser = new UserModel({
                email : email,
                firstName : data.name,
            })
    
            const SavedUser = await newUser.save();
    
            const token = jwt.sign({
                user : SavedUser._id,
                email : SavedUser.email,
            } , process.env.JWT_Secret,{
                expiresIn: '30d'
            })
            console.log("Making token here")
            console.log(token)
            res.cookie("Token", token).redirect(302, `${process.env.Client_URL}/?auth=success&token=${token}`);

          
        } catch (err) {
          console.log('Error logging in with OAuth2 user', err);
          res.redirect(303, `${process.env.Client_URL}/?auth=error`);
        }
}

const google_SignUp = async (req,res)=>{
    console.log('request recived');
    res.header("Access-Control-Allow-Origin" , "http://localhost:5173");
    res.header('Referrer-Policy' , 'no-referrer-when-downgrade');

    const RedirectURL = 'http://127.0.0.1:5000/api/user/oauth';

    const oauthClient = new OAuth2Client(
        process.env.Client_ID ,  
        process.env.client_Secret,
        RedirectURL
    )
        
    const authorizeUrl = oauthClient.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email',
        prompt: 'consent'
      });
  
      res.json({url:authorizeUrl})

}

const signup = async(req,res)=>{
    try {

        
        const {email , password} = req.body;  

        console.log(email + password)
        
        if(!email || !password){
            return res.status(400).json({errorMessage : "Please Enter the all fields of the form"});
        }

        if(password.length<6){
            return res.status(400).json({errorMessage : "Please Enter a password of more than 6 characters"});
        }

        
        const users = await UserModel.findOne({email});

        
        if(users){
            return res.status(400).json({errorMessage : "The account with this email already exits .Please use another email for Signup"});
        
        }

        //Hash the password

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password , salt);

        // console.log(passwordHash);

        const newUser = new UserModel({
            email : email , 
            password : passwordHash ,
        })

        const SavedUser = await newUser.save();

        const token = jwt.sign({
            user : SavedUser._id,
            email : SavedUser.email,
        } , process.env.JWT_Secret,{
            expiresIn: '30d'
        })

        console.log(token)

        //send the token in cookie

        res.cookie("Token", token, {
            httpOnly : true , 
            secure : true,
            expiresIn : 30 * 24 * 60 *60
          });
        return res.status(200).send({
            message : "Record save successfully",
            email : SavedUser.email,
            token : token
        
        });
    } catch (error) {
        console.log(error);
        res.status(500).send();
        
    }
}

const isLoggedin = async(req,res)=>{
    try {

        console.log(req.cookies);
        const token = req.cookies.Token;
        

        if(!token){
            return res.status(401).send(false)
        }else{
            try {
                const verifyToken = jwt.verify(token , process.env.JWT_Secret);
                req.user = verifyToken;
                return res.status(200).send(true)
            } catch (error) {
                return res.status(401).send(false)
            }
            
        }
        
        //res.send(true);
    } catch (error) {
        return res.status(401).send(false)
    }
}

const updateProfile = async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}

const forgotPassword = async(req,res)=>{
    try {
        const {email} = req.body;
        if(!email){
            res.status(400).send({
                message : "Please enter all fields"
            })
        }
        let user = await UserModel.findOne({email})
        console.log(user)
        if (!user){
            res.status(400).send({
                message : "Please enter a valid email address which is registered with"+
                "our system"
            })
        }
        const token = jwt.sign({
            user : user._id , 
            email : user.email,
        } , process.env.JWT_Secret,{
            expiresIn : '15m'
        })

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'eleva.english@gmail.com',
              pass: 'snfg zsiu dtcf krud'
            }
          });
          
          var mailOptions = {
            from: 'eleva.english@gmail.com',
            to: 'muneebwaqas900@gmail.com',
            subject: 'Reset Your Aaron Hakso Chatbot Password',
            text: `http://localhost:5173/reset-password/${user._id}/${token}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              return res.status(200).send({
                message : "Success"
              })
            }
          });

    } catch (error) {
        res.status(400).send({
            message : "A technical error occured please try again"
        })
    }
}

const resetpassword = async(req,res)=>{
    try {
        console.log("I am here")
        const {id , token} = req.params;
        console.log(id)
        console.log(token)
        const {password} = req.body;

        jwt.verify(token , process.env.JWT_Secret , async (err , decoded)=>{
            if(err){
                return res.status(401).json({
                    message : "Error with token"
                })
            }else{
                const salt = await  bcrypt.genSalt();
                const passwordHash = await bcrypt.hash(password , salt);
                UserModel.findByIdAndUpdate({_id : id} , {password : passwordHash}).then((u)=>{
                    return res.status(200).send({
                        message : "Password Updated sucessfully"
                    })
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).send({
                        message : "There was a technical error.Please try again"
                    })
                })
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message : error
        })
    }
}

const updatechat = async(req,res)=>{
    try {
        console.log('----------in update chat-------------');
        
            const {chatData , user} = req.body;
            // console.log(chatData);
            // console.log(user);
            const _id = user?.user;
            if(_id){
                UserModel.findById(_id).then((user)=>{
                    if(user){
                        user.chat.push(chatData);

                        // Save the updated user document
                        user.save()
                          .then(() => {
                            return res.status(200).send("Chat saved successfully");
                          })
                          .catch((error) => {
                            return res.status(500).send("Error saving chat data");
                          });
                    }
                }).catch((error)=>{
                    return res.status(401).send("Unauthorized access");
                })
            }else{
                return res.status(500).send("Something went wrong");
            }
            
    } catch (error) {
            console.log(error);
    }
}



const incrementcount = async(req,res)=>{
    try {
        const {_id} = req.body;
        console.log(_id);
        // const result = await UserModel.findByIdAndUpdate(user._id , {$set:{count : user.count+1}})
        const result = await UserModel.updateOne({_id : _id},{
            $inc:{
                count: 1
            }
        })
        

        console.log(result);

        const user = await UserModel.findById(_id);
        return res.status(200).send({
            count : user.count  , 
            payment : user.payment

        })

    } catch (error) {
        return res.status(400).send({
            error : error
        })
    }
}

const getName = async(req,res)=>{
    const token = req.cookies.Token;
    jwt.verify(token, process.env.JWT_Secret, async (err, decoded) => {
        if (err) {
          // Token is invalid or expired
          console.error('Error decoding token:', err.message);
          return res.status(401).send({
            message : err.message
          })
          // Handle error
        } else {
          // Token is valid
          console.log('Decoded token:', decoded);
          // Extract email from the decoded token
          const userEmail = decoded.email;
          
          try {
            // Find user by email in the database
            const user = await UserModel.findOne({ email: userEmail });
      
            if (user) {
              // User found, extract firstName value
              const firstName = user.firstName;
              console.log('User firstName:', firstName);

              if(firstName){
                res.json({ firstName: firstName });
              }else{
                return res.status('404').send({
                    message : "FirstName is not given"
                })
              }
              // Return firstName in the response
              
            } else {
              // User not found in the database
              console.error('User not found for email:', userEmail);
              return res.status(401).send({
                message : "User not found"
              })
              // Handle error
            }
          } catch (error) {
            // Database query error
            console.error('Error querying database:', error.message);
            return res.status(401).send({
                message : error.message
              })
            // Handle error
          }
        }
      });


}

const getInfo  = async(req,res)=>{
    const token = req.cookies.Token;
    jwt.verify(token, process.env.JWT_Secret, async (err, decoded) => {
        if (err) {
          // Token is invalid or expired
          console.error('Error decoding token:', err.message);
          return res.status(401).send({
            message : err.message
          })
          // Handle error
        } else {
          // Token is valid
          // Extract email from the decoded token
          const userEmail = decoded.email;
          
          try {
            // Find user by email in the database
            const user = await UserModel.findOne({ email: userEmail });
            if (user) {
              const Info = {
                email : user.email
              }
              return res.json(Info);

            } else {
              // User not found in the database
              console.error('User not found for email:', userEmail);
              return res.status(401).send({
                message : "User not found"
              })
              // Handle error
            }
          } catch (error) {
            // Database query error
            console.error('Error querying database:', error.message);
            return res.status(401).send({
                message : error.message
              })
            // Handle error
          }
        }
      });

}

const setInfo = async(req,res)=>{
    const token = req.cookies.Token;
    jwt.verify(token, process.env.JWT_Secret, async (err, decoded) => {
    if (err) {
        // Token is invalid or expired
        console.error('Error decoding token:', err.message);
        return res.status(401).send({
            message: err.message
        });
    } else {
        // Token is valid
        console.log('Decoded token:', decoded);
        // Extract email from the decoded token
        const userEmail = decoded.email;

        try {
            // Find user by email in the database
            const user = await UserModel.updateOne({ email: userEmail } , {
                $set : {
                    firstName : req.body.inputName, 
                } 
            });
            return res.status(200).send({
                user : user
            });
        
        } catch (error) {
            // Database query error
            console.error('Error querying database:', error.message);
            return res.status(500).send({
                message: error.message
            });
        }
    }
});
}
const getcount = async(req,res)=>{
    try {
        console.log(req.body);
        const {_id} = req.body;
        console.log("this is the id")
        console.log(_id);
        const user = await UserModel.findById({_id});
        console.log(user);
        return res.status(200).send({
            count : user.count
        })

    } catch (error) {
        console.log(error);
    }
}


module.exports = {login , logout , signup , isLoggedin , incrementcount , 
    getcount, updatechat , forgotPassword , resetpassword , google_SignUp , oauth , getName , getInfo  , setInfo};