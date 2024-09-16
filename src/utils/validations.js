const Email = new RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i); 
const Dateformat= new RegExp(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i);
const Alphanumeric = new RegExp(/^[A-Za-z\d\s]+$/);
const Aphabeticals = new RegExp(/^[a-zA-Z ]*$/);
const Numeric = new RegExp(/^[0-9]+$/);
const Amount = new RegExp(/^\$?[\d,]+(\.\d*)?$/);

export const emailValidation = email => Email.test(email);
export const dateFormatValidation = date => Dateformat.exec(date);
export const alphanumeicValidation = text => Alphanumeric.test(text);
export const aphabeticalsValidation = text => Aphabeticals.test(text);
export const numericValidation = number => Numeric.test(number);
export const amountValidation = amount => Amount.test(amount);

export const capitalizeFirstLetterEachWord = (str) => {
    str = str.split(" ");
    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(" ");
}
export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const removeExtraSpaces = (string) => {
    return string.replace(/\s{2,}/g, ' ').trim()
}

export const notValid = string => {
    return [null, undefined, 'null', 'undefined', ''].includes(removeExtraSpaces(string))
}

export const formatPrice = (value) => {
    if(value <= 1000) return value;
    var nStr = value + '';
    nStr = nStr.replace(/\,/g, "");
    let x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

export const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return`(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3,6)}-${phoneNumber.slice(6, 10)}`;
  }