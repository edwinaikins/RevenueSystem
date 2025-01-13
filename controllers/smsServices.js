require("dotenv").config;

const apiKey = process.env.APIKEY
const username = process.env.USERNAME
const senderId = process.env.SENDERID

// Function to send SMS using the external API

const sendSMS = async (recipient, message, msgid) => {
  try {
    const requestData = {
      senderid: 'NAMA',
      destinations: [
        {
          destination: recipient,
          message: message,
          msgid: msgid,
          smstype: 'text'
        }
      ]
    };
    console.log(requestData)

    const response = await fetch('https://frogapi.wigal.com.gh/api/v3/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey,
        'USERNAME': username
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (data.status === 'success') {
      console.log('SMS sent successfully:', data);
      return true;
    } else {
      console.error('Failed to send SMS:', data);
      return false;
    }
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    throw error;
  }
};

module.exports = { sendSMS };
