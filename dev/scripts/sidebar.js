import React from 'react';
import ReactDOM from 'react-dom';


const Sidebar = (props) => {
    return (
        <div className="infoPane">
            <h5>{props.title}</h5>
            <p>{props.address}</p>
            <button className="save" onClick={props.click}>Save Restaurant</button>
            <a href="#" onClick={props.delete} ><i className="fas fa-times"></i></a>
        </div>
    )    
}

export default Sidebar;
