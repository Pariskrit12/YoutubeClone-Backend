//This is useful when you want to throw consistent, structured errors in your 
// API (like with HTTP status codes and custom messages).
class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        error=[],
        stack=""
    ){
        super(message)
        this.statusCode=statusCode,
        this.data=null,
        this.message=message,
        this.success=false,
        this.errors=this.error

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}
export {ApiError};