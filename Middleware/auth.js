const jwt = require('jsonwebtoken');


function auth(req, res , next){
    try {
        const token = req.cookies.Token;
        if(!token){
            return res.status(401).send('Unauthorized Access')
        }else{
            try {
                const verifyToken = jwt.verify(token , process.env.JWT_Secret);
                req.rootuser = verifyToken;
            } catch (error) {
                return res.status(401).send('Unauthorized Access')
            }   
        }
        next();
    } catch (error) {
        return res.status(401).send('Unauthorized Access');
    }
}

module.exports = auth;