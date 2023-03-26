import { Configuration, OpenAIApi } from "openai";

export const configuration = new Configuration({
    apiKey: "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",
  });
  
export const openai = new OpenAIApi(configuration);
  