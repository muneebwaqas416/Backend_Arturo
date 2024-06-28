const addUser = (User)=>({email , billingID , plan , endDate})=>{
    if(email || billingID || plan || endDate){
        throw new Error("Please Enter complete information with email , billingID , plan  , endDate");
    }
    const user = User((email , billingID , plan , endDate));
    return user.save();
}

const getUsers = (User)=>()=>{
    return User.find({});
}

const getUserByEmail = (User)=> async(email)=>{
    return await User.findOne({email})
}

const getUserByBillingID = (User)=> async(billingID)=>{
    return await User.findOne({billingID})
}


module.exports = (User)=>{
    return {
        addUser : addUser(User) , 
        getUsers : getUsers(User) , 
        getUserByEmail : getUserByEmail(User) , 
        getUserByBillingID : getUserByBillingID(User)
    }
}