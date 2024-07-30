const { google } = require('googleapis');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const path = require('path');
const credentials_content = require('./info/client_secret.json');
const port = 4780; // don't modify
credentials = credentials_content.web;
const TOKEN_PATH = path.join(__dirname, 'token.json');
const pass_message = [];
var pass;
var response_message;
const app = express();

app.use(cors());
app.use(express.json());

async function loadToken() {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return reject(err);
      resolve(JSON.parse(token));
    });
  });
}

const oauth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('Error retrieving access token', err);
      return res.status(500).send('Authentication failed');
    }
    //console.log("token: ", token);
    oauth2Client.setCredentials(token);
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      res.send('Authentication successful! Token stored in token.json');
    });
  });
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);

  if (fs.existsSync(TOKEN_PATH)) {
    //console.log("OP2_IN");
    loadToken().then(token => {
      //console.log("token: ", token);
      oauth2Client.setCredentials(token);
      //console.log("OP2_end");
      retrieveEmails();

    }).catch(err => {
      console.error('Error loading token:', err);
    });
  } else {
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    console.log('Authorize this app by visiting this url:', authorizationUrl);

  }
});

app.get('/data', (req,res)=>{
  res.setHeader('Content-Type', 'application/json');
  res.json({message: response_message});
  console.log("Pass_data to extension");
});

app.post('/shutdown', (req,res)=>{
  res.send('closing the server');
  server.close(()=>{
    console.log(`closing the port ${port}`);
  });
});

async function retrieveEmails() {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  try {
    //console.log("in");
    const start_time = new Date().getTime();
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: `after:${Math.floor(start_time/1000)-86400}`, //在目前24小時之前的message都會收到
      maxResults: 10 // Optional: Limit the number of results
    });
    console.log("now:", new Date());
    //console.log("res: ", res);
    const messages = res.data.messages || [];
    if (messages.length) {
        console.log('Messages:');
        for (const message of messages) {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });
          const emailData = msg.data;
          //const parts = emailData.payload.parts || [];
          //let body = '';

          /*
          for (const part of parts) {
            console.log("MIME_type: ", part.mimeType);
            if (part.mimeType === 'text/plain') {
              body = Buffer.from(part.body.data, 'base64').toString('utf8');
              break;
            } else if (part.mimeType === 'text/html') {
              // 如果需要获取HTML内容，处理方式类似
              body = Buffer.from(part.body.data, 'base64').toString('utf8');
              break;
            }
          }
          */
          if(emailData.snippet){
            console.log("e-mail.snippnet: ", emailData.snippet);
            pass_message.push(emailData.snippet);
          }
          console.log(`Message ID: ${message.id}`);
          //console.log(`Body: ${body || 'No body available'}`);
          //console.log(`Snippet: ${emailData.snippet}`);
        };
        console.log("message_unpush: ", pass_message);
        pass = pass_message.toString();//換行符號
        pass += " 請幫我用繁體中文條列式摘要他們,請在條列式的回答中後面新增他們是否為廣告訊息";
        console.log("~");
        console.log("pass: ", pass);


        fetch('http://localhost:3000/ask-chatgpt', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: pass}),
        })
        .then(response => (
            response.json()
        ))
        .then(data => {
            console.log("data: ", data);
            response_message = data.answer;
            console.log("response_messgae: ", response_message);
            //document.getElementById('response').textContent = data.answer || 'No response from ChatGPT';
        })
        .catch(error => {
            console.error('Error:', error);
            //document.getElementById('response').textContent = 'Failed to fetch data';
        });

    } else {
      console.log('No messages found.');
    }
  } catch (error) {
    console.error('Error retrieving emails:', error);
  }
}
