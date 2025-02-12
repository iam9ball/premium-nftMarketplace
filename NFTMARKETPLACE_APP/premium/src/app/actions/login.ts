'use server'
import { GenerateLoginPayloadParams, signLoginPayload, VerifyLoginPayloadParams } from 'thirdweb/auth';
import { Account, generateAccount, privateKeyToAccount } from 'thirdweb/wallets';
import { cookies } from 'next/headers';
import { getAddress } from 'thirdweb';
import { refreshJWT } from "thirdweb/utils";
import { createAuth } from 'thirdweb/auth';
import { client } from '../client';

const privateKey = process.env.PRIVATE_KEY!;
 
const auth = createAuth({
    adminAccount: privateKeyToAccount({client, privateKey}),
    domain: process.env.DOMAIN! || 'localhost:3000',
    client,
    jwt: {
        expirationTimeSeconds: 60 * 60 * 24 * 7
    },
    login: {
        statement: `Welcome to ${process.env.DOMAIN! || 'localhost:3000'}, Sign the message to login`
        
    }


});

 





export async function generatePayload(options: GenerateLoginPayloadParams) {
        return await auth.generatePayload(options);
   
}

export async function login(payload: VerifyLoginPayloadParams) {
    const verifiedPayload = await auth.verifyPayload(payload);
    if(verifiedPayload.valid) {
        const jwt = await auth.generateJWT({ payload: verifiedPayload.payload });
        cookies().set('jwt', jwt, {httpOnly: true, secure: true, sameSite: 'strict'});
    }
}


export async function isLoggedIn(address: string) {

    try {
   
        // if no address is passed then return false
        if (!address) {
            return false;
        }
        // check if the user is logged in by checking the cookies
        const jwt = cookies().get('jwt');
        
        // if the jwt is not present then return false
        if (!jwt) {
            return false;
        }

        // verify the jwt
        const authResult = await auth.verifyJWT({ jwt: jwt.value });

        // if the result is not valid return false

        if(!authResult.valid) {
            return false;
        }
        
        // check if the address in the jwt is the same as the address passed
        if (getAddress(authResult.parsedJWT.sub) !== getAddress(address)) {
            return false;
        }
        // we are logged in
        return true;
        
    } catch (error) {
        console.error(error);
        return false
        
    }

 
}

export async function getAuthResult(jwtValue: string) {

    try {
     const authResult = await auth.verifyJWT({ jwt: jwtValue });

    if (!authResult.valid) {
        return {valid: false, parsedJWT: null};
    }
    return authResult;
    } catch (error) {
        console.error(error);
         return {valid: false, parsedJWT: null};
        
    }
    
}





