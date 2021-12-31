const axios = require('axios')
const config = require('./config.json');
const imagetyperzapi = require('imagetyperz-api')
imagetyperzapi.set_access_key(config.token)
const process = require('process');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var captcha_params = {
    page_url: 'https://support.snapchat.com/en-US/i-need-help',
    sitekey: '6Ldt4CkUAAAAAJuBNvKkEcx7OcZFLfrn9cMkrXR8'
}

async function balance() {
    const balance = await imagetyperzapi.account_balance()
    console.log(`Balance: $${balance}`)

}

async function solve(myUser, email, reportee, rText) {
    const captchaID = await imagetyperzapi.submit_recaptcha(captcha_params)
    console.log('Waiting for captcha to be solved ...')
    const response = await imagetyperzapi.retrieve_response(captchaID)   // wait for response to get solved
    if (response.Status == "Solved") {
        console.log("Captcha solved, passing to post func")
        post(myUser, email, reportee, rText, response.Response)
    }
    else {
        console.log(`Captcha not solved! Status: ${response.Status}`)
        console.log(response)
        pKill("Captcha error!")

    }
}

function post(myUser, email, reportee, rText, captcha) {
    data = `key=ts-reported-content-2&field-24380496=${myUser}&field-24335325=${email}&field-25326243=&field-24380626=${reportee}&field-22808619=${rText}&g-recaptcha-response=${captcha}&answers=5153567363039232,5743597085261824`
    axios.post('https://support.snapchat.com/en-US/api/v2/send', data,
        {
            headers: {
                'Content-type': 'text/plain',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
            }

        }).then(res => {
            console.log(`statusCode: ${res.status}`)
            if (res.status == "200") {
                pKill("Success!")
            }
            else {
                console.log(res)
                pKill("Error while sending!")
            }
        }).catch(err => {
            console.log(err)
            pKill("Error 2 while sending!")
        })
}

function pKill(message) {
    console.log(`pKill: ${message}`)
    process.exit()
}

function main() {
    var args = process.argv.slice(2);
    if (args.length < 4) {
        pKill("Improper arguments!")
    }
    else {
        msg = args.slice(3)
        solve(args[0], args[1], args[2], msg)
    }
}


main()

//post(myUser, email, reportee, rText, captcha)