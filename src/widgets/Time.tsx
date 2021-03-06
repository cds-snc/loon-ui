import React from "react";
import { Socket } from "phoenix";
import { Cell } from "styled-css-grid";
import styled from "styled-components";
import { format } from "date-fns";
import { Area } from "../types";
interface Payload {
  data: string;
  timestamp: Date;
}
interface State {
  payload: Payload;
}
interface Props {
  socket: Socket;
  area: Area;
}

const Panel = styled.div`
  color: white;
  padding: 0.6rem;
  font-size: 2rem;
`;

const Content = styled.p`
  font-size: 3rem;
`;

export default class Time extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let channel = props.socket.channel("data_source:time", {});
    channel.join().receive("error", (resp: string) => {
      console.log("Unable to join: ", resp);
    });
    channel.on("data", (payload: Payload) => {
      this.setState({ payload: payload });
    });
  }

  render() {
    if (!this.state || !this.state.payload) {
      return null;
    }

    const data: Payload = this.state.payload;
    const date = format(data.data, "MMMM Do, YYYY");
    const time = format(data.data, "hh:mm:ss A");
    const { area } = this.props;
    return (
      <Cell area={area} style={{ backgroundColor: "#4285f4" }} center>
        <Panel>
          <h2>Time:</h2>
          <div>
            <Content>
              {date} <br /> {time}
            </Content>
          </div>
        </Panel>
      </Cell>
    );
  }
}
