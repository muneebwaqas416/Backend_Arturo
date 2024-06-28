const express = require('express')
const router = express.Router();


const {login , logout ,  signup , isLoggedin , incrementcount , getcount , updatechat , forgotPassword , google_SignUp , resetpassword , oauth , getName , getInfo , setInfo } = require('../Controllers/UserController')

const auth = require('../Middleware/auth');

//oauth

router.get('/oauth' , oauth)
//login

router.post('/login' , login)

//if a 

// router.put('/update' , auth , )
// router.get('/viewProfile' , auth , )

//signup

router.post('/' ,google_SignUp);

router.post('/signup' , signup);

router.get('/getName' , auth , getName);

//logout

router.get('/logout' ,auth ,  logout);

router.post('/count/' ,auth ,  getcount);


router.put('/increment' , auth , incrementcount);

router.put('/updatechat' , auth , updatechat);

router.get('/check' , auth , (req,res)=>{
    //console.log(req.rootuser);
    res.status(200).send({
        user : req.rootuser,
    })
})

router.post('/forgot-password' , forgotPassword)

router.post('/reset-password/:id/:token' , resetpassword);

router.get('/loggedin' , isLoggedin);

router.get('/getInfo' ,auth ,  getInfo);

router.put('/setInfo' , auth , setInfo);

module.exports = router;