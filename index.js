const app = require("./app");
require("dotenv").config();
app.listen(process.env.PORT, (req, res) => {
  console.log("server is up and running http://localhost:" + process.env.PORT);
});
