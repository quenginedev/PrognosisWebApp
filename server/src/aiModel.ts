import { config } from './config'
import OpenAI from 'openai'

export const useAiModel = () => {
  const apiKey = config.openAiApiKey
  if (!apiKey) throw new Error('OpenAI API key is missing')
  const aiInstance = new OpenAI({ apiKey })

  


  const diagnoseSymptopms = async (initialMessage: string) => {
    const systemInstructions = `The Json below wrapped is the initial prognosis of an individual. 
  Evaluate the symptoms in the initialMessage prognosis and add them to a property called currentSymptopms node which is an array.  
  You are to give all available multichoice or single questions to ask to get to the individuals 
  diagnosis as quickly as possible in a questions node. Each question should comes with it's 
  corresponding answers and associated symptom to the question that can be added to the 
  currentSymptopms node. return me only the json using the example response format below.

  // Inital request
  {
    "initialMessage": ${initialMessage},
  }


  // Example response format
  {
    "currentSymptoms": ['***', '***', ...],
    "questions": [
      {
        "question": "***",
        "type": "single",
        "answers": [
          { "answer": "***", "symptom": "***" }, 
          { "answer": "***", "symptom": "***" }, 
          { "answer": "***", "symptom": "***" }, 
          { "answer": "***", "symptom": "***" }, 
        ]
      },
      {
        "question": "***",
        "type": "multiple",
        "answers": [
          { "answer": "***", "symptom": "***" }, 
          { "answer": "***", "symptom": "***" }, 
          { "answer": "***", "symptom": "***" }, 
          { "answer": "***", "symptom": "***" }, 
          { "answer": "***", "symptom": "***" }, 
        ]
      },
      ...
    }
  `
    const completion = await aiInstance.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: "system", content: systemInstructions },
      ]
    })
    const jsonStr = completion.choices[0].message.content
    if(!jsonStr) throw new Error('No diagnosis found')
    const diagnosis = JSON.parse(jsonStr)
    return diagnosis
  }

  return {
    diagnoseSymptopms
  }
}