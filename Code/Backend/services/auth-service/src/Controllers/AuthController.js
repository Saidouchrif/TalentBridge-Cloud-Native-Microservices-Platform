const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../Models');


// REGISTER
exports.register = async (req, res) => {
<<<<<<< HEAD
    try {
        const { email, password, role = 'student' } = req.body;
=======

    try {

        const { email, password } = req.body;
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8

        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
<<<<<<< HEAD
            password: hashedPassword,
            role
        });

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(201).json({
            message: "User created",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
=======
            password: hashedPassword
        });

        res.status(201).json({
            message: "User created",
            user
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
};


// LOGIN
exports.login = async (req, res) => {
<<<<<<< HEAD
    try {
=======

    try {

>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
<<<<<<< HEAD
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
=======
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
            }
        );

        res.json({
            token,
<<<<<<< HEAD
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
=======
            user
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
