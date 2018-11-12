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
            username: '',
            user: null,
            savedRestaurants: []
        }
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submit = this.submit.bind(this);
        this.getCoords = this.getCoords.bind(this);
        this.getSavedRestaurants = this.getSavedRestaurants.bind(this);
        this.getSavedRestaurants();
    }

    signIn() {
        auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            this.getSavedRestaurants();
            this.setState({
                user
            })
            console.log(user)
        })
    }
    signOut() {
        auth.signOut()
        .then(() => {
            this.setState({
                user: null,
                userText: ''
            });
        });
    }
    handleChange(e) {
        this.setState({
            [e.target.id]: e.target.value
        })
    }
    getSavedRestaurants() {
        const dbRef = firebase.database().ref('/restaurants');

        const restaurantList = [];

        dbRef.on('value', (response) => {
            const data = response.val();
            const state = [];
            for (let key in data) {
                data[key].key = key;
                state.push(data[key]);
            }

            this.setState({
                savedRestaurants: state
            });
        })
    }
    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user })
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
                                url: eatingPlace.restaurant.url
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

        if(inputResult === '') {
            alert('Please enter a location or address');
            return;
        }

        this.getCoords(inputResult);

        $('html, body').animate({
            scrollTop: $('#map').offset().top
        });
    }
    render() {
        return (
        <div className="container">
            <div className="fullBleed">
                <div className="logo">
                    <img className="wordedLogo" src="../../public/images/fullLogo.png" />
                    <div className="responsiveLogo">
                        <img src="../../public/images/squareLogo.png" />
                    </div>
                    <div className="signOut">
                    {this.state.user ? <div className="clearfix">
                        <div className="userStuff clearfix">
                            <div className="userPhoto">
                            <div>
                                <img src={this.state.user.photoURL} alt="" />
                            </div>
                            <div className="welcome">
                                <span>
                                Welcome, {this.state.user.displayName}!
                                </span>
                            </div>
                            </div>
                        </div>
                        </div> : <div />}
                    {this.state.user ? <div className="buttonContainer">
                        <button className="authButton logOut" onClick={this.signOut}>
                            Sign Out
                        </button>
                        </div> : <div className="buttonContainer">
                        <button className="authButton logIn" onClick={this.signIn}>
                            Sign in
                        </button>
                        </div>}
                    </div>
                </div>
            </div>
            <div className="background" />
            {this.state.user ? <div className="search-thing">
                <form onSubmit={this.submit} className="formFlex wrapper">
                  <label htmlFor="userSearch" className="searchLabel">City or Address:</label>
                  <input type="text" id="userText" value={this.state.userText} onChange={this.handleChange} />
                  <input type="submit" value="Food Me!" />
                </form>

                <div id="map" className="map">
                  <MapContainer locations={this.state.restaurants} coords={this.state.coordinates} userHistory={this.state.savedRestaurants} userInfo={this.state.user.displayName} />
                </div>
              </div> : <div />}
        </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));