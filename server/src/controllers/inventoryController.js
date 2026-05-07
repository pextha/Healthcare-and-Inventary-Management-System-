import { connectMSSQL, sql } from '../config/sqlDatabase.js';

export const getSmartReorder = async (req, res) => {
    try {
        const pool = await connectMSSQL();
        
        // Execute the BI stored procedure for Demand Forecasting and Reorder
        const result = await pool.request()
            .execute('sp_DemandForecastingAndReorder');
            
        res.status(200).json({
            success: true,
            data: result.recordset,
            message: 'Smart reorder forecasting fetched successfully'
        });
    } catch (error) {
        console.error('Error in smart reorder fetching:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory forecasts',
            error: error.message
        });
    }
};
