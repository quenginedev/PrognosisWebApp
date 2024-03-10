import { config } from './config'
import OpenAI from 'openai'

export const useAiModel = () => {
  const apiKey = config.openAiApiKey
  if (!apiKey) throw new Error('OpenAI API key is missing')
  const aiInstance = new OpenAI({ apiKey })

  const createReponseFormat = (initialMessage: string) => `{
    "initialMessage": "${initialMessage}",
    "currentSymptoms": ["symptom1", "symptom2", ...],
    "questions": [
      {
        "question": "Question text",
        "type": "single/multiple",
        "answers": [
          { "answer": "Answer 1", "symptom": "Associated symptom 1" },
          { "answer": "Answer 2", "symptom": "Associated symptom 2" },
          ...
        ]
      },
      ...
    ]
  }`

  const createSystemInstructions = (initialMessage: string) => {
    return `Create a JSON object starting with the initial symptoms provided in the initialMessage. These symptoms should be analyzed and listed within a property named currentSymptoms, which is an array. Additionally, construct a comprehensive list of diagnostic questions, categorized as either "single choice" or "multiple choice", to help identify the individual's condition more accurately. Each question should include a series of potential answers, each paired with an associated symptom that, if selected, would be added to the currentSymptoms array. The final JSON object should only include these two properties, following the example format provided below.
    // Desired output format
    ${createReponseFormat(initialMessage)}
    This task requires extracting symptoms from the initial message, determining appropriate diagnostic questions, and formatting the response in a structured JSON object string. no yapping
      `
  }
  

  const createFollowUpInstructions = (payload: any) => {
    const prompt = `Analyze the provided symptoms in the initialMessage and currentSymptoms array to determine possible medical conditions the user might have. When the forcePossibleConditions property is true, generate a list of the top 5 to 10 potential medical conditions, considering the given symptoms. For each listed condition, include a 'risk level' indicating the severity (e.g., 'Low', 'Moderate', 'High') and advice on the urgency of seeking medical care (e.g., 'Immediate', 'Within 24 hours', 'Schedule a doctor's visit'). If the conditions require immediate hospitalization, specify this explicitly. Here's the revised format for your response:
    {
      "possibleConditions": [
        {
          "condition": "Condition 1",
          "confidence": 92,
          "riskLevel": "High/Moderate/Low",
          "advice": "Immediate hospital visit/Within 24 hours/Schedule a doctor's visit"
        },
        ...
      ],
      "followUpQuestions": [
        {
          "question": "Specific question text",
          "type": "single or multiple",
          "answers": [
            {"answer": "Option 1", "symptom": "Related symptom 1"},
            {"answer": "Option 2", "symptom": "Related symptom 2"},
            ...
          ]
        },
        ...
      ]
    }

    Ensure that if forcePossibleConditions is true, the possibleConditions array is populated with potential diagnoses based on the provided symptoms, and the followUpQuestions section should be empty. If forcePossibleConditions is not true or not specified, and the symptoms do not lead to a confident diagnosis, then populate the followUpQuestions with queries designed to garner more specific symptom information, leaving the possibleConditions array empty. return JSON object only and no yapping

    Below is the initialMessage and currentSymptoms array to be used:
    ${JSON.stringify(payload)}
    `
    console.log(prompt)
    return prompt
  }

  const getResponse = async (prompt: string) => {
    const completion = await aiInstance.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: "system", content: prompt },
      ]
    })
    return completion.choices[0].message.content
  }

  const getFollowUp = async (prognosis: any) => {
    const prompt = createFollowUpInstructions(prognosis)
    const response = await getResponse(prompt)
    console.log(response)
    if(!response) throw new Error('No follow-up found')
    const followUp = JSON.parse(response)
    return followUp
  }

  const diagnoseSymptopms = async (initialMessage: string) => {
    try {
      const jsonStr = await getResponse(createSystemInstructions(initialMessage))
      if(!jsonStr) throw new Error('No diagnosis found')
      const diagnosis = JSON.parse(jsonStr)
      return diagnosis
    } catch (error) {
      console.error(error)
    }
  }

  return {
    diagnoseSymptopms,
    getFollowUp
  }
}