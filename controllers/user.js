const { Op } = require('sequelize');
const { User, Sessions } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.me = catchAsync(async (req, res, next) => {
    const { user } = req;

    res.status(200).json({
        success: true,
        data: {
            user: user.dataValues,
        },
    });
});

exports.sessions = catchAsync(async (req, res, next) => {
    const { user, decodedToken } = req;

    const currentSession = await Sessions.findAll({
        where: {
            logged_out: false,
            token_id: decodedToken.token_id,
        },
    });

    const allSessions = await Sessions.findAll({
        where: {
            logged_out: false,
            token_id: { [Op.not]: decodedToken.token_id },
        },
    });

    res.status(200).json({
        success: true,
        data: {
            current: currentSession,
            all: allSessions,
        },
    });
});

// Terminate session
exports.terminateSession = catchAsync(async (req, res, next) => {
    const {
        user,
        params: { id },
    } = req;

    const document = await Sessions.update(
        { logged_out: true, logged_out_at: new Date() },
        {
            where: { user_id: user.id, id },
        }
    );

    if (!document) {
        return next(new AppError(404, 'No document found with that ID'));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

// Terminate all sessions except current session
exports.terminateAllSessions = catchAsync(async (req, res, next) => {
    const { user, decodedToken } = req;

    const document = await Sessions.update(
        { logged_out: true, logged_out_at: new Date() },
        {
            where: {
                user_id: user.id,
                token_id: {
                    [Op.not]: decodedToken.token_id,
                },
            },
        }
    );

    if (!document) {
        return next(new AppError(404, 'No document found with that ID'));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
