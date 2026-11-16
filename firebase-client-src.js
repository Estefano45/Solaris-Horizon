import {initializeApp} from 'firebase/app';
import {getAuth,setPersistence,browserLocalPersistence,signInAnonymously} from 'firebase/auth';
import {getDatabase,ref,onValue} from 'firebase/database';
export async function connect(config){
 const app=initializeApp(config),auth=getAuth(app);await setPersistence(auth,browserLocalPersistence);await auth.authStateReady();if(!auth.currentUser)await signInAnonymously(auth);const db=getDatabase(app);
 return {uid:auth.currentUser.uid,token:()=>auth.currentUser.getIdToken(),listen:(code,receive,error)=>onValue(ref(db,'rooms/'+code),s=>receive(s.val()),error)};
}
