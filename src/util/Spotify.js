const clientID = '71b480deedea40109c0e3ef5e8237515';
const redirectUri = 'http://localhost:3000/';
let accessToken;
let expiresIn;

const Spotify = {
    getAccessToken() {
        const url = window.location.href;
        const token = url.match(/access_token=([^&]*)/);
        const time = url.match(/expires_in=([^&]*)/);

        if (accessToken) {
            return accessToken;
        }
        else if (token !== null && time !== null) {
            accessToken = token[1];
            expiresIn = time[1];
        }
        else {
            window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&redirect_uri=${redirectUri}&scope=playlist-modify-public`;
            accessToken = token[1];
            expiresIn = time[1];
        }

        window.setTimeout(() => accessToken = null, expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        return accessToken;
    },

    search(term) {
        this.getAccessToken()
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
            {headers:
                {Authorization: `Bearer ${accessToken}`}
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Request Failed!');
        }, networkError => console.log(networkError.message)
        ).then(jsonResponse => {
            if (jsonResponse.tracks.items) {
                return jsonResponse.tracks.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    artist: item.artists[0].name,
                    album: item.album.name,
                    uri: item.uri
                }))
            } else {
                return [];
            }
        })
    },

    savePlaylist(playlistName, trackUris) {
        this.getAccessToken();
        let userID;
        let playlistID;

        if (playlistName && trackUris) {
            return fetch(`https://api.spotify.com/v1/me`, {
                headers: {Authorization: `Bearer ${accessToken}`}
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Request Failed!');
            }, networkError => console.log(networkError.message)
            ).then(jsonResponse => {
                userID =jsonResponse.id;

            return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                headers: {'Content-type': `application/json`,
                Authorization: `Bearer ${accessToken}`},
                method: 'POST',
                body: JSON.stringify({name: playlistName})
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Request Failed!');
            }, networkError => console.log(networkError.message)
            ).then(jsonResponse => {
                playlistID = jsonResponse.id;

            return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                headers: {Authorization: `Bearer ${accessToken}`,
                'Content-type': 'application/josn'},
                method: 'POST',
                body: JSON.stringify({uris: trackUris})
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Request Failed!');
            }, networkError => console.log(networkError.message)
            ).then(jsonResponse => {
                console.log(jsonResponse.snapshot_id);
            });
            });
        });
    }
}
}

export default Spotify;
