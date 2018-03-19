function send400(message, res)
{
  res.status(400).json({
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
