const sendErrorDev = (err, req, res) => {
    return res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (originalError, err, req, res, next) => {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // B) Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
        success: false,
        message: 'Something went very wrong!',
    });

    next(originalError);
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        sendErrorProd(err, error, req, res, next);
    }
};
