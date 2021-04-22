const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');
const { User, Sessions } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
require('dotenv').config();

const jwt_secret = process.env.JWT_SECRET;

exports.generateToken = catchAsync(async (req, res, next) => {
    const { user } = req;

    const token_id = uuidv4();
    const token = jwt.sign({ id: user.id, token_id }, jwt_secret);

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const device = req.headers['user-agent'];

    await Sessions.create({
        user_id: user.id,
        token_id,
        device,
        ip,
    });

    res.status(201).json({
        success: true,
        token,
        data: {
            user,
        },
    });
});

exports.signup = catchAsync(async (req, res, next) => {
    const user = await User.create({
        email: req.body.email,
        password: req.body.password,
    });

    user.password = undefined;
    req.user = user;

    next();
});

exports.login = catchAsync(async (req, res, next) => {
    console.log(req.body);
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError(400, 'Please provide email and password!'));
    }

    const user = await User.findOne({ where: { email } });
    const validPassword = await User.validPassword(
        password,
        user.dataValues.password
    );

    if (!user || !validPassword) {
        return next(new AppError(401, 'Incorrect email or password'));
    }

    user.password = undefined;
    req.user = user;

    next();
});

exports.logout = catchAsync(async (req, res) => {
    const { user, decodedToken } = req;

    await Sessions.update(
        { logged_out: true, logged_out_at: new Date() },
        {
            where: { user_id: user.id, token_id: decodedToken.token_id },
        }
    );

    res.status(200).json({ success: true });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Get token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token)
        return next(
            new AppError(
                401,
                'You are not logged in! Please log in to get access.'
            )
        );

    const decoded = await promisify(jwt.verify)(token, jwt_secret);

    const currentUser = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
    });

    const session = await Sessions.findOne({
        where: {
            token_id: decoded.token_id,
        },
    });

    if (session.dataValues.logged_out)
        return next(
            new AppError(
                401,
                'You are not logged in! Please log in to get access.'
            )
        );

    if (!currentUser) {
        return next(
            new AppError(
                401,
                'The user belonging to this token does no longer exist.'
            )
        );
    }

    req.user = currentUser;
    req.decodedToken = decoded;
    next();
});
