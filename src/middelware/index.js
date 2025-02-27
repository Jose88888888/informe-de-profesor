export function isActiveSession(){
    const token=localStorage.getItem("access-token");
    if(token){
        return true;
    }else{
        return false;
    }
}

export function isProfesor(){
    const token = localStorage.getItem("userrol");
    if(token){
        return true;
    }else{
        return false;
    }
}