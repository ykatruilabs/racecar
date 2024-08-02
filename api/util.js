const { fetch, setGlobalDispatcher, Agent} = require('undici');
setGlobalDispatcher(new Agent({connect: { timeout: 20_000 }}));
async function insertAirtable(data) {

  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer patR7Sm9cgrYzgC7Q.fa8177d176b4b85be651bde35d1e49a088a4f2c230f5ce60846b98fc2ac4d5b0");
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "records": [data]
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  await fetch("https://api.airtable.com/v0/appA8cfL6YkqZphwW/tblX4kt59uDeNzo3v", requestOptions)
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));

}

module.exports = {
  insertAirtable,
}
