const serverless = require("serverless-http");
const express = require("express");
const { insertAirtable } = require("./util");
const app = express();

app.get("/", (_, res) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.post("/user_frame_data", async (req, res) => {
  const data = JSON.parse(req.body)
  switch (data.type) {
    case "INSERT": {
      await insertAirtable({
        "fields": {
          "Frame ID": data.record.frame_id.toString(),
          "Selected": data.record.results.option,
          "Frame User Address": data.record.frame_user_address,
          "Frame User ID": data.record.frame_user_id.toString(),
          "Frame ID": data.record.frame_id,
          "Frame User Name": data.record.frame_user_name,
          "Frame User Display Name": data.record.frame_user_display_name,
          "Frame Profile Picture": data.record.frame_profile_picture,
        }
      }).then(res => console.log(JSON.stringify(res)))
        .catch(console.error)

      return res.status(201).json({
        message: "ok",
      });
    }
    default: {
      return res.status(200).json({
        message: `invalid user frame data type, ${data.type}`,
      });
    }
  }

});

app.use((req, res) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
