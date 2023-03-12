import { GoogleLogin } from 'react-google-login';

const clientId = "64694146330-nnuqeknh6s7hjdvic3ndb48ujnbppsbc.apps.googleusercontent.com";

function Login(){

    const onSuccess = (res) => {
        console.log("Login Success! res: ", res);
    }

    const onFailure = (res) => {
        console.log("Login FAILED! res: ", res);
    }

    return(
        <div id= "signInButton">
            <GoogleLogin
                clientId={clientId}
                buttonText = "Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn = {true}
            />
        </div>
    )
}

export default Login;