const db = require("../config/db");

exports.showSettingsPage = async (req, res) => {
    try {
        const [feeFixings] = await db.query('SELECT fee_fixing_id, fee_type FROM fee_fixings');
        const [businessTypes] = await db.query('SELECT business_type_id, business_type FROM business_types');
        const [locations] = await db.query('SELECT location_id, location FROM locations');
        console.log(businessTypes);
        res.render("settings", {
            layout: false, 
            pageTitle: 'Settings', 
             feeFixings, 
             businessTypes, 
             locations });
    } catch (error) {
        console.error('Error fetching options:', error);
        res.status(500).send('Server error');
    }
}

exports.addBusinessType = async (req, res) => {
    const { businessType } = req.body;
    console.log(req.body)
    console.log(businessType)
  
  try{
    const query = 'INSERT INTO business_types (business_type) VALUES (?)';
    [result] = await db.query(query, [businessType])
    res.redirect('/settings');
  }
  catch(error){
    console.error(error);
    res.status(500).send('Failed to add business type');
  }

}

exports.addLocation = async (req, res) => {
    const { location } = req.body;
  const query = 'INSERT INTO locations (name) VALUES (?)';
  db.query(query, [location], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to add location');
    }
    res.redirect('/settings');
  });
}

exports.addFeefixing = async (req, res) => {
    const { fee_type, amount } = req.body;
  const query = 'INSERT INTO fees (name, amount) VALUES (?, ?)';
  db.query(query, [fee_type, amount], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to add fee');
    }
    res.redirect('/settings');
  });
}

exports.addPropertyType = async (req, res) => {
  const { finance_code, property_type } = req.body;
try{
  const query = 'INSERT INTO property_types (finance_code, property_type) VALUES (?, ?)';
  [result] = await db.query(query, [finance_code, property_type])
  res.json({msg: "Success"});
}
catch(error){
  console.error(error);
  res.status(500).send('Failed to add property type');
}

}

exports.updateBusinessType = async (req, res) => {

}

exports.updateLocation = async (req, res) => {
    
}

exports.updateFeefixing = async (req, res) => {
    
}

exports.deleteBusinessType = async (req, res) => {

}

exports.deleteLocation = async (req, res) => {
    
}

exports.deleteFeefixing = async (req, res) => {
    
}