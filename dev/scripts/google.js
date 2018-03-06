import React from 'react';
import ReactDOM from 'react-dom';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';


export class MapContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            address: '',
            rating:'',
            showingInfoWindow: false,
            selectedPlace: {},
            activeMarker: {}
        }
        
        this.markerClick = this.markerClick.bind(this);
        this.onMapClicked = this.onMapClicked.bind(this);
        this.clickThis = this.clickThis.bind(this);
    }
    componentDidMount() {
        firebase.auth().onAuthStateChanged((res) => {
            if(res) {
                this.setState({
                    loggedIn: true
                })
            } else {
                loggedIn: false
            }
        })
    }
    markerClick(props, marker) {
        console.log(props);
        this.setState({
            showingInfoWindow: true,
            title: props.title,
            activeMarker: marker,
            address: props.address,
            rating: props.rating
        })
    }
    clickThis(){
        
        const userSave = {
            restaurant: this.state.title,
            address: this.state.address,
            rating: this.state.rating
        }
        // console.log(userSave);

        const dbRef = firebase.database().ref('/restaurants');
        dbRef.push(userSave);
    }
    onMapClicked(props) {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null,
            })
        }
    }

    render(props) {
        const style = {
            width:'70%',
            height:'80%'
        }
        // centerAroundCurrentLocation={true} 
    return (
        <div>
            <div className="infoPane">
              <h5>{this.state.title}</h5>
              <p>{this.state.address}</p>
              <span>{this.state.rating}</span>
              <button onClick={this.clickThis}>CLICK CLICK</button>
            </div>
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
          </div>
    )
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyCNX1tthuQLaX98UVGv2dcbFnpjdhw0TnQ')
})(MapContainer)