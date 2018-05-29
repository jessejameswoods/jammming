import React from 'react';
import './TrackList.css';
import Track from '../Track/Track';

class TrackList extends React.Component {
  render() {
          let tracks = this.props.tracks.map(track => {
              return <Track track={track} onAdd={this.props.onAdd} onRemove={this.props.onRemove} isRemoval={this.props.isRemoval} />
          });

          return (
              <div className="TrackList">
              {tracks}
              </div>
          );
      }
  }

  export default TrackList;
