import { openai } from "./configai";

async function getAnswer(prompt){

    

    try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: prompt,
          max_tokens: 1000
        });
        console.log("completion.data.choices[0].text")
        console.log(completion.data.choices[0].text)
        return completion.data.choices[0].text
      } catch (error) {
        console.log("ERROR")
        console.log(error)

        if (error.response) {
  
        } else {
        }
      }
}

export async function getSimpleAIAnswer(mailToAnswer){
    const answer = await getAnswer("Give me an answer to this email with the same mood as it is written: " + mailToAnswer );
    return answer;
}

export async function getSameWithHeader(oldAnswer , mailToAnswer){
    const answer = await getAnswer("I'm need to answer to this email: " + mailToAnswer +  ". I have wrote this: " +  oldAnswer + ". Just add a header.");
    return answer;
}

export async function getSameWithFooter(oldAnswer , mailToAnswer , name){
    const answer = await getAnswer("I need to answer to this email: " + mailToAnswer +  ". I have wrote this: " +  oldAnswer + ". Copy my answer and add a footer to it. If you need, my name is " + name);
    return answer;
}

export async function getBiggerAnswer(oldAnswer , mailToAnswer){
    const answer = await getAnswer("I need to answer to this email: " + mailToAnswer +  ". I have wrote this: " +  oldAnswer + ". Give me a bigger reply based on mine.");
    return answer;
}

export async function getSmallerAnswer(oldAnswer , mailToAnswer){
    const answer = await getAnswer("I need to answer to this email: " + mailToAnswer +  ". I have wrote this: " +  oldAnswer + ". Give me a smaller reply based on mine.");
    return answer;
}

export async function getDetailledAnswer(oldAnswer , mailToAnswer , details){
    const aux = (details != "") ? ("I need to answer to this email: " + mailToAnswer +  ". I have wrote this: " +  oldAnswer + ". Give me a new version with this characteristics: " + details) : ("Answer to this email: " + mailToAnswer)
    const answer = await getAnswer(aux);
    return answer;
}

