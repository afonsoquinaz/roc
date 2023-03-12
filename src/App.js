import logo from './logo.svg';
import './App.css';
import LoginButton from './components/login';
import {useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';
import atob from 'atob';
import btoa from 'btoa';
import utf8 from 'utf8';
import {decode as base64_decode, encode as base64_encode} from 'base-64';
import { Configuration, OpenAIApi } from 'openai';
import { getBiggerAnswer, getDetailledAnswer, getSameWithFooter, getSameWithHeader, getSimpleAIAnswer, getSmallerAnswer } from './Requests/OpenAIRequests';
import IconRestart from './images/IconRestart.png';
import { FaBeer } from 'react-icons/fa';
import {MdFaceUnlock } from 'react-icons/md';
import { GiBarefoot } from 'react-icons/gi'
import {AiOutlineSend} from 'react-icons/ai'
import {FaRedoAlt} from 'react-icons/fa';
import {BsPlusSquareFill} from 'react-icons/bs';
import {AiFillMinusSquare} from 'react-icons/ai';


const clientId = "64694146330-nnuqeknh6s7hjdvic3ndb48ujnbppsbc.apps.googleusercontent.com";

function App  ()  {

  var [listOfEmails, setListOfEmails] = useState([]);
  var [selectedEmail , setSelectedEmail] = useState(null);
  var [selectedEmailText , setSelectedEmailText] = useState("");
  var [selectedReceiverEmail , setSelectedReceiverEmail] = useState("");
  var [suggestionReply , setSuggestionReply] = useState("");
  var [detailsForNewSuggestion , setDetailsForNewSuggestion] = useState("");



  const OnSuccess = (res) => {
    setEmailUser(res.profileObj.email)
    setNameUser(res.profileObj.givenName + " " + res.profileObj.familyName)
    setImageUser(res.profileObj.imageUrl)
    setGmailToken(res.accessToken)
    //GetEmails(res.accessToken)

    var result = "";

    const config = {
        headers: { Authorization: `Bearer ${res.accessToken}` }
    };

    axios.get( 
      `https://gmail.googleapis.com/gmail/v1/users/${res.profileObj.email}/threads`,
      config
    ).then(response => {
      result = response.data;
      setListOfEmails(result.threads)
      return result;
    }).catch(console.log);;



    

}

const onFailure = (res) => {
    console.log("Login FAILED! res: ", res);
}


  useEffect(()=> {
      function start() {
        gapi.client.init({
          clientId: clientId,
          scope: "https://mail.google.com/"
        })
      };

      gapi.load('client:auth2',start);
  })





  var [oldSuggestions, setOldSuggestions] = useState([]);

  
  function GetEmail  (email, id ,token)  {

    const config = {
      headers: { Authorization: `Bearer ${token}` }
  };

  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);
  

  
    var r = "";
    axios.get(
    `https://gmail.googleapis.com/gmail/v1/users/${email}/messages/${id}`,
    config
  ).then(response => {
  


    let email = ""
    for(let i = 0 ; i < response.data.payload.headers.length; i++){
      if(response.data.payload.headers[i].name == "From"){
        email = response.data.payload.headers[i].value
      }
    }
    setSelectedReceiverEmail(email)


    let d = ""
     if(response.data.payload.parts && response.data.payload.parts.length > 1 )
    {

    d = response.data.payload.parts[1].body.data
   } 
   else if(response.data.payload.parts && response.data.payload.parts.length > 0 && response.data.payload.parts[0])
         {

         d = response.data.payload.parts[0].body.data
        }       

    else {

      d = response.data.payload.body.data
    }


    var mailDecoded = ""

    setSelectedEmailText(selectedEmail.snippet);
       mailDecoded = utf8.decode(atob(d));

       

    r = mailDecoded;
    setSelectedEmailText(mailDecoded);



    if(mailDecoded == ""){
      setSelectedEmailText(selectedEmail.snippet);
    }
    const getAnswerReply = async () => {
      
      try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: "Give me an aswer to the following email: "+ mailDecoded,
          max_tokens: 1000
        });

        setSuggestionReply(completion.data.choices[0].text);
      } catch (error) {

        setSuggestionReply("error");
        if (error.response) {
  
        } else {
        }
      }
    };
    getAnswerReply()








    return mailDecoded;
  }).catch(console.log);;
  
  
  }
  
  const handleEditEmailToSubmit = (event) => {
    setSuggestionReply(event.target.value);
  }

  async function handleSendBig(){
    setOldSuggestions(oldSuggestions.concat(suggestionReply))
    setSuggestionReply(await getBiggerAnswer(suggestionReply ,selectedEmailText ))
  }

  async function handleSendWithFooter(){
    setOldSuggestions(oldSuggestions.concat(suggestionReply))
    setSuggestionReply(await getSameWithHeader(suggestionReply ,selectedEmailText ))
}

async function handleSendWithHeader(){
  setOldSuggestions(oldSuggestions.concat(suggestionReply))
  setSuggestionReply(await getSameWithFooter(suggestionReply ,selectedEmailText, nameUser))
}
    async function handleSendSmall(){
      setOldSuggestions(oldSuggestions.concat(suggestionReply))
      setSuggestionReply(await getSmallerAnswer(suggestionReply ,selectedEmailText ))
  }
  async function handleSendSuggestion(){
    if(suggestionReply != ""){
      setOldSuggestions(oldSuggestions.concat(suggestionReply))
    }

    setSuggestionReply(await getDetailledAnswer(suggestionReply ,selectedEmailText ,detailsForNewSuggestion ))
    
  }

  function handleSendEmail  () {

    const config = {
      headers: { Authorization: `Bearer ${tokenGmail}` }
    };
  // Set up the message
  const message = [
    'To: ' + selectedReceiverEmail,
    'Subject: Easy Answer',
    '',
    suggestionReply
  ].join('\n');


  
  let encoded = base64_encode(message);


      // Set up the Axios request
      axios({
        method: 'POST',
        url: 'https://www.googleapis.com/gmail/v1/users/me/messages/send',
        headers: {
          Authorization: `Bearer ${tokenGmail}`,
          'Content-Type': 'application/json',
        },
        data: {
          raw: encoded,
        },
      }).then((response) => {
        console.log(`Message sent: ${response.data}`);
      }).catch((error) => {
        console.error(`Error sending message: ${error}`);
      });
  }

  const handleSelectEmail = (email) => {

    setSuggestionReply("")
    setDetailsForNewSuggestion("");
    setOldSuggestions([]);
    setSelectedEmail(email);
    setSelectedEmailText(GetEmail(emailUser , email.id , tokenGmail));
    GetEmail(emailUser , email.id , tokenGmail)
    
  }


  var [nameUser , setNameUser] = useState();
  var [imageUser , setImageUser] = useState();

  var [emailUser , setEmailUser] = useState();
  var [tokenGmail , setGmailToken] = useState("");
  return (
    <div className="App  bg-gradient-to-br from-green-400 bg-blue-900">

        <div className='grid grid-cols-10 '>
        <div className='col-span-5 mr-auto pl-7 pt-5 pb-4 text-3xl text-white'>EASY ANSWER </div>
        

        <div className='col-span-5 ml-auto pr-7 pt-5 pb-4 '> <div className='grid grid-cols-2 '> <span className='pt-1 ml-auto text-white'>{nameUser}</span> <img className=' rounded-full h-9 w-9 mb-1 ml-auto' src={imageUser} alt="example" /> </div> </div>
        <div className='col-span-3 pl-2'>
                 {
                    listOfEmails.map((mail , index) => {
                      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
                      return(
                        <div onClick={() => handleSelectEmail(mail)} key= {mail.id} style={{ backgroundColor: selectedEmail == mail ? '#94a3b8': 'white' , color: selectedEmail == mail ? 'white': 'black'}} className="grid grid-cols-8 hover:bg-slate-500  border border-slate-500 border-2 rounded p-4 mx-2 bg-slate-200 text-black hover:bg-slate-300   m-2 mb-auto">
                         
                              <div className='col-span-1 font-bold text-blue-200 rounded-full bg-red-200 mx-auto px-4 py-2' style={{backgroundColor: randomColor}}>{mail.snippet.substring(0,1)}</div>
                              <div className='col-span-7'>{mail.snippet.substring(0,30)} {(mail.snippet.length > 30) ? <span>...</span> : <span></span>}</div>
                       </div>
                      )
                    })
                  }
       </div>
       <div className='ml-10 col-span-7'>
              {
                (selectedEmail != null) ? 
                  <div className='grid grid-cols-1 '>
                    <div  className="hover:bg-slate-500 border border-slate-500 border-2 text-start rounded p-4 mx-2 bg-slate-200 text-black    m-2 mb-auto">
                    {selectedEmailText }
                    
                  </div> 
                  <div className=" justify-center text-black">

                    <div className="border rounded mx-5 p-2 bg-slate-100  text-black relative mb-3  mt-10 " data-te-input-wrapper-init>
                      <textarea
                        className="text-black peer block min-h-[auto]  w-full rounded border-0 bg-transparent "
                        id="exampleFormControlTextarea1"
                        rows="4"
                        placeholder="Your message"
                        value = {suggestionReply}
                        onChange={ (event) => (setSuggestionReply(event.target.value))}
                        ></textarea>
                        
                      <div className='grid grid-cols-6  '>
                        <div className='grid grid-cols-2'>
                        <div  onClick={() => handleSendWithFooter()}  className='border mb-auto border-blue-800 mx-2 rounded mt-1 col-start-1 text-blue-800 bg-white  px-2 py-2 hover:bg-blue-400'> <MdFaceUnlock className='h-6 w-6 '/> </div>
              
                        <div  onClick={() => handleSendWithHeader()}  className='border mb-auto border-blue-800 mx-2 rounded mt-1 col-start-2 text-blue-800 bg-white  px-2 py-2 hover:bg-blue-400'> <GiBarefoot className='h-6 w-6 '/> </div>
                        </div>
                       <div  onClick={() => handleSendSmall()}  className='border border-blue-800 mx-2 rounded mt-1 mb-auto col-start-2 text-blue-800 bg-white  px-3 py-2 hover:bg-blue-400'> <AiFillMinusSquare className='h-7 w-7 mx-auto mt-1'/>  </div>
                      <div  onClick={() => handleSendBig()}  className='border  border-blue-800 mx-2 rounded mt-1 mb-auto col-start-3 text-blue-800 bg-white  px-3 py-2 hover:bg-blue-400'> <BsPlusSquareFill className='h-6 w-6 mx-auto mt-1'/>  </div>
                      <div  className=' grid grid-cols-10 border  border-blue-800 mx-2 rounded mt-1 col-span-2 mb-auto col-start-4 text-blue-800 bg-white  px-3 py-1 '> <textarea
                                  className=" col-span-7 text-black hover:border-transparent "
                                  id="exampleFormControlTextarea1"
                                  rows="1"
                                  placeholder="Your message"
                                  value = {detailsForNewSuggestion}
                                  onChange={ (event) => (setDetailsForNewSuggestion(event.target.value))}
                                  ></textarea> <div  onClick={() => handleSendSuggestion()}  className="border p-1 ml-1 rounded col-span-3 text-black mb-auto hover:bg-blue-300 border-blue-800">  <FaRedoAlt className='h-6 w-6 mx-auto text-blue-800'/> </div></div>
                     


                      <div  onClick={() => handleSendEmail()}  className='rounded mt-1 mx-2 col-start-6 mb-auto text-white bg-blue-500 px-3 py-1 hover:bg-blue-800'> <AiOutlineSend className='h-5 w-5 mx-auto '/> </div> 
                      </div>
                      
                    </div>
                    {
                    oldSuggestions.map((suggestion , index) => {
                      return(
                        <div key= {suggestion.id}  className=" border border-slate-500 border-2 rounded p-4 mx-5 bg-slate-100 text-black  text-start  m-2 mb-auto">
                          <span className='text-start'>{suggestion}</span>
                          <div className='grid grid-cols-5'> 
                          <div  onClick={() => handleSendEmail()}  className='col-start-5 mt-5 rounded mt-1 mx-2 col-start-5 text-white bg-blue-500 px-3 py-1 hover:bg-blue-800'>  <AiOutlineSend className='h-6 w-6 mx-auto'/> </div> 
                
                          </div>
                        
                       </div>
                      )
                    })
                  }

                  </div>
                  </div>:
                  <div className="hover:bg-slate-500 border border-slate-500 border-2 rounded p-4 mx-2 bg-slate-200 text-black    m-2 mb-auto">
                          
              </div>

              }

       </div>

        </div>
        <div id= "signInButton">
            <GoogleLogin
                clientId={clientId}
                buttonText = "Login"
                onSuccess={OnSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn = {true}
            />
        </div>
    </div>
  );
}

export default App;
