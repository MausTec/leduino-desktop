const {ApiClient} = require('twitch');
const {PubSubClient} = require('twitch-pubsub-client');
const {ElectronAuthProvider} = require('twitch-electron-auth-provider');
const { ipcMain } = require('electron');

const CLIENT_ID = 'uc6rmnts2td4z4ch98jwqlue2zcysr';

class TwitchConnection {
    static authenticate(data, onRedeem, window) {
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
                window && window.webContents.send('TWITCH_REDEEM', JSON.stringify(message));
                onRedeem(message);
            })
        });
    }
}

module.exports = TwitchConnection;