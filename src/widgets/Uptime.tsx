import React from "react";
import { Socket } from "phoenix";
import {Cell} from "styled-css-grid";
import styled from 'styled-components';

interface Sites {site:string ,up:true };
interface Payload {data: Sites[], timestamp:Date};
interface State {payload:Payload };
interface Props {socket:Socket};

const Panel = styled.div`
  
  padding:1rem;

  a{
    color: black;
    display:inline-block;
    padding:5px;
    line-height:1.2rem;
  }
`
export default class Uptime extends React.Component<Props, State> {
  constructor(props:Props) {
    super(props);
    let channel = props.socket.channel("data_source:cds_up", {});
    channel.join().receive("error", (resp:string) => {
      console.log("Unable to join: ", resp);
    });
    channel.on("data", (payload:Payload) => {
      this.setState({ payload: payload});
    });
  }

  render() {
    if(!this.state || !this.state.payload){
      return null;
     }
 
    const data:Payload = this.state.payload;
    return (
      <Cell style={{backgroundColor:"#c4d2de"}} width={2} height={4}>
      <Panel>
        <h2>Domain Status:</h2>
        {data.data.map((el) =>{
          const icon = el.up ? "✅" : "🚫"
         return <div key={el.site}> {icon} <a href={el.site}>{el.site}</a> </div>
        })}
      </Panel>
      </Cell>
    );
  }
}