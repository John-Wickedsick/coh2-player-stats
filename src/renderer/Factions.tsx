import React from 'react';
import aef from '../../assets/faction_aef.webp';
import british from '../../assets/faction_british.webp';
import german from '../../assets/faction_german.webp';
import soviet from '../../assets/faction_soviet.webp';
import west_german from '../../assets/faction_west_german.webp';

const getFactionImage = (faction: string) => {
  switch (faction.replace(/\s+/g, '')) {
    case 'aef':
      return (
        <>
          <img className="textCenter factionImg" alt="AEF" src={aef} />
        </>
      );
    case 'british':
      return (
        <>
          <img className="textCenter factionImg" alt="British" src={british} />
        </>
      );
    case 'german':
      return (
        <>
          <img className="textCenter factionImg" alt="German" src={german} />
        </>
      );
    case 'soviet':
      return (
        <>
          <img className="textCenter factionImg" alt="Soviet" src={soviet} />
        </>
      );
    case 'west_german':
      return (
        <>
          <img className="textCenter factionImg" alt="OKW" src={west_german} />
        </>
      );
    default:
      return (
        <>
          <img className="textCenter factionImg" alt="OKW" src={west_german} />
        </>
      );
  }
};

export default getFactionImage;
