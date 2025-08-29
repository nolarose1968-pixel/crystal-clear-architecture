/**
 * Fire22 API Main Router
 *
 * Enterprise-grade API router with comprehensive middleware stack
 */
import { Router } from 'itty-router';
import { authenticate } from './middleware/auth.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import { authRoutes } from './routes/auth.routes';
import { adminRoutes } from './routes/admin.routes';
import { otherRoutes } from './routes/other.routes';
import { financialRoutes } from './routes/financial.routes';
import { managerRoutes } from './routes/manager.routes';
import { healthRoutes } from './routes/health.routes';
import { customerRoutes } from './routes/customer.routes';
const api = Router({ base: '/api' });
// Apply global middleware
api.all('*', rateLimiter());
// Public routes (no authentication)
api.all('/auth/*', authRoutes.handle);
api.all('/health/*', healthRoutes.handle);
// Protected routes (require authentication)
api.all('*', authenticate);
// Role-based routes
api.all('/admin/*', adminRoutes.handle);
api.all('/other/*', otherRoutes.handle);
api.all('/financial/*', financialRoutes.handle);
api.all('/manager/*', managerRoutes.handle);
api.all('/customer/*', customerRoutes.handle);
// 404 handler
api.all('*', () => new Response('Not Found', { status: 404 }));
export default api;
//# sourceMappingURL=router.js.map
