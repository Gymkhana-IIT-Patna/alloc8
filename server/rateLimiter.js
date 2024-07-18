
import rateLimit from 'express-rate-limit';
import concurrentLimiter from './concurrentLimiter.js';

const apiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again after 10 minutes',
});




const apiLimiter = [apiRateLimiter, concurrentLimiter];
export default apiLimiter;
