import React from 'react';
import PlayerEntry from './PlayerEntry';
import './App.global.css';

interface Props {
  players: any;
}

const App: React.FC<Props> = ({ players }) => {
  return (
    <div className="topContainer">
      <div className="teamGroup leftTeam">
        <table>
          <tr>
            <th className="factionCol"> </th>
            <th className="rankCol">Solo</th>
            <th className="rankCol">Team</th>
            <th> </th>
          </tr>
          {players.left.map((player: any) => (
            <PlayerEntry key={player.position} player={player} />
          ))}
          <tr>
            <td colSpan={4} className="vsSplit">
              VS
            </td>
          </tr>
          {players.right.map((player: any) => (
            <PlayerEntry key={player.position} player={player} />
          ))}
        </table>
      </div>
    </div>
  );
};

export default App;
