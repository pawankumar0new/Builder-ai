import {createContext, useState, useContext, useEffect, useCallback, useRef} from "react";
import api from "../api/api"

const AppContext = createContext(undefined);

export function AppContextProvider({children}){
    
    const [user, setUser] = useState(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [sessionError, setSessionError] = useState(null)
    const sessionRequestId = useRef(0)


    const checkSession = useCallback(async()=>{
        const requestId = ++sessionRequestId.current
        const isLatestRequest = () => requestId === sessionRequestId.current

        if(isLatestRequest()){
            setLoadingUser(true)
            setSessionError(null)
        }
        try{
            const {data} = await api.get("/api/auth/me")
            if(isLatestRequest()){
                setUser(data.user)
                return {authenticated: Boolean(data.user)}
            }
        }catch(error){
            if(isLatestRequest()){
                if(error.response?.status === 401){
                    setUser(null)
                }else{
                    setSessionError(error)
                }
            }
        }finally{
            if(isLatestRequest()){
                setLoadingUser(false)
            }
        }
        return {authenticated: false}
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