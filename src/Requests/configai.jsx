import { Configuration, OpenAIApi } from "openai";

export const configuration = new Configuration({
    apiKey: "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",
  });
  
export const openai = new OpenAIApi(configuration);
  