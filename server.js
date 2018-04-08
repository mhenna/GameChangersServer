const express = require('express')
const app = express();

app.get('/', (req, res) => res.send("etekel 3ala allah"))
app.listen(3000, () => console.log("Game Changers up, Listening on port 3000, inshallah."))
