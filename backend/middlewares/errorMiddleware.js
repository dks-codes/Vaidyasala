export default class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

//to handle the input errors in form
export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is Invalid. Try Again!`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired. Try Again!`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "CastError") {
    //occurs when there's a mismatch of type while entering data
    const message = `JInvalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //Extracts the error messages from the Error object.
  //const errorMessage = err.errors ? Object.values(err.errors).map(error => error.message).join(' ') : err.message;

  const errorMessage = err.errors // Check if err object has an errors property
    ? Object.values(err.errors) // If it does, extract the values (error objects)
        .map((error) => error.message) // Map over each error object and extract the 'message' property
        .join(" ") // Join all the error messages into a single string separated by spaces
    : err.message; // If there are no nested errors, use the main error message

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

/*
ValidationError: Message validation failed: email: Please Provide A Valid Email!, phone: Phone Number Must Contain Exact 10 Digits!
{
  errors: {
            email: ValidatorError: Please Provide A Valid Email!
            {
                properties: {
                    message: 'Please Provide A Valid Email!',
                    type: 'user defined',
                    validator: <ref *1> [Function: isEmail] {
                    default: [Circular *1]
                    },
                    path: 'email',
                    fullPath: undefined,
                    value: 'dks'
                },
                kind: 'user defined',
                path: 'email',
                value: 'dks',
                reason: undefined,
                [Symbol(mongoose#validatorError)]: true
            },
            phone: ValidatorError: Phone Number Must Contain Exact 10 Digits!
            {
                properties: {
                    validator: [Function (anonymous)],
                    message: 'Phone Number Must Contain Exact 10 Digits!',
                    type: 'minlength',
                    minlength: 10,
                    path: 'phone',
                    fullPath: undefined,
                    value: '123456789'
                },
                kind: 'minlength',
                path: 'phone',
                value: '123456789',
                reason: undefined,
                [Symbol(mongoose#validatorError)]: true
            }
    },
  _message: 'Message validation failed'
}
*/
