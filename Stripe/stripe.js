const stripe = require('stripe');

const Stripe = stripe(process.env.SECRET_KEY);