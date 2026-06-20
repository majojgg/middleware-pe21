import { Request, Response, Router } from 'express';

const router = Router();

const METODO_PAGO = [
    'Efectivo',
    'Transferencia',
    'Débito',
    'Crédito'
];

// Post: estudianteID, materias (Arreglo), periodoID, metodo_pago
router.post('/', (req: Request, res: Response) => {

    const { estudianteID, materias, periodoID, metodo_pago } = req.body;

    if (!estudianteID || !materias.length || !periodoID || !metodo_pago) {
        console.error('No existe el id del estudiante');

        res.status(400).json({
            error: 'Campos requeridos: estudianteID, materias, periodoID, metodo_pago'
        });

        return;
    }

    if (!METODO_PAGO.includes(metodo_pago)) {
        console.error('El metodo de pago insertado no es valido');

        res.status(400).json({
            error: 'El metodo de pago insertado debe ser: Efectivo, Transferencia, Débito o Crédito'
        });

        return;
    }

    res.status(201).json({
        version: 'v2',
        message: {
            estudianteID,
            materias,
            periodoID,
            metodo_pago
        }
    });
});

export default router;