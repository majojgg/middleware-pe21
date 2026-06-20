import {Request, Response, Router} from 'express';

// public router = 
    
const router = Router();

// Post: estudianteID, materias (Arreglo), periodoID - registrar matrículo
router.post('/', (req: Request, res: Response, next) =>{
    // const body = req.body;
    const {estudianteID, materias, periodoID} = req.body;


    if(!estudianteID || !materias.length || !periodoID) {
        console.error('No existe el id del estudiante')
        res.status(400).json(
            {
                error: 'Campos requeridos: estudianteID. materias, periodoID'
            }

        
        )
    }

    res.status(201).json({
        version: 'v1',
        message: {
            estudianteID, materias, periodoID
        }

    })
    

})

export default router;