import dotenv from 'dotenv' 

dotenv.config()

export const config = {
  openAiApiKey: process.env.OPENAI_API_KEY,
}