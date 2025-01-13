const db = require("../config/db")
const { sendSMS } = require("./smsServices")

exports.sendBillSMS = async (req, res) => {
    let msgid = `BILL-`
    try{
        const [smsDetails] = await db.query(`SELECT * FROM sms WHERE status = "Pending"`)
        for(let i = 0; i < smsDetails.length; i++){
            msgid = `BILL-${smsDetails[i].bill_id}`
            console.log(msgid)
           await sendSMS(`0${smsDetails[i].recipient}`, smsDetails[i].message, msgid)
           const [status] = await db.query(`UPDATE sms SET status = "Delivered" WHERE bill_id = ?`, [smsDetails[i].bill_id])
           console.log(status)
        }
        res.json({msg: "SMS successfully submitted to API GateWay"})
    }catch(error){
        console.log(error)
    }
}