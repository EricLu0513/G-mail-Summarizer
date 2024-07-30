const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const child = exec('node e-mail.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`standard error: ${stderr}`);
    }
    console.log(`standard output: ${stdout}`);
  });

app.post('/ask-chatgpt', async (req, res) => {
    const { question } = req.body;
    console.log("question: ", question);//help user to check
    const my_key = require('./info/gpt.json');//get the individual key

    try {
        const {Configuration, OpenAIApi} = require("openai");
        const configuration = new Configuration({
        apiKey: my_key.secret_key,
        basePath: "https://api.chatanywhere.cn"
        });
        console.log('API Key:', configuration.apiKey);//check API.key whether correct
        //console.log('Base Path:', configuration.basePath);
        const openai = new OpenAIApi(configuration)
        //console.log("openai: ", openai);
        const response = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [{role: "user", content: question}],
        });

        console.log({ answer: response.data.choices[0].message.content})
        res.json({ answer: response.data.choices[0].message.content});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/shutdown', (req, res) => {
    fetch('http://localhost:4780/shutdown', {
        method: 'POST'
      })
      .then(response => response.text())
      .then(data => {
        console.log('Server Reply:', data);
      })
      .catch(error => {
        console.error('Request Error:', error);
      });
    res.send('Shutting down  all server ');
    setTimeout(() => {
        process.exit(0);
      }, 5000); // 延遲5秒
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
