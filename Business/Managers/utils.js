function send400(message, res)
{
  res.status(400).json({
    status: '400',
    statustext: 'Failed',
    errors: [{
      messages: [
        message
      ]
    }]
  });
}

module.exports = {
    send400
}
