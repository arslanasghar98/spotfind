import React from "react";
import { Spotify } from "react-spotify-embed";
type Props = {
  uri: string;
};

const SppotifyComponent = (props: Props) => {
  const { uri } = props;
  return <Spotify wide link={uri} />;
};

export default SppotifyComponent;
