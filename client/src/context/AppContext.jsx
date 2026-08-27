import {createContext, useState, useContext, useEffect, useCallback, useRef} from "react";
import api from "../api/api"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";


const AppContext = createContext(undefined);

export function AppContextProvider({children}){

    const navigate = useNavigate()
    
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

    const login = async (email, password) =>{
        try{
            const {data} = await api.post("/api/auth/login", {email, password})
            setUser(data.user)
            toast.success("Welcom back!")
            navigate("/")
        }catch(err){
            console.error("Login failed:", err)
            const errMsg = err?.response?.data?.error || "Invalid email or password"
            toast.error(errMsg)
            throw new Error(errMsg)
        }
    }

    const register = async (name, email, password) =>{
        try{
            const {data} = await api.post("/api/auth/register", {name, email, password})
            setUser(data.user)
            toast.success("Account created successfully!")
            navigate("/")
        }catch(err){
            console.error("Registration failed:", err)
            const errMsg = err?.response?.data?.error || "Registration failed"
            toast.error(errMsg)
            throw new Error(errMsg)
        }
    }
    return(
        <AppContext.Provider value={{user, loadingUser, login, register}}> 
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