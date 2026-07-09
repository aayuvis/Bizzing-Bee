import React from 'react';
import { Avatar } from 'bizzing-bee-ds';
const P: Record<string,string[]> = {
  'Hive': ['bizzy','honeypot','bumble','waggle','drone','clover','blossom','nectar','propolis','queenhive'],
  'Stage': ['star','mic','maestro','jester','lumen','diva','popcorn','melody','encore','goldlegend'],
  'Cosmos': ['luna','astro','comet','rocket','alien','saturn','blackhole','supernova','ufo','nebula'],
  'Dojo': ['panda','ninja','samurai','neko','bamboo','kitsune','oni','koi','starsteel','dragonmaster'],
  'Lab': ['beaker','atom','robo','magnet','germy','brainiac','phoenix','volt','scopey','aurum'],
  'Arcade': ['pixel','joy','ghost','dpad','tokeny','bossbot','rainbow','glitch','hiscore','neonking'],
  'Origami': ['paperplane','cranefold','boatfold','hopfold','fanfold','lotusfold','koifold','kabuto','flutterfold','goldencrane'],
  'Elements': ['pebble','breeze','droplet','ember','leafy','cloudy','wave','boulder','zappy','elemental'],
};
export const AllPacks = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {Object.entries(P).map(([pack, ids]) => (
      <div key={pack} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ width: 66, fontSize: 12, fontWeight: 800 }}>{pack}</span>
        {ids.map(id => <Avatar key={id} id={id} size={44} />)}
      </div>
    ))}
  </div>
);
export const Hero = () => <Avatar id="queenhive" size={110} />;
