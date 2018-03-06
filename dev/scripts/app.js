import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import MapContainer from './google';

const googleURL = "https://maps.googleapis.com/maps/api/geocode/json?";

// Initialize Firebase
var config = {
    apiKey: "AIzaSyA2f5SWWUhBul0ey99wAJtcEMU_wLCu61Q",
    authDomain: "dude-wheres-my-food.firebaseapp.com",
    databaseURL: "https://dude-wheres-my-food.firebaseio.com",
    projectId: "dude-wheres-my-food",
    storageBucket: "dude-wheres-my-food.appspot.com",
    messagingSenderId: "351310641968"
};
firebase.initializeApp(config);
const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userText: '',
            restaurants: [],
            coordinates: {},
            loggedIn: false
        }
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submit = this.submit.bind(this);
        this.getCoords = this.getCoords.bind(this);
    }

    signIn(e) {
        const provider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            this.setState ({
                user
            })
        })
    }
    signOut() {
        auth.signOut()
        .then(()=> {
            this.setState({
                user:null
            });
        });
    }
    handleChange(e) {
        this.setState({
            [e.target.id]: e.target.value
        })
    }
    componentDidMount () {
        auth.onAuthStateChanged((user) =>{
            if(user) {
                this.setState({user})
            }
        });
    }
    getCoords(address) {
        axios
            .get(`${googleURL}`, {
                params: {
                    key: "AIzaSyDNBpAAUuUkRyioDLQUQW_DZYIb1PiY85Q",
                    address: address
                }
            })
            .then(({ data }) => {
                axios
                    .get(`https://developers.zomato.com/api/v2.1/search`, {
                        headers: {
                            "user-key": `53314a8415a07eafa4656461b1c6272d`
                        },
                        params: {
                            lat: data.results[0].geometry.location.lat,
                            lon: data.results[0].geometry.location.lng,
                            radius: '500',
                            sort: 'real_distance'
                        }
                    }).then((response) => {
                        let newArray = Array.from(this.state.restaurants);

                        newArray = response.data.restaurants.map(eatingPlace => {

                            return {
                                name: eatingPlace.restaurant.name,
                                address: eatingPlace.restaurant.location.address,
                                latitude: eatingPlace.restaurant.location.latitude,
                                longitude: eatingPlace.restaurant.location.longitude,
                                rating: eatingPlace.restaurant.user_rating.aggregate_rating
                            };
                        });

                        this.setState({
                            restaurants: newArray,
                            lat: data.results[0].geometry.location.lat,
                            lon: data.results[0].geometry.location.lng,
                            coordinates: {
                                lat: data.results[0].geometry.location.lat,
                                lng: data.results[0].geometry.location.lng
                            }
                        });
                    });
            });
    }
    submit(e) {
        e.preventDefault();

        const inputResult = this.state.userText;
        const coords = {};

        this.getCoords(inputResult);
    }
    render() {

        return <div>
            <div className="logo">
              <img src="./public/images/fullLogo.png" />
            </div>
            <div className="signOut">
              {this.state.user ? <button className="authButton" onClick={this.signOut}>
                  Sign Out
                </button> : <button className="authButton" onClick={this.signIn}>
                  Sign in
                </button>}
            </div>
            {this.state.user ? <div>
                <div className="userStuff">
                  <form onSubmit={this.submit} className="wrapper">
                    <label htmlFor="userSearch">City or Address:</label>
                    <input type="text" id="userText" value={this.state.userText} onChange={this.handleChange} />
                    <input type="submit" value="Food Me!" />
                  </form>

                  <div id="map" className="map">
                    <MapContainer locations={this.state.restaurants} coords={this.state.coordinates} />
                  </div>    
                </div>
              </div> : <div className="wrapper">
                <p>you must be logged in</p>
              </div>}
          </div>;
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
