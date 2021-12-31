const fs = require('fs')
const figlet = require('figlet');
const process = require('process');
const exec = require('child_process').exec;
const { stdout, stderr } = require('process');

threads = null
currentThreads = null
toCheck = null
var processes = {}
counter = 0
origLength = 0
twilbal = "$0 USD."
myUser = "none"



function isConfig() {
    try {
        config = require('./config.json');
        console.log("config.json successfully loaded!")
        return true
    } catch (err) {
        console.log("Uh oh! config.json was not loaded properly. This is usually because you don't have a config.json file located in the directory of this program.")
        console.log("An example file will be created if it is not already present. Press any key to exit.")
        let example = {
            "token": "Your ImageTyperz access token",
            "threads": "How many processes do you want running at once?",
            "reportee": "Who should we report?",
            "rText": "What should we say?"
        };
        let data = JSON.stringify(example)
        fs.writeFileSync('config.example.json', data)
        endProcess()
        return false

    }
}

function isCombo() {
    try {
        //combo = require('./combo.txt');
        console.log("combo.txt successfully loaded!")
        toCheck = fs.readFileSync('./combo.txt').toString().split('\n');
        return true
    }
    catch (err) {
        console.log(err)
        console.log("There is no combo.txt file. Create this file and insert email addresses line by line. For example:")
        console.log("john@apple.com")
        console.log("smith@pear.com")
        console.log("Once you've placed the file in this directory, relaunch the program. Press any key to exit.")
        endProcess()
        return false
    }
}

function splash() {
    figlet.text(`Snap
    Spam`, {
        font: 'Big Money-sw',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
    }, function (err, data) {
        if (err) {
            console.log('SNAPSPAM');
            return;
        }
        console.log(data);
    });
    setTimeout(function () {
        console.log(`SnapSpam by Mehad. https://github.com/mehadh`)
    }, 100)

}

function start() {
    process.title = "SnapSpam - https://github.com/mehadh"
    if (isConfig() && isCombo()) {
        splash()
        setTimeout(function () {
            if (config.threads == undefined || config.threads == null || isNaN(config.threads)) {
                console.log('Your config.json file does not contain a valid amount of threads. Please check your config.json file again. Press any key to exit.')
                endProcess()
            }
            else if (toCheck == null || toCheck == undefined) {
                console.log('Something is wrong with your combo.txt file. Please check it and try again. Press any key to exit.')
                endProcess()
            }
            else {
                console.log('Starting to report!')
                threads = config.threads
                currentThreads = config.threads
                origLength = toCheck.length
                starterHelper()
            }
        }, 200)
    }
}

function processStarter() {
    if (toCheck[0] == undefined || toCheck[0] == null) {
        console.log(`Either the end of the list has been reached, or the combos.txt file has errors in it. You can end the process when all checks have completed.`)
    }
    else {
        counter += 1
        goCheck = toCheck[0]
        goCheck = goCheck.replace(/@/g, "%40")
        toCheck.shift()
        processes[counter] = exec(`node snap.js ${myUser} ${goCheck} ${config.reportee} ${config.rText}`,
            (error, stdout, stderr) => {
                console.log(`Output: ${stdout} || Err: ${stderr}`);
                if (error !== null) {
                    console.log(`Error: ${error}`)
                }
            })

        processes[counter].on('close', () => exitHandler())
        processes[counter].on('error', () => exitHandler())
        process.title = `SnapSpam by Mehad - Doing/done: ${origLength - toCheck.length} Todo: ${toCheck.length}/${origLength}`
    }

}

function exitHandler() {
    // Hopefully this doesn't do something bad!
    setTimeout(function () {
        processStarter()
    }, 250)
}

function starterHelper() {
    if (currentThreads != 0 && !isNaN(threads) && !isNaN(currentThreads)) {
        for (let i = 0; i < currentThreads; i++) {
            setTimeout(function () {
                processStarter()
            }, 250)
        }
    }
}

function endProcess() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

start()