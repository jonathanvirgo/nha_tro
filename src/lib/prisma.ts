import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';

// =============================================================================
// PRISMA CLIENT - PRODUCTION OPTIMIZED
// =============================================================================

// -----------------------------------------------------------------------------
// 1. Environment Validation
// -----------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!DATABASE_URL) {
    throw new Error(
        '[Prisma] DATABASE_URL is required. Please set it in your .env file.'
    );
}

// -----------------------------------------------------------------------------
// 2. Global Singleton Pattern (for hot reload in development)
// -----------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

// -----------------------------------------------------------------------------
// 3. Environment-specific Pool Configuration
// -----------------------------------------------------------------------------

const getPoolConfig = (): PoolConfig => {
    const isProduction = NODE_ENV === 'production';
    const isServerless = process.env.SERVERLESS === 'true'; // Set this in Vercel/Lambda

    // Base configuration
    const baseConfig: PoolConfig = {
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false, // Required for Supabase/managed databases
        },
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        application_name: process.env.APP_NAME || 'nha-tro',
    };

    // Serverless environment (Vercel, AWS Lambda, Cloudflare Workers)
    if (isServerless) {
        return {
            ...baseConfig,
            max: 3,                         // Very low pool for serverless
            min: 0,                         // No persistent connections
            idleTimeoutMillis: 30000,       // 30 seconds
            connectionTimeoutMillis: 10000, // 10 seconds
            allowExitOnIdle: true,          // Allow function to exit
        };
    }

    // Production persistent server (Render, Railway, EC2)
    if (isProduction) {
        return {
            ...baseConfig,
            max: 10,                         // Balanced for most apps
            min: 2,                          // Keep warm connections
            idleTimeoutMillis: 120000,       // 2 minutes
            connectionTimeoutMillis: 30000,  // 30 seconds
            allowExitOnIdle: false,          // Keep pool alive
        };
    }

    // Development
    return {
        ...baseConfig,
        max: 5,                          // Lower for local dev
        min: 1,
        idleTimeoutMillis: 60000,        // 1 minute
        connectionTimeoutMillis: 15000,  // 15 seconds
        allowExitOnIdle: false,
    };
};

// -----------------------------------------------------------------------------
// 4. Create Connection Pool
// -----------------------------------------------------------------------------

const createPool = (): Pool => {
    const pool = new Pool(getPoolConfig());

    // Handle unexpected pool errors
    pool.on('error', (err: Error & { code?: string }) => {
        console.error('[Prisma Pool] Unexpected error:', {
            message: err.message,
            code: err.code,
            timestamp: new Date().toISOString(),
        });
    });

    return pool;
};

const pool = globalForPrisma.pool ?? createPool();

// -----------------------------------------------------------------------------
// 5. Create Prisma Client with Adapter
// -----------------------------------------------------------------------------

const createPrismaClient = (): PrismaClient => {
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: NODE_ENV === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'], // Only errors in production
    });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// -----------------------------------------------------------------------------
// 6. Store in Global (Development only - prevents hot reload issues)
// -----------------------------------------------------------------------------

if (NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pool = pool;
}

// -----------------------------------------------------------------------------
// 7. Connection Health Check (on startup)
// -----------------------------------------------------------------------------

const testConnection = async (): Promise<void> => {
    const startTime = Date.now();
    try {
        const client = await pool.connect();
        const duration = Date.now() - startTime;

        console.log(`[Prisma] ✅ Database connected (${duration}ms)`);
        console.log(`[Prisma] Pool: total=${pool.totalCount}, idle=${pool.idleCount}, waiting=${pool.waitingCount}`);

        client.release();
    } catch (err) {
        const error = err as Error;
        console.error('[Prisma] ❌ Connection failed:', {
            message: error.message,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
        });
        // Don't throw - let app start but log the error
    }
};

// Run health check (non-blocking)
testConnection().catch(console.error);

// -----------------------------------------------------------------------------
// 8. Graceful Shutdown (Critical for production)
// -----------------------------------------------------------------------------

let isShuttingDown = false;

const gracefulShutdown = async (signal: string): Promise<void> => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`[Prisma] Received ${signal}, closing connections...`);

    try {
        await Promise.all([
            prisma.$disconnect(),
            pool.end(),
        ]);
        console.log('[Prisma] ✅ Connections closed gracefully');
    } catch (err) {
        const error = err as Error;
        // Ignore "end called twice" errors
        if (!error.message?.includes('end on pool more than once')) {
            console.error('[Prisma] ⚠️ Shutdown error:', error.message);
        }
    }
};

// Register shutdown handlers
process.on('SIGINT', async () => {
    await gracefulShutdown('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await gracefulShutdown('SIGTERM');
    process.exit(0);
});

process.on('beforeExit', async () => {
    await gracefulShutdown('beforeExit');
});

// -----------------------------------------------------------------------------
// 9. Exports
// -----------------------------------------------------------------------------

export default prisma;
export { pool };

// Optional: Export a function to check pool health at runtime
export const getPoolStats = () => ({
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
});
