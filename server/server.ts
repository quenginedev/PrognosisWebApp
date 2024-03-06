import express from 'express'
import { useAiModel } from './src/aiModel'
import bodyParser from 'body-parser'

const app = express()
const port = 3000

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json({
    message: 'Welocme to the API',
  })
})

app.post('/diagnose', async (req, res) => {
  const { diagnoseSymptopms } = useAiModel()
  const initialMessage = req.body.initialMessage
  const diagnosis = await diagnoseSymptopms(initialMessage)
  res.json(diagnosis)
})


app.listen(port, () => {
  console.log(`listening on port ${port}`)
})