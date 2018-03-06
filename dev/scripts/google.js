import React from 'react';
import ReactDOM from 'react-dom';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import Sidebar from './sidebar'


export class MapContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            address: '',
            showingInfoWindow: false,
            selectedPlace: {},
            activeMarker: {},
            restaurants: []
        }
        
        this.markerClick = this.markerClick.bind(this);
        this.onMapClicked = this.onMapClicked.bind(this);
        this.clickThis = this.clickThis.bind(this);
        this.deleteRestaurant = this.deleteRestaurant.bind(this);
    }
    componentDidMount() {
        const dbRef = firebase.database().ref();

        dbRef.on('value', (snapshot) => {
            const restData = snapshot.val();
            const restArray = [];

            for (let rest in restData) {
                restData[rest].key = rest;
                restArray.push(restData[rest]);
            }

            this.setState({
                restaurants: restArray
            });
        });
    }
    markerClick(props, marker) {
        console.log(props);
        this.setState({
            showingInfoWindow: true,
            title: props.title,
            activeMarker: marker,
            address: props.address
        })
    }
    clickThis(){
        const userSave = {
            restaurant: this.state.title,
            address: this.state.address
        }
        const newRest = Array.from(this.state.restaurants);

        newRest.push(userSave);

        const dbRef = firebase.database().ref('/restaurants/users');
        dbRef.push(userSave);

        this.setState({
            restaurants: newRest
        })    

    }
    onMapClicked(props) {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null,
            })
        }
    }
    deleteRestaurant(leave) {
        const dbRef = firebase.database().ref();
        dbRef.remove();
    }
    render(props) {
        const style = {
            width:'70%',
            height:'80%'
        }
        // centerAroundCurrentLocation={true} 
        return (<div>
            {/* <div className="infoPane">
              <h5>{this.state.title}</h5>
              <p>{this.state.address}</p>
              <span>{this.state.rating}</span>
              <button className="save" onClick={this.clickThis}>Save Restaurant</button>
                <a href="#" onClick={this.deleteRestaurant} ><i className="fas fa-times"></i></a>
            </div> */}
            <Map google={this.props.google} zoom={13} onClick={this.onMapClicked} center={this.props.coords} style={style}>
              {Object.values(this.props.locations).map(
                (location, i) => {
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
                    />
                  );
                }
              )}
              <InfoWindow marker={this.state.activeMarker} onClose={this.onInfoWindowClose} visible={this.state.showingInfoWindow}>
                <div className="results">
                  <h2>{this.state.title}</h2>
                  <p className="locationAddress">
                    {this.state.address}
                  </p>
                </div>
              </InfoWindow>
            </Map>
            
            <div className="infopaneContainer">
              {this.state.restaurants.map((rest, i) => {
                  return (
                      <Sidebar title={this.state.title} address={this.state.address} click={this.clickThis} delete={this.deleteRestaurant} rest={this.state.restaurants} key={i}/>
                  )
              })}
            </div>
          </div>
        )
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyCNX1tthuQLaX98UVGv2dcbFnpjdhw0TnQ')
})(MapContainer)