const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3010;

app.use(express.static('static'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to database'))
    .catch((error) => {
        console.error('Error connecting to database', error);
        process.exit(1); // Exit the process on failure
    });



app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// Import the User model
const User = require('./models/User');

// POST route for creating a user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, age } = req.body;

        // Validate input
        if (!name || !email || !age) {
            return res.status(400).json({ message: 'Validation error: All fields are required.' });
        }

        // Save user to database
        const newUser = new User({ name, email, age });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        if (error.code === 11000) { // Handle duplicate email error
            return res.status(400).json({ message: 'Validation error: Email already exists.' });
        }
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
