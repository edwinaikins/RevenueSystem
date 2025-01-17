const db = require("../config/db");


exports.showBusinessBillReportPage = (req, res) => {
    res.render("businessBillReport")
}

exports.showPropertyBillReportPage = (req, res) => {
    res.render("propertyBillReport")
}

exports.showSignageBillReportPage = (req, res) => {
    res.render("signageBillReport")
}


exports.showCollectorBusinessBillReportPage = (req, res) => {
    res.render("collectorBusinessBillsReport")
}

exports.showCollectorPropertyBillReportPage = (req, res) => {
    res.render("collectorPropertyBillsReport")
}

exports.showCollectorSignageBillReportPage = (req, res) => {
    res.render("collectorSignageBillsReport")
}

exports.showCollectorBusinessSummaryReportPage = (req, res) => {
    res.render("collectorBusinessSummaryReport")
}

exports.showCollectorPropertySummaryReportPage = (req, res) => {
    res.render("collectorPropertySummaryReport")
}

exports.showCollectorSignageSummaryReportPage = (req, res) => {
    res.render("collectorSignageSummaryReport")
}