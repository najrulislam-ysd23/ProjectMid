const fs = require('fs');
const logPath = './server/log.txt';

class Logger {
    addLog(logEntry) {
        fs.appendFile(logPath, logEntry, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            } 
            else {
                console.log('Log entry added successfully.');
            }
        });
    }
}

module.exports = new Logger();