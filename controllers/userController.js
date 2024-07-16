const userService = require('../services/userService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // For generating JWT tokens

const saltRounds = 10; // Number of salt rounds for bcrypt
const jwtSecret = process.env.JWT_SECRET; 

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // Validate input
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        data: {
          Statuscode: 400,
          result: 'All fields are required'
        }
      });
    }

    // Check if email already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        data: {
          Statuscode: 400,
          result: 'Email already exists'
        }
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = {
      firstname,
      lastname,
      email,
      password: hashedPassword,
      roleId: 2 // Default role ID for "User"
    };

    await userService.createUser(user);

    // Respond with success message
    res.status(201).json({
      status: 'success',
      data: {
        Statuscode: 200,
        result: 'Your account has been created.'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      data: {
        Statuscode: 500,
        result: error.message || 'An error occurred'
      }
    });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        data: {
          Statuscode: 400,
          result: 'Email and password are required'
        }
      });
    }

    // Find user by email
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        data: {
          Statuscode: 401,
          result: 'Invalid email or password'
        }
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        data: {
          Statuscode: 401,
          result: 'Invalid email or password'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign({
      id: user.id,
      email: user.email,
      roleId: user.roleId
    }, jwtSecret, { expiresIn: '1h' }); 

    // Find role name
    const role = await userService.findRoleById(user.roleId);

    // Respond with success message and token
    res.status(200).json({
      status: 'success',
      data: {
        Statuscode: 200,
        result: 'You have successfully logged in',
        id: user.id,
        email: user.email,
        role: role.name, // name` is the field for role name
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      data: {
        Statuscode: 500,
        result: error.message || 'An error occurred'
      }
    });
  }
};
