const cron = require('node-cron');
const UserModel = require('../Models/UserModel');

// Schedule a task to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  const users = await UserModel.find({ payment: true });

  users.forEach(async (user) => {
    const oneYearAgo = new Date();
    console.log(oneYearAgo);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (user.paymentDate <= oneYearAgo) {
      user.payment = false;
      await user.save();
    }
  });
});
