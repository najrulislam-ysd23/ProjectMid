const success = (message, data = null, timestamp) => {
    var time = new Date().toTimeString();
    return {
        success: true,
        message: message,
        data: data,
        timestamp: time,
    };
};

const failure = (message, error = null, timestamp) => {
    var time = new Date().toTimeString();
    return {
        success: false,
        message: message,
        error: error,
        timestamp: time,
    };
};

module.exports = {
    success,
    failure
}