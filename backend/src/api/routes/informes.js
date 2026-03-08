import express from 'express';
import pool from '../../config/database.js';
import { asyncHandler } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

/**
 * GET /api/informes/cuotas-sociales
 * Reporte de cuotas sociales pagadas en un periodo
 */
router.get('/cuotas-sociales', asyncHandler(async (req, res) => {
    const { mes, anio, lugar_id } = req.query;
    
    let sql = `
        SELECT 
            l.nombre as lugar_nombre,
            pr.nombre_completo as practicante_nombre,
            ps.mes_abono,
            ps.monto,
            ps.fecha_pago,
            ps.observaciones
        FROM PagoSocio ps
        JOIN Socio s ON ps.socio_id = s.id
        JOIN Practicante pr ON s.practicante_id = pr.id
        JOIN Lugar l ON s.lugar_id = l.id
        WHERE ps.deleted_at IS NULL AND ps.fecha_pago IS NOT NULL
    `;
    const params = [];

    if (mes && anio) {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const mesAbono = `${monthNames[mes - 1]} ${anio}`;
        sql += ' AND ps.mes_abono = ?';
        params.push(mesAbono);
    }

    if (lugar_id) {
        sql += ' AND (l.id = ? OR l.parent_id = ?)';
        params.push(lugar_id, lugar_id);
    }

    sql += ' ORDER BY l.nombre, pr.nombre_completo';

    const [rows] = await pool.execute(sql, params);
    res.json({ data: rows });
}));

/**
 * GET /api/informes/padron-socios-pagos
 * Reporte detallado de socios con cuota pagada
 */
router.get('/padron-socios-pagos', asyncHandler(async (req, res) => {
    const { mes, anio, lugar_id } = req.query;
    
    if (!mes || !anio) {
        throw new AppError('Mes y año son obligatorios', 400);
    }

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mesAbono = `${monthNames[mes - 1]} ${anio}`;

    let sql = `
        SELECT 
            s.id as sistema_id,
            s.numero_socio,
            pr.nombre_completo,
            pr.dni,
            pr.fecha_nacimiento,
            pr.telefono,
            pr.email,
            pr.direccion,
            l.nombre as sede_nombre,
            ps.mes_abono,
            ps.monto,
            ps.fecha_pago,
            ps.estado_desconocido,
            CASE 
                WHEN ps.id IS NULL THEN 'Pendiente'
                WHEN ps.estado_desconocido = 1 THEN 'Relación Directa'
                WHEN ps.monto >= l.cuota_social_general OR ps.monto >= l.cuota_social_descuento THEN 'Completa'
                ELSE 'Parcial'
            END as tipo_pago,
            CASE 
                WHEN ps.id IS NULL THEN 'NO ABONÓ AÚN'
                WHEN ps.estado_desconocido = 1 THEN '¿ABONÓ DIRECTO?'
                WHEN ps.monto = l.cuota_social_general THEN 'General'
                WHEN ps.monto = l.cuota_social_descuento THEN 'Bonificada/Descuento'
                ELSE 'Manual/Ajustada'
            END as categoria_cuota
        FROM Socio s
        JOIN Practicante pr ON s.practicante_id = pr.id
        JOIN Lugar l ON s.lugar_id = l.id
        -- Unimos con PagoSocio para el mes específico
        LEFT JOIN PagoSocio ps ON ps.socio_id = s.id 
            AND ps.mes_abono = ? 
            AND ps.deleted_at IS NULL
        -- Solo incluimos socios que tengan algún abono activo o asistencia en ese mes/lugar
        -- O simplemente todos los socios registrados en esa sede (según preferencia usual de padrón)
        WHERE s.deleted_at IS NULL
    `;
    const params = [mesAbono];

    if (lugar_id) {
        sql += ' AND (l.id = ? OR l.parent_id = ?)';
        params.push(lugar_id, lugar_id);
    }

    sql += ' ORDER BY l.nombre, pr.nombre_completo';

    const [rows] = await pool.execute(sql, params);
    res.json({ data: rows });
}));

/**
 * GET /api/informes/alquiler-espacios
 * Reporte de pagos por alquiler de espacios (Club)
 */
router.get('/alquiler-espacios', asyncHandler(async (req, res) => {
    const { fecha_inicio, fecha_fin, lugar_id } = req.query;

    let sql = `
        SELECT 
            l.nombre as lugar_nombre,
            c.fecha,
            c.hora,
            c.hora_fin,
            a.nombre as actividad_nombre,
            c.monto_referencia_espacio as monto_esperado,
            c.monto_pago_espacio as monto_pagado,
            c.fecha_pago_espacio as fecha_pago,
            (IFNULL(c.monto_referencia_espacio, 0) - IFNULL(c.monto_pago_espacio, 0)) as diferencia
        FROM Clase c
        JOIN Lugar l ON c.lugar_id = l.id
        JOIN Actividad a ON c.actividad_id = a.id
        WHERE c.deleted_at IS NULL AND c.pago_espacio_realizado = 1
    `;
    const params = [];

    if (fecha_inicio) {
        sql += ' AND c.fecha >= ?';
        params.push(fecha_inicio);
    }
    if (fecha_fin) {
        sql += ' AND c.fecha <= ?';
        params.push(fecha_fin);
    }
    if (lugar_id) {
        sql += ' AND (l.id = ? OR l.parent_id = ?)';
        params.push(lugar_id, lugar_id);
    }

    sql += ' ORDER BY l.nombre, c.fecha, c.hora';

    const [rows] = await pool.execute(sql, params);
    res.json({ data: rows });
}));

/**
 * GET /api/informes/consolidado-sede
 * Informe fusionado de Cuotas y Alquileres
 */
router.get('/consolidado-sede', asyncHandler(async (req, res) => {
    const { mes, anio, lugar_id } = req.query;
    if (!lugar_id) throw new AppError('Debe seleccionar una sede para el informe consolidado', 400);

    // 1. Obtener Cuotas Sociales (mismo filtro inclusivo de hijos)
    let sqlCuotas = `
        SELECT l.nombre as lugar_nombre, pr.nombre_completo, ps.monto, ps.mes_abono
        FROM PagoSocio ps
        JOIN Socio s ON ps.socio_id = s.id
        JOIN Practicante pr ON s.practicante_id = pr.id
        JOIN Lugar l ON s.lugar_id = l.id
        WHERE ps.deleted_at IS NULL AND ps.fecha_pago IS NOT NULL
        AND (l.id = ? OR l.parent_id = ?)
    `;
    const paramsCuotas = [lugar_id, lugar_id];

    if (mes && anio) {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        paramsCuotas.push(`${monthNames[mes - 1]} ${anio}`);
        sqlCuotas += ' AND ps.mes_abono = ?';
    }

    // 2. Obtener Alquileres (mismo filtro inclusivo)
    const firstDay = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const lastDay = new Date(anio, mes, 0).toISOString().split('T')[0];
    
    let sqlAlquileres = `
        SELECT l.nombre as lugar_nombre, c.fecha, c.hora, c.hora_fin, a.nombre as actividad_nombre, c.monto_pago_espacio as monto
        FROM Clase c
        JOIN Lugar l ON c.lugar_id = l.id
        JOIN Actividad a ON c.actividad_id = a.id
        WHERE c.deleted_at IS NULL AND c.pago_espacio_realizado = 1
        AND (l.id = ? OR l.parent_id = ?)
        AND c.fecha >= ? AND c.fecha <= ?
    `;
    const paramsAlquileres = [lugar_id, lugar_id, firstDay, lastDay];

    const [cuotas] = await pool.execute(sqlCuotas, paramsCuotas);
    const [alquileres] = await pool.execute(sqlAlquileres, paramsAlquileres);

    res.json({ 
        data: {
            cuotas,
            alquileres
        } 
    });
}));

/**
 * GET /api/informes/balance-mensual
 * Informe de flujo de caja completo y rentabilidad por hora
 */
router.get('/balance-mensual', asyncHandler(async (req, res) => {
    const { mes, anio, lugar_id, criterio = 'pago' } = req.query;
    if (!mes || !anio) throw new AppError('Mes y año son obligatorios', 400);

    const firstDay = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const lastDay = new Date(anio, mes, 0).toISOString().split('T')[0];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesAbonoStr = `${monthNames[mes - 1]} ${anio}`;

    // 1. Ingresos por Abonos (Clases)
    let sqlAbonos = `
        SELECT SUM(p.monto) as total
        FROM Pago p
        JOIN Abono a ON p.abono_id = a.id
        WHERE p.deleted_at IS NULL
    `;
    const paramsAbonos = [];
    if (criterio === 'mes') {
        sqlAbonos += ' AND a.mes_abono = ?';
        paramsAbonos.push(mesAbonoStr);
    } else {
        sqlAbonos += ' AND p.fecha >= ? AND p.fecha <= ?';
        paramsAbonos.push(firstDay, lastDay);
    }
    if (lugar_id) {
        sqlAbonos += ' AND (a.lugar_id = ? OR EXISTS (SELECT 1 FROM Lugar WHERE id = a.lugar_id AND parent_id = ?))';
        paramsAbonos.push(lugar_id, lugar_id);
    }
    const [[{ total: ingresosAbonos }]] = await pool.execute(sqlAbonos, paramsAbonos);

    // 2. Cuotas Sociales Recibidas (Ingresos)
    let sqlCuotas = `
        SELECT SUM(p.monto) as total
        FROM Pago p
        JOIN PagoSocio ps ON p.pago_socio_id = ps.id
        JOIN Socio s ON ps.socio_id = s.id
        JOIN Lugar l ON s.lugar_id = l.id
        WHERE p.deleted_at IS NULL
    `;
    const paramsCuotas = [];
    if (criterio === 'mes') {
        sqlCuotas += ' AND ps.mes_abono = ?';
        paramsCuotas.push(mesAbonoStr);
    } else {
        sqlCuotas += ' AND p.fecha >= ? AND p.fecha <= ?';
        paramsCuotas.push(firstDay, lastDay);
    }
    if (lugar_id) {
        sqlCuotas += ' AND (l.id = ? OR l.parent_id = ?)';
        paramsCuotas.push(lugar_id, lugar_id);
    }
    const [[{ total: ingresosCuotas }]] = await pool.execute(sqlCuotas, paramsCuotas);

    // 2b. Egresos por Cuotas Sociales (Lo que el profesor pagó al club)
    let sqlEgresosCuotas = `
        SELECT SUM(ps.monto) as total
        FROM PagoSocio ps
        JOIN Socio s ON ps.socio_id = s.id
        JOIN Lugar l ON s.lugar_id = l.id
        WHERE ps.deleted_at IS NULL AND ps.estado_desconocido = 0
    `;
    const paramsEgresosCuotas = [];
    if (criterio === 'mes') {
        sqlEgresosCuotas += ' AND ps.mes_abono = ?';
        paramsEgresosCuotas.push(mesAbonoStr);
    } else {
        sqlEgresosCuotas += ' AND ps.fecha_pago >= ? AND ps.fecha_pago <= ?';
        paramsEgresosCuotas.push(firstDay, lastDay);
    }
    if (lugar_id) {
        sqlEgresosCuotas += ' AND (l.id = ? OR l.parent_id = ?)';
        paramsEgresosCuotas.push(lugar_id, lugar_id);
    }
    const [[{ total: egresosCuotas }]] = await pool.execute(sqlEgresosCuotas, paramsEgresosCuotas);

    // 3. Otros Movimientos de Caja (Caja siempre se filtra por fecha real)
    let sqlMovCaja = `
        SELECT tipo, SUM(monto) as total
        FROM MovimientoCaja
        WHERE deleted_at IS NULL AND fecha >= ? AND fecha <= ?
        GROUP BY tipo
    `;
    const [movimientos] = await pool.execute(sqlMovCaja, [firstDay, lastDay]);
    const otrosIngresos = movimientos.find(m => m.tipo === 'ingreso')?.total || 0;
    const otrosEgresos = movimientos.find(m => m.tipo === 'egreso')?.total || 0;

    // 4. Egresos por Alquiler de Espacios (Costo para el profesor)
    let sqlAlquiler = `
        SELECT SUM(monto_pago_espacio) as total
        FROM Clase
        WHERE deleted_at IS NULL AND pago_espacio_realizado = 1
    `;
    const paramsAlquiler = [];
    if (criterio === 'mes') {
        sqlAlquiler += ' AND fecha >= ? AND fecha <= ?'; // Clases que ocurrieron en el mes
        paramsAlquiler.push(firstDay, lastDay);
    } else {
        sqlAlquiler += ' AND fecha_pago_espacio >= ? AND fecha_pago_espacio <= ?'; // Pagos realizados en el mes
        paramsAlquiler.push(firstDay, lastDay);
    }
    if (lugar_id) {
        sqlAlquiler += ' AND (lugar_id = ? OR EXISTS (SELECT 1 FROM Lugar WHERE id = Clase.lugar_id AND parent_id = ?))';
        paramsAlquiler.push(lugar_id, lugar_id);
    }
    const [[{ total: egresosAlquiler }]] = await pool.execute(sqlAlquiler, paramsAlquiler);

    // 5. Cálculo de Horas de Clase (Las horas trabajadas siempre son por mes calendario)
    let sqlHoras = `
        SELECT SUM(TIME_TO_SEC(TIMEDIFF(hora_fin, hora))) / 3600 as horas
        FROM Clase
        WHERE deleted_at IS NULL AND fecha >= ? AND fecha <= ?
    `;
    const paramsHoras = [firstDay, lastDay];
    if (lugar_id) {
        sqlHoras += ' AND (lugar_id = ? OR EXISTS (SELECT 1 FROM Lugar WHERE id = Clase.lugar_id AND parent_id = ?))';
        paramsHoras.push(lugar_id, lugar_id);
    }
    const [[{ horas: totalHoras }]] = await pool.execute(sqlHoras, paramsHoras);

    const totalIngresos = parseFloat(ingresosAbonos || 0) + parseFloat(ingresosCuotas || 0) + parseFloat(otrosIngresos || 0);
    const totalEgresos = parseFloat(egresosAlquiler || 0) + parseFloat(egresosCuotas || 0) + parseFloat(otrosEgresos || 0);
    const balanceNeto = totalIngresos - totalEgresos;
    const gananciaPorHora = totalHoras > 0 ? balanceNeto / totalHoras : 0;

    res.json({
        data: {
            periodo: mesAbonoStr,
            criterio,
            ingresosAbonos: parseFloat(ingresosAbonos || 0),
            ingresosCuotas: parseFloat(ingresosCuotas || 0),
            otrosIngresos: parseFloat(otrosIngresos || 0),
            egresosAlquiler: parseFloat(egresosAlquiler || 0),
            egresosCuotas: parseFloat(egresosCuotas || 0),
            otrosEgresos: parseFloat(otrosEgresos || 0),
            totalIngresos,
            totalEgresos,
            balanceNeto,
            totalHoras: parseFloat(totalHoras || 0),
            gananciaPorHora
        }
    });
}));

export default router;
