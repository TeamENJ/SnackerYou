import React from 'react';
import ReactDOM from 'react-dom';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';

export class MapContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            address: '',
            details: '',
            showingInfoWindow: false,
            selectedPlace: {},
            activeMarker: {},
            loggedIn: false,
            savedRestaurants: props.userHistory
        }

        this.markerClick = this.markerClick.bind(this);
        this.onMapClicked = this.onMapClicked.bind(this);
        this.clickThis = this.clickThis.bind(this);
        this.deleteRestaurant = this.deleteRestaurant.bind(this);
    }

    componentWillReceiveProps(props) {
        // console.log(this.props.userHistory)
        console.log(this.props.locations)
        let restaurantHistory = props.userHistory
        this.setState({
            savedRestaurants: restaurantHistory
        })
    }

    markerClick(props, marker) {
        console.log(props);
        this.setState({
            showingInfoWindow: true,
            title: props.title,
            activeMarker: marker,
            address: props.address,
            details: props.details
        })
    }
    clickThis(key) {

        if( this.state.address === '' || this.state.title === '') {
            alert('Please select a location');
            return;
        }
        
        let userSave = {
            restaurant: this.state.title,
            address: this.state.address,
            details: this.state.details
        }

        const dbRef = firebase.database().ref('/restaurants');
        dbRef.push(userSave);

        this.setState({
            restaurant: '',
            address: ''
        });

        this.onMapClicked();
    }
    componentDidMount() {
        const dbRef = firebase.database().ref('/restaurants');
        dbRef.on('value', (snapshot) => {
            let items = snapshot.val();
            let newState = [];
            for (let item in items) {
                newState.push({
                  id: item,
                  title: items[item].title,
                  address: items[item].address,
                  details: items[item].details
                });
            }
            this.setState({
                places: newState
            });
        });
    }

    onMapClicked(props) {
        if (this.state.showingInfoWindow) {
            this.setState({
              showingInfoWindow: false,
              activeMarker: null,
              title: ''
            });
        }
    }
    deleteRestaurant(key) {
        // e.preventDefault();
        console.log(key)
        const dbRef = firebase.database().ref(`restaurants/${key}`)
        dbRef.remove();
    }
    render(props) {
        const style = {
            width:'100%',
            height:'100%'
        }
        return (
        <div className="rightColumn">
            <div className="infoPane">
              <h3>{this.props.userInfo}'s Picks</h3>
              <div>
                  <button onClick={this.clickThis} className="save">
                    Save Restaurant
                  </button>
              </div>

              {this.state.savedRestaurants.map(restaurant => {
                console.log(restaurant);
                return <div key={restaurant.key}>
                    <h5>{restaurant.restaurant}</h5>
                    <p>{restaurant.address}</p>
                    <a href={restaurant.details} target="_blank">Details</a>
                    <button className="delete" value={restaurant.key} onClick={() => this.deleteRestaurant(restaurant.key)}>
                      <i class="fas fa-times" />
                    </button>
                  </div>;
              })}
            </div>
            <section className="saved">
              <div className="wrapper" />
            </section>

            <Map google={this.props.google} centerAroundCurrentLocation={true} zoom={16} onClick={this.onMapClicked} center={this.props.coords} style={style} location={this.props.locations}>
              {Object.values(this.props.locations).map(
                (location, i) => {
                console.log(location);
                  return (
                    <Marker
                      name={"Toronto"}
                      title={location.name}
                      address={location.address}
                      position={{
                        lat: location.latitude,
                        lng: location.longitude
                      }}
                      onClick={this.markerClick}
                      name={"Current location"}
                      key={i}
                      details={location.url}
                    />
                  );
                }
              )}
              <InfoWindow marker={this.state.activeMarker} onClose={this.onMapClicked} visible={this.state.showingInfoWindow}>
                <div className="results">
                  <h2>{this.state.title}</h2>
                  <p className="locationAddress">
                    {this.state.address}
                  </p>
                  <a href={this.state.details} target="_blank">Details</a>
                </div>
              </InfoWindow>
            </Map>
          </div>
        );  
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyCNX1tthuQLaX98UVGv2dcbFnpjdhw0TnQ')
})(MapContainer)