const test = require('node:test')
const data = require('./testdata/insert.user_frame_data.json')
const { insertAirtable } = require('./util')

test("update.user_frame_data", async () => {

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
        .catch(err => console.log(JSON.stringify(err)))
    }
    default: {
      throw new Error(`invalid user frame data type, ${data.type}`)
    }
  }
})

