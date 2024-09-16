import API from "./api";
export const formRules = {
    signin: {
        rules: {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            password: {
                required: true
            }
        },
        msg: {
            email: {
                required: 'Email is required',
                pattern: 'Email is not valid'
            },
            password: {
                required: 'Password is required'
            }
        }
    },
    signup: {
        rules: {
            name: {
                required: true
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            password: {
                required: true,
                minLength: 7,
                maxLength: 20
    
            }
        },
        msg: {
            name: {
                required: 'Name is requied'
            },
            email: {
                required: 'Email is required',
                pattern: 'Email is not valid'
            },
            password: {
                required: 'Password is required',
                minLength: 'Password length should be minimum 7 characters',
                maxLength: 'Password length should be maximum 20 characters'
    
            }
        }
        
    },
    workspace: {
        rules: {
            name: {
                required: true,
                minLength: 2
            },
            industry: {
                required: true,
                not_equal: 'none'
            }
        },
        msg: {
            name: {
                required: 'Company name is required',
                minLength: 'Company name should be atleast 2 characters long',
            },
            industry: {
                required: 'Please select an industry',
                not_equal: 'Please select an industry'
            },
            
        }
        
    },
    project: {
        rules: {
            title: {
                required: true,
                minLength: 2
            }
        },
        msg: {
            title: {
                required: 'Project title is required',
                minLength: 'Project title should be atleast 2 characters long',
            },
            
        }
        
    },
    member_signup: {
        rules:{
            name: {
                required: true,
                minLength: 2,
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            password: {
                required: true,
                minLength: 7,
                maxLength: 20
    
            }
        },
        msg: {
            name: {
                required: 'Name is requied',
                minLength: 'Name should be atleast 2 characters long',
            },
            email: {
                required: 'Email is required',
                pattern: 'Email is not valid'
            },
            password: {
                required: 'Password is required',
                minLength: 'Password length should be minimum 7 characters',
                maxLength: 'Password length should be maximum 20 characters'
    
            }
        }
    },
    singup_otp: {
        rules:{
            otp: {
                required: true,
                minLength: 6,
                maxLength: 6,
            }
        },
        msg: {
            otp: {
                required: 'OTP is required',
                minLength: 'Please enter 6 digit OTP',
                maxLength: 'Please enter 6 digit OTP',
            }
        }
    },
    add_member: {
        rules: {
            email: {
                required: true,
                unique: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                
            },
            role: {
                required: true,
                not_equal: 'none'
            }
        },
        msg:{
            email: {
                required: 'Email is required',
                pattern: 'Email is not valid',
                unique: "This member is already exist or an invitation is already sent."
            },
            role: {
                required: 'Please choose a role',
                not_equal: 'Please choose a role'
            }
        }
    },
    clients: {
        rules: {
            name: {
                required: true,
                minLength: 2,
            }
        },
        msg: {
            name: {
                required: 'Name is requied',
                minLength: 'Name should be atleast 2 characters long',
            },
        }
    },
    forgot_password: {
        rules:{
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            }
        },
        msg: {
            email: {
                required: 'Email is required',
                pattern: 'Email is not valid'
            },
        }
    },
    reset_password: {
        rules: {
            password: {
                required: true,
                minLength: 7,
                maxLength: 20
            },
            confirm_password: {
                required: true,
                minLength: 7,
                maxLength: 20,
            }
        },
        msg: {
            password: {
                required: 'Password is required',
                minLength: 'Password length should be minimum 7 characters',
                maxLength: 'Password length should be maximum 20 characters'
            },
            confirm_password: {
                required: 'Confirm password is required',
                minLength: 'Confirm password length should be minimum 7 characters',
                maxLength: 'Confirm password length should be maximum 20 characters'
            }
        }
    },
    profile: {
        rules: {
            name: {
                required: true,
                minLength: 2
            },
        },
        msg: {
            name: {
                required: 'Name is required',
                minLength: 'Name should be atleast 2 characters long',
            },
        }
    }
}

export const getFieldRules = (form, fieldName) => { 
    if( formRules[form] && formRules[form]['rules'][fieldName]){
        return formRules[form]['rules'][fieldName]
    }else{
        return {};
    }
    
};

export const  validateField = async (form, fieldName, value, rules) => {
    let error = '';
    
    if (rules.required && value === "" || rules.required && !value.trim()) {
        error  = formRules[form]['msg'][fieldName]['required'];
     // error = 'This field is required';
    } else if (rules.pattern && !rules.pattern.test(value)) {
        error  = formRules[form]['msg'][fieldName]['pattern'];
      //error = 'Please provide a valid email';
    } else if (rules.minLength && value.length < rules.minLength) {
        error  = formRules[form]['msg'][fieldName]['minLength'];
      //error = `Minimum ${rules.minLength} characters required`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
        error  = formRules[form]['msg'][fieldName]['maxLength'];
      //error = `Maximum ${rules.maxLength} characters allowed`;
    } else if (rules.not_equal && value === rules.not_equal) {
        error  = formRules[form]['msg'][fieldName]['not_equal'];
      //error = `Maximum ${rules.maxLength} characters allowed`;
    }else if (rules.unique && fieldName === "email") {
        const response =   await checkUniquemail( value )
        error = response;
    }
    
    return error;
  };

  export async function checkUniquemail( email ){
    try{
        const response = await API.apiGet('checkmail', {email: email});
        if( response?.data?.success === false ){
            return response?.data?.message || 'Email already exist';
        }
        
    }catch( error){
        return ''
        console.log('API error: ', error)
    }
  }