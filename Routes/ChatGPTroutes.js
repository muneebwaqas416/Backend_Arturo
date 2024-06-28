const express = require('express');
const router = express.Router();
const auth = require('../Middleware/auth');
const {GPT_func , getDifficultWords, getPronunciation} = require('../Controllers/ChatGPTController');


//check here with cookies of the end user that either his count is 5 or not if count==5 then check that is it's payment is true or not in the authentication



router.post('/completitons' , auth , GPT_func);

router.post('/getDifficultWords' , auth , getDifficultWords);


router.post('/getPronunciation' , auth , getPronunciation);


module.exports = router;