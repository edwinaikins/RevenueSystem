const db = require("../config/db");


exports.showBusinessBillReportPage = (req, res) => {
    res.render("businessBillReport")
}

exports.showPropertyBillReportPage = (req, res) => {
    res.render("propertyBillReport")
}

exports.showCollectorBusinessBillReportPage = (req, res) => {
    res.render("collectorBusinessBillsReport")
}

exports.showCollectorPropertyBillReportPage = (req, res) => {
    res.render("collectorPropertyBillsReport")
}