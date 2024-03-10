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

app.post('/follow-up', async (req, res) => {
  const { getFollowUp } = useAiModel()
  const prognosis = req.body
  const followUp = await getFollowUp(prognosis)
  console.log({followUp})
  res.json(followUp)
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})