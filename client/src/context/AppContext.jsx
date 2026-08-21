import {createContext, useState, useContext, useEffect, useCallback} from "react";
import api from "../api/api"

const AppContext = createContext(undefined);

export function AppContextProvider({children}){
    
    const [user, setUser] = useState(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [sessionError, setSessionError] = useState(null)


    const checkSession = useCallback(async()=>{
        setLoadingUser(true)
        setSessionError(null)
        try{
            const {data} = await api.get("/api/auth/me")
            setUser(data.user);
        }catch(error){
            if(error.response?.status === 401){
                setUser(null)
            }else{
                setSessionError(error)
            }
        }finally{
            setLoadingUser(false)
        }
    }, [])
    useEffect(()=>{
        checkSession()
    },[checkSession])
    return(
        <AppContext.Provider value={{user, loadingUser, sessionError, retrySession: checkSession}}> 
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext(){
    const context = useContext(AppContext);
    if(context === undefined){
        throw new Error("useAppContext must be used within an AppContextProvider")
    }
    return context;
}