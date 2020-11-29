const {ApiClient} = require('twitch');
const {PubSubClient} = require('twitch-pubsub-client');
const {ElectronAuthProvider} = require('twitch-electron-auth-provider');

const CLIENT_ID = 'uc6rmnts2td4z4ch98jwqlue2zcysr';

class TwitchConnection {
    static authenticate(data) {
        const redirectUri = 'http://localhost/login';

        const authProvider = new ElectronAuthProvider({
            clientId: CLIENT_ID,
            redirectUri
        })

        const apiClient = new ApiClient({ authProvider });
        const pubSubClient = new PubSubClient();
        pubSubClient.registerUserListener(apiClient).then(userId => {
            console.log({userId});

            pubSubClient.onRedemption(userId, (message) => {
                console.log(`${message.userDisplayName} redeemed: ${JSON.stringify(message, undefined, 2)}`);
                ipcMain.emit('TWITCH_REDEEM', JSON.stringify(message));

                switch(message.rewardName) {
                    case "Lights go Red":
                        port.write("set all #FF0000\n");
                        break;
                    case "Lights go Blu":
                        port.write("set all #0000FF\n");
                        break;
                    case "Lights custom hex":
                        port.write(`set all ${message.message}\n`)
                        break;
                }
            })
        });
    }
}

module.exports = TwitchConnection;