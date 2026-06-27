import { type Request, type Response, type NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET ?? '';

function base64urlDecode(str: string): string {
    return Buffer.from(
        str.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
    ).toString('utf8');
}

export function requireJwt(
    req: Request,
    res: Response,
    next: NextFunction
): void {

    const authHeader = req.headers['authorization'] ?? '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : '';

    if (!token) {
        res.status(401).json({
            error: 'Token ausente'
        });
        return;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
        res.status(401).json({
            error: 'Token malformado'
        });
        return;
    }

    const headerB64 = parts[0]!;
    const payloadB64 = parts[1]!;
    const sigB64 = parts[2]!;

    try {

        // Verificar algoritmo
        const header = JSON.parse(base64urlDecode(headerB64));

        if (header.alg !== 'HS256') {
            res.status(401).json({
                error: 'Algoritmo no permitido'
            });
            return;
        }

        // Recalcular firma
        const expectedSig = createHmac('sha256', JWT_SECRET)
            .update(`${headerB64}.${payloadB64}`)
            .digest('base64url');

        const receivedSig = Buffer.from(sigB64);
        const expectedSigBuffer = Buffer.from(expectedSig);

        // Evitar que timingSafeEqual lance excepción
        if (receivedSig.length !== expectedSigBuffer.length) {
            res.status(401).json({
                error: 'Firma invalida'
            });
            return;
        }

        if (!timingSafeEqual(receivedSig, expectedSigBuffer)) {
            res.status(401).json({
                error: 'Firma invalida'
            });
            return;
        }

        // Leer claims
        const claims = JSON.parse(base64urlDecode(payloadB64));

        const now = Math.floor(Date.now() / 1000);

        if (claims.exp && claims.exp < now) {
            res.status(401).json({
                error: 'Token expirado'
            });
            return;
        }

        if (!claims.sub) {
            res.status(401).json({
                error: 'Claim sub ausente'
            });
            return;
        }

        (req as Request & {
            user?: {
                sub: string;
                scope: string;
            };
        }).user = {
            sub: claims.sub,
            scope: claims.scope ?? ''
        };

        next();

    } catch {
        res.status(401).json({
            error: 'Token invalido'
        });
    }
}