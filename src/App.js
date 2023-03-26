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
import gmailIcon from './images/gmail.png';
import hotmailIcon from './images/outlook.png';
import { FaBeer } from 'react-icons/fa';
import {MdFaceUnlock } from 'react-icons/md';
import { GiBarefoot } from 'react-icons/gi'
import {AiOutlineSend} from 'react-icons/ai'
import {FaRedoAlt} from 'react-icons/fa';
import {BsPlusSquareFill} from 'react-icons/bs';
import {AiFillMinusSquare} from 'react-icons/ai';
import MicrosoftLogin from "react-microsoft-login";
import FacebookLogin from 'react-facebook-login';
import SlackLogin from 'react-slack-login';

import { Providers } from '@microsoft/mgt-element';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';

import { stripTagsFromString } from '@baggie/string';



const clientId = "64694146330-nnuqeknh6s7hjdvic3ndb48ujnbppsbc.apps.googleusercontent.com";

function App  ()  {
  //////
  var [tokenMicrosoft, setTokenMicrosoft] = useState([]);

  var [listOfEmailsHotmail, setListOfEmailsHotmail] = useState([]);
  var [listOfEmailsHotmailSnippet, setListOfEmailsHotmailSnippet] = useState([]);
  var [hotmailDetails, setHotmailDetails] = useState([]);
  var [hotmailReceiverEmail , setHotmailReceiverEmail] = useState();
  var [hotmailDate , setHotmailDate] = useState();
  
  //////

  var [listOfEmails, setListOfEmails] = useState([]);
  var [selectedEmail , setSelectedEmail] = useState(null);
  var [selectedEmailText , setSelectedEmailText] = useState("");
  var [selectedReceiverEmail , setSelectedReceiverEmail] = useState("");
  var [selectedDateEmail , setDateEmail] = useState("");
  var [suggestionReply , setSuggestionReply] = useState("");
  var [detailsForNewSuggestion , setDetailsForNewSuggestion] = useState("");



  const OnSuccess = (res) => {
    setEmailUser(res.profileObj.email)
    setNameUser(res.profileObj.givenName + " " + res.profileObj.familyName)
    setImageUser(res.profileObj.imageUrl)
    setGmailToken(res.accessToken)
    //GetEmails(res.accessToken)
    var result = "";

    const maxResults = 10;

    const config = {
      headers: { Authorization: `Bearer ${res.accessToken}` },
      params: {
        maxResults: maxResults
      }
    };
    

    axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/${res.profileObj.email}/messages`,
      config,
    )
    .then(response => {
      result = response.data;
      console.log("LISTA DE EMAILS");
      console.log(response);
    
      // Get detailed information for each message, including the internalDate
      const messagePromises = result.messages.map(message => {
        return axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/${res.profileObj.email}/messages/${message.id}`,
          config
        );
      });
    
      return Promise.all(messagePromises);
    })
    .then(messages => {
      // Combine the messages with their internalDate and other details
      const detailedMessages = messages.map(response => response.data);
      console.log("DETAILED MESSAGES");
      console.log(detailedMessages);
      setListOfEmails(detailedMessages);
      return detailedMessages;
    })
    .catch(console.log);


    

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

  function onFailed(error) {
    console.error('Slack authentication failed:', error);
  }
  
  function onSuccess(response) {
    console.log('Slack authentication successful:', response);
    // You can use the response object to access the user's Slack ID and access token
    // and perform further actions, such as retrieving user data or posting messages to channels
  }


  const authHandler = (err, data) => {
    console.log(err, data);
    console.log("MICROSOFT LOGIN!! " + data)
    console.log(data)
     const accessToken = data.accessToken;
     setTokenMicrosoft(data.accessToken);
    const emailEndpoint = "https://graph.microsoft.com/v1.0/me/messages";
    let config = {
      headers: { Authorization: `Bearer ${accessToken}` }
  };
  axios.get(emailEndpoint,
    config
  )
  .then(response => {
    console.log(response.data);

        const emails = response.data.value;
        console.log(`Retrieved ${emails.length} emails:`);

        const select = ['subject', 'body', 'bodyPreview', 'uniqueBody'].join(',');
         config = {
          headers: { Authorization: `Bearer ${accessToken}` },
           params: { $select: select }
      };
        var detailedMessagesHotmail = []
        console.log("AFONSO AFONSO AFONSO")
        console.log(emails)
        setListOfEmailsHotmailSnippet(emails)

        emails.forEach(email => {
          const emailEndpoint = `https://graph.microsoft.com/v1.0/me/messages/${email.id}`;
          

          axios.get(emailEndpoint, config)
            .then(response => {
              console.log(response.data);
              console.log(stripTagsFromString(response.data.uniqueBody.content));
              detailedMessagesHotmail.concat(stripTagsFromString(response.data.uniqueBody.content))
              setListOfEmailsHotmail(listOfEmailsHotmail.concat(stripTagsFromString(response.data.uniqueBody.content)));
              console.log("------")
              console.log(listOfEmailsHotmail.concat(stripTagsFromString(response.data.uniqueBody.content)));
              console.log("------")
            })
            .catch(error => {
              console.error(error);
            });


        });
        
        console.log("AQUII AFONSO?????")
        console.log(detailedMessagesHotmail)
        console.log(listOfEmailsHotmail)


  // Fetch messages from Teams
  console.log("TEAMS" + accessToken)
  const teamsEndpoint = "https://graph.microsoft.com/v1.0/me/joinedTeams";
  config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  axios
    .get(teamsEndpoint, config)
    .then((response) => {
      console.log(response.data);
      const teams = response.data.value;

      teams.forEach((team) => {
        const channelsEndpoint = `https://graph.microsoft.com/v1.0/teams/${team.id}/channels`;
        axios
          .get(channelsEndpoint, config)
          .then((response) => {
            console.log(response.data);
            const channels = response.data.value;

            channels.forEach((channel) => {
              const messagesEndpoint = `https://graph.microsoft.com/v1.0/teams/${team.id}/channels/${channel.id}/messages`;
              axios
                .get(messagesEndpoint, config)
                .then((response) => {
                  console.log(response.data);
                  const messages = response.data.value;
                  console.log(`Retrieved ${messages.length} messages from ${team.displayName} - ${channel.displayName}`);
                  
                  // Do something with the messages
                  // ...

                })
                .catch((error) => {
                  console.error(error);
                });
            });
          })
          .catch((error) => {
            console.error(error);
          });
      });
    })
    .catch((error) => {
      console.error(error);
    });

  })
  .catch(error => {
    console.error(error);
  });
  };

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
  

    console.log(response)
    let email = ""
    let date = ""
    for(let i = 0 ; i < response.data.payload.headers.length; i++){
      if(response.data.payload.headers[i].name == "From"){
        email = response.data.payload.headers[i].value
      }
    }
    for(let i = 0 ; i < response.data.payload.headers.length; i++){
      if(response.data.payload.headers[i].name == "Date"){
        date = response.data.payload.headers[i].value
      }
    }
    setSelectedReceiverEmail(email)
    setDateEmail(date)
    


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
  async function handleSendSuggestionHotmail(){
    if(suggestionReply != ""){
      setOldSuggestions(oldSuggestions.concat(suggestionReply))
    }

    setSuggestionReply(await getDetailledAnswer(suggestionReply ,hotmailDetails ,detailsForNewSuggestion ))
    
  }

  function handleSendEmailHotmail(){
    const emailEndpoint = "https://graph.microsoft.com/v1.0/me/sendMail";
    const config = {
      headers: { 
        Authorization: `Bearer ${tokenMicrosoft}`, 
        'Content-Type': 'application/json'
      }
    };
  
    // Set up the email message
    const emailMessage = {
      message: {
        subject: 'Easy Answer',
        body: {
          contentType: 'HTML',
          content: `<b>${suggestionReply}</b>`
        },
        toRecipients: [
          {
            emailAddress: {
              address: hotmailReceiverEmail
            }
          }
        ]
      },
      saveToSentItems: true
    };
  
    axios.post(emailEndpoint, emailMessage, config)
      .then(response => {
        console.log('Email sent successfully:', response.data);
      })
      .catch(error => {
        console.error('Failed to send email:', error);
      });
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




  const handleSelectEmailHotmail = (email) => {
    const emailEndpoint = `https://graph.microsoft.com/v1.0/me/messages/${email}`;
    const select = ['subject', 'body', 'bodyPreview', 'uniqueBody' , 'sentDateTime' , 'from'].join(',');
    const config = {
     headers: { Authorization: `Bearer ${tokenMicrosoft}` },
      params: { $select: select }
 };

    axios.get(emailEndpoint, config)
      .then(response => {
        console.log(response.data);
        console.log(stripTagsFromString(response.data.uniqueBody.content));
        setSelectedEmail(null)
        setHotmailDetails(stripTagsFromString(response.data.uniqueBody.content))
        setHotmailReceiverEmail(response.data.from.emailAddress.address)
        setHotmailDate(response.data.sentDateTime)

        
        console.log("SUCCESS RETRIEVING 1 HOTMAIL EMAIL DETAILS")
      })
      .catch(error => {
        console.error(error);
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

  const responseFacebook = (response) => {
    console.log("login facebook result : " , response);
    console.log("Token: " , response.accessToken)
    //facebook request facebook requestfacebook request facebook requestfacebook request facebook request
//facebook request facebook requestfacebook request facebook requestfacebook request facebook request
//facebook request facebook requestfacebook request facebook requestfacebook request facebook request

// Replace ACCESS_TOKEN with your actual access token
const PAGE_ACCESS_TOKEN = response.accessToken;

const PAGE_ID = '1337671583465847';


  try {
    const response1 =  axios.get(`https://graph.facebook.com/me/permissions`);
    const conversations = response1.data.data;
    console.log(conversations);
  } catch (error) {
    console.error(error);
  }




//facebook request facebook requestfacebook request facebook requestfacebook request facebook request
//facebook request facebook requestfacebook request facebook requestfacebook request facebook request
//facebook request facebook requestfacebook request facebook requestfacebook request facebook request



  }
   

   
  var [nameUser , setNameUser] = useState();
  var [imageUser , setImageUser] = useState();

  var [emailUser , setEmailUser] = useState();
  var [tokenGmail , setGmailToken] = useState("");
  return (
    <div className="App  bg-gradient-to-br from-green-400 bg-blue-900">

        <div className='grid grid-cols-10 '>
        <div className='col-span-5 mr-auto pl-7 pt-5 pb-4 text-3xl text-white'>EASY ANSWER </div>
  

        <div className='col-span-5 ml-auto pr-7 pt-5 pb-4 '>
        <FacebookLogin
    appId="1337671583465847"
    autoLoad={true}
    fields="name,email,picture"
    callback={responseFacebook} />
    <SlackLogin
  redirectUrl='https://localhost:3000/api/v1/auth/slack'
  onFailure={onFailed}
  onSuccess={onSuccess}
  slackClientId='4930653413505.5008055881955'
  slackUserScope='openid profile'
/>
<MicrosoftLogin
 clientId={"7e6c4d4d-8022-4ba1-aeb3-2c0d85b9e2dd"} 
 authCallback={authHandler} 
 graphScopes={['Mail.ReadBasic',  'Mail.ReadWrite' , 'openid', 'profile', 'User.Read', 'Mail.Read', 'Mail.Send' , 'Group.Read.All' , 'Group.ReadWrite.all']}
 />

           <div className='grid grid-cols-2 '> <span className='pt-1 ml-auto text-white'>{nameUser}</span> <img className=' rounded-full h-9 w-9 mb-1 ml-auto' src={imageUser} alt="example" /> </div> </div>
        

        <div className='col-span-3 pl-2'>

        {[
  ...listOfEmailsHotmailSnippet.map((email) => ({ type: 'LIST1', email })),
  ...listOfEmails.map((email) => ({ type: 'LIST2', email })),
].sort(() => Math.random() - 0.5).map((mail , index) => {
  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  if(mail.type === 'LIST1'){
    return(
      
      <div key={index} onClick={() => handleSelectEmailHotmail(mail.email.id)} className="grid grid-cols-8 hover:bg-slate-500  border border-slate-500 border-2 rounded px-4 pb-4 pt-2 mx-2 bg-slate-200 text-black hover:bg-slate-300 m-2 mb-auto">
        <div className='text-black font-bold col-start-8'><img className='h-7 w-7 ml-3' src={hotmailIcon}></img></div>
        <div className='col-span-1 font-bold text-blue-200 rounded-full bg-red-200 mx-auto px-4 py-2' style={{backgroundColor: randomColor}}>{mail.email.bodyPreview.substring(0,1)}</div>
        <div className='col-span-7'>{mail.email.bodyPreview.substring(0,30)} {(mail.email.bodyPreview.length > 30) ? <span>...</span> : <span></span>}</div>
      </div>
    )
  }
  if(mail.type === 'LIST2'){
    return(
      

      
          <div onClick={() => handleSelectEmail(mail.email)} key= {mail.email.id} style={{ backgroundColor: selectedEmail == mail.email ? '#94a3b8': 'white' , color: selectedEmail == mail.email ? 'white': 'black'}} className="grid grid-cols-8 hover:bg-slate-500  border border-slate-500 border-2 rounded px-4 pb-4 pt-2 mx-2 bg-slate-200 text-black hover:bg-slate-300   m-2 mb-auto">
           <div className='text-black font-bold col-start-8'><img className='h-7 w-7 ml-3' src={gmailIcon}></img></div>
                <div className='col-span-1 font-bold text-blue-200 rounded-full bg-red-200 mx-auto px-4 py-2' style={{backgroundColor: randomColor}}>{mail.email.snippet.substring(0,1)}</div>
                <div className='col-span-7'>{mail.email.snippet.substring(0,30)} {(mail.email.snippet.length > 30) ? <span>...</span> : <span></span>}</div>
         </div>
        
      
    )
  }
})}
                  {
                    listOfEmailsHotmailSnippet.map((mail , index) => {
                      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
                      return(
                        <div key= {index} onClick={() => handleSelectEmailHotmail(mail.id)}   className="grid grid-cols-8 hover:bg-slate-500  border border-slate-500 border-2 rounded px-4 pb-4 pt-2 mx-2 bg-slate-200 text-black hover:bg-slate-300   m-2 mb-auto">
                            <div className='text-black font-bold col-start-8'><img className='h-7 w-7 ml-3' src={hotmailIcon}></img></div>
                       <div className='col-span-1 font-bold text-blue-200 rounded-full bg-red-200 mx-auto px-4 py-2' style={{backgroundColor: randomColor}}>{mail.bodyPreview.substring(0,1)}</div>
                              <div className='col-span-7'>{mail.bodyPreview.substring(0,30)} {(mail.bodyPreview.length > 30) ? <span>...</span> : <span></span>}</div>
                </div>
                      )
                    })
                  }

                 {
                    listOfEmails.map((mail , index) => {
                      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
                      return(
                        <div onClick={() => handleSelectEmail(mail)} key= {mail.id} style={{ backgroundColor: selectedEmail == mail ? '#94a3b8': 'white' , color: selectedEmail == mail ? 'white': 'black'}} className="grid grid-cols-8 hover:bg-slate-500  border border-slate-500 border-2 rounded px-4 pb-4 pt-2 mx-2 bg-slate-200 text-black hover:bg-slate-300   m-2 mb-auto">
                         <div className='text-black font-bold col-start-8'><img className='h-7 w-7 ml-3' src={gmailIcon}></img></div>
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
                  <div className='grid grid-cols-1 gap1'>
                    <div  className="grid grid-cols-4 hover:bg-slate-500 border border-slate-500 border-2 text-start rounded p-4 mx-2 bg-slate-200 text-black    m-2 mb-auto">
                    <div className='border col-span-3 border-blue-800 bg-blue-200 rounded p-2 mb-4'>{selectedReceiverEmail}</div>
                    <div className='border border-slate-800 bg-slate-300 rounded p-2 mb-4'>{selectedDateEmail}</div>
                    <div className='col-span-4'>{selectedEmailText }</div>
                    
                    
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
                (hotmailDetails != null) ?  
<div className='grid grid-cols-1 gap1'>
                    <div  className="grid grid-cols-4 hover:bg-slate-500 border border-slate-500 border-2 text-start rounded p-4 mx-2 bg-slate-200 text-black    m-2 mb-auto">
                    <div className='border col-span-3 border-blue-800 bg-blue-200 rounded p-2 mb-4'>{hotmailReceiverEmail}</div>
                    <div className='border border-slate-800 bg-slate-300 rounded p-2 mb-4'>{hotmailDate}</div>
                    <div className='col-span-4'>{hotmailDetails}</div>
                    
                    
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
                                  ></textarea> <div  onClick={() => handleSendSuggestionHotmail()}  className="border p-1 ml-1 rounded col-span-3 text-black mb-auto hover:bg-blue-300 border-blue-800">  <FaRedoAlt className='h-6 w-6 mx-auto text-blue-800'/> </div></div>
                     


                      <div  onClick={() => handleSendEmailHotmail()}  className='rounded mt-1 mx-2 col-start-6 mb-auto text-white bg-blue-500 px-3 py-1 hover:bg-blue-800'> <AiOutlineSend className='h-5 w-5 mx-auto '/> </div> 
                      </div>
                      
                    </div>
                    {
                    oldSuggestions.map((suggestion , index) => {
                      return(
                        <div key= {suggestion.id}  className=" border border-slate-500 border-2 rounded p-4 mx-5 bg-slate-100 text-black  text-start  m-2 mb-auto">
                          <span className='text-start'>{suggestion}</span>
                          <div className='grid grid-cols-5'> 
                          <div  onClick={() => handleSendEmailHotmail()}  className='col-start-5 mt-5 rounded mt-1 mx-2 col-start-5 text-white bg-blue-500 px-3 py-1 hover:bg-blue-800'>  <AiOutlineSend className='h-6 w-6 mx-auto'/> </div> 
                
                          </div>
                        
                       </div>
                      )
                    })
                  }

                  </div>
                  </div>
                :
                  <div className="hover:bg-slate-500 border border-slate-500 border-2 rounded p-4 mx-2 bg-slate-200 text-black    m-2 mb-auto">
                          
              </div>

              }

       </div>

        </div>
        <div id= "signInButton">
            <GoogleLogin
                scope='read_mailbox'
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