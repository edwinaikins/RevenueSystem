const db = require("../config/db")

exports.showDasboard = (req, res) => {
    res.render("dashboard",{
        layout: false, 
        pageTitle: 'Dashboard',
    })
}

exports.getKPIS = async (req, res) => {
    const { year } = req.query;

    try{
        const query = `
     SELECT 
      (SELECT COUNT(*) FROM bills WHERE year = ?) AS total_bills,
      (SELECT SUM(total_amount) + COALESCE(SUM(arrears), 0) 
       FROM bills 
       WHERE year = ?) AS total_revenue,
      (SELECT SUM(amount) FROM payments WHERE payment_status = 'Approved' AND YEAR(payment_date) = ?) AS total_collected,
      ((SELECT SUM(total_amount) + COALESCE(SUM(arrears), 0) 
        FROM bills 
        WHERE year = ?) - 
       (SELECT SUM(amount) FROM payments WHERE payment_status = 'Approved' AND YEAR(payment_date) = ?)) AS total_outstanding;`;

       const [result] = await db.query(query,[year, year, year, year, year])
       res.json(result[0])
    }catch(error){
        res.status(500).json({msg: error})
    } 
   
  }

  exports.getRevenueSources = async (req, res) => {
    const { year } = req.query;

    try{
        const query = `
     SELECT 
      entity_type, 
      SUM(total_amount + COALESCE(arrears, 0)) AS total_amount 
    FROM bills 
    WHERE year = ?
    GROUP BY entity_type;`;

       const [result] = await db.query(query,[year])
       res.json(result)
    }catch(error){
        res.status(500).json({msg: error})
    } 
   
  }

  exports.getBillDistribution = async (req, res) => {
    const { year } = req.query;

    try{
        const printedQuery = `
        SELECT COUNT(*) AS count
        FROM bills
        WHERE year = ?;
      `;
  
      const servedQuery = `
        SELECT COUNT(*) AS count
        FROM collector_bill_assignment
        WHERE distribution_status = 'Bill Served'
      `;
  
      const servedValueQuery = `
        SELECT SUM(b.total_amount + IFNULL(b.arrears, 0)) AS total_served_value
        FROM collector_bill_assignment cba
        JOIN bills b ON cba.bill_id = b.bill_id
        WHERE cba.distribution_status = 'Bill Served'
          AND b.year = ?
      `;

        const [printedResult] = await db.query(printedQuery, [year]);
        const [servedResult] = await db.query(servedQuery, [year]);
        const [servedValueResult] = await db.query(servedValueQuery, [year]);

        // Response Data
        const response = {
        Printed: printedResult[0].count || 0,
        Served: servedResult[0].count || 0,
        ServedValue: parseFloat(servedValueResult[0].total_served_value || 0),
        };

       res.json(response)
    }catch(error){
        res.status(500).json({msg: error})
    } 
   
  }

  exports.getRevenueTrends = async (req, res) => {
    const { year } = req.query;

    try{
        const query = `
        SELECT 
            MONTH(p.payment_date) AS month,
            SUM(p.amount) AS total_revenue
        FROM payments p
        WHERE p.payment_status = 'Approved' AND YEAR(p.payment_date) = ?
        GROUP BY MONTH(p.payment_date)
        ORDER BY month;
    `;

       const [result] = await db.query(query,[year])
       res.json(result)
    }catch(error){
        res.status(500).json({msg: error})
    } 
   
  }

  exports.getAgentProductivity = async (req, res) => {
    const { year } = req.query;

    try{
        const query = `
        SELECT 
            rc.name AS collector_name,
            COUNT(cba.bill_id) AS bills_assigned,
            SUM(b.total_amount + COALESCE(b.arrears, 0)) AS total_bill_value,
            COUNT(DISTINCT CASE WHEN p.payment_status = 'Approved' THEN b.bill_id END) AS bills_collected,
            COUNT(DISTINCT CASE WHEN cba.distribution_status = 'Bill Served' THEN cba.bill_id END) AS bills_served
        FROM collector_bill_assignment cba
        JOIN revenue_collector rc ON cba.collector_id = rc.collector_id
        JOIN bills b ON cba.bill_id = b.bill_id
        LEFT JOIN payments p ON b.bill_id = p.bill_id
        WHERE b.year = ?
        GROUP BY rc.name;
    `;

       const [result] = await db.query(query,[year])
       res.json(result)
    }catch(error){
        res.status(500).json({msg: error})
    } 
   
  }