import firebase from "firebase/app";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Firebase } from "../lib/firebase";
import { AppUser } from "../lib/context";

export default function (): AppUser =>
{
    let user: firebase.User;
    [ user ] = useAuthState( firebase.auth() );

    const [ username, setUsername ] = React.useState<string>( "" );

    React.useEffect( () =>
    {
        let unsubscribe: () => void;

        if ( user )
        {
            const ref = Firebase.Firestore.collection( "users" ).doc( user.uid );
            unsubscribe = ref.onSnapshot( doc =>
            {
                const data = doc.data();
                setUsername( data?.username );
            } );
        }
        else
        {
            setUsername( "" );
        }
    }, [ user ] )

    return { firebaseUser: user, username };
}