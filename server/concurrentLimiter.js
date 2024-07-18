import semaphore from 'semaphore';

const maxConcurrentRequests = 20; 
const sem = semaphore(maxConcurrentRequests);

const concurrentLimiter = (req, res, next) => {
  let timeout;

  const handleTimeout = () => {
    res.status(503).json({ message: 'Too many concurrent requests, please try again later' });
  };

  const proceed = () => {
    clearTimeout(timeout);
    res.on('finish', () => {
      sem.leave();
    });
    next();
  };

  timeout = setTimeout(handleTimeout, 30000); 

  sem.take(() => {
    if (res.headersSent) {
      sem.leave();
    } else {
      proceed();
    }
  });
};

export default concurrentLimiter;