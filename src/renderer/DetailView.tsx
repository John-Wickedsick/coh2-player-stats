import React from 'react';
import './global.css';
import './DetailView.global.css';

interface Props {
  player: any;
}

const DetailView: React.FC<Props> = ({ player }) => {
  console.log(player);
  return <div className="detailContainer">Detail View {player.name}</div>;
};

export default DetailView;
