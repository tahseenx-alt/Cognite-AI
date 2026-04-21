import express from 'express'
import cors from 'cors';


const app = express();
const PORT = 5002


app.use(cors());
app.use(express.json());

app.get('/api', (req,res)=>{
  res.send('Cognito AI Kitchen is Open!');
})

app.post('/api/test', (req,res)=>{
  const ReceivedData = req.body;
  console.log("Data Received from the user is " , ReceivedData);
  res.json({
    status:"Success",
    message:"Server Received your Data",
    data:ReceivedData
  });
})


app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});