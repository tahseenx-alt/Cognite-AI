import express from 'express'

const app = express();
 PORT = 5001;
app.listen(`Server is listening on http://localhost:${PORT}`);

app.get('/api', (req,res)=>{
  res.send('Cognito AI Kitchen is Open!');
})